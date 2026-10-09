import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldAlert,
  UserCheck,
  CheckCircle2,
  Clock,
  Filter,
  Search,
  ArrowRight,
  AlertOctagon,
  Sparkles,
  Camera,
  Upload,
  User,
  PhoneCall,
  Layers,
  ChevronDown,
  X
} from 'lucide-react';
import { api } from '../services/api';
import { fileToCompressedDataUrl } from '../utils/image';
import { Complaint, ComplaintStatus, PriorityLevel, DepartmentType } from '../types';
import { useRole } from '../context/RoleContext';
import { AIClassifierBadge } from '../components/AIClassifierBadge';

export const AdminDashboard: React.FC = () => {
  const { currentProfile, isAdmin, isOfficer } = useRole();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [deptFilter, setDeptFilter] = useState<string>(
    isOfficer && currentProfile.department ? currentProfile.department : 'ALL'
  );
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Resolution Action Modal State
  const [activeActionComplaint, setActiveActionComplaint] = useState<Complaint | null>(null);
  const [actionType, setActionType] = useState<'ASSIGN' | 'RESOLVE' | 'IN_PROGRESS'>('ASSIGN');

  // Form Fields for Modal
  const [officerName, setOfficerName] = useState(currentProfile.name);
  const [officerRole, setOfficerRole] = useState(currentProfile.title);
  const [officerPhone, setOfficerPhone] = useState(currentProfile.phone);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [afterImageUrl, setAfterImageUrl] = useState(
    'https://images.unsplash.com/photo-1584467735815-f778f274e296?w=800&auto=format&fit=crop&q=80'
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const afterFileInputRef = useRef<HTMLInputElement>(null);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const list = await api.getComplaints({
        department: deptFilter,
        status: statusFilter,
        priority: priorityFilter,
        search: searchQuery
      });
      setComplaints(list);
    } catch (err) {
      console.error('Failed to load complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [deptFilter, statusFilter, priorityFilter]);

  // Sync active officer credentials when role switcher in Navbar changes
  useEffect(() => {
    setOfficerName(currentProfile.name);
    setOfficerRole(currentProfile.title);
    setOfficerPhone(currentProfile.phone);
    if (isOfficer && currentProfile.department) {
      setDeptFilter(currentProfile.department);
    } else {
      setDeptFilter('ALL');
    }
  }, [currentProfile, isOfficer]);

  const handleOpenModal = (complaint: Complaint, type: 'ASSIGN' | 'RESOLVE' | 'IN_PROGRESS') => {
    setActiveActionComplaint(complaint);
    setActionType(type);
    setResolutionNotes(
      type === 'RESOLVE'
        ? `Remediation completed by ${currentProfile.name}. Defect rectified and site cleared.`
        : type === 'IN_PROGRESS'
        ? `Field team deployed on-site under ${currentProfile.name}. Repair operations underway.`
        : `Work order dispatched to ${currentProfile.name}.`
    );
  };

  const handleExecuteStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeActionComplaint) return;

    setIsUpdating(true);
    try {
      let targetStatus: ComplaintStatus = 'Assigned';
      if (actionType === 'IN_PROGRESS') targetStatus = 'In_Progress';
      if (actionType === 'RESOLVE') targetStatus = 'Resolved';

      await api.updateStatus(activeActionComplaint.id, {
        status: targetStatus,
        assignedOfficerName: officerName,
        assignedOfficerRole: officerRole,
        assignedOfficerPhone: officerPhone,
        resolutionNotes: resolutionNotes,
        afterImages: actionType === 'RESOLVE' ? [afterImageUrl] : undefined,
        actorName: currentProfile.name,
        actorRole: currentProfile.title
      });

      setActiveActionComplaint(null);
      fetchComplaints();
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Official Persona Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white border border-slate-800 shadow-2xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/30">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                {currentProfile.role === 'ADMIN' ? 'Super Admin Mode' : 'Department Officer Mode'}
              </span>
              <span className="text-xs font-mono text-slate-400">
                Badge: {currentProfile.badgeNumber || 'ADM-01'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold mt-1">{currentProfile.name}</h1>
            <p className="text-xs text-slate-300">{currentProfile.title}</p>
          </div>
        </div>

        {/* Quick Triage Counters */}
        <div className="grid grid-cols-3 gap-3 text-center text-xs">
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <div className="text-rose-400 font-extrabold text-lg">
              {complaints.filter((c) => c.priority === 'Critical').length}
            </div>
            <div className="text-[10px] text-slate-400 uppercase">Critical SOS</div>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <div className="text-amber-400 font-extrabold text-lg">
              {complaints.filter((c) => c.status === 'In_Progress').length}
            </div>
            <div className="text-[10px] text-slate-400 uppercase">In Progress</div>
          </div>
          <div className="bg-slate-800/80 p-3 rounded-xl border border-slate-700">
            <div className="text-emerald-400 font-extrabold text-lg">
              {complaints.filter((c) => c.status === 'Resolved').length}
            </div>
            <div className="text-[10px] text-slate-400 uppercase">Resolved</div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-sm space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search queue by title, ticket ID, or landmark..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <button
            onClick={fetchComplaints}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl"
          >
            Apply Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Department</label>
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
            >
              <option value="ALL">All Municipal Departments</option>
              <option value="Roads & Infrastructure">Roads & Infrastructure</option>
              <option value="Water Supply & Sewerage">Water Supply & Sewerage</option>
              <option value="Solid Waste & Sanitation">Solid Waste & Sanitation</option>
              <option value="Electricity & Power">Electricity & Power</option>
              <option value="Public Health & Sanitation">Public Health & Sanitation</option>
              <option value="Urban Planning & Encroachment">Urban Planning & Encroachment</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Status Queue</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
            >
              <option value="ALL">All Statuses</option>
              <option value="AI_Triaged">AI Triaged (Needs Assignment)</option>
              <option value="Assigned">Assigned to Officer</option>
              <option value="In_Progress">Field Work In Progress</option>
              <option value="Resolved">Resolved & Verified</option>
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase mb-1">Priority</label>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
            >
              <option value="ALL">All Priorities</option>
              <option value="Critical">Critical (Immediate SLA)</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Routine Priority</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grievance Triage Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-gov overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <h3 className="font-extrabold text-base text-slate-900">
              Department Triage & Action Queue ({complaints.length})
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">Live AI Dispatched</span>
        </div>

        {loading ? (
          <div className="text-center py-16">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs text-slate-500">Fetching department ledger...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="text-center py-12 text-slate-500 text-xs">
            No complaints found in this queue.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3.5">Ticket ID & Urgency</th>
                  <th className="px-5 py-3.5">Issue Title & Ward</th>
                  <th className="px-5 py-3.5">Department</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Assigned Officer</th>
                  <th className="px-5 py-3.5 text-right">Official Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {complaints.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Col 1 */}
                    <td className="px-5 py-4 whitespace-nowrap space-y-1">
                      <span className="font-mono font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded text-xs block w-fit">
                        {c.id}
                      </span>
                      <AIClassifierBadge priority={c.priority} />
                    </td>

                    {/* Col 2 */}
                    <td className="px-5 py-4 max-w-xs space-y-1">
                      <div className="font-bold text-slate-900 truncate">{c.title}</div>
                      <div className="text-[11px] text-slate-500 truncate">
                        📍 {c.location.address} ({c.location.ward})
                      </div>
                    </td>

                    {/* Col 3 */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-medium text-[11px] border border-slate-200">
                        {c.department}
                      </span>
                    </td>

                    {/* Col 4 */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span
                        className={`px-2.5 py-1 rounded-full font-bold text-[11px] ${
                          c.status === 'Resolved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.status === 'In_Progress'
                            ? 'bg-blue-100 text-blue-800'
                            : c.status === 'Assigned'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {c.status.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Col 5 */}
                    <td className="px-5 py-4 whitespace-nowrap text-slate-600">
                      {c.assignedTo ? (
                        <div>
                          <div className="font-semibold text-slate-900">{c.assignedTo.officerName}</div>
                          <div className="text-[10px] text-slate-400">{c.assignedTo.phone}</div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                      )}
                    </td>

                    {/* Col 6: Actions */}
                    <td className="px-5 py-4 whitespace-nowrap text-right space-x-1.5">
                      {c.status !== 'Resolved' && (
                        <>
                          <button
                            onClick={() => handleOpenModal(c, 'ASSIGN')}
                            className="px-2.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-lg border border-blue-200 transition-colors"
                          >
                            Assign
                          </button>

                          <button
                            onClick={() => handleOpenModal(c, 'IN_PROGRESS')}
                            className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold rounded-lg border border-amber-200 transition-colors"
                          >
                            In Progress
                          </button>

                          <button
                            onClick={() => handleOpenModal(c, 'RESOLVE')}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg shadow-xs transition-colors"
                          >
                            Resolve & Proof
                          </button>
                        </>
                      )}

                      {c.status === 'Resolved' && (
                        <span className="text-emerald-600 font-bold text-xs inline-flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" /> Verified
                        </span>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* RESOLUTION / STATUS UPDATE MODAL */}
      {activeActionComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
            
            <div className="bg-gradient-to-r from-slate-900 to-blue-900 p-5 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base">
                    {actionType === 'RESOLVE'
                      ? 'Upload Resolution Proof & Close Ticket'
                      : actionType === 'IN_PROGRESS'
                      ? 'Mark Field Work In Progress'
                      : 'Assign Field Officer / Contractor'}
                  </h3>
                  <span className="font-mono text-xs text-blue-300">
                    {activeActionComplaint.id}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setActiveActionComplaint(null)}
                className="p-1 rounded-lg hover:bg-white/20 text-white/80"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteStatusUpdate} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Assigned Officer / Contractor</label>
                <input
                  type="text"
                  value={officerName}
                  onChange={(e) => setOfficerName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Designation / Role</label>
                  <input
                    type="text"
                    value={officerRole}
                    onChange={(e) => setOfficerRole(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Official Mobile Phone</label>
                  <input
                    type="text"
                    value={officerPhone}
                    onChange={(e) => setOfficerPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900"
                  />
                </div>
              </div>

              {actionType === 'RESOLVE' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-700">
                      After Remediation Proof Photo *
                    </label>
                    <button
                      type="button"
                      onClick={() => afterFileInputRef.current?.click()}
                      className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>Choose File from Device</span>
                    </button>
                  </div>

                  <input
                    type="file"
                    ref={afterFileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          setAfterImageUrl(await fileToCompressedDataUrl(file));
                        } catch (err) {
                          console.error('Photo upload error:', err);
                          alert('Could not read that photo. Please choose a JPG or PNG image.');
                        }
                      }
                    }}
                  />

                  <input
                    type="text"
                    value={afterImageUrl}
                    onChange={(e) => setAfterImageUrl(e.target.value)}
                    placeholder="Or enter resolved image URL..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-xs"
                  />
                  <div className="h-36 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
                    <img src={afterImageUrl} alt="After Preview" className="w-full h-full object-cover" />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 mb-1">Official Remediation Notes *</label>
                <textarea
                  rows={3}
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-900"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setActiveActionComplaint(null)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-md"
                >
                  {isUpdating ? 'Saving...' : 'Confirm Status Update'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
