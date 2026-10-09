import React from 'react';
import { AlertCircle, ThumbsUp, ArrowRight, X, MapPin, Layers } from 'lucide-react';
import { Complaint } from '../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onUpvoteAndTrack: (duplicateTicketId: string) => void;
  onContinueFiling: () => void;
  duplicates: Array<{
    complaint: Complaint;
    distanceMeters: number;
    similarityScore: number;
    reason: string;
  }>;
}

export const DuplicateWarningModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onUpvoteAndTrack,
  onContinueFiling,
  duplicates
}) => {
  if (!isOpen || duplicates.length === 0) return null;

  const topMatch = duplicates[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-600 p-4 sm:p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-xs">
              <Layers className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">Similar Grievance Found Nearby</h3>
              <p className="text-amber-100 text-xs">AI Geospatial Duplicate Prevention</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/20 text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
            Our AI engine detected an active grievance registered within{' '}
            <span className="font-bold text-slate-900">{topMatch.distanceMeters} meters</span> of your location matching your issue:
          </p>

          {/* Duplicate Card Preview */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                {topMatch.complaint.id}
              </span>
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                Status: {topMatch.complaint.status.replace('_', ' ')}
              </span>
            </div>

            <h4 className="font-bold text-slate-900 text-sm">{topMatch.complaint.title}</h4>
            <p className="text-xs text-slate-600 line-clamp-2">{topMatch.complaint.description}</p>

            <div className="flex items-center gap-2 text-[11px] text-slate-500 pt-1 border-t border-slate-200">
              <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{topMatch.complaint.location.address}</span>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 bg-white p-2 rounded-lg border border-slate-200">
              <span className="font-medium">Community Upvotes:</span>
              <span className="font-bold text-blue-600">{topMatch.complaint.upvotes} Citizens Supported</span>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-800 flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p>
              <strong>Tip:</strong> Upvoting the existing ticket escalates its priority to municipal authorities without creating redundant paperwork!
            </p>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row gap-2 justify-end">
          <button
            onClick={onContinueFiling}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-200/60 rounded-xl transition-colors order-2 sm:order-1"
          >
            It's a different issue, File Anyway
          </button>
          <button
            onClick={() => onUpvoteAndTrack(topMatch.complaint.id)}
            className="px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.02] order-1 sm:order-2"
          >
            <ThumbsUp className="w-4 h-4" />
            <span>Upvote This Issue (+1 Me Too) & Track</span>
          </button>
        </div>

      </div>
    </div>
  );
};
