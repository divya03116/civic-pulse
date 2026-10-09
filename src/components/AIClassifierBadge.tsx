import React from 'react';
import { Sparkles, AlertOctagon, AlertTriangle, Info, Clock, CheckCircle, BrainCircuit } from 'lucide-react';
import { PriorityLevel, DepartmentType, AIAnalysisResult } from '../types';

interface Props {
  priority: PriorityLevel;
  department?: DepartmentType | string;
  confidence?: number;
  slaHours?: number;
  aiAnalysis?: AIAnalysisResult;
  showDetailed?: boolean;
}

export const AIClassifierBadge: React.FC<Props> = ({
  priority,
  department,
  confidence = 0.94,
  slaHours,
  aiAnalysis,
  showDetailed = false
}) => {
  const getPriorityConfig = () => {
    switch (priority) {
      case 'Critical':
        return {
          bg: 'bg-rose-500/10 text-rose-600 border-rose-500/30',
          dot: 'bg-rose-500',
          pulse: 'pulse-glow-critical',
          icon: AlertOctagon,
          label: 'Critical Hazard'
        };
      case 'High':
        return {
          bg: 'bg-amber-500/10 text-amber-600 border-amber-500/30',
          dot: 'bg-amber-500',
          pulse: '',
          icon: AlertTriangle,
          label: 'High Priority'
        };
      case 'Medium':
        return {
          bg: 'bg-blue-500/10 text-blue-600 border-blue-500/30',
          dot: 'bg-blue-500',
          pulse: '',
          icon: Info,
          label: 'Standard Priority'
        };
      default:
        return {
          bg: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30',
          dot: 'bg-emerald-500',
          pulse: '',
          icon: CheckCircle,
          label: 'Routine Priority'
        };
    }
  };

  const config = getPriorityConfig();
  const Icon = config.icon;

  if (!showDetailed) {
    return (
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-semibold border ${config.bg} ${config.pulse}`}
        >
          <span className={`w-2 h-2 rounded-full ${config.dot}`}></span>
          <Icon className="w-3.5 h-3.5" />
          <span>{config.label}</span>
        </span>

        {department && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md font-medium text-[11px] bg-slate-100 text-slate-700 border border-slate-200">
            {department}
          </span>
        )}

        {slaHours && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] bg-slate-800 text-slate-200 font-medium">
            <Clock className="w-3 h-3 text-slate-400" />
            <span>SLA: {slaHours}h</span>
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-blue-100 bg-gradient-to-br from-blue-50/70 via-indigo-50/40 to-slate-50 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <span>CivicPulse AI Neural Triage</span>
              <span className="text-[10px] font-medium px-1.5 py-0.2 bg-blue-600 text-white rounded">
                Verified
              </span>
            </h4>
            <p className="text-[11px] text-slate-500">Autonomous Department & Severity Routing</p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-xs font-extrabold text-blue-700">
            {Math.round(confidence * 100)}% Match
          </span>
          <div className="w-16 h-1.5 bg-blue-200 rounded-full overflow-hidden mt-0.5">
            <div
              className="h-full bg-blue-600 rounded-full"
              style={{ width: `${Math.round(confidence * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs mb-3">
        <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Target Department</span>
          <span className="font-semibold text-slate-800 text-xs block truncate">{department || 'Auto-Routing'}</span>
        </div>

        <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">AI Severity Score</span>
          <span className={`font-bold inline-flex items-center gap-1 ${config.bg} px-2 py-0.5 rounded text-[11px]`}>
            <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`}></span>
            {priority}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Mandatory SLA Window</span>
          <span className="font-bold text-slate-900 flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            {slaHours || 24} Hours
          </span>
        </div>
      </div>

      {aiAnalysis && (
        <div className="space-y-2 text-xs border-t border-blue-100 pt-2.5 text-slate-600">
          <p className="text-slate-700 text-xs leading-relaxed font-medium">
            <span className="font-bold text-slate-900">AI Assessment: </span>
            {aiAnalysis.severityAssessment}
          </p>

          {aiAnalysis.detectedObjects && aiAnalysis.detectedObjects.length > 0 && (
            <div className="flex flex-wrap items-center gap-1 pt-1">
              <span className="text-[11px] font-semibold text-slate-500">Visual/NLP Tags:</span>
              {aiAnalysis.detectedObjects.map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded bg-slate-200 text-slate-700 text-[10px] font-mono font-medium"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
