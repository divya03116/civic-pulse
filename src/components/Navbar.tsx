import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  PlusCircle,
  Search,
  MapPin,
  BarChart3,
  Layers,
  UserCheck,
  Menu,
  X,
  PhoneCall,
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { useRole, PRESET_PROFILES } from '../context/RoleContext';

export const Navbar: React.FC = () => {
  const { currentProfile, activeKey, switchProfile, isCitizen } = useRole();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchTicket, setSearchTicket] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTicket.trim()) {
      navigate(`/track/${searchTicket.trim().toUpperCase()}`);
      setSearchTicket('');
      setMobileMenuOpen(false);
    }
  };

  const handleNavClick = (path: string) => {
    setMobileMenuOpen(false);
    // If clicking current route, scroll smoothly to top
    if (location.pathname === path) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      // If clicking File Grievance while on /file, reset the form state
      if (path === '/file') {
        window.dispatchEvent(new CustomEvent('civicpulse:reset-file-form'));
      }
    }
  };

  // As citizen, Analytics Hub must NOT be visible
  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'File Grievance', path: '/file', highlight: true },
    { name: 'Track Status', path: '/track' },
    { name: 'Public Feed', path: '/feed' },
    { name: 'Civic GIS Map', path: '/map' },
    ...(!isCitizen
      ? [
          { name: 'Analytics Hub', path: '/analytics', adminOnly: true },
          { name: 'Official Dashboard', path: '/admin', adminOnly: true }
        ]
      : [])
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-lg">
      {/* Top Municipal Alert & Emergency Bar */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 px-4 py-1.5 text-xs text-slate-300 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2 max-w-7xl mx-auto w-full justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="font-semibold text-white">Pune Municipal Corporation (PMC)</span>
            <span className="hidden md:inline text-slate-400">| 24/7 AI Citizen Grievance Portal</span>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-1.5 text-amber-300 font-medium">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>PMC Helpline: 1800 103 0222 / 1916</span>
            </div>
            <div className="flex items-center gap-1 bg-slate-800/90 px-2 py-0.5 rounded text-[11px] text-blue-300 border border-slate-700">
              <Sparkles className="w-3 h-3 text-blue-400" />
              <span>Pune AI Core Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Portal Identity */}
          <Link
            to="/"
            onClick={() => handleNavClick('/')}
            className="flex items-center gap-3 group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white">CivicPulse</span>
                <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-400/30">PUNE</span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block -mt-1 font-medium">PMC Grievance Redressal</p>
            </div>
          </Link>

          {/* Search Ticket Bar (Desktop) */}
          <form onSubmit={handleTrackSubmit} className="hidden lg:flex items-center relative max-w-xs w-full">
            <input
              type="text"
              placeholder="Track ticket (e.g. 1001)..."
              value={searchTicket}
              onChange={(e) => setSearchTicket(e.target.value)}
              className="w-full pl-9 pr-8 py-1.5 bg-slate-800/80 border border-slate-700 text-xs rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
            {searchTicket && (
              <button
                type="submit"
                className="absolute right-2 text-[10px] bg-blue-600 hover:bg-blue-500 text-white px-1.5 py-0.5 rounded font-semibold"
              >
                Go
              </button>
            )}
          </form>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              if (link.highlight) {
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => handleNavClick(link.path)}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-95"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>File Grievance</span>
                  </Link>
                );
              }
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => handleNavClick(link.path)}
                  className={`px-3 py-2 rounded-lg text-xs lg:text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-blue-400 font-semibold'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  } ${link.adminOnly ? 'text-amber-300 bg-amber-950/40 border border-amber-800/40' : ''}`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Role Switcher Dropdown */}
          <div className="flex items-center gap-2">
            <div className="relative group">
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700 hover:border-slate-600 cursor-pointer transition-all">
                <div className={`w-2 h-2 rounded-full ${
                  currentProfile.role === 'ADMIN' ? 'bg-amber-400' :
                  currentProfile.role === 'OFFICER' ? 'bg-blue-400' : 'bg-emerald-400'
                }`} />
                <div className="text-left">
                  <div className="text-[11px] text-slate-400 leading-tight">View As:</div>
                  <div className="text-xs font-semibold text-white truncate max-w-[110px] sm:max-w-[140px]">
                    {currentProfile.name.split(' ')[0]} ({currentProfile.role === 'CITIZEN' ? 'Citizen' : currentProfile.role === 'ADMIN' ? 'Admin' : 'Officer'})
                  </div>
                </div>
                <UserCheck className="w-3.5 h-3.5 text-slate-400 ml-1" />
              </div>

              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-1 w-64 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-2 hidden group-hover:block hover:block z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1">
                  Switch Persona / Role
                </div>
                {Object.entries(PRESET_PROFILES).map(([key, p]) => (
                  <button
                    key={key}
                    onClick={() => switchProfile(key)}
                    className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-start justify-between gap-2 transition-colors ${
                      activeKey === key
                        ? 'bg-blue-600/20 text-blue-300 border border-blue-500/30 font-medium'
                        : 'text-slate-300 hover:bg-slate-700/60 hover:text-white'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-white">{p.name}</div>
                      <div className="text-[10px] text-slate-400">{p.title}</div>
                    </div>
                    {activeKey === key && <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 shrink-0 mt-0.5" />}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-800 text-slate-300 hover:text-white focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-4 space-y-2">
          <form onSubmit={handleTrackSubmit} className="relative mb-3">
            <input
              type="text"
              placeholder="Track ticket ID..."
              value={searchTicket}
              onChange={(e) => setSearchTicket(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 text-sm rounded-lg text-white"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          </form>

          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => handleNavClick(link.path)}
              className={`block px-3 py-2 rounded-lg text-sm font-medium ${
                location.pathname === link.path
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
};
