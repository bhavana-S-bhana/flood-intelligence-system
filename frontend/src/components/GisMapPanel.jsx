import React from 'react';
import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polygon, Marker, Popup, Polyline, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import { Compass, Layers, Warehouse, Navigation, AlertTriangle, Truck } from 'lucide-react';
import { GeoJSON } from 'react-leaflet';

// Custom DivIcons for Leaflet Map
const createDepotIcon = (name) => {
  return L.divIcon({
    className: 'custom-depot-marker',
    html: `
      <div style="background: rgba(15, 23, 42, 0.95); border: 2px solid #3B82F6; border-radius: 8px; padding: 4px 8px; color: white; font-size: 11px; font-weight: bold; display: flex; items-center; gap: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.6); white-space: nowrap;">
        <span style="background: #2563EB; color: white; border-radius: 4px; padding: 1px 4px; font-size: 10px;">Depot</span>
        <span>${name}</span>
      </div>
    `,
    iconSize: [120, 30],
    iconAnchor: [60, 15]
  });
};

const createZoneCenterIcon = (zoneId, name, severity) => {
  const color = severity === 'Critical' ? '#EF4444' : severity === 'High' ? '#F97316' : severity === 'Medium' ? '#EAB308' : '#10B981';
  return L.divIcon({
    className: 'custom-zone-marker',
    html: `
      <div style="background: rgba(17, 24, 39, 0.9); border: 2px solid ${color}; border-radius: 6px; padding: 3px 6px; color: white; font-size: 11px; font-weight: bold; display: flex; items-center; gap: 4px; box-shadow: 0 4px 10px rgba(0,0,0,0.5);">
        <span style="background: ${color}; color: black; border-radius: 3px; padding: 0px 4px; font-size: 10px; font-weight: 800;">${zoneId}</span>
        <span>${name}</span>
      </div>
    `,
    iconSize: [110, 26],
    iconAnchor: [55, 13]
  });
};

const createTransitBadgeIcon = (label) => {
  return L.divIcon({
    className: 'custom-transit-marker',
    html: `
      <div style="background: rgba(30, 58, 138, 0.95); border: 1px solid #60A5FA; border-radius: 6px; padding: 3px 6px; color: #EFF6FF; font-size: 9px; font-weight: 600; display: flex; align-items: center; gap: 4px; box-shadow: 0 4px 12px rgba(0,0,0,0.5); backdrop-filter: blur(4px); white-space: nowrap;">
        <span style="font-size: 12px;">${label}</span>
      </div>
    `,
    iconSize: [180, 24],
    iconAnchor: [90, 12]
  });
};

export default function GisMapPanel({ zones, selectedZoneId, onSelectZone, transitRoutes }) {
  console.log("FRONTEND TRANSIT ROUTES:", transitRoutes);
  const [mapStyle, setMapStyle] = useState('satellite'); // 'satellite', 'dark', 'terrain'
  const [showLabels, setShowLabels] = useState(true);

  const [keralaBoundaryData, setKeralaBoundaryData] = useState(null);
  const [keralaZonesData, setKeralaZonesData] = useState(null);

  useEffect(() => {
    fetch('/kerala_boundary.geojson')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Failed to load Kerala boundary');
        }
        return response.json();
      })
      .then((data) => setKeralaBoundaryData(data))
      .catch((error) => console.error('Kerala boundary error:', error));
  }, []);
  
useEffect(() => {
  fetch('/kerala_8_zones.geojson')
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to load Kerala 8 zones');
      }
      return response.json();
    })
    .then((data) => {
      if (data.features?.length !== 8) {
        throw new Error('Expected exactly 8 flood zones');
      }
      setKeralaZonesData(data);
    })
    .catch((error) => {
      console.error('Kerala zones error:', error);
    });
}, []);


  const tileUrls = {
    satellite: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    dark: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    terrain: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png'
  };

  const mapAttributions = {
    satellite: 'Esri, Maxar, Earthstar Geographics',
    dark: '&copy; CartoDB & OpenStreetMap',
    terrain: '&copy; OpenTopoMap'
  };

  const getPolygonStyle = (severity, isSelected) => {
  let color = '#10B981';
  let fillColor = '#10B981';
  
  if (severity === 'Critical') {
    color = '#DC2626';
    fillColor = '#DC2626';
  } else if (severity === 'Medium') {
    color = '#EAB308';
    fillColor = '#EAB308';
  }

  return {
    color: isSelected ? '#FFFFFF' : color,
    weight: isSelected ? 3 : 2,
    fillColor: fillColor,
    fillOpacity: isSelected ? 0.55 : 0.35,
    dashArray: isSelected ? '4' : null
  };
};

  const zoneList = zones ? Object.values(zones) : [];

