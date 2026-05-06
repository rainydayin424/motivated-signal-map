"""
geocoder.py - US Census Bureau Batch Geocoder with a local JSON cache.

Census Batch Geocoder API:
  URL:    https://geocoding.geo.census.gov/geocoder/locations/addressbatch
  Method: multipart/form-data POST with benchmark=Public_AR_Current
  Input:  CSV with columns (id, street, city, state, zip)
  Output: CSV with columns (id, input, status, quality, matched_addr, "lng,lat", tiger_id, side)
  Cost:   Free, no API key required. Max 10,000 addresses per request;
          we use batches of 100 to stay safe.

Caching:
  - On first run, results are saved to data/geocode_cache.json.
  - On later runs, only addresses missing from the cache are sent to the API.
  - For 500 addresses, the first geocoding run takes roughly 30-60 seconds.
    After that it loads instantly from cache.

Address parsing:
  Input format: "10401 N 52ND ST 111, Maricopa County, AZ"
  We take everything before the first comma as the street,
  and hardcode state=AZ. City and zip are left blank.
"""
import csv
import io
import json
import os
import time

import requests

CENSUS_URL = "https://geocoding.geo.census.gov/geocoder/locations/addressbatch"
BATCH_SIZE = 100


def _parse_street(address: str) -> str:
    """Extracts the street portion by taking everything before the first comma."""
    return address.split(",")[0].strip()


def _build_csv_batch(addresses: list[str]) -> str:
    """Builds the CSV string expected by the Census Batch Geocoder (id, street, city, state, zip)."""
    lines = []
    for i, addr in enumerate(addresses):
        street = _parse_street(addr)
        # City is omitted; Census matches on street + state alone.
        lines.append(f'{i},"{street}",,AZ,')
    return "\n".join(lines)


def _parse_response(text: str, id_to_address: dict[int, str]) -> dict[str, dict]:
    """
    Parses the Census CSV response and returns {address: {lat, lng}} for matched rows.
    Census returns coordinates as "longitude,latitude" in column index 5.
    """
    results: dict[str, dict] = {}
    reader = csv.reader(io.StringIO(text.strip()))
    for row in reader:
        if len(row) < 6:
            continue
        try:
            row_id = int(row[0].strip())
        except ValueError:
            continue
        match_status = row[2].strip()
        if match_status != "Match":
            continue
        coords_str = row[5].strip()
        if not coords_str:
            continue
        try:
            lng_str, lat_str = coords_str.split(",")
            lng = float(lng_str)
            lat = float(lat_str)
        except (ValueError, AttributeError):
            continue
        addr = id_to_address.get(row_id)
        if addr:
            results[addr] = {"lat": lat, "lng": lng}
    return results


def geocode_addresses(addresses: list[str], cache_path: str) -> dict[str, dict]:
    """
    Geocodes a list of addresses using the Census Batch API, with a local cache.

    Reads cache_path first; only sends addresses not already in the cache.
    New results are merged into the cache file for future runs.
    Addresses that the Census API fails to match are excluded from the result.
    Returns {address_string: {"lat": float, "lng": float}}.
    """
    cache: dict[str, dict] = {}
    if os.path.exists(cache_path):
        with open(cache_path, "r", encoding="utf-8") as f:
            cache = json.load(f)

    uncached = [a for a in addresses if a not in cache]

    if uncached:
        print(f"Geocoding {len(uncached)} addresses in batches of {BATCH_SIZE}...")
        for batch_start in range(0, len(uncached), BATCH_SIZE):
            batch = uncached[batch_start : batch_start + BATCH_SIZE]
            id_to_address = {i: addr for i, addr in enumerate(batch)}
            csv_content = _build_csv_batch(batch)

            try:
                resp = requests.post(
                    CENSUS_URL,
                    data={"benchmark": "Public_AR_Current"},
                    files={"addressFile": ("addresses.csv", csv_content.encode("utf-8"), "text/csv")},
                    timeout=90,
                )
                if resp.status_code == 200:
                    batch_results = _parse_response(resp.text, id_to_address)
                    cache.update(batch_results)
                    print(f"  Batch {batch_start // BATCH_SIZE + 1}: matched {len(batch_results)}/{len(batch)}")
                else:
                    print(f"  Census API returned {resp.status_code}")
            except requests.RequestException as e:
                print(f"  Geocoding request failed: {e}")

            # Brief pause to avoid hammering the Census API.
            time.sleep(0.5)

        os.makedirs(os.path.dirname(cache_path), exist_ok=True)
        with open(cache_path, "w", encoding="utf-8") as f:
            json.dump(cache, f, indent=2)
        print(f"Cache saved: {len(cache)} total entries")

    return cache
