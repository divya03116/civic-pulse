import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Sparkles, HeartHandshake, PhoneCall, Globe2, Building2, FileCheck2 } from 'lucide-react';
import { useRole } from '../context/RoleContext';

export const Footer: React.FC = () => {
  const { isCitizen } = useRole();

  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-xs">
      {/* Upper Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Col 1: Portal Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-white font-extrabold text-lg tracking-tight">CivicPulse AI Pune</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Pune Municipal Corporation (PMC) citizen grievance redressed platform powered by zero-latency Natural Language Processing and Computer Vision triage.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 font-medium">
              <Sparkles className="w-3.5 h-3.5" />
              <span>PMC 100% Automated Triage Guarantee</span>
            </div>
          </div>

          {/* Col 2: Citizen Services */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3">Citizen Services</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/file" className="hover:text-blue-400 transition-colors">File New Grievance</Link></li>
              <li><Link to="/track" className="hover:text-blue-400 transition-colors">Real-time Ticket Tracking</Link></li>
              <li><Link to="/feed" className="hover:text-blue-400 transition-colors">Public Transparency Wall</Link></li>
              <li><Link to="/map" className="hover:text-blue-400 transition-colors">Interactive Pune Ward Heatmap</Link></li>
              {!isCitizen && (
                <li><Link to="/analytics" className="hover:text-blue-400 transition-colors">Department SLA Scorecards</Link></li>
              )}
            </ul>
          </div>

          {/* Col 3: Municipal Departments */}
          <div>
            <h4 className="text-white font-bold text-sm mb-3">Participating Departments</h4>
            <ul className="space-y-1.5 text-xs text-slate-400">
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                <span>Roads & Public Infrastructure (PMC)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500"></span>
                <span>Water Supply & Sewerage Board</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                <span>Solid Waste Management (SWM Pune)</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                <span>Power Distribution & Public Lighting</span>
              </li>
              <li className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                <span>Town Planning & Anti-Encroachment</span>
              </li>
            </ul>
          </div>

          {/* Col 4: 24x7 Helplines */}
          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-white font-bold text-sm">
              <PhoneCall className="w-4 h-4 text-amber-400" />
              <span>PMC Emergency Helpdesk</span>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">PMC Central Control:</span>
                <span className="text-white font-semibold">1800 103 0222</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">Municipal SOS Hotline:</span>
                <span className="text-white font-semibold">1916</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-800">
                <span className="text-slate-400">MSEDCL Power Emergency:</span>
                <span className="text-white font-semibold">1912</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-slate-400">Pune Disaster Management:</span>
                <span className="text-white font-semibold">020 25501269</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Sub-bar */}
      <div className="border-t border-slate-800/80 bg-slate-950 py-4 px-4 text-center text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            © 2026 Pune Municipal Corporation (PMC). Government Open Data Initiative.
          </div>
          <div className="flex items-center gap-4 text-slate-400">
            <span className="hover:text-white cursor-pointer">Citizen Charter</span>
            <span className="hover:text-white cursor-pointer">SLA Regulations</span>
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
