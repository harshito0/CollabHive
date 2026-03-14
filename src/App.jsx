import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { CommandPalette } from './components/layout/CommandPalette';
import { ToastProvider } from './components/layout/ToastContainer';
import { Dashboard } from './pages/Dashboard';
import { AIMentor } from './pages/AIMentor';
import { Matchmaking } from './pages/Matchmaking';
import { Workspace } from './pages/Workspace';
import { Hackathon } from './pages/Hackathon';
import { Portfolio } from './pages/Portfolio';
import RecruiterHub from './pages/RecruiterHub';
import LandingPage from './pages/LandingPage';
import { TeamRoom } from './pages/TeamRoom';
import { AuthModal } from './components/auth/AuthModal';
import { ProfileSetup } from './components/auth/ProfileSetup';
import './App.css';

// Placeholder components for routing
const Placeholder = ({ title }) => (
  <div className="flex-center" style={{ height: '60vh', flexDirection: 'column', gap: '1rem' }}>
    <h1 style={{ fontSize: '2.5rem' }}>{title}</h1>
    <p className="text-muted">Module under construction. Check back soon!</p>
  </div>
);

/* ── Layout wrapper: hides sidebar/header on /landing ── */
function AppLayout({ user, onLoginClick, onLogout, children }) {
  const location = useLocation();
  const isLanding = location.pathname === '/landing';

  if (isLanding) {
    return <>{children}</>;
  }

  return (
    <div className="app-container">
      <Sidebar user={user} onLoginClick={onLoginClick} onLogout={onLogout} />
      <main className="main-content">
        <Header user={user} onLoginClick={onLoginClick} />
        <div className="page-container">
          {children}
        </div>
      </main>
    </div>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileSetupOpen, setIsProfileSetupOpen] = useState(false);
  const [pendingUser, setPendingUser] = useState(null);

  const handleLogin = (authData) => {
    if (authData.isNewUser) {
      setPendingUser(authData);
      setIsAuthOpen(false);
      setIsProfileSetupOpen(true);
    } else {
      setUser(authData);
      setIsAuthOpen(false);
    }
  };

  const handleProfileComplete = (profileData) => {
    setUser({ ...pendingUser, ...profileData });
    setPendingUser(null);
    setIsProfileSetupOpen(false);
  };

  const openAuth = () => setIsAuthOpen(true);

  return (
    <Router>
      <ToastProvider>
        <AppLayout user={user} onLoginClick={openAuth} onLogout={() => setUser(null)}>
          <Routes>
            <Route path="/" element={<Dashboard user={user} onLoginClick={openAuth} />} />
            <Route path="/mentor" element={<AIMentor user={user} />} />
            <Route path="/matchmaking" element={<Matchmaking />} />
            <Route path="/workspace" element={<Workspace />} />
            <Route path="/hackathon" element={<Hackathon />} />
            <Route path="/learning" element={<Placeholder title="Learning Paths" />} />
            <Route path="/recruiter" element={<RecruiterHub />} />
            <Route path="/portfolio" element={<Portfolio user={user} />} />
            <Route path="/landing" element={<LandingPage />} />
            <Route path="/team" element={<TeamRoom user={user} />} />
          </Routes>
        </AppLayout>

        {/* Global overlays */}
        <CommandPalette />

        <AuthModal
          isOpen={isAuthOpen}
          onClose={() => setIsAuthOpen(false)}
          onLogin={handleLogin}
        />

        <ProfileSetup
          isOpen={isProfileSetupOpen}
          onComplete={handleProfileComplete}
        />
      </ToastProvider>
    </Router>
  );
}

export default App;
