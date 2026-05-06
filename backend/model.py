"""
model.py - Motivation score calculator for Maricopa County property sellers.

Scoring formula (range 0-100):
  motivation_score = (years_owned / MAX_YEARS) * 70 + absentee_owner * 30

  - years_owned: longer ownership is assumed to mean higher motivation to sell.
    Normalized against _MAX_YEARS (40 years), contributing up to 70 points.
  - absentee_owner: owners who don't live on the property are more likely
    to want to sell. Worth a flat 30 points.

Score thresholds (from CLAUDE.md):
  High   (red):    score >= 67
  Medium (yellow): 33 <= score < 67
  Low    (green):  score < 33
"""
import pandas as pd

# Upper bound for normalizing years_owned. Based on the data distribution.
_MAX_YEARS = 40.0


def score_properties(df: pd.DataFrame) -> pd.DataFrame:
    """
    Adds a motivation_score column (float, 0-100) to the input DataFrame.

    NaN values are treated as 0. years_owned is clamped to _MAX_YEARS.
    Returns a copy; the original DataFrame is not modified.
    """
    years_norm = df["years_owned"].fillna(0).clip(0, _MAX_YEARS) / _MAX_YEARS
    absentee = df["absentee_owner"].fillna(0).clip(0, 1)
    df = df.copy()
    df["motivation_score"] = (years_norm * 70 + absentee * 30).round(1)
    return df
