# Implementation Plan - Bitcoin Mining Concentration Map

Create a high-end Fintech Terminal style dashboard for the "Bitcoin Mining Concentration Map" (ID 86) for the Real Rails Intelligence Library. The project will separate the concerns into a Python FastAPI backend and a Next.js (TypeScript, Tailwind CSS) frontend.

## User Review Required

> [!IMPORTANT]
> - We will use Leaflet (via `react-leaflet`) for the geospatial visualization because it runs entirely locally without requiring Mapbox API keys.
> - We will use Recharts for analytics (pool concentration and historical line charts).
> - We will build the backend using Python FastAPI and Pandas.

## Open Questions

- *Are there any specific historical time ranges (e.g., 2019-2026) that you want highlighted in the time-series replay?* (By default, we will map 2020-2026 to show the post-China ban migration to the US, Kazakhstan, etc.)

## Proposed Changes

### Backend Component (FastAPI)

Create a FastAPI backend inside a `backend` directory.

#### [NEW] [main.py](file:///d:/academics/INTERNSHIP/bitcoin/backend/main.py)
Exposes the following endpoints:
- `/api/summary`: Key metrics (Global Hashrate, Avg Renewable %, Active Pools).
- `/api/map-data`: GeoJSON and properties representing key global mining hubs (e.g., Texas, Iceland, Sichuan, Kazakhstan) with hashrate share, primary energy source, and operational status.
- `/api/historical`: Time-series hashrate share per country (2020-2026) for the replay feature.
- `/api/pools`: Current distribution of mining hashrate across major pools (Foundry USA, AntPool, F2Pool, ViaBTC, etc.).
- `/api/download`: Provides CSV downloads of mining concentration data.

#### [NEW] [requirements.txt](file:///d:/academics/INTERNSHIP/bitcoin/backend/requirements.txt)
Dependencies: `fastapi`, `uvicorn`, `pandas`, `pydantic`.

---

### Frontend Component (Next.js + TypeScript + Tailwind)

Create a Next.js frontend in the `frontend` directory using `create-next-app`.

#### [NEW] [package.json](file:///d:/academics/INTERNSHIP/bitcoin/frontend/package.json)
Dependencies including `recharts`, `lucide-react`, `leaflet`, `react-leaflet`, `@types/leaflet`.

#### [NEW] [layout.tsx](file:///d:/academics/INTERNSHIP/bitcoin/frontend/src/app/layout.tsx)
Base HTML template with Inter/Geist fonts, custom styling headers, and meta description tags for SEO.

#### [NEW] [page.tsx](file:///d:/academics/INTERNSHIP/bitcoin/frontend/src/app/page.tsx)
The main split-screen dashboard:
- 70% Left Stage: Leaflet Map showing mine locations/regions as circular heatmaps/points, interactive time slider (replay over time), and pool share dashboard.
- 30% Right Sidebar:
  - Section A: Title & Metrics.
  - Section B: Why This Matters (Insight A: Decentralization concentration).
  - Section C: Who Controls the Rail (Insight B: Geographic consolidation & pool control).
  - Section D: Filters & UI Controls.
  - Section E: Download Sample Data.

#### [NEW] [tailwind.config.ts](file:///d:/academics/INTERNSHIP/bitcoin/frontend/tailwind.config.ts)
Configured with Real Rails colors: Background `#030712`, Surface/Cards `#0B1117`, Accent Primary `#38BDF8` (Electric Cyan), Accent Secondary `#818CF8` (Indigo), Borders `#1F2937`.

---

## Verification Plan

### Automated Tests
- Test FastAPI endpoints via curl or basic requests script.
- Verify build success: `npm run build` on Next.js.

### Manual Verification
- Visual inspection of the dashboard: check background colors (#030712), sidebar width (exactly 30%), filters responsiveness, and leaflet rendering.
- Verify download button exports valid data.
