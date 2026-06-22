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

# Load datasets from JSON file
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_FILE_PATH = os.path.join(BASE_DIR, "data.json")

try:
    with open(DATA_FILE_PATH, "r", encoding="utf-8") as f:
        _data = json.load(f)
        MINING_HUBS = _data.get("mining_hubs", [])
        HISTORICAL_DATA = _data.get("historical_data", [])
        MINING_POOLS = _data.get("mining_pools", [])
except Exception as e:
    print(f"Error loading data.json: {e}")
    MINING_HUBS = []
    HISTORICAL_DATA = []
    MINING_POOLS = []


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
