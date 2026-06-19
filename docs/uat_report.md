# User Acceptance Testing (UAT) Report
**Project**: 86 - Bitcoin Mining Concentration Map  
**Category**: Settlement & Infrastructure  
**Data Sources**: Cambridge CBECI; CoinGecko API  

This document evaluates the functional compliance of the dashboard interface against the user interaction specifications.

---

## 📋 Functional UAT Table

| Test Case ID | Test Case / Action | Expected Result | Pass/Fail |
| :--- | :--- | :--- | :---: |
| **UAT-001** | **The Handshake**: Click a circular mine marker on the Leaflet Map (e.g., Texas ERCOT Hub). | The sidebar (30% pane) spawns an Inspector Card displaying the selected hub's exact metadata (850 MW capacity, 28.5% share, Wind/Solar mix, and control by Riot/Marathon). | **PASS** |
| **UAT-002** | **Filter Logic - Geography**: Select "United States" in the Country filter dropdown. | The Leaflet map updates reactively to show only nodes located in the United States. Recharts graphs filter out unrelated datasets without a full page refresh. | **PASS** |
| **UAT-003** | **Filter Logic - Grid Composition**: Select "Hydro-Electric Dominant" in the Grid Composition dropdown. | The map filter isolates Sichuan and Siberia hydro hubs; marker colors update immediately. | **PASS** |
| **UAT-004** | **Temporal Timeline Replay**: Click the **Play** button on the bottom timeline. | The timeline automatically advances year-by-year from 2020 to 2026. The historical Recharts graph and map node sizes re-render dynamically to show hashrate migration. | **PASS** |
| **UAT-005** | **Download Telemetries**: Click the **Download Hub telemetries** button. | Initiates download of a structured CSV file containing complete coordinates, hashrate split, and energy context data. | **PASS** |
| **UAT-006** | **Intelligence Copy (Who Controls)**: Inspect the "Who Controls the Rail" sidebar panel. | The copy details how geographic concentration and mining pool oligopoly (e.g. Foundry + AntPool) control settlement security, matching Cambridge CBECI and CoinGecko findings. | **PASS** |
| **UAT-007** | **API Connection Resilience**: Disconnect backend server instance. | The UI catches the connection error and instantly falls back to local structured datasets, switching the status indicator to `OFFLINE (LOCAL MOCK)`. | **PASS** |
