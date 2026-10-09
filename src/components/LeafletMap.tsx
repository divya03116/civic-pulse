import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, useMap, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Complaint, PriorityLevel } from '../types';
import { Link } from 'react-router-dom';
import { MapPin, AlertOctagon, Clock, ThumbsUp, CheckCircle, ExternalLink } from 'lucide-react';

interface Props {
  complaints?: Complaint[];
  selectedLocation?: { lat: number; lng: number };
  onSelectLocation?: (loc: { lat: number; lng: number; address?: string }) => void;
  isPickerMode?: boolean;
  center?: [number, number];
  zoom?: number;
  height?: string;
  showHeatmapEffect?: boolean;
}

// Create custom colored SVG marker icons
const createCustomIcon = (priority: PriorityLevel, status: string) => {
  let color = '#0284c7'; // Medium default blue
  let glowClass = '';

  if (status === 'Resolved') {
    color = '#10b981'; // Green
  } else if (priority === 'Critical') {
    color = '#e11d48'; // Red
    glowClass = 'pulse-glow-critical';
  } else if (priority === 'High') {
    color = '#f59e0b'; // Amber
  }

  const svgHtml = `
    <div class="custom-map-pin ${glowClass}" style="background-color: ${color}; width: 32px; height: 32px; border: 2.5px solid #ffffff;">
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path>
        <circle cx="12" cy="10" r="3"></circle>
      </svg>
    </div>
  `;

  return L.divIcon({
    html: svgHtml,
    className: 'custom-leaflet-div-icon',
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32]
  });
};

const pickerIcon = L.divIcon({
  html: `
    <div class="custom-map-pin" style="background-color: #2563eb; width: 36px; height: 36px; border: 3px solid #ffffff; box-shadow: 0 0 20px rgba(37,99,235,0.6);">
      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white" stroke="#2563eb" stroke-width="2">
        <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z"/>
      </svg>
    </div>
  `,
  className: 'custom-picker-div-icon',
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -36]
});

// Map click handler component for location picker mode
const LocationPickerEvents: React.FC<{
  onSelect: (loc: { lat: number; lng: number; address?: string }) => void;
}> = ({ onSelect }) => {
  useMapEvents({
    click(e) {
      onSelect({
        lat: Number(e.latlng.lat.toFixed(6)),
        lng: Number(e.latlng.lng.toFixed(6)),
        address: `Lat: ${e.latlng.lat.toFixed(4)}, Lng: ${e.latlng.lng.toFixed(4)}`
      });
    }
  });
  return null;
};

// Center updater
const MapRecenter: React.FC<{ center: [number, number]; zoom?: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom !== undefined ? zoom : map.getZoom(), { animate: true });
  }, [center, zoom, map]);
  return null;
};

// Stable reference: an inline default array would be recreated every render and
// re-trigger the center-sync effect below in an infinite loop.
const DEFAULT_CENTER: [number, number] = [18.5204, 73.8567];

export const LeafletMap: React.FC<Props> = ({
  complaints = [],
  selectedLocation,
  onSelectLocation,
  isPickerMode = false,
  center = DEFAULT_CENTER,
  zoom = 13,
  height = '500px',
  showHeatmapEffect = false
}) => {
  const [activeCenter, setActiveCenter] = useState<[number, number]>(
    selectedLocation ? [selectedLocation.lat, selectedLocation.lng] : center
  );

  useEffect(() => {
    if (selectedLocation) {
      setActiveCenter([selectedLocation.lat, selectedLocation.lng]);
    } else if (center) {
      setActiveCenter(center);
    }
  }, [selectedLocation, center]);

  return (
    <div style={{ height }} className="w-full rounded-2xl overflow-hidden shadow-inner border border-slate-200 relative">
      <MapContainer
        center={activeCenter}
        zoom={zoom}
        scrollWheelZoom={false}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        <MapRecenter center={activeCenter} zoom={zoom} />

        {isPickerMode && onSelectLocation && (
          <LocationPickerEvents onSelect={onSelectLocation} />
        )}

        {/* Selected Picker Marker */}
        {isPickerMode && selectedLocation && (
          <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={pickerIcon}>
            <Popup>
              <div className="text-xs p-1">
                <p className="font-bold text-slate-800">Selected Incident Location</p>
                <p className="text-slate-500 font-mono text-[10px]">
                  {selectedLocation.lat}, {selectedLocation.lng}
                </p>
              </div>
            </Popup>
          </Marker>
        )}

        {/* Heatmap simulated density circles */}
        {showHeatmapEffect &&
          complaints.map((c) => {
            if (!c.location?.lat || !c.location?.lng) return null;
            const radius = c.priority === 'Critical' ? 450 : c.priority === 'High' ? 300 : 180;
            const fillColor =
              c.priority === 'Critical' ? '#e11d48' : c.priority === 'High' ? '#f59e0b' : '#0284c7';
            return (
              <Circle
                key={`heat-${c.id}`}
                center={[c.location.lat, c.location.lng]}
                radius={radius}
                pathOptions={{
                  fillColor,
                  fillOpacity: 0.22,
                  stroke: false
                }}
              />
            );
          })}

        {/* Complaints Markers */}
        {!isPickerMode &&
          complaints.map((c) => {
            if (!c.location?.lat || !c.location?.lng) return null;
            return (
              <Marker
                key={c.id}
                position={[c.location.lat, c.location.lng]}
                icon={createCustomIcon(c.priority, c.status)}
              >
                <Popup className="civic-custom-popup">
                  <div className="w-56 p-1 text-slate-800 space-y-2">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                        {c.id}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          c.status === 'Resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.priority === 'Critical'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {c.status.replace('_', ' ')}
                      </span>
                    </div>

                    {c.images?.before?.[0] && (
                      <div className="w-full h-24 rounded-lg overflow-hidden bg-slate-100">
                        <img
                          src={c.images.before[0]}
                          alt={c.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <h4 className="font-bold text-xs leading-tight line-clamp-2">{c.title}</h4>

                    <div className="text-[10px] text-slate-500 space-y-0.5">
                      <p className="truncate">🏢 {c.department}</p>
                      <p className="truncate">📍 {c.location.ward}</p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-[11px]">
                      <span className="font-semibold text-slate-700 flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3 text-blue-600" />
                        {c.upvotes}
                      </span>
                      <Link
                        to={`/track/${c.id}`}
                        className="text-blue-600 font-bold hover:underline inline-flex items-center gap-1"
                      >
                        Track <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
      </MapContainer>

      {/* Map Legend Overlay */}
      <div className="absolute bottom-4 right-4 z-20 bg-white/95 backdrop-blur-xs p-2.5 rounded-xl shadow-lg border border-slate-200/80 text-[11px] space-y-1.5">
        <div className="font-bold text-slate-700 text-[10px] uppercase tracking-wider mb-1">
          Marker Legend
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-rose-600 pulse-glow-critical"></span>
          <span className="font-medium text-slate-700">Critical (SLA 4-12h)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
          <span className="font-medium text-slate-700">High Priority</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-600"></span>
          <span className="font-medium text-slate-700">Standard Priority</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          <span className="font-medium text-slate-700">Resolved Proof</span>
        </div>
      </div>
    </div>
  );
};
