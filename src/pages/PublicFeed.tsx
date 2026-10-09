import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Filter,
  ThumbsUp,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { Complaint, DepartmentType, PriorityLevel, ComplaintStatus } from '../types';
import { AIClassifierBadge } from '../components/AIClassifierBadge';

const DEPARTMENTS: { label: string; value: string }[] = [
  { label: 'All Departments', value: 'ALL' },
  { label: 'Roads & Infrastructure', value: 'Roads & Infrastructure' },
  { label: 'Water Supply & Sewerage', value: 'Water Supply & Sewerage' },
  { label: 'Solid Waste & Sanitation', value: 'Solid Waste & Sanitation' },
  { label: 'Electricity & Power', value: 'Electricity & Power' },
  { label: 'Public Health & Sanitation', value: 'Public Health & Sanitation' },
  { label: 'Urban Planning', value: 'Urban Planning & Encroachment' }
];

const PRIORITIES: { label: string; value: string }[] = [
  { label: 'All Priorities', value: 'ALL' },
  { label: 'Critical', value: 'Critical' },
  { label: 'High', value: 'High' },
  { label: 'Medium', value: 'Medium' },
  { label: 'Low', value: 'Low' }
];

const STATUSES: { label: string; value: string }[] = [
  { label: 'All Statuses', value: 'ALL' },
  { label: 'Open / Triaged', value: 'AI_Triaged' },
  { label: 'Assigned', value: 'Assigned' },
  { label: 'In Progress', value: 'In_Progress' },
  { label: 'Resolved', value: 'Resolved' }
];

export const PublicFeed: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchList = async () => {
    setLoading(true);
    try {
      const list = await api.getComplaints({
        department: selectedDept,
        priority: selectedPriority,
        status: selectedStatus,
        search: searchQuery
      });
      setComplaints(list);
    } catch (err) {
      console.error('Failed to load complaints feed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [selectedDept, selectedPriority, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchList();
  };

  const handleUpvote = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const res = await api.upvoteComplaint(id);
      setComplaints((prev) =>
        prev.map((c) => (c.id === id ? res.complaint : c))
      );
    } catch (err) {
      console.error('Upvote failed:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200 mb-2">
            <Layers className="w-3.5 h-3.5" />
            <span>Open Civic Ledger</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Public Grievance Transparency Wall
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Explore live citizen issues, track municipal responsiveness, and upvote local concerns.
          </p>
        </div>

        <Link
          to="/file"
          className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-500/20 flex items-center gap-2 self-start sm:self-center transition-all hover:scale-105"
        >
          <span>File New Grievance</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search by keywords, street name, landmark, or ticket ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <button
            type="submit"
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Search
          </button>
        </form>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 border-t border-slate-100 text-xs">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {DEPARTMENTS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>

          <select
            value={selectedPriority}
            onChange={(e) => setSelectedPriority(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid of Complaints */}
      {loading ? (
        <div className="text-center py-16 space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-600">Loading civic ledger...</p>
        </div>
      ) : complaints.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-3">
          <AlertCircle className="w-10 h-10 text-slate-400 mx-auto" />
          <h3 className="font-bold text-base text-slate-800">No Grievances Found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try adjusting your search criteria or select 'All Departments' to see more records.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {complaints.map((c) => (
            <div
              key={c.id}
              className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-gov hover:shadow-gov-lg hover:border-blue-300 transition-all flex flex-col justify-between group"
            >
              <div className="p-5 space-y-3">
                
                {/* Header Badge Row */}
                <div className="flex items-center justify-between gap-1">
                  <span className="font-mono text-xs font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-lg">
                    {c.id}
                  </span>
                  <AIClassifierBadge priority={c.priority} />
                </div>

                {/* Photo Thumbnail */}
                {c.images.before[0] && (
                  <div className="h-44 rounded-2xl overflow-hidden bg-slate-100 relative">
                    <img
                      src={c.images.before[0]}
                      alt={c.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {c.status === 'Resolved' && (
                      <div className="absolute top-2 right-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-md flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Resolved Proof</span>
                      </div>
                    )}
                  </div>
                )}

                <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                  {c.title}
                </h3>

                <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                  {c.description}
                </p>

                {/* Meta details */}
                <div className="space-y-1 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-medium text-slate-600">🏢 {c.department}</span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{c.location.ward}</span>
                  </div>
                </div>

              </div>

              {/* Card Footer Actions */}
              <div className="bg-slate-50 p-4 border-t border-slate-100 flex items-center justify-between text-xs">
                <button
                  type="button"
                  onClick={(e) => handleUpvote(c.id, e)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 font-bold transition-all active:scale-95"
                >
                  <ThumbsUp className="w-3.5 h-3.5 text-blue-600" />
                  <span>{c.upvotes}</span>
                </button>

                <Link
                  to={`/track/${c.id}`}
                  className="font-bold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 hover:underline"
                >
                  <span>Track Milestone</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};