const defaultRoutes = transitRoutes || [];

  const depots = [
    { id: 'D1', name: 'D1 Kochi Depot', coords: [9.97, 76.28] },
    { id: 'D2', name: 'D2 Kozhikode Depot', coords: [11.25, 75.77] },
    { id: 'D3', name: 'D3 Thrissur Depot', coords: [10.52, 76.20] },
    { id: 'D4', name: 'D4 Trivandrum Depot', coords: [8.52, 76.93] }
  ];

  return (
    <div className="relative flex-1 h-full min-h-[400px] bg-[#0A1120] rounded-xl overflow-hidden border border-slate-800 shadow-2xl flex flex-col">
      {/* Top Map Header Overlay */}
      <div className="absolute top-3 left-3 z-[1000] bg-[#0D1527]/90 backdrop-blur-md border border-slate-700/60 px-3.5 py-2 rounded-xl text-white shadow-xl flex items-center space-x-2.5">
        <Compass className="w-5 h-5 text-blue-400 animate-spin-slow" />
        <div>
          <h2 className="text-sm font-bold text-white tracking-wide">Kerala Flood Monitoring & Resource Allocation</h2>
          <p className="text-[10px] text-slate-400">GIS Live Satellite Layer • Real-time MILP Dispatch Routing</p>
        </div>
      </div>

      {/* Top Right Map Style Control Overlay */}
      <div className="absolute top-3 right-3 z-[1000] bg-[#0D1527]/90 backdrop-blur-md border border-slate-700/60 p-1.5 rounded-xl text-xs flex items-center space-x-1 shadow-xl">
        <button
          onClick={() => setMapStyle('satellite')}
          className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
            mapStyle === 'satellite' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-white'
          }`}
        >
          Satellite
        </button>
        

       
<button
  onClick={() => setMapStyle('terrain')}
  className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
    mapStyle === 'terrain'
      ? 'bg-blue-600 text-white shadow'
      : 'text-slate-400 hover:text-white'
  }`}
>
  Labels
