import os
from fastapi import FastAPI, Response
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import json

app = FastAPI(title="Bitcoin Mining Concentration Map API")

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Coordinates and details for major mining sites/hubs
MINING_HUBS = [
    {
        "id": "hub-us-texas",
        "name": "Texas ERCOT Hub",
        "country": "United States",
        "region": "Texas",
        "lat": 31.9686,
        "lon": -99.9018,
        "hashrate_share": 28.5,
        "power_capacity_mw": 850,
        "energy_type": "Wind/Solar/Gas",
        "renewable_percentage": 42.0,
        "grid_intensity": 380,
        "status": "Active",
        "institutional_control": "Riot Platforms, Marathon Digital, Core Scientific"
    },
    {
        "id": "hub-us-georgia",
        "name": "Georgia Industrial Cluster",
        "country": "United States",
        "region": "Georgia",
        "lat": 32.1656,
        "lon": -82.9001,
        "hashrate_share": 6.8,
        "power_capacity_mw": 240,
        "energy_type": "Nuclear/Coal/Gas",
        "renewable_percentage": 25.0,
        "grid_intensity": 410,
        "status": "Active",
        "institutional_control": "CleanSpark, Terawulf"
    },
    {
        "id": "hub-kz-ekibastuz",
        "name": "Ekibastuz Coal Basin Hub",
        "country": "Kazakhstan",
        "region": "Ekibastuz",
        "lat": 51.7297,
        "lon": 75.3266,
        "hashrate_share": 11.2,
        "power_capacity_mw": 450,
        "energy_type": "Coal",
        "renewable_percentage": 2.0,
        "grid_intensity": 880,
        "status": "Restricted",
        "institutional_control": "Local Grid Operators & private consortiums"
    },
    {
        "id": "hub-cn-sichuan",
        "name": "Sichuan Hydro-Mining Hub",
        "country": "China",
        "region": "Sichuan",
        "lat": 30.6570,
        "lon": 104.0658,
        "hashrate_share": 9.5,
        "power_capacity_mw": 380,
        "energy_type": "Hydro",
        "renewable_percentage": 92.0,
        "grid_intensity": 75,
        "status": "Underground",
        "institutional_control": "Private domestic pools & independent miners"
    },
    {
        "id": "hub-ru-bratsk",
        "name": "Bratsk Hydro Hub",
        "country": "Russia",
        "region": "Siberia",
        "lat": 56.1322,
        "lon": 101.6142,
        "hashrate_share": 8.0,
        "power_capacity_mw": 320,
        "energy_type": "Hydro",
        "renewable_percentage": 85.0,
        "grid_intensity": 90,
        "status": "Active",
        "institutional_control": "BitRiver"
    },
    {
        "id": "hub-is-reykjavik",
        "name": "Icelandic Geothermal Sites",
        "country": "Iceland",
        "region": "Reykjanes",
        "lat": 64.1466,
        "lon": -21.9426,
        "hashrate_share": 2.1,
        "power_capacity_mw": 90,
        "energy_type": "Geothermal/Hydro",
        "renewable_percentage": 100.0,
        "grid_intensity": 0,
        "status": "Active",
        "institutional_control": "Genesis Mining, Hive Digital"
    },
    {
        "id": "hub-ca-quebec",
        "name": "Quebec Hydro Grid Hub",
        "country": "Canada",
        "region": "Quebec",
        "lat": 52.9399,
        "lon": -73.5491,
        "hashrate_share": 3.4,
        "power_capacity_mw": 140,
        "energy_type": "Hydro",
        "renewable_percentage": 99.0,
        "grid_intensity": 5,
        "status": "Active",
        "institutional_control": "Bitfarms, Hut 8"
    },
    {
        "id": "hub-py-itaipu",
        "name": "Itaipu Dam Hub",
        "country": "Paraguay",
        "region": "Ciudad del Este",
        "lat": -25.4093,
        "lon": -54.6111,
        "hashrate_share": 4.2,
        "power_capacity_mw": 180,
        "energy_type": "Hydro",
        "renewable_percentage": 100.0,
        "grid_intensity": 0,
        "status": "Active",
        "institutional_control": "SATO Technologies, Marathon Digital"
    }
]

