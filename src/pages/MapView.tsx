import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Layers,
  Flame,
  Filter,
  CheckCircle2,
  AlertOctagon,
  Eye,
  Sparkles,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { api } from '../services/api';
import { Complaint, WardMetric } from '../types';
import { LeafletMap } from '../components/LeafletMap';

export const MapView: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [wards, setWards] = useState<WardMetric[]>([]);
  const [selectedWard, setSelectedWard] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [showHeatmap, setShowHeatmap] = useState(true);
  const [loading, setLoading] = useState(true);

  // Active Map Center (Pune Municipal Corporation)
  const [mapCenter, setMapCenter] = useState<[number, number]>([18.5204, 73.8567]);
  const [mapZoom, setMapZoom] = useState(13);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [compList, stats] = await Promise.all([
          api.getComplaints(),
          api.getAnalytics()
        ]);
        setComplaints(compList);
        setWards(stats.wards);
      } catch (err) {
        console.error('Failed to load map data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredComplaints = complaints.filter((c) => {
    if (selectedWard !== 'ALL' && !c.location.ward.toLowerCase().includes(selectedWard.toLowerCase())) {
      return false;
    }
    if (priorityFilter !== 'ALL' && c.priority !== priorityFilter) {
      return false;
    }
    return true;
  });

  const handleWardSelect = (wardName: string, lat?: number, lng?: number) => {
    setSelectedWard(wardName);
    if (lat && lng) {
      setMapCenter([lat, lng]);
      setMapZoom(15);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Top Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 mb-1.5">
            <MapPin className="w-3.5 h-3.5" />
            <span>GIS Municipal Geospatial Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Interactive City Grievance Heatmap
          </h1>
          <p className="text-xs text-slate-500">
            Real-time geospatial clustering, hazard density zones, and ward performance telemetry.
          </p>
        </div>

        {/* Heatmap Layer Toggle */}
        <div className="flex items-center gap-3 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs self-start md:self-center">
          <button
            onClick={() => setShowHeatmap(!showHeatmap)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              showHeatmap
                ? 'bg-rose-500 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>Heatmap Overlay {showHeatmap ? 'ON' : 'OFF'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Left Sidebar Wards + Right Map */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Sidebar: Ward Selector & Incidents List */}
        <div className="lg:col-span-4 space-y-4 max-h-[640px] flex flex-col">
          
          {/* Ward Summary Pills */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-gov space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                Municipal Wards ({wards.length})
              </h3>
              <button
                onClick={() => {
                  setSelectedWard('ALL');
                  setMapCenter([18.5204, 73.8567]);
                  setMapZoom(13);
                }}
                className={`text-[11px] font-bold ${
                  selectedWard === 'ALL' ? 'text-blue-600 underline' : 'text-slate-400 hover:text-slate-700'
                }`}
              >
                Reset All
              </button>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {wards.map((w) => (
                <button
                  key={w.ward}
                  onClick={() => handleWardSelect(w.ward, w.lat, w.lng)}
                  className={`w-full text-left p-2.5 rounded-xl text-xs flex items-center justify-between transition-all ${
                    selectedWard === w.ward
                      ? 'bg-blue-600 text-white font-bold shadow-md shadow-blue-500/20'
                      : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/80'
                  }`}
                >
                  <div className="truncate pr-2">
                    <p className="truncate font-semibold">{w.ward}</p>
                    <p className={`text-[10px] ${selectedWard === w.ward ? 'text-blue-200' : 'text-slate-400'}`}>
                      Top: {w.topCategory}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold ${
                        selectedWard === w.ward
                          ? 'bg-blue-800 text-white'
                          : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {w.totalComplaints}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Active Incidents in Selected Ward */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200 shadow-gov space-y-3 flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">
                Incidents ({filteredComplaints.length})
              </h3>
              <span className="text-[11px] font-mono text-slate-400">
                {selectedWard === 'ALL' ? 'City-wide' : selectedWard.split(' - ')[0]}
              </span>
            </div>

            <div className="space-y-2 overflow-y-auto flex-1 pr-1">
              {filteredComplaints.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    if (c.location?.lat && c.location?.lng) {
                      setMapCenter([c.location.lat, c.location.lng]);
                      setMapZoom(16);
                    }
                  }}
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 transition-all cursor-pointer space-y-1.5 group"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-100 px-1.5 py-0.5 rounded">
                      {c.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        c.priority === 'Critical'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {c.priority}
                    </span>
                  </div>

                  <h4 className="font-bold text-xs text-slate-900 group-hover:text-blue-600 line-clamp-1">
                    {c.title}
                  </h4>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <span className="truncate max-w-[140px]">{c.location.address}</span>
                    <Link
                      to={`/track/${c.id}`}
                      className="text-blue-600 font-bold hover:underline inline-flex items-center gap-0.5"
                    >
                      Track <ExternalLink className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Area: Interactive GIS Map */}
        <div className="lg:col-span-8 h-[640px] rounded-3xl overflow-hidden shadow-gov-lg border border-slate-200 relative">
          <LeafletMap
            complaints={filteredComplaints}
            center={mapCenter}
            zoom={mapZoom}
            height="100%"
            showHeatmapEffect={showHeatmap}
          />
        </div>

      </div>

    </div>
  );
};