</button>

      </div>

      {/* Leaflet Map Canvas */}
      <div className="w-full h-full flex-1">
        <MapContainer
        center={[10.0, 76.5]}
        zoom={6}
        scrollWheelZoom={true}
          style={{ width: '100%', height: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            url={tileUrls[mapStyle]}
            attribution={mapAttributions[mapStyle]}
          />
          {showLabels && (
  <TileLayer
    url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
    attribution="Esri"
    opacity={1}
  />
)}

         
{/* OLD ZONE POLYGONS AND MARKERS — temporarily disabled

{zoneList.map((z) => {
  const isSelected = selectedZoneId === z.id;

  return (
    <React.Fragment key={z.id}>
      <Polygon
        positions={z.polygon}
        pathOptions={getPolygonStyle(z.severity, isSelected)}
        eventHandlers={{
          click: () => onSelectZone(z.id)
        }}
      >
        <Tooltip sticky direction="top">
          <div className="font-sans text-xs p-1">
            <p className="font-bold text-white">{z.id} - {z.name}</p>
            <p className="text-slate-300">
              Severity: <span className="font-bold text-amber-400">{z.severity}</span>
            </p>
            <p className="text-slate-300">
              Water Level: <span className="font-bold">{z.water_level_m} m</span>
            </p>
            <p className="text-slate-300">
              Risk Score: <span className="font-bold text-red-400">{z.composite_risk_score}</span>
            </p>
          </div>
        </Tooltip>
      </Polygon>

     {/*
  OLD ZONE POLYGONS AND MARKERS TEMPORARILY DISABLED
*/}


          {/* Render Depot Node Markers */}
          {depots.map((d) => (
            <Marker key={d.id} position={d.coords} icon={createDepotIcon(d.name)}>
              <Popup>
                <div className="text-xs">
                  <p className="font-bold text-blue-400">{d.name}</p>
                  <p className="text-slate-300">Primary Logistics Hub</p>
                  <p className="text-[10px] text-emerald-400 mt-1 font-semibold">Active Base Reserves</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {/* Render Transport Vectors & Badge Markers */}
          {defaultRoutes.map((r) => {
            const midLat = (r.from_coords[0] + r.to_coords[0]) / 2;
            const midLon = (r.from_coords[1] + r.to_coords[1]) / 2;
            return (
              <React.Fragment key={r.id}>
                {/* Curved / Dashed Route Polyline */}
                <Polyline
  positions={r.polyline || [r.from_coords, r.to_coords]}
                  pathOptions={{
                    color: '#60A5FA',
                    weight: 3,
                    dashArray: '6, 8',
                    opacity: 0.95
                  }}
                />
                {/* Midpoint Transit Status Label Badge */}
             <Marker
  position={
    r.polyline
      ? r.polyline[Math.floor(r.polyline.length / 2)]
      : [midLat + 0.15, midLon - 0.10]
  }
icon={createTransitBadgeIcon(
  `${r.asset === 'rescue_boats' || r.asset === 'Rescue Boats' ? '🚤' :
    r.asset === 'medical_teams' || r.asset === 'Medical Teams' ? '🚑' :
    r.asset === 'relief_kits' || r.asset === 'Relief Kits' ? '📦' :
    r.asset === 'water_pumps' || r.asset === 'Water Pumps' ? '💧' :
    r.resource_type === 'rescue_boats' ? '🚤' :
    r.resource_type === 'medical_teams' ? '🚑' :
    r.resource_type === 'relief_kits' ? '📦' :
    r.resource_type === 'water_pumps' ? '💧' :
    '📦'} | ${r.from_depot || ''} → ${r.to_zone || ''} | ${
      r.eta_minutes != null
        ? `ETA ${(r.eta_minutes / 60).toFixed(1)} hrs`
        : r.label?.split('|').pop()?.trim() || ''
    }`
)}
/>
              </React.Fragment>
            );
          })}
            {/* Kerala State Boundary */}
          <GeoJSON
            data={keralaBoundaryData}
            style={{
              color: '#00FFFF',
              weight: 3,
              fillOpacity: 0,
            }}
          />
          
{keralaZonesData && (
  <GeoJSON
    data={keralaZonesData}
    style={(feature) => {
      const zoneId = feature?.properties?.zone_id;
      const zoneList = Array.isArray(zones)
  ? zones
  : Object.values(zones ?? {});

const zone = zoneList.find(
        (item) =>
          String(item.zone_id ?? item.id).toUpperCase() ===
          String(zoneId).toUpperCase()
      );

      const risk = Number(
  zone?.composite_risk_score ?? 0
);

      let color = '#16A34A';

      if (risk >= 0.70) {
        color = '#7F0000'; // Dark red — Critical
      } else if (risk >= 0.50) {
        color = '#EA580C';
      } else if (risk >= 0.35) {
        color = '#EAB308';
      }

     
return {
  color: '#FFFFFF',
  weight: 2,
  opacity: 1,
  fillColor: color,

  fillOpacity: 0.45,
  lineJoin: 'round',
};

    }}
    onEachFeature={(feature, layer) => {
      const zoneId = feature?.properties?.zone_id;
      layer.bindTooltip(String(zoneId ?? 'Flood Zone'), {
        sticky: true,
      });
    }}
  />
)}

          
{keralaBoundaryData && (
  <GeoJSON
    data={keralaBoundaryData}
    style={{
      color: '#00FFFF',
      weight: 3,
      fillOpacity: 0,
    }}
  />
)}


        </MapContainer>
        
      </div>

     {/* Bottom Left Map Legend */}
<div className="absolute bottom-16 left-3 z-[1000] bg-[#0D1527]/90 backdrop-blur-md border border-slate-700/60 p-3 rounded-xl text-xs text-white shadow-2xl">
  <h4 className="font-bold text-slate-200 mb-2 border-b border-slate-800 pb-1">
    Risk Level
  </h4>

  <div className="space-y-1 text-[11px]">

    {/* Low */}
    <div className="flex items-center space-x-2">
      <span className="w-3 h-3 rounded-full bg-emerald-500"></span>
      <span className="text-slate-300 font-medium">
        Low (0 - 0.3)
      </span>
    </div>

    {/* Medium */}
    <div className="flex items-center space-x-2">
      <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
      <span className="text-slate-300 font-medium">
        Medium (0.3 - 0.6)
      </span>
    </div>

    {/* Critical */}
    <div className="flex items-center space-x-2">
      <span className="w-3 h-3 rounded-full bg-red-700"></span>
      <span className="text-slate-100 font-bold">
        Critical (0.6 - 1.0)
      </span>
    </div>

    {/* Resource Route */}
    <div className="flex items-center space-x-2 pt-1 border-t border-slate-800/80">
      <span className="w-4 border-b-2 border-dashed border-blue-400"></span>
      <span className="text-blue-300 text-[10px]">
        Resource Route
      </span>
    </div>

  </div>
</div>

      {/* Bottom Right Map Inset - India Overview Map */}
      <div className="absolute bottom-3 right-3 z-[1000] bg-[#0D1527]/95 border border-slate-700/80 p-1.5 rounded-xl shadow-2xl w-24 h-28 flex flex-col items-center justify-between">
        <span className="text-[9px] font-bold text-blue-400 tracking-wider">KERALA</span>
        <div className="w-full flex-1 relative bg-slate-900 rounded border border-slate-800 flex items-center justify-center overflow-hidden">
          <svg viewBox="0 0 100 120" className="w-full h-full opacity-60">
            {/* Simplified India silhouette outline */}
            <path d="M 30,10 L 70,10 L 80,40 L 70,80 L 50,110 L 40,90 L 30,60 Z" fill="#1E293B" stroke="#334155" strokeWidth="1" />
            {/* Highlighted Kerala southwestern strip */}
            <path d="M 42,75 L 46,75 L 48,95 L 43,105 L 40,90 Z" fill="#EF4444" stroke="#F87171" strokeWidth="1" className="animate-pulse" />
          </svg>
        </div>
        <span className="text-[8px] text-slate-400">India Overview</span>
      </div>
    </div>
  );
}