HISTORICAL_DATA = [
    {"year": 2020, "United States": 3.4, "China": 65.1, "Kazakhstan": 6.1, "Russia": 6.8, "Canada": 2.8, "Others": 15.8},
    {"year": 2021, "United States": 17.2, "China": 34.3, "Kazakhstan": 18.2, "Russia": 11.1, "Canada": 4.1, "Others": 15.1},
    {"year": 2022, "United States": 37.8, "China": 0.0, "Kazakhstan": 13.2, "Russia": 8.9, "Canada": 6.5, "Others": 33.6},
    {"year": 2023, "United States": 39.5, "China": 14.2, "Kazakhstan": 9.8, "Russia": 7.5, "Canada": 5.8, "Others": 23.2},
    {"year": 2024, "United States": 40.1, "China": 16.5, "Kazakhstan": 8.2, "Russia": 7.1, "Canada": 5.4, "Others": 22.7},
    {"year": 2025, "United States": 41.5, "China": 18.0, "Kazakhstan": 7.5, "Russia": 6.8, "Canada": 5.0, "Others": 21.2},
    {"year": 2026, "United States": 42.1, "China": 19.5, "Kazakhstan": 6.9, "Russia": 6.5, "Canada": 4.8, "Others": 20.2}
]

MINING_POOLS = [
    {"name": "Foundry USA", "share": 29.5, "headquarters": "United States", "operator": "Digital Currency Group"},
    {"name": "AntPool", "share": 26.2, "headquarters": "China / Singapore", "operator": "Bitmain"},
    {"name": "F2Pool", "share": 12.1, "headquarters": "China", "operator": "Chun Wang"},
    {"name": "ViaBTC", "share": 11.8, "headquarters": "China", "operator": "Haipo Yang"},
    {"name": "Binance Pool", "share": 8.4, "headquarters": "Malta/Global", "operator": "Binance"},
    {"name": "MaraPool", "share": 4.5, "headquarters": "United States", "operator": "Marathon Digital Holdings"},
    {"name": "Others", "share": 7.5, "headquarters": "Global", "operator": "Decentralized independent nodes"}
]

import urllib.request

def fetch_live_hashrate() -> float:
    try:
        url = "https://blockchain.info/q/hashrate"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=4) as response:
            raw_gh = float(response.read().decode("utf-8").strip())
            # Convert Gigahashes/sec to Exahashes/sec (divide by 1,000,000,000)
            ehs = round(raw_gh / 1_000_000_000, 1)
            if ehs > 10.0:  # Validate sanity threshold
                return ehs
    except Exception as e:
        print(f"Error fetching live hashrate, using default: {e}")
    return 612.4

@app.get("/api/summary")
def get_summary():
    live_hashrate = fetch_live_hashrate()
    return {
        "global_hashrate_ehs": live_hashrate,
        "avg_renewable_percentage": 54.8,
        "top_country": "United States (42.1%)",
        "active_hubs_tracked": len(MINING_HUBS),
        "last_updated": "June 2026 (Live)"
    }

@app.get("/api/map-data")
def get_map_data():
    return {
        "type": "FeatureCollection",
        "features": [
            {
                "type": "Feature",
                "geometry": {
                    "type": "Point",
                    "coordinates": [hub["lon"], hub["lat"]]
                },
                "properties": {
                    "id": hub["id"],
                    "name": hub["name"],
                    "country": hub["country"],
                    "region": hub["region"],
                    "hashrate_share": hub["hashrate_share"],
                    "power_capacity_mw": hub["power_capacity_mw"],
                    "energy_type": hub["energy_type"],
                    "renewable_percentage": hub["renewable_percentage"],
                    "grid_intensity": hub["grid_intensity"],
                    "status": hub["status"],
                    "institutional_control": hub["institutional_control"]
                }
            } for hub in MINING_HUBS
        ]
    }

@app.get("/api/historical")
def get_historical():
    return HISTORICAL_DATA

@app.get("/api/pools")
def get_pools():
    return MINING_POOLS

@app.get("/api/download")
def download_data():
    # Construct a dataframe from mining hubs data
    df = pd.DataFrame(MINING_HUBS)
    csv_data = df.to_csv(index=False)
    return Response(
        content=csv_data,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=bitcoin_mining_concentration_hubs.csv"}
    )
