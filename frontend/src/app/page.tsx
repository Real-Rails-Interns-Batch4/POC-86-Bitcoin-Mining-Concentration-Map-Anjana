"use client";

import { useEffect, useState, useRef, useTransition } from "react";
import dynamic from "next/dynamic";
import { 
  Activity, 
  Leaf, 
  Cpu, 
  Download, 
  Play, 
  Pause, 
  RotateCcw, 
  Info, 
  ShieldAlert, 
  Globe,
  Settings,
  Database
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  BarChart,
  Bar,
  Cell,
  Legend,
  ReferenceLine,
  ReferenceArea
} from "recharts";

// Dynamically import map component to disable SSR errors
const MiningMap = dynamic(() => import("../components/MiningMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-[#0b1117] border border-gray-800 rounded-lg text-gray-400">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div>
        <p className="text-sm font-mono tracking-wider">INITIALIZING GEOSPATIAL MAP ENGINE...</p>
      </div>
    </div>
  )
});

// Fallback Mock Datasets (Document 4 Guardrail)
const MOCK_SUMMARY = {
  global_hashrate_ehs: 612.4,
  avg_renewable_percentage: 54.8,
  top_country: "United States (42.1%)",
  active_hubs_tracked: 8,
  last_updated: "June 2026",
  geopolitical_entropy: {
    entropy_value: 2.184,
    max_entropy: 2.585,
    decentralization_index: 84.5,
    risk_level: "High Decentralization (Low Risk)",
    direction: "decreasing",
    direction_arrow: "↘"
  }
};

const MOCK_MINING_HUBS = [
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
];

const MOCK_HISTORICAL = [
  {"year": 2020, "United States": 3.4, "China": 65.1, "Kazakhstan": 6.1, "Russia": 6.8, "Canada": 2.8, "Others": 15.8},
  {"year": 2021, "United States": 17.2, "China": 34.3, "Kazakhstan": 18.2, "Russia": 11.1, "Canada": 4.1, "Others": 15.1},
  {"year": 2022, "United States": 37.8, "China": 0.0, "Kazakhstan": 13.2, "Russia": 8.9, "Canada": 6.5, "Others": 33.6},
  {"year": 2023, "United States": 39.5, "China": 14.2, "Kazakhstan": 9.8, "Russia": 7.5, "Canada": 5.8, "Others": 23.2},
  {"year": 2024, "United States": 40.1, "China": 16.5, "Kazakhstan": 8.2, "Russia": 7.1, "Canada": 5.4, "Others": 22.7},
  {"year": 2025, "United States": 41.5, "China": 18.0, "Kazakhstan": 7.5, "Russia": 6.8, "Canada": 5.0, "Others": 21.2},
  {"year": 2026, "United States": 42.1, "China": 19.5, "Kazakhstan": 6.9, "Russia": 6.5, "Canada": 4.8, "Others": 20.2},
  {"year": 2027, "is_forecast": true, "United States": 54.1, "China": 0.0, "Kazakhstan": 11.1, "Russia": 7.8, "Canada": 5.8, "Others": 21.3},
  {"year": 2028, "is_forecast": true, "United States": 56.3, "China": 0.0, "Kazakhstan": 10.7, "Russia": 7.3, "Canada": 5.6, "Others": 20.1}
];

const MOCK_POOLS = [
  {"name": "Foundry USA", "share": 29.5, "headquarters": "United States", "operator": "Digital Currency Group"},
  {"name": "AntPool", "share": 26.2, "headquarters": "China / Singapore", "operator": "Bitmain"},
  {"name": "F2Pool", "share": 12.1, "headquarters": "China", "operator": "Chun Wang"},
  {"name": "ViaBTC", "share": 11.8, "headquarters": "China", "operator": "Haipo Yang"},
  {"name": "Binance Pool", "share": 8.4, "headquarters": "Malta/Global", "operator": "Binance"},
  {"name": "MaraPool", "share": 4.5, "headquarters": "United States", "operator": "Marathon Digital Holdings"},
  {"name": "Others", "share": 7.5, "headquarters": "Global", "operator": "Decentralized independent nodes"}
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

export default function Dashboard() {
  const [isPending, startTransition] = useTransition();

  // Core API State
  const [summary, setSummary] = useState<any>(MOCK_SUMMARY);
  const [hubs, setHubs] = useState(MOCK_MINING_HUBS);
  const [historical, setHistorical] = useState(MOCK_HISTORICAL);
  const [pools, setPools] = useState(MOCK_POOLS);
  const [isUsingMock, setIsUsingMock] = useState(false);
  const [showForecast, setShowForecast] = useState(false);

  // Interaction State
  const [selectedHub, setSelectedHub] = useState<any>(null);
  const [selectedCountryFilter, setSelectedCountryFilter] = useState("All");
  const [selectedEnergyFilter, setSelectedEnergyFilter] = useState("All");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("All");
  
  // Replay timeline
  const [replayYear, setReplayYear] = useState(2026);
  const [isReplaying, setIsReplaying] = useState(false);
  const timerRef = useRef<any>(null);

  // Fetch API data on load with fallback logic
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [sumRes, mapRes, histRes, poolRes] = await Promise.all([
          fetch(`${API_URL}/summary`),
          fetch(`${API_URL}/map-data`),
          fetch(`${API_URL}/historical`),
          fetch(`${API_URL}/pools`)
        ]);

        if (!sumRes.ok || !mapRes.ok || !histRes.ok || !poolRes.ok) {
          throw new Error("HTTP error on API fetch");
        }

        const sumJson = await sumRes.json();
        const mapJson = await mapRes.json();
        const histJson = await histRes.json();
        const poolJson = await poolRes.json();

        // Convert GeoJSON features back to flat array for React layout filters
        const hubsList = mapJson.features.map((f: any) => ({
          ...f.properties,
          lat: f.geometry.coordinates[1],
          lon: f.geometry.coordinates[0]
        }));

        setSummary(sumJson);
        setHubs(hubsList);
        setHistorical(histJson);
        setPools(poolJson);
        setIsUsingMock(false);
      } catch (err) {
        console.warn("Backend API not reachable. Switching to local mock dataset:", err);
        setIsUsingMock(true);
        // Reset states to fallback values
        setSummary(MOCK_SUMMARY);
        setHubs(MOCK_MINING_HUBS);
        setHistorical(MOCK_HISTORICAL);
        setPools(MOCK_POOLS);
      }
    };

    fetchDashboardData();
  }, []);

  // Handle Play/Pause timeline replay
  useEffect(() => {
    if (isReplaying) {
      timerRef.current = setInterval(() => {
        setReplayYear((prevYear) => {
          const maxYear = showForecast ? 2028 : 2026;
          if (prevYear >= maxYear) return 2020;
          return prevYear + 1;
        });
      }, 1500);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isReplaying, showForecast]);

  // Apply interactive filters
  const filteredHubs = hubs.filter((hub) => {
    // Country Filter
    if (selectedCountryFilter !== "All" && hub.country !== selectedCountryFilter) return false;
    
    // Status Filter
    if (selectedStatusFilter !== "All" && hub.status !== selectedStatusFilter) return false;
    
    // Energy Filter
    if (selectedEnergyFilter !== "All") {
      if (selectedEnergyFilter === "Hydro" && !hub.energy_type.toLowerCase().includes("hydro")) return false;
      if (selectedEnergyFilter === "Renewable Dominant" && hub.renewable_percentage < 80) return false;
      if (selectedEnergyFilter === "Fossil Heavy" && hub.renewable_percentage > 40) return false;
    }
    
    return true;
  });

  // Re-map features list to match Leaflet map requirements
  const mapFeatures = filteredHubs.map((hub) => ({
    type: "Feature",
    geometry: {
      type: "Point" as const,
      coordinates: [hub.lon, hub.lat] as [number, number],
    },
    properties: hub,
  }));

  // Download Data logic
  const handleDownload = () => {
    if (isUsingMock) {
      // Build client-side CSV download if API is down
      const headers = "id,name,country,region,lat,lon,hashrate_share,power_capacity_mw,energy_type,renewable_percentage,grid_intensity,status,institutional_control\n";
      const rows = hubs.map(h => 
        `"${h.id}","${h.name}","${h.country}","${h.region}",${h.lat},${h.lon},${h.hashrate_share},${h.power_capacity_mw},"${h.energy_type}",${h.renewable_percentage},${h.grid_intensity},"${h.status}","${h.institutional_control}"`
      ).join("\n");
      const blob = new Blob([headers + rows], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "bitcoin_mining_concentration_hubs_local.csv";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      // Trigger direct download from backend
      window.open(`${API_URL}/download`, "_blank");
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#030712] text-gray-100 font-sans">
      
      {/* LEFT STAGE: 70% Width */}
      <div className="w-[70%] h-full flex flex-col p-4 space-y-4 border-r border-gray-800">
        
        {/* Top Header Metrics & Control HUD */}
        <div className="flex items-center justify-between glass-panel border border-gray-800 p-3 rounded-lg">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-cyan-400 animate-pulse" />
            <div>
              <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-mono">Terminal Active Instance</span>
              <h2 className="text-sm font-semibold tracking-tight text-white flex items-center gap-2">
                Settlement & Infrastructure: Bitcoin HASHRATE MATRIX
              </h2>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-right">
              <span className="text-[10px] text-gray-400 uppercase block font-mono">GLOBAL HASHRATE</span>
              <span className="text-sm font-bold text-cyan-400">{summary.global_hashrate_ehs} EH/s</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-400 uppercase block font-mono">AVG RENEWABLE %</span>
              <span className="text-sm font-bold text-emerald-400">{summary.avg_renewable_percentage}%</span>
            </div>
            <div className="text-right group relative cursor-help">
              <span className="text-[10px] text-gray-400 uppercase block font-mono">GEOPOLITICAL DECENTRALIZATION</span>
              <div className="flex items-center justify-end gap-1.5 mt-0.5">
                <span className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border uppercase flex items-center gap-0.5 ${
                  (summary.geopolitical_entropy || MOCK_SUMMARY.geopolitical_entropy).direction === "increasing"
                    ? "text-emerald-400 border-emerald-500/30 bg-emerald-950/20"
                    : (summary.geopolitical_entropy || MOCK_SUMMARY.geopolitical_entropy).direction === "decreasing"
                    ? "text-rose-400 border-rose-500/30 bg-rose-950/20"
                    : "text-gray-400 border-gray-500/30 bg-gray-950/20"
                }`}>
                  <span className="text-[10px]">{(summary.geopolitical_entropy || MOCK_SUMMARY.geopolitical_entropy).direction_arrow}</span>
                  {(summary.geopolitical_entropy || MOCK_SUMMARY.geopolitical_entropy).direction}
                </span>
                <span className="text-sm font-bold text-indigo-400 hover:text-indigo-300 transition-colors duration-200 shadow-[0_0_10px_rgba(129,140,248,0.2)] px-1.5 py-0.5 rounded border border-indigo-500/20 bg-indigo-950/10">
                  {(summary.geopolitical_entropy || MOCK_SUMMARY.geopolitical_entropy).decentralization_index}% <span className="text-[10px] text-gray-400 font-normal">({(summary.geopolitical_entropy || MOCK_SUMMARY.geopolitical_entropy).entropy_value} H)</span>
                </span>
              </div>
              {/* Tooltip */}
              <div className="absolute right-0 top-full mt-2 hidden group-hover:block z-50 w-64 p-3 bg-[#0b1117] border border-indigo-500/30 rounded-md shadow-2xl text-left backdrop-blur-md">
                <p className="text-[11px] font-mono text-cyan-400 mb-1 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping inline-block" />
                  GEOPOLITICAL ENTROPY METRICS
                </p>
                <div className="text-[10px] text-gray-300 space-y-1.5">
                  <div className="flex justify-between">
                    <span>Shannon Entropy (H):</span>
                    <span className="text-white font-mono font-bold">{(summary.geopolitical_entropy || MOCK_SUMMARY.geopolitical_entropy).entropy_value} / {(summary.geopolitical_entropy || MOCK_SUMMARY.geopolitical_entropy).max_entropy}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Risk Profile:</span>
                    <span className={`font-semibold ${(summary.geopolitical_entropy || MOCK_SUMMARY.geopolitical_entropy).risk_level.includes("Low Risk") ? "text-emerald-400" : "text-amber-400"}`}>
                      {(summary.geopolitical_entropy || MOCK_SUMMARY.geopolitical_entropy).risk_level}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Decentralization Trend:</span>
                    <span className={`font-bold capitalize ${(summary.geopolitical_entropy || MOCK_SUMMARY.geopolitical_entropy).direction === "increasing" ? "text-emerald-400" : "text-rose-400"}`}>
                      {(summary.geopolitical_entropy || MOCK_SUMMARY.geopolitical_entropy).direction_arrow} {(summary.geopolitical_entropy || MOCK_SUMMARY.geopolitical_entropy).direction}
                    </span>
                  </div>
                  <p className="text-[9px] text-gray-400 border-t border-gray-800 pt-1 leading-relaxed">
                    Measures hashrate dispersion using Shannon's Entropy. A higher index indicates the network hashrate is spread across more jurisdictions, lowering geopolitical risk.
                  </p>
                </div>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-gray-400 uppercase block font-mono">SOURCE CONNECTIVITY</span>
              <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${isUsingMock ? "text-amber-400 border-amber-400/40 bg-amber-950/20" : "text-emerald-400 border-emerald-400/40 bg-emerald-950/20"}`}>
                {isUsingMock ? "OFFLINE (LOCAL MOCK)" : "ONLINE (API)"}
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Interactive Leaflet Map stage */}
        <div className="flex-1 min-h-[350px] relative">
          <MiningMap 
            features={mapFeatures} 
            selectedHubId={selectedHub?.id || null} 
            onSelectHub={setSelectedHub} 
          />
        </div>

        {/* Lower Analytics Stage: Split between Replay Chart & Pool Distribution */}
        <div className="h-[220px] grid grid-cols-2 gap-4">
          
          {/* Replay over Time / Country Share Line Chart */}
          <div className="glass-panel border border-gray-800 rounded-lg p-3 flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-gray-800/80 pb-1.5">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-semibold tracking-wider text-gray-300 uppercase">Hashrate Share Timeline ({replayYear})</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => {
                    const nextShow = !showForecast;
                    setShowForecast(nextShow);
                    if (!nextShow && replayYear > 2026) {
                      setReplayYear(2026);
                    }
                  }}
                  className={`px-2 py-0.5 rounded text-[9px] font-mono transition duration-200 border ${
                    showForecast 
                      ? "bg-cyan-950/40 border-cyan-400 text-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.2)]" 
                      : "bg-gray-900/60 border-gray-700 text-gray-400 hover:text-gray-200 hover:border-gray-600"
                  }`}
                  title="Toggle 2027-2028 projections (Holt's Linear Model)"
                >
                  Projections
                </button>
                <button 
                  onClick={() => setIsReplaying(!isReplaying)}
                  className="p-1 rounded bg-cyan-900/30 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-400 transition"
                  title={isReplaying ? "Pause Replay" : "Play Replay Over Time"}
                >
                  {isReplaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                </button>
                <button 
                  onClick={() => { setIsReplaying(false); setReplayYear(showForecast ? 2028 : 2026); }}
                  className="p-1 rounded bg-gray-900/50 hover:bg-gray-800 border border-gray-700 text-gray-400 transition"
                  title="Reset to Current"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Replay Slider controller */}
            <div className="my-2 flex items-center gap-3 px-1">
              <span className="text-[10px] font-mono text-gray-500">2020</span>
              <input
                type="range"
                min="2020"
                max={showForecast ? "2028" : "2026"}
                value={replayYear}
                onChange={(e) => {
                  setIsReplaying(false);
                  setReplayYear(parseInt(e.target.value));
                }}
                className="flex-1 accent-cyan-400 h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer"
              />
              <span className="text-[10px] font-mono text-cyan-400 font-bold">{replayYear}</span>
            </div>

            {/* Recharts Area Chart */}
            <div className="flex-1 w-full text-[9px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historical.filter(h => h.year <= replayYear && (showForecast || !(h as any).is_forecast))}>
                  <XAxis dataKey="year" stroke="#4b5563" />
                  <YAxis stroke="#4b5563" />
                  <ChartTooltip 
                    contentStyle={{ backgroundColor: "#0b1117", borderColor: "#1f2937", color: "#f3f4f6" }}
                  />
                  <Legend iconSize={8} wrapperStyle={{ fontSize: '9px', marginTop: '-5px' }} />
                  {showForecast && (
                    <ReferenceArea x1={2026} x2={2028} stroke="#818cf8" strokeDasharray="3 3" strokeOpacity={0.4} fill="#818cf8" fillOpacity={0.03} />
                  )}
                  {showForecast && (
                    <ReferenceLine x={2026} stroke="#818cf8" strokeDasharray="3 3" label={{ value: 'PROJECTION ZONE', fill: '#818cf8', fontSize: 8, position: 'top', dy: -5 }} />
                  )}
                  <Area type="monotone" dataKey="United States" stroke="#38bdf8" fill="#38bdf8" fillOpacity={0.1} stackId="1" strokeDasharray={showForecast ? "4 4" : undefined} />
                  <Area type="monotone" dataKey="China" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} stackId="1" strokeDasharray={showForecast ? "4 4" : undefined} />
                  <Area type="monotone" dataKey="Kazakhstan" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.1} stackId="1" strokeDasharray={showForecast ? "4 4" : undefined} />
                  <Area type="monotone" dataKey="Russia" stroke="#818cf8" fill="#818cf8" fillOpacity={0.1} stackId="1" strokeDasharray={showForecast ? "4 4" : undefined} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Mining Pools Concentration Analytics */}
          <div className="glass-panel border border-gray-800 rounded-lg p-3 flex flex-col justify-between">
            <div className="flex items-center gap-2 border-b border-gray-800/80 pb-1.5">
              <Cpu className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-semibold tracking-wider text-gray-300 uppercase">Pool Hashrate Share (%)</span>
            </div>

            {/* Recharts Bar Chart */}
            <div className="flex-1 w-full text-[9px] mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pools} layout="vertical">
                  <XAxis type="number" stroke="#4b5563" domain={[0, 35]} />
                  <YAxis dataKey="name" type="category" stroke="#4b5563" width={70} />
                  <ChartTooltip
                    contentStyle={{ backgroundColor: "#0b1117", borderColor: "#1f2937", color: "#f3f4f6" }}
                  />
                  <Bar dataKey="share" fill="#818cf8" radius={[0, 4, 4, 0]}>
                    {pools.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.name === "Foundry USA" || entry.name === "AntPool" ? "#38bdf8" : "#818cf8"} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

      </div>

      {/* INTELLIGENCE SIDEBAR: 30% Width */}
      <div className="w-[30%] h-full flex flex-col bg-[#0b1117] border-l border-gray-800 p-6 justify-between overflow-y-auto">
        
        {/* Section A: Title & High-level Metric */}
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-bold uppercase tracking-widest mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping inline-block" />
              Settlement & Infrastructure
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white uppercase">
              Bitcoin Mining Concentration Map
            </h1>
            <p className="text-xs text-gray-400 mt-1">
              Geospatial telemetry mapping institutional, state, and pool-level control nodes.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3 bg-[#030712] border border-gray-800/80 rounded-md">
              <span className="text-[10px] text-gray-400 block font-mono">DOMINANT REGION</span>
              <span className="text-xs font-bold text-cyan-400 uppercase">{summary.top_country}</span>
            </div>
            <div className="p-3 bg-[#030712] border border-gray-800/80 rounded-md">
              <span className="text-[10px] text-gray-400 block font-mono">TRACKED NODES</span>
              <span className="text-xs font-bold text-indigo-400 uppercase">{summary.active_hubs_tracked} Global Hubs</span>
            </div>
          </div>
        </div>

        {/* Section B: Why This Matters */}
        <div className="border-t border-gray-800 py-4 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-300 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" /> Why This Matters
          </h3>
          <p className="text-xs text-gray-300 leading-relaxed font-sans">
            Shows that even decentralized systems have physical concentration points. Hardware deployments, energy off-take structures, and local regulatory policies shape the routing of settlement security.
          </p>
        </div>

        {/* Section C: Who Controls the Rail */}
        <div className="border-t border-gray-800 py-4 space-y-2">
          <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5" /> Who Controls the Rail
          </h3>
          <p className="text-xs text-gray-300 leading-relaxed font-sans">
            The Bitcoin Mining Concentration Map reveals a centralized power dynamic where control over network security and transaction validation is heavily consolidated among a few dominant geographic regions and massive mining pools, challenging Bitcoin's foundational ethos of decentralization.
          </p>
        </div>

        {/* Selected Hub Interactive Inspector Card */}
        {selectedHub && (
          <div className="border border-cyan-500/40 bg-[#030712]/90 rounded-md p-3 space-y-2 relative glow-active">
            <div className="flex justify-between items-start border-b border-gray-800 pb-1">
              <h4 className="text-xs font-bold text-white uppercase">{selectedHub.name}</h4>
              <button 
                onClick={() => setSelectedHub(null)}
                className="text-[10px] text-gray-500 hover:text-cyan-400 transition"
              >
                ✕ Close
              </button>
            </div>
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 text-[10px]">
              <div>
                <span className="text-gray-400 block font-mono">Location:</span>
                <span className="text-gray-200">{selectedHub.region}, {selectedHub.country}</span>
              </div>
              <div>
                <span className="text-gray-400 block font-mono">Capacity:</span>
                <span className="text-gray-200 font-semibold">{selectedHub.power_capacity_mw} MW</span>
              </div>
              <div>
                <span className="text-gray-400 block font-mono">Hashrate Share:</span>
                <span className="text-cyan-400 font-bold">{selectedHub.hashrate_share}%</span>
              </div>
              <div>
                <span className="text-gray-400 block font-mono">Energy Mix:</span>
                <span className="text-emerald-400 font-bold">{selectedHub.renewable_percentage}% Green ({selectedHub.energy_type})</span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-400 block font-mono">Institutional Control:</span>
                <span className="text-gray-300 italic">{selectedHub.institutional_control}</span>
              </div>
            </div>
          </div>
        )}

        {/* Section D: Functional Filters */}
        <div className="border-t border-gray-800 py-4 space-y-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase text-gray-300">
            <Settings className="w-3.5 h-3.5" /> Interactive Filters
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-[9px] uppercase tracking-wider text-gray-500 block mb-1">Country Node</label>
              <select
                value={selectedCountryFilter}
                onChange={(e) => setSelectedCountryFilter(e.target.value)}
                className="w-full text-xs bg-[#030712] border border-gray-800 rounded p-1.5 text-gray-200 focus:outline-none focus:border-cyan-400"
              >
                <option value="All">All Countries</option>
                <option value="United States">United States</option>
                <option value="China">China</option>
                <option value="Kazakhstan">Kazakhstan</option>
                <option value="Russia">Russia</option>
                <option value="Canada">Canada</option>
                <option value="Paraguay">Paraguay</option>
                <option value="Iceland">Iceland</option>
              </select>
            </div>

            <div>
              <label className="text-[9px] uppercase tracking-wider text-gray-500 block mb-1">Operational Status</label>
              <select
                value={selectedStatusFilter}
                onChange={(e) => setSelectedStatusFilter(e.target.value)}
                className="w-full text-xs bg-[#030712] border border-gray-800 rounded p-1.5 text-gray-200 focus:outline-none focus:border-cyan-400"
              >
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Restricted">Restricted / Capped</option>
                <option value="Underground">Underground / Unreported</option>
              </select>
            </div>

            <div>
              <label className="text-[9px] uppercase tracking-wider text-gray-500 block mb-1">Grid Composition</label>
              <select
                value={selectedEnergyFilter}
                onChange={(e) => setSelectedEnergyFilter(e.target.value)}
                className="w-full text-xs bg-[#030712] border border-gray-800 rounded p-1.5 text-gray-200 focus:outline-none focus:border-cyan-400"
              >
                <option value="All">All Energy Grid Types</option>
                <option value="Hydro">Hydro-Electric Dominant</option>
                <option value="Renewable Dominant">High Green Mix (&gt;80%)</option>
                <option value="Fossil Heavy">High Fossil Mix (&lt;40%)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section E: Download Sample Data Button */}
        <div className="border-t border-gray-800 pt-4">
          <button
            onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded bg-cyan-500 text-[#030712] hover:bg-cyan-400 active:scale-[0.98] transition font-bold text-xs uppercase tracking-wider"
          >
            <Download className="w-4 h-4" /> Download Hub telemetries
          </button>
        </div>

      </div>

    </div>
  );
}
