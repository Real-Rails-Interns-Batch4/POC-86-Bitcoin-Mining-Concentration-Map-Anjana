# Walkthrough - Bitcoin Mining Concentration Map

The Bitcoin Mining Concentration Map dashboard is a real-time analytics terminal designed for the Real Rails Intelligence Library. It visualizes settlement infrastructure security metrics, regional energy mix data, mining pool concentrations, and historical geographic migration.

---

## 🛠️ Architecture Summary

### 1. Python FastAPI Backend
- **Data Adapters**: Integrates mock telemetry structures based on Cambridge CBECI hashrate and CoinGecko info.
- **Endpoints**:
  - `/api/summary`: Key parameters like global network hashrate (612.4 EH/s) and average green energy index.
  - `/api/map-data`: GeoJSON output mapping coordinates of major global hubs.
  - `/api/historical`: Monthly timelines (2020-2026) capturing the global migration of hashrate.
  - `/api/pools`: Distribution of hashrate across dominant pools (Foundry USA, AntPool, F2Pool, etc.).
  - `/api/download`: Stream-download endpoint generating CSV extracts of regional datasets.

### 2. Next.js 15+ Frontend (TypeScript & Tailwind v4)
- **High-Performance Map**: Integrates Leaflet via `react-leaflet` mapping hubs as heat rings colored by grid composition.
- **Real-Time Timelines**: Built using Recharts Area components to replay changes over time (2020-2026), showing the shifts after China's hashrate ban in 2021.
- **Responsive Layout**: Designed on a 2-Column Split matching the Real Rails DNA (70% Stage / 30% Sidebar) with an Obsidian Black theme (`#030712`).
- **Demo Guardrail (2-Hour Rule)**: The dashboard automatically queries the local FastAPI server. If offline or unreachable, it dynamically falls back to an offline mock data adapter to ensure zero downtime.

---

## 🧪 Verification & Visual Layouts

The layout, visual colors, and functional elements were verified on the local development build:

1. **Dashboard Interface**:
   ![Dashboard Interface](./dashboard_loaded_1781885929648.png)

2. **Scrolled view showing bottom charts**:
   ![Timeline & Pool Charts](./dashboard_scrolled_1781885951232.png)

3. **Interactive Dropdowns & Selection Filters**:
   ![Dropdown Filters](./dropdown_open_1781886039839.png)

### Verified Checklist:
- **Obsidian Black Theme (#030712)**: Confirmed.
- **Sidebar Width (30%)**: Confirmed.
- **Interactions**: Map tooltips, timeline play/pause controls, and country/energy/status filters work without page refreshes.
- **Download telemetry**: Download button successfully outputs CSV files.
- **API Status**: Top right HUD correctly logs connection state: `ONLINE (API)` when backend is active, and switches to `OFFLINE (LOCAL MOCK)` if offline.

---

## 🚀 Predictive Mining Migration & Geopolitical Entropy Upgrades

We have enriched the dashboard with advanced predictive modelling and geopolitical concentration metrics:

### 1. Backend Mathematical Calculations
* **Shannon Entropy ($H = -\sum p_i \log_2 p_i$):** Computes hashrate dispersion across political jurisdictions. Higher entropy indicates increased geographic decentralization (lower concentration risk).
* **Decentralization Trend Indicators:** Dynamically compares the current year's entropy to the previous year to output trend directions (`↗ increasing` / `↘ decreasing` / `→ stable`).
* **Double Exponential Smoothing (Holt's Linear Trend Model):** Forecasts country shares for the projection years **2027 and 2028**. The forecasted values are clamped to $\ge 0.0$ and normalized so that the total sum of all country shares equals $100\%$ for each year.

### 2. Frontend Interface Enhancements
* **Premium HUD scorecard:** Placed next to the global hashrate metric, showing the calculated decentralization index percentage, current raw entropy score $(H)$, and a colored trend pill badge representing the direction of decentralization.
* **Projections Toggle:** Adds a "Projections" control in the timeline card. When active, it updates the timeline slider bounds up to **2028** and converts the AreaChart's stacked lines to dashed outlines (`strokeDasharray="4 4"`) inside the projection zone.

---

## 🧪 Visual Verification (Upgrades)

The new feature additions were validated on the live build:

1. **Decentralization HUD Metric & Tooltip:**
   ![Decentralization Index Card](./dashboard_init_1782897713241.png)

2. **Dashed Projections Active (2027-2028):**
   ![Timeline Projections Active](./projections_active_1782898620613.png)

3. **Interactive UI Walkthrough Video:**
   ![UI Feature Walkthrough](./dashboard_final_check_1782898568764.webp)

