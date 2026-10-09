import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Search,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  Shield,
  ThumbsUp,
  AlertOctagon,
  Star,
  ExternalLink,
  MessageSquare,
  FileCheck2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import { api } from '../services/api';
import { Complaint, ComplaintStatus } from '../types';
import { AIClassifierBadge } from '../components/AIClassifierBadge';

const STATUS_STEPS: { status: ComplaintStatus; label: string; desc: string }[] = [
  { status: 'Submitted', label: 'Submitted', desc: 'Complaint registered by citizen' },
  { status: 'AI_Triaged', label: 'AI Triaged', desc: 'Auto-routed & SLA assigned' },
  { status: 'Assigned', label: 'Assigned', desc: 'Ward Engineer work order issued' },
  { status: 'In_Progress', label: 'In Progress', desc: 'Field repair team on-site' },
  { status: 'Resolved', label: 'Resolved', desc: 'Remediation verified with proof' }
];

export const TrackComplaint: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [searchId, setSearchId] = useState(id || '');
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [allComplaints, setAllComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Feedback Form State
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);

  // Reopen Form State
  const [showReopenForm, setShowReopenForm] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [isReopening, setIsReopening] = useState(false);

  // Load all complaints for quick picker
  useEffect(() => {
    api.getComplaints().then(setAllComplaints).catch(console.error);
  }, []);

  // Fetch ticket details when ID changes
  useEffect(() => {
    if (!id) {
      if (allComplaints.length > 0) {
        // Set first complaint as active preview without forcing URL redirect
        setComplaint(allComplaints[0]);
        setSearchId(allComplaints[0].id);
      }
      return;
    }

    const fetchTicket = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await api.getComplaintById(id);
        setComplaint(data);
        setSearchId(data.id);
        if (data.feedback) {
          setFeedbackSubmitted(true);
          setRating(data.feedback.rating);
          setFeedbackComment(data.feedback.comment);
        } else {
          setFeedbackSubmitted(false);
        }
      } catch (err: any) {
        setError(err.message || 'Ticket not found');
        setComplaint(null);
      } finally {
        setLoading(false);
      }
    };

    fetchTicket();
  }, [id, allComplaints]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchId.trim()) {
      navigate(`/track/${searchId.trim().toUpperCase()}`);
    }
  };

  const handleUpvote = async () => {
    if (!complaint) return;
    try {
      const res = await api.upvoteComplaint(complaint.id);
      setComplaint(res.complaint);
    } catch (err) {
      console.error('Failed to upvote:', err);
    }
  };

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;
    setIsSubmittingFeedback(true);
    try {
      const updated = await api.submitFeedback(complaint.id, rating, feedbackComment);
      setComplaint(updated);
      setFeedbackSubmitted(true);
    } catch (err: any) {
      alert(err.message || 'Failed to submit feedback');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  const handleReopenSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint || !reopenReason.trim()) return;
    setIsReopening(true);
    try {
      const updated = await api.reopenComplaint(complaint.id, reopenReason.trim());
      setComplaint(updated);
      setShowReopenForm(false);
      setReopenReason('');
      setFeedbackSubmitted(false);
      alert('Grievance has been reopened and escalated for re-investigation.');
    } catch (err: any) {
      alert(err.message || 'Failed to reopen grievance');
    } finally {
      setIsReopening(false);
    }
  };

  // Helper to compute step index
  const getStepIndex = (status: ComplaintStatus) => {
    switch (status) {
      case 'Submitted':
        return 0;
      case 'AI_Triaged':
        return 1;
      case 'Assigned':
        return 2;
      case 'In_Progress':
        return 3;
      case 'Resolved':
        return 4;
      default:
        return 0;
    }
  };

  const currentStepIdx = complaint ? getStepIndex(complaint.status) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      
      {/* Search Header & Quick Ticket Dropdown */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-gov space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Live Grievance Tracking & SLA Audit
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Track the exact real-time milestone progress, assigned engineer, and resolution evidence.
            </p>
          </div>

          {/* Search Input Bar */}
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 max-w-md w-full">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Enter Ticket ID (e.g. CIVIC-2026-1001)..."
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 font-mono focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase font-semibold"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95 shrink-0"
            >
              Track
            </button>
          </form>
        </div>

        {/* Quick Selection Chips */}
        {allComplaints.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 text-xs">
            <span className="text-[11px] font-bold text-slate-500">Quick Test Tickets:</span>
            {allComplaints.map((c) => (
              <button
                key={c.id}
                onClick={() => navigate(`/track/${c.id}`)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition-all ${
                  complaint?.id === c.id
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200'
                }`}
              >
                {c.id} ({c.status.replace('_', ' ')})
              </button>
            ))}
          </div>
        )}
      </div>

      {loading && (
        <div className="text-center py-12 space-y-3">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-xs font-semibold text-slate-600">Retrieving municipal ledger records...</p>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-6 text-center text-rose-800 space-y-2">
          <AlertOctagon className="w-8 h-8 text-rose-600 mx-auto" />
          <h3 className="font-bold text-base">Grievance Record Not Found</h3>
          <p className="text-xs text-rose-700 max-w-md mx-auto">
            No active complaint matches the requested ticket ID. Please verify the number or submit a new grievance.
          </p>
          <Link
            to="/file"
            className="inline-block mt-2 px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl"
          >
            File New Grievance
          </Link>
        </div>
      )}

      {complaint && !loading && (
        <div className="space-y-8">
          
          {/* Main Status & SLA Header Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-gov space-y-6">
            
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-extrabold text-blue-700 bg-blue-50 border border-blue-200 px-3 py-1 rounded-xl">
                    {complaint.id}
                  </span>
                  <AIClassifierBadge
                    priority={complaint.priority}
                    department={complaint.department}
                    slaHours={complaint.estimatedSlaHours}
                  />
                </div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">{complaint.title}</h2>
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>{complaint.location.address} ({complaint.location.ward})</span>
                </div>
              </div>

              {/* Upvote & Support Action */}
              <button
                onClick={handleUpvote}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-700 hover:text-blue-700 text-xs font-bold transition-all self-start lg:self-center active:scale-95"
              >
                <ThumbsUp className="w-4 h-4 text-blue-600" />
                <span>Support Issue ({complaint.upvotes} Upvotes)</span>
              </button>
            </div>

            {/* 5-Step Interactive Milestone Stepper */}
            <div className="space-y-3">
              <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Resolution Milestones
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                {STATUS_STEPS.map((st, idx) => {
                  const isDone = idx <= currentStepIdx;
                  const isCurrent = idx === currentStepIdx;

                  return (
                    <div
                      key={st.status}
                      className={`p-3 rounded-2xl border transition-all ${
                        isCurrent
                          ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20 ring-2 ring-blue-400/30'
                          : isDone
                          ? 'bg-emerald-50 text-emerald-900 border-emerald-200'
                          : 'bg-slate-50 text-slate-400 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono font-bold">0{idx + 1}</span>
                        {isDone ? (
                          <CheckCircle2
                            className={`w-4 h-4 ${isCurrent ? 'text-white' : 'text-emerald-600'}`}
                          />
                        ) : (
                          <Clock className="w-4 h-4 text-slate-300" />
                        )}
                      </div>
                      <div className="font-bold text-xs">{st.label}</div>
                      <div
                        className={`text-[10px] mt-0.5 leading-tight ${
                          isCurrent ? 'text-blue-100' : isDone ? 'text-emerald-700' : 'text-slate-400'
                        }`}
                      >
                        {st.desc}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SLA Clock & Officer In-Charge Banner */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              
              {/* SLA Banner */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-600 uppercase text-[10px]">
                    Statutory SLA Window
                  </span>
                  <span className="font-bold text-blue-600">{complaint.estimatedSlaHours} Hours Target</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900">
                      {complaint.status === 'Resolved' ? 'Resolved Within SLA' : 'SLA Clock Active'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Registered: {new Date(complaint.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>

              {/* Assigned Officer Card */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-600 uppercase text-[10px]">
                    Assigned Field Authority
                  </span>
                  <span className="font-mono text-[10px] font-bold text-slate-500">
                    {complaint.assignedTo?.badgeNumber || 'PENDING DISPATCH'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="font-bold text-sm text-slate-900">
                      {complaint.assignedTo?.officerName || 'Central Ward Dispatch'}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      {complaint.assignedTo?.officerRole || complaint.department}
                    </div>
                  </div>
                </div>
              </div>

            </div>

          </div>

          {/* Photographic Verification & Before/After Proof */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-gov space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Photographic Evidence & Proof</h3>
              <p className="text-xs text-slate-500">
                Visual inspection and repair verification record.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Before Photo */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-rose-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    Citizen Upload (Before Remediation)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Original Capture</span>
                </div>

                <div className="h-64 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner">
                  {complaint.images.before[0] ? (
                    <img
                      src={complaint.images.before[0]}
                      alt="Before Repair"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-slate-400 text-xs">
                      No photo uploaded
                    </div>
                  )}
                </div>
              </div>

              {/* After Photo / Resolution Proof */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-600 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    Official Field Proof (After Remediation)
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">Verified Inspection</span>
                </div>

                <div className="h-64 rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 shadow-inner flex items-center justify-center">
                  {complaint.images.after?.[0] ? (
                    <img
                      src={complaint.images.after[0]}
                      alt="After Remediation"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-center p-6 space-y-2 text-slate-400">
                      <Clock className="w-8 h-8 mx-auto text-slate-300" />
                      <p className="text-xs font-semibold">Remediation in progress</p>
                      <p className="text-[11px]">
                        The field engineer will upload resolution proof upon job completion.
                      </p>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {complaint.resolutionNotes && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <span className="font-bold text-emerald-800 uppercase text-[10px] block">
                  Official Remediation Notes:
                </span>
                <p className="leading-relaxed">{complaint.resolutionNotes}</p>
              </div>
            )}
          </div>

          {/* Chronological Action Timeline */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-gov space-y-6">
            <div className="space-y-1">
              <h3 className="text-lg font-bold text-slate-900">Chronological Event Timeline</h3>
              <p className="text-xs text-slate-500">Immutable ledger of actions and communications.</p>
            </div>

            <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
              {complaint.timeline.map((item, idx) => (
                <div key={item.id || idx} className="relative space-y-1">
                  <span className="absolute -left-6 top-1 w-4 h-4 rounded-full bg-blue-600 border-2 border-white shadow-xs"></span>
                  <div className="flex flex-wrap items-center justify-between gap-1">
                    <h4 className="font-bold text-xs text-slate-900">{item.title}</h4>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                  <div className="text-[10px] font-semibold text-slate-400">
                    By: {item.actor} ({item.role})
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Citizen Verification & Satisfaction Rating */}
          {complaint.status === 'Resolved' && (
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50/50 rounded-3xl p-6 sm:p-8 border border-blue-200 shadow-gov space-y-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                  <h3 className="text-lg font-bold text-slate-900">
                    Citizen Resolution Verification
                  </h3>
                </div>
                <p className="text-xs text-slate-600">
                  Rate the quality and speed of this resolution to help maintain department accountability.
                </p>
              </div>

              {feedbackSubmitted ? (
                <div className="bg-white p-4 rounded-2xl border border-blue-200 flex items-center justify-between text-xs">
                  <div className="space-y-1">
                    <span className="font-bold text-slate-900">Feedback Recorded</span>
                    <p className="text-slate-600 italic">"{feedbackComment || 'Satisfied with resolution'}"</p>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
                    <span>★ {rating}.0</span>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleFeedbackSubmit} className="space-y-4 bg-white p-5 rounded-2xl border border-blue-200">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      How satisfied are you with this repair?
                    </label>
                    <div className="flex items-center gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className="p-1 hover:scale-125 transition-transform"
                        >
                          <Star
                            className={`w-7 h-7 ${
                              star <= rating
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-slate-200 hover:text-amber-200'
                            }`}
                          />
                        </button>
                      ))}
                      <span className="text-xs font-bold text-slate-700 ml-2">
                        {rating === 5
                          ? 'Excellent Resolution'
                          : rating === 4
                          ? 'Very Good'
                          : rating === 3
                          ? 'Average'
                          : 'Needs Improvement'}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Citizen Comments / Verification Notes
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Clean work, road is now safe to drive on..."
                      value={feedbackComment}
                      onChange={(e) => setFeedbackComment(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingFeedback}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition-all active:scale-95"
                  >
                    Submit Citizen Rating
                  </button>
                </form>
              )}

              {/* Citizen Reopen Escalation Option */}
              <div className="pt-3 border-t border-blue-200/80">
                {!showReopenForm ? (
                  <button
                    type="button"
                    onClick={() => setShowReopenForm(true)}
                    className="text-xs text-rose-600 hover:text-rose-700 font-bold flex items-center gap-1.5 transition-colors"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Issue not fixed or problem recurred? Click here to Reopen Grievance</span>
                  </button>
                ) : (
                  <form onSubmit={handleReopenSubmit} className="bg-white p-4 rounded-2xl border border-rose-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-rose-600" />
                        Reopen Grievance for Municipal Re-Investigation
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowReopenForm(false)}
                        className="text-xs text-slate-400 hover:text-slate-600"
                      >
                        Cancel
                      </button>
                    </div>
                    <input
                      type="text"
                      placeholder="Explain why this issue is not resolved (e.g. pothole crater still deep, pipe still leaking)..."
                      value={reopenReason}
                      onChange={(e) => setReopenReason(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    />
                    <button
                      type="submit"
                      disabled={isReopening || !reopenReason.trim()}
                      className="px-4 py-2 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs transition-all active:scale-95"
                    >
                      {isReopening ? 'Submitting Reopen Request...' : 'Confirm & Reopen Issue'}
                    </button>
                  </form>
                )}
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
