import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ScrollToTop } from './components/ScrollToTop';
import { CivicBotModal } from './components/CivicBotModal';
import { Home } from './pages/Home';
import { FileComplaint } from './pages/FileComplaint';
import { TrackComplaint } from './pages/TrackComplaint';
import { PublicFeed } from './pages/PublicFeed';
import { MapView } from './pages/MapView';
import { AdminDashboard } from './pages/AdminDashboard';
import { Analytics } from './pages/Analytics';
import { useRole } from './context/RoleContext';

export const App: React.FC = () => {
  const { isCitizen } = useRole();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-blue-600 selection:text-white">
      {/* Scroll restoration helper */}
      <ScrollToTop />

      {/* Top Navigation */}
      <Navbar />

      {/* Main Routed Content */}
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/file" element={<FileComplaint />} />
          <Route path="/track" element={<TrackComplaint />} />
          <Route path="/track/:id" element={<TrackComplaint />} />
          <Route path="/feed" element={<PublicFeed />} />
          <Route path="/map" element={<MapView />} />
          <Route
            path="/admin"
            element={isCitizen ? <Navigate to="/" replace /> : <AdminDashboard />}
          />
          <Route
            path="/analytics"
            element={isCitizen ? <Navigate to="/" replace /> : <Analytics />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {/* 24/7 AI Civic Assistant Floating Bot */}
      <CivicBotModal />

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default App;
