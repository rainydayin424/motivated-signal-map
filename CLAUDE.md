# motivated-signal-map

Display high-motivation real estate sellers on a Leaflet map.
Trained on real Maricopa County data (500 samples).

## Stack (REQUIRED)
- Frontend: React + TypeScript + Leaflet (free, no API key)
- Backend: Python + FastAPI
- Rule-based weighted formula

## Data
File: data/maricopa_sample_500.csv
Columns: apn, address, owner_name, years_owned, absentee_owner

## Features for model
- years_owned (numeric)
- absentee_owner (0 or 1)
Output: motivation_score (0-100)
- High (red): score >= 67
- Medium (yellow): 33-66
- Low (green): < 33

## Geocoding
Use Census Batch Geocoder (free, no API key, batch upload).
Cache results to data/geocode_cache.json so reruns are instant.

## UI
- Bottom bar (centered): filter slider (min score), absentee owner toggle, properties count, pin color legend
- Main: fullscreen Leaflet map (dark theme, CartoDB Dark Matter tiles)
- Pin click: popup showing address, score, years_owned, absentee_owner

## Code conventions
- Every file must have a header comment describing its purpose
- Every function and class must have a docstring explaining what it does
- All code and file names in English