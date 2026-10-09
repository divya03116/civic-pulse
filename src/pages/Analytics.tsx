import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';
import {
  BarChart3,
  TrendingUp,
  BrainCircuit,
  ShieldCheck,
  Clock,
  Download,
  AlertTriangle,
  Sparkles,
  Layers,
  Building,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';
import { AnalyticsSummary, DepartmentMetric, WardMetric } from '../types';
import { useRole } from '../context/RoleContext';
import { Link } from 'react-router-dom';

export const Analytics: React.FC = () => {
  const { isCitizen } = useRole();
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isCitizen) return;
    api.getAnalytics()
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [isCitizen]);

  if (isCitizen) {
    return (
      <div className="max-w-xl mx-auto px-4 py-24 text-center space-y-5 animate-in fade-in duration-200">
        <div className="w-16 h-16 bg-amber-50 text-amber-600 border border-amber-200 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h2 className="text-2xl font-extrabold text-slate-900">Restricted to Municipal Authorities</h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            The Analytics Hub contains internal administrative scorecards, SLA metrics, and operational dispatch insights for Municipal Commissioners and Department Heads.
          </p>
          <p className="text-xs text-slate-400">
            To view this dashboard for testing, switch your persona to <strong>Admin</strong> or <strong>Officer</strong> using the "View As" menu in the top bar.
          </p>
        </div>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all"
          >
            Return to Citizen Home
          </Link>
        </div>
      </div>
    );
  }

  const handleExportCSV = () => {
    if (!data) return;
    const headers = 'Department,Total,Resolved,Pending,AvgResolutionHours,SLACompliance%\n';
    const rows = data.departments
      .map(
        (d) =>
          `"${d.name}",${d.totalComplaints},${d.resolvedComplaints},${d.pendingComplaints},${d.avgResolutionTimeHours},${d.slaComplianceRate}%`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Municipal_Grievance_Report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading || !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-3">
        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="text-xs font-semibold text-slate-600">Compiling city-wide analytics intelligence...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Top Header & Export Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Municipal Performance Intelligence</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Executive Analytics & SLA Scorecards
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Real-time telemetry, department turnaround benchmarks, and AI-predicted municipal bottlenecks.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all self-start sm:self-center hover:scale-105 active:scale-95"
        >
          <Download className="w-4 h-4" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* AI Executive Summary Briefing */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-md">
              <BrainCircuit className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg">AI Municipal Executive Summary</h3>
              <p className="text-xs text-blue-300">Generated by CivicPulse Neural Intelligence Engine</p>
            </div>
          </div>
          <span className="text-[10px] font-mono bg-blue-500/20 text-blue-300 px-2.5 py-1 rounded-full border border-blue-400/30">
            UPDATED HOURLY
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
          
          {/* Key Insights */}
          <div className="space-y-2 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/70">
            <h4 className="font-bold text-blue-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Core Efficiency Insights</span>
            </h4>
            <ul className="space-y-2 text-slate-300 leading-relaxed">
              {data.aiExecutiveSummary.keyInsights.map((insight, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-400 font-bold">✓</span>
                  <span>{insight}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Hotspots */}
          <div className="space-y-2 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/70">
            <h4 className="font-bold text-amber-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>Identified Density Hotspots</span>
            </h4>
            <ul className="space-y-2 text-slate-300 leading-relaxed">
              {data.aiExecutiveSummary.criticalHotspots.map((hotspot, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-amber-400 font-bold">●</span>
                  <span>{hotspot}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Recommended Actions */}
          <div className="space-y-2 bg-slate-800/60 p-4 rounded-2xl border border-slate-700/70">
            <h4 className="font-bold text-emerald-300 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Recommended Next Steps</span>
            </h4>
            <ul className="space-y-2 text-slate-300 leading-relaxed">
              {data.aiExecutiveSummary.recommendedActions.map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <span className="text-indigo-400 font-bold">→</span>
                  <span>{rec}</span>
                </li>
              ))}
            </ul>
          </div>

        </div>
      </div>

      {/* Main Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Monthly Submission vs Resolution Trend */}
        <div className="lg:col-span-8 bg-white p-6 rounded-3xl border border-slate-200 shadow-gov space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">Monthly Ingestion vs Resolution</h3>
              <p className="text-xs text-slate-500">Citizen grievances received vs successfully verified</p>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
              94.6% Closure Rate
            </span>
          </div>

          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthlyTrends}>
                <defs>
                  <linearGradient id="colorSub" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorRes" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area
                  type="monotone"
                  dataKey="submitted"
                  name="Grievances Submitted"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorSub)"
                />
                <Area
                  type="monotone"
                  dataKey="resolved"
                  name="Grievances Resolved"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRes)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Distribution Pie */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-gov space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900">Priority Severity Breakdown</h3>
            <p className="text-xs text-slate-500">Autonomous AI classification split</p>
          </div>

          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.priorityDistribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {data.priorityDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    borderRadius: '0.75rem',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            {data.priorityDistribution.map((p) => (
              <div
                key={p.name}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100"
              >
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }}></span>
                  <span className="font-medium text-slate-700">{p.name}</span>
                </div>
                <span className="font-bold text-slate-900">{p.count}</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Department Scorecard Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-gov overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <h3 className="font-extrabold text-base text-slate-900">
            Municipal Department SLA Scorecard
          </h3>
          <p className="text-xs text-slate-500">
            Turnaround benchmarks, active field inspectors, and statutory compliance percentage.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Department</th>
                <th className="px-6 py-3.5">Total Grievances</th>
                <th className="px-6 py-3.5">Resolved</th>
                <th className="px-6 py-3.5">Pending Work</th>
                <th className="px-6 py-3.5">Avg Turnaround</th>
                <th className="px-6 py-3.5">SLA Compliance</th>
                <th className="px-6 py-3.5 text-right">Rating Score</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {data.departments.map((dept) => (
                <tr key={dept.name} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 flex items-center gap-2">
                    <Building className="w-4 h-4 text-blue-600" />
                    <span>{dept.name}</span>
                  </td>
                  <td className="px-6 py-4 font-mono font-semibold text-slate-800">
                    {dept.totalComplaints}
                  </td>
                  <td className="px-6 py-4 text-emerald-600 font-bold font-mono">
                    {dept.resolvedComplaints}
                  </td>
                  <td className="px-6 py-4 text-amber-600 font-mono">
                    {dept.pendingComplaints}
                  </td>
                  <td className="px-6 py-4 font-mono text-slate-700">
                    {dept.avgResolutionTimeHours} hrs
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${dept.slaComplianceRate}%` }}
                        ></div>
                      </div>
                      <span className="font-bold text-slate-900 font-mono text-[11px]">
                        {dept.slaComplianceRate}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right font-bold text-amber-500">
                    ★ {dept.satisfactionScore} / 5.0
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
