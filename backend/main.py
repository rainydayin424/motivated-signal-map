"""
main.py - FastAPI entry point for the motivated-signal-map backend.

What this file does:
  - Runs a pipeline on first request: load CSV -> score properties -> geocode addresses.
    The result is cached in memory for the lifetime of the process.
  - /api/properties: returns properties filtered by min_score and absentee_only,
    sorted by motivation_score descending.
  - /api/health: simple check to confirm the server is up.
  - CORS is open to the Vite dev server (5173) and CRA (3000).

To run:
  uvicorn main:app --reload
"""
import os

import pandas as pd
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware

from geocoder import geocode_addresses
from model import score_properties

app = FastAPI(title="Motivated Signal Map API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

_BASE = os.path.dirname(__file__)
DATA_PATH = os.path.join(_BASE, "data", "maricopa_sample_500.csv")
CACHE_PATH = os.path.join(_BASE, "data", "geocode_cache.json")

# Loaded once on first request, reused for all subsequent requests.
_properties: list[dict] | None = None


def _load_properties() -> list[dict]:
    """
    Runs the full data pipeline: read CSV -> score -> geocode.

    Properties that fail geocoding (no Census match) are dropped.
    Results are stored in _properties and reused on later calls.
    Returns a list of dicts with keys: apn, address, owner_name,
    years_owned, absentee_owner, motivation_score, lat, lng.
    """
    global _properties
    if _properties is not None:
        return _properties

    df = pd.read_csv(DATA_PATH)
    df = score_properties(df)

    coords = geocode_addresses(df["address"].tolist(), CACHE_PATH)

    records: list[dict] = []
    for _, row in df.iterrows():
        coord = coords.get(str(row["address"]))
        if coord is None:
            continue
        records.append(
            {
                "apn": str(row["apn"]),
                "address": str(row["address"]),
                "owner_name": str(row["owner_name"]),
                "years_owned": float(row["years_owned"]),
                "absentee_owner": int(row["absentee_owner"]),
                "motivation_score": float(row["motivation_score"]),
                "lat": coord["lat"],
                "lng": coord["lng"],
            }
        )

    _properties = records
    return _properties


@app.get("/api/health")
def health() -> dict:
    """Returns ok if the server is running."""
    return {"status": "ok"}


@app.get("/api/properties")
def get_properties(
    min_score: float = Query(0, ge=0, le=100, description="Minimum motivation score"),
    absentee_only: bool = Query(False, description="Filter to absentee owners only"),
) -> list[dict]:
    """
    Returns geocoded properties that pass the given filters,
    sorted by motivation_score descending.
    """
    props = _load_properties()
    result = [p for p in props if p["motivation_score"] >= min_score]
    if absentee_only:
        result = [p for p in result if p["absentee_owner"] == 1]
    result.sort(key=lambda p: p["motivation_score"], reverse=True)
    return result
