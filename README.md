# motivated-signal-map

A visual prospecting tool for real estate agents. Identifies homeowners likely open to selling based on tenure and absentee ownership, then plots them on an interactive Maricopa County map with motivation-level filtering.

> Built as a portfolio project. Live demo runs on a 500-property sample of public Maricopa County records.

## Demo

![Full map view](docs/screenshots/screenshot1.png)

*All 500 sampled properties across Maricopa County, scored and color-coded by motivation.*

&nbsp;

![Filtered with score 18+](docs/screenshots/screenshot2.png)

*Filtered view (score ≥ 18) with a property popup showing address, score, and key signals. Sensitive details are blurred for privacy.*

&nbsp;

## Features

- Interactive dark-themed Leaflet map with 500 color-coded property pins by motivation score
- Click pins for property details, filter by score threshold or absentee owners only

## Data

Public bulk data from [Maricopa County Assessor](https://mcassessor.maricopa.gov/page/data_sales/):
- Residential Master (~1.4M records)
- Rental Registration (~270K records)

500 properties sampled after joining on APN (Assessor Parcel Number). Engineered features:
- `years_owned`: Years since deed date
- `absentee_owner`: Rental Indicator = 'Y'

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + TypeScript + Leaflet |
| Backend | Python + FastAPI |
| Scoring | Rule-based weighted formula (no model training) |
| Geocoding | Census Batch Geocoder (free, no API key) |

## Scoring Formula

```
motivation_score = (years_owned / 40) × 70 + absentee_owner × 30
```

`years_owned` gets 70 points because it's a continuous signal — the longer someone has held a property, the more likely they are to be open to selling. `absentee_owner` gets 30 as a flat bonus: non-resident owners tend to be more transactional, but it's a binary flag with less resolution, so it plays a supporting role.

## Getting Started

### Backend

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

> **Note:** First run will geocode 500 addresses (~5 minutes). Results are cached to `backend/data/geocode_cache.json` for instant subsequent runs.

## Project Structure

```
motivated-signal-map/
├── backend/
│   ├── main.py               # FastAPI app & endpoints
│   ├── model.py              # Scoring logic
│   ├── geocoder.py           # Census Batch Geocoder
│   └── requirements.txt
├── frontend/
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── tsconfig.node.json
│   ├── vite.config.ts
│   └── src/
│       ├── main.tsx
│       ├── index.css
│       ├── App.tsx
│       ├── api/
│       │   └── client.ts
│       ├── components/
│       │   ├── Map.tsx
│       │   └── Sidebar.tsx
│       └── types/
│           └── index.ts
└── docs/
    └── screenshots/
```

> `backend/data/` (CSV + geocode cache) is excluded from version control via `.gitignore`.

## License

Data sourced from Maricopa County public records. For personal/educational use only.