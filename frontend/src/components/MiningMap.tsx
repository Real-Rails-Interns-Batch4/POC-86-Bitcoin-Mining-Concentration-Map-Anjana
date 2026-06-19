"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import L from "leaflet";

interface HubProperties {
  id: string;
  name: string;
  country: string;
  region: string;
  hashrate_share: number;
  power_capacity_mw: number;
  energy_type: string;
  renewable_percentage: number;
  grid_intensity: number;
  status: string;
  institutional_control: string;
}

interface MiningMapProps {
  features: Array<{
    type: string;
    geometry: {
      type: string;
      coordinates: [number, number];
    };
    properties: HubProperties;
  }>;
  selectedHubId: string | null;
  onSelectHub: (hub: HubProperties | null) => void;
}

// Controller component to programmatically pan/zoom when a hub is selected
function MapController({ selectedHubId, features }: { selectedHubId: string | null; features: any[] }) {
  const map = useMap();

  useEffect(() => {
    if (selectedHubId) {
      const selectedFeature = features.find(f => f.properties.id === selectedHubId);
      if (selectedFeature) {
        const [lon, lat] = selectedFeature.geometry.coordinates;
        map.setView([lat, lon], 5, { animate: true });
      }
    }
  }, [selectedHubId, features, map]);

  return null;
}

export default function MiningMap({ features, selectedHubId, onSelectHub }: MiningMapProps) {
  // Fix leaflet asset path issues in SSR/Next environment
  useEffect(() => {
    // Delete default icon prototype options if using default markers
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });
  }, []);

  // Helper to color-code bubbles by energy type / renewable %
  const getMarkerColor = (renewablePct: number) => {
    if (renewablePct >= 80) return "#10B981"; // Hydro/Green - Emerald
    if (renewablePct >= 40) return "#38BDF8"; // Mix - Electric Cyan
    return "#F59E0B"; // Fossil Heavy - Amber
  };

  return (
    <div className="w-full h-full relative rounded-lg overflow-hidden border border-gray-800 shadow-2xl">
      <MapContainer
        center={[20, 0]}
        zoom={2}
        minZoom={2}
        maxZoom={10}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />

        {features.map((feature) => {
          const [lon, lat] = feature.geometry.coordinates;
          const { id, name, country, hashrate_share, renewable_percentage, energy_type } = feature.properties;
          const isSelected = selectedHubId === id;
          const radius = Math.max(8, Math.sqrt(hashrate_share) * 6);

          return (
            <CircleMarker
              key={id}
              center={[lat, lon]}
              radius={radius}
              fillColor={getMarkerColor(renewable_percentage)}
              color={isSelected ? "#ffffff" : "#1f2937"}
              weight={isSelected ? 2 : 1}
              fillOpacity={isSelected ? 0.85 : 0.6}
              eventHandlers={{
                click: () => {
                  onSelectHub(feature.properties);
                },
              }}
            >
              <Popup className="dark-leaflet-popup">
                <div className="p-2 space-y-1 font-sans text-xs">
                  <h4 className="font-bold text-gray-100 border-b border-gray-800 pb-1 mb-1">
                    {name}
                  </h4>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-400">Country:</span>
                    <span className="text-gray-200">{country}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-400">Hashrate Share:</span>
                    <span className="text-cyan-400 font-semibold">{hashrate_share}%</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-gray-400">Primary Energy:</span>
                    <span className="text-emerald-400 font-semibold">{energy_type} ({renewable_percentage}%)</span>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        <MapController selectedHubId={selectedHubId} features={features} />
      </MapContainer>

      {/* Map Legend overlay */}
      <div className="absolute bottom-4 left-4 z-[1000] p-3 rounded-md bg-[#0b1117]/90 border border-gray-800 text-[10px] space-y-1.5 backdrop-blur-sm pointer-events-auto">
        <div className="font-semibold text-gray-300 uppercase tracking-wider mb-1">Energy Profile</div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] inline-block" />
          <span className="text-gray-300">Renewable Dominant (&gt;80%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#38BDF8] inline-block" />
          <span className="text-gray-300">Mixed Grid (40% - 80%)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] inline-block" />
          <span className="text-gray-300">Fossil Heavy (&lt;40%)</span>
        </div>
      </div>
    </div>
  );
}
