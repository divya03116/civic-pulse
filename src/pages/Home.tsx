import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  PlusCircle,
  Search,
  MapPin,
  Clock,
  TrendingUp,
  BrainCircuit,
  Camera,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Users,
  Building,
  Zap,
  BarChart2,
  FileText,
  Flame
} from 'lucide-react';
import { api } from '../services/api';
import { Complaint, AnalyticsSummary } from '../types';
import { AIClassifierBadge } from '../components/AIClassifierBadge';
import { LeafletMap } from '../components/LeafletMap';

export const Home: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [ticketSearch, setTicketSearch] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [compList, stats] = await Promise.all([
          api.getComplaints(),
          api.getAnalytics()
        ]);
        setComplaints(compList);
        setAnalytics(stats);
      } catch (err) {
        console.error('Error loading homepage data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const urgentComplaints = complaints
    .filter((c) => c.priority === 'Critical' || c.priority === 'High')
    .slice(0, 3);

  const recentlyResolved = complaints.filter((c) => c.status === 'Resolved').slice(0, 2);

  return (
    <div className="space-y-12 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white pt-12 pb-20 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        
        {/* Background Subtle Grid Effect */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-30"></div>

        <div className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-400/30 text-blue-300 text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Next-Gen Municipal Governance Portal</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15] text-white">
              AI-Powered Citizen <br />
              <span className="bg-gradient-to-r from-blue-400 via-sky-300 to-emerald-400 bg-clip-text text-transparent">
                Grievance Resolution
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
              Report civic issues like potholes, water leaks, garbage overflow, and streetlight failures.
              Our zero-latency AI instantly analyzes photos and text, routes to the exact department,
              assigns priority, and tracks resolution with photographic proof.
            </p>

            {/* Quick Actions Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/file"
                className="flex items-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-sm shadow-xl shadow-blue-600/30 hover:scale-[1.02] active:scale-98 transition-all"
              >
                <PlusCircle className="w-5 h-5" />
                <span>File Grievance Now</span>
              </Link>

              <Link
                to="/track"
                className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 text-white font-semibold text-sm border border-slate-700 hover:border-slate-600 transition-all"
              >
                <Search className="w-4 h-4 text-blue-400" />
                <span>Track Ticket</span>
              </Link>

              <Link
                to="/map"
                className="flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-800/60 hover:bg-slate-700/60 text-slate-300 hover:text-white font-medium text-sm border border-slate-700/70 transition-all"
              >
                <MapPin className="w-4 h-4 text-emerald-400" />
                <span>Civic GIS Map</span>
              </Link>
            </div>

            {/* Micro Highlights */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800/80 text-slate-300 text-xs">
              <div className="flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-blue-400 shrink-0" />
                <span>Zero-Latency AI Triage</span>
              </div>
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Photo Verification Proof</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Guaranteed SLA Timelines</span>
              </div>
            </div>

          </div>

          {/* Hero Right: Live AI Triage Card Simulation */}
          <div className="lg:col-span-5">
            <div className="bg-slate-800/90 rounded-2xl p-5 border border-slate-700/90 shadow-2xl backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></div>
                  <span className="font-bold text-xs text-white">Live AI Incident Ingestion</span>
                </div>
                <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-400/30">
                  REAL-TIME
                </span>
              </div>

              {/* Sample Simulated Card */}
              <div className="bg-slate-900/90 rounded-xl p-4 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950/80 px-2 py-0.5 rounded border border-blue-800">
                    CIVIC-2026-1001
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    Critical (SLA: 12h)
                  </span>
                </div>

                <h4 className="font-bold text-sm text-white">Major Pothole & Road Caving Near Metro Station</h4>
                <p className="text-xs text-slate-400 leading-relaxed">
                  "2-foot crater next to Metro Pillar 48 causing traffic hazard and accidents..."
                </p>

                <div className="p-2.5 rounded-lg bg-slate-800/90 border border-slate-700 text-xs space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">AI Confidence:</span>
                    <span className="text-emerald-400 font-bold">96% Neural Match</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Auto-Assigned:</span>
                    <span className="text-slate-200 font-semibold">Roads & Infrastructure</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Officer In-Charge:</span>
                    <span className="text-blue-300 font-medium">Eng. Suresh Patil (Ward 12)</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 text-slate-400">
                  <span>38 Citizens Upvoted</span>
                  <Link to="/track/CIVIC-2026-1001" className="text-blue-400 font-bold hover:underline">
                    View Live Tracker →
                  </Link>
                </div>
              </div>

              {/* Duplicate Prevention Micro-Banner */}
              <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Geospatial AI consolidated 142 duplicate complaints this month.</span>
              </div>

            </div>
          </div>

        </div>
      </section>

      {/* Live Impact Counters Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-gov space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Total Grievances</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <FileText className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {analytics?.totalGrievances || 585}+
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Across all 15 PMC Administrative Wards</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-gov space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Avg. Turnaround Time</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
              {analytics?.avgTurnaroundHours || 18.5} hrs
            </div>
            <p className="text-[11px] text-emerald-700 font-medium">Reduced from 72h with AI Routing</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-gov space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">SLA Compliance</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600">
              {analytics?.slaComplianceRate || 93.4}%
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Resolved within statutory window</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-gov space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">Citizen Satisfaction</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-amber-600">
              {analytics?.citizenSatisfactionRate || 94.8}%
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Based on verified post-repair ratings</p>
          </div>

        </div>
      </section>

      {/* How the AI System Works Infographic */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            How CivicPulse AI Automates Resolution
          </h2>
          <p className="text-slate-600 text-sm">
            Eliminating bureaucratic delays through intelligent multimodal triage and end-to-end accountability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 font-bold flex items-center justify-center text-base">
              1
            </div>
            <h3 className="font-bold text-base text-slate-900">Citizen Files Issue</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Upload photo, text, and geo-pin. No need to know which government department handles it.
            </p>
            <div className="text-[11px] font-semibold text-blue-600 bg-blue-50 p-2 rounded-lg">
              📸 Computer Vision tagger active
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 font-bold flex items-center justify-center text-base">
              2
            </div>
            <h3 className="font-bold text-base text-slate-900">Zero-Shot AI Triage</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              NLP classifies department, subcategory, severity score, and assigns strict SLA countdown timer.
            </p>
            <div className="text-[11px] font-semibold text-indigo-600 bg-indigo-50 p-2 rounded-lg">
              ⚡ 4.8 sec average triage time
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-600 font-bold flex items-center justify-center text-base">
              3
            </div>
            <h3 className="font-bold text-base text-slate-900">Field Crew Action</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Assigned Ward Engineer receives instant notification, deploys repair crew, and posts live notes.
            </p>
            <div className="text-[11px] font-semibold text-amber-700 bg-amber-50 p-2 rounded-lg">
              👷 Direct Officer Badge linking
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm relative space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 font-bold flex items-center justify-center text-base">
              4
            </div>
            <h3 className="font-bold text-base text-slate-900">Resolution & Proof</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              After-repair photo is uploaded. Citizen receives SMS/Web notification and rates resolution quality.
            </p>
            <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 p-2 rounded-lg">
              ⭐ 1-5 Star Citizen Verification
            </div>
          </div>

        </div>
      </section>

      {/* Featured Urgent Incidents & Live City Map */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Urgent Incidents */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-rose-600" />
                <h3 className="font-extrabold text-lg text-slate-900">Urgent Field Incidents</h3>
              </div>
              <Link to="/feed" className="text-xs font-bold text-blue-600 hover:underline">
                View All →
              </Link>
            </div>

            <div className="space-y-3">
              {urgentComplaints.map((c) => (
                <div
                  key={c.id}
                  className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-blue-400 transition-all space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                      {c.id}
                    </span>
                    <AIClassifierBadge priority={c.priority} department={c.department} />
                  </div>

                  <h4 className="font-bold text-sm text-slate-900">{c.title}</h4>

                  <p className="text-xs text-slate-600 line-clamp-2">{c.description}</p>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-100 text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {c.location.ward}
                    </span>
                    <Link
                      to={`/track/${c.id}`}
                      className="font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                    >
                      Track Live <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Live GIS Ward Heatmap Preview */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">Live City Grievance GIS Map</h3>
                <p className="text-xs text-slate-500">Real-time incident distribution & hotspot monitoring</p>
              </div>
              <Link
                to="/map"
                className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl border border-blue-200 transition-colors"
              >
                Expand Fullscreen Map ↗
              </Link>
            </div>

            <div className="h-[420px] rounded-2xl overflow-hidden shadow-gov border border-slate-200">
              <LeafletMap complaints={complaints} height="100%" showHeatmapEffect={true} />
            </div>
          </div>

        </div>
      </section>

      {/* Proof of Resolution Showcase */}
      {recentlyResolved.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          <div className="bg-gradient-to-br from-emerald-950 via-slate-900 to-slate-950 p-6 sm:p-8 rounded-3xl text-white border border-emerald-800/40 space-y-6">
            
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-full border border-emerald-700/50 mb-2">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified Photographic Proof</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-extrabold">Recently Resolved Grievances</h3>
              </div>
              <p className="text-xs text-slate-300 max-w-sm">
                Every grievance closed by municipal authorities requires verified before-and-after photographic evidence and citizen confirmation.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {recentlyResolved.map((c) => (
                <div
                  key={c.id}
                  className="bg-slate-900/90 rounded-2xl p-4 border border-slate-800 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      {c.id}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400">
                      Resolved in {c.estimatedSlaHours}h SLA
                    </span>
                  </div>

                  <h4 className="font-bold text-sm text-white">{c.title}</h4>

                  {/* Before & After Photo Comparison */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1">
                        <span>● Before Repair</span>
                      </div>
                      <div className="h-28 rounded-xl overflow-hidden bg-slate-800">
                        <img
                          src={c.images.before[0]}
                          alt="Before"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1">
                        <span>● After Remediation</span>
                      </div>
                      <div className="h-28 rounded-xl overflow-hidden bg-slate-800">
                        <img
                          src={c.images.after?.[0] || c.images.before[0]}
                          alt="After"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  </div>

                  {c.feedback && (
                    <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-xs flex items-center justify-between">
                      <span className="text-slate-300 italic">"{c.feedback.comment}"</span>
                      <span className="text-amber-400 font-bold">★ {c.feedback.rating}.0</span>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-xs pt-1 text-slate-400">
                    <span>Officer: {c.assignedTo?.officerName || 'Ward Team'}</span>
                    <Link to={`/track/${c.id}`} className="text-emerald-400 font-bold hover:underline">
                      View Full Audit →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>
      )}

    </div>
  );
};
