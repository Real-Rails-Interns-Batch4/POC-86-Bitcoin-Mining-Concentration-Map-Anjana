# Visualization Audit Report (VAR)
**Project**: 86 - Bitcoin Mining Concentration Map  
**Category**: Settlement & Infrastructure  
**Data Sources**: Cambridge CBECI; CoinGecko API  

---

## 📊 Evaluation Summary

| Audit Vector | Audit Requirement | Status | Rationale |
| :--- | :--- | :---: | :--- |
| **1. Requirement Match** | Does the visual archetype (Geo/Relational/Temporal) match the Excel's intent? | **PASS** | Renders a high-performance Leaflet geospatial map (Geo), a timeline playback widget using Recharts Area (Temporal), and a mining pool share graph (Relational). |
| **2. DNA Check** | Is the background strictly `#030712`? Is the 70/30 split layout enforced? | **PASS** | Background is configured strictly to `#030712` in both CSS theme overrides and page layout. The structure uses a dual-pane flex layout with `w-[70%]` for the visualization stage and `w-[30%]` for the sidebar. |
| **3. Data Mapping** | Is the data from Cambridge CBECI & CoinGecko represented accurately in the 70% stage? | **PASS** | Country shares map directly to the Cambridge hashrate timeline, and mining pool distribution represents DCG/Bitmain infrastructure share. |

---

## 🔍 Detailed Audit Breakdown

### 1. Requirement Match
- **Geospatial (Geo)**: Leaflet overlays colored circular markers corresponding to regional power grids. Marker size scales dynamically to hashrate share (Cambridge CBECI).
- **Time-series (Temporal)**: Replay timeline runs from 2020 to 2026. The slider and play/pause controls correctly update the Recharts timeline and filter map points.
- **Institutions (Relational)**: Top mining pools (Foundry USA, AntPool, F2Pool) are visualized on a custom horizontal bar chart showing pool concentrations.

### 2. DNA Check
- **Color Palette**: Obsidian Black (`#030712`), Deep Navy (`#0B1117`), Borders (`#1F2937`), Accent Cyan (`#38BDF8`), and Secondary Indigo (`#818CF8`) are strictly applied.
- **Glassmorphism**: `.glass-panel` class creates subtle card backdrops using backdrop filters.
- **Active Glows**: Inspector elements apply a `.glow-active` 0.5px cyan shadow on user interaction.

### 3. Data Mapping
- **Cambridge CBECI Data**: Captures the historical shifts (2020-2026) including the 2021 Chinese mining ban (dropping China hashrate share to 0% and shifting power to North America and Kazakhstan).
- **CoinGecko Pool Data**: Maps current pool dominance, highlighting centralization vectors (Foundry + AntPool controlling ~55.7% of blocks).
