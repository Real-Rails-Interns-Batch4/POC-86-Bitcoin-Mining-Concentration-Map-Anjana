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


import math
import urllib.request

def calculate_geopolitical_entropy(historical_data) -> dict:
    if not historical_data:
        return {
            "entropy_value": 0.0,
            "max_entropy": 0.0,
            "decentralization_index": 0.0,
            "risk_level": "Unknown",
            "direction": "stable",
            "direction_arrow": "→"
        }
    
    # Get the latest actual (non-forecasted) year's data
    actual_data = [h for h in historical_data if not h.get("is_forecast")]
    if not actual_data:
        return {
            "entropy_value": 0.0,
            "max_entropy": 0.0,
            "decentralization_index": 0.0,
            "risk_level": "Unknown",
            "direction": "stable",
            "direction_arrow": "→"
        }
        
    latest_year_data = actual_data[-1]
    shares = [val for key, val in latest_year_data.items() if key not in ("year", "is_forecast")]
    total_share = sum(shares)
    if total_share == 0:
        return {
            "entropy_value": 0.0,
            "max_entropy": 0.0,
            "decentralization_index": 0.0,
            "risk_level": "Unknown",
            "direction": "stable",
            "direction_arrow": "→"
        }
        
    probs = [s / total_share for s in shares if s > 0]
    entropy = -sum(p * math.log2(p) for p in probs)
    max_entropy = math.log2(len(shares)) if len(shares) > 0 else 1.0
    decentralization_index = round((entropy / max_entropy) * 100, 1) if max_entropy > 0 else 0.0
    
    # Calculate previous year's entropy to find direction
    direction = "stable"
    direction_arrow = "→"
    if len(actual_data) >= 2:
        prev_year_data = actual_data[-2]
        prev_shares = [val for key, val in prev_year_data.items() if key not in ("year", "is_forecast")]
        prev_total = sum(prev_shares)
        if prev_total > 0:
            prev_probs = [s / prev_total for s in prev_shares if s > 0]
            prev_entropy = -sum(p * math.log2(p) for p in prev_probs)
            if entropy > prev_entropy + 0.001:
                direction = "increasing"
                direction_arrow = "↗"
            elif entropy < prev_entropy - 0.001:
                direction = "decreasing"
                direction_arrow = "↘"
                
    # Risk categorization
    if decentralization_index >= 80:
        risk_level = "High Decentralization (Low Risk)"
    elif decentralization_index >= 60:
        risk_level = "Moderate Decentralization (Medium Risk)"
    else:
        risk_level = "High Concentration (High Risk)"
        
    return {
        "entropy_value": round(entropy, 3),
        "max_entropy": round(max_entropy, 3),
        "decentralization_index": decentralization_index,
        "risk_level": risk_level,
        "direction": direction,
        "direction_arrow": direction_arrow
    }

def holt_linear_trend_forecast(series, alpha=0.5, beta=0.3, steps=2):
    n = len(series)
    if n == 0:
        return [0.0] * steps
    if n == 1:
        return [series[0]] * steps
        
    L = [0.0] * n
    T = [0.0] * n
    
    L[0] = series[0]
    L[1] = series[1]
    T[1] = series[1] - series[0]
    
    for t in range(2, n):
        L[t] = alpha * series[t] + (1 - alpha) * (L[t-1] + T[t-1])
        T[t] = beta * (L[t] - L[t-1]) + (1 - beta) * T[t-1]
        
    forecasts = []
    for h in range(1, steps + 1):
        f = L[-1] + h * T[-1]
        forecasts.append(f)
    return forecasts

def get_forecasted_data(historical_data, alpha=0.5, beta=0.3, steps=2):
    if not historical_data:
        return []
        
    first_row = historical_data[0]
    countries = [k for k in first_row.keys() if k != "year"]
    
    series_dict = {country: [] for country in countries}
    for row in historical_data:
        for country in countries:
            series_dict[country].append(row[country])
            
    forecasts_dict = {}
    for country, series in series_dict.items():
        forecasts_dict[country] = holt_linear_trend_forecast(series, alpha, beta, steps)
        
    last_year = historical_data[-1]["year"]
    forecasted_rows = []
    for h in range(1, steps + 1):
        year = last_year + h
        raw_vals = {country: max(0.0, forecasts_dict[country][h-1]) for country in countries}
        total_sum = sum(raw_vals.values())
        
        if total_sum > 0:
            normalized_vals = {country: round((val / total_sum) * 100, 1) for country, val in raw_vals.items()}
        else:
            normalized_vals = {country: round(100.0 / len(countries), 1) for country in countries}
            
        row = {"year": year, "is_forecast": True}
        row.update(normalized_vals)
        forecasted_rows.append(row)
        
    return forecasted_rows

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
    entropy_metrics = calculate_geopolitical_entropy(HISTORICAL_DATA)
    return {
        "global_hashrate_ehs": live_hashrate,
        "avg_renewable_percentage": 54.8,
        "top_country": "United States (42.1%)",
        "active_hubs_tracked": len(MINING_HUBS),
        "last_updated": "June 2026 (Live)",
        "geopolitical_entropy": entropy_metrics
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
    forecast_data = get_forecasted_data(HISTORICAL_DATA)
    return HISTORICAL_DATA + forecast_data

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
