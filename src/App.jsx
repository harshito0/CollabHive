import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { Dashboard } from './pages/Dashboard';
import { AIMentor } from './pages/AIMentor';
import { Matchmaking } from './pages/Matchmaking';
import { Workspace } from './pages/Workspace';
import { Hackathon } from './pages/Hackathon';
import { Portfolio } from './pages/Portfolio';
import RecruiterHub from './pages/RecruiterHub';
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

function App() {
  const [user, setUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileSetupOpen, setIsProfileSetupOpen] = useState(false);
  const [pendingUser, setPendingUser] = useState(null); // holds auth data while profile is being set up

  const handleLogin = (authData) => {
    setPendingUser(authData);
    setIsAuthOpen(false);
    setIsProfileSetupOpen(true); // Immediately show the profile wizard
  };

  const handleProfileComplete = (profileData) => {
    setUser({ ...pendingUser, ...profileData });
    setPendingUser(null);
    setIsProfileSetupOpen(false);
  };

  return (
    <Router>
      <div className="app-container">
        <Sidebar user={user} onLoginClick={() => setIsAuthOpen(true)} onLogout={() => setUser(null)} />
        <main className="main-content">
          <Header user={user} onLoginClick={() => setIsAuthOpen(true)} />
          <div className="page-container">
            <Routes>
              <Route path="/" element={<Dashboard user={user} onLoginClick={() => setIsAuthOpen(true)} />} />
              <Route path="/mentor" element={<AIMentor />} />
              <Route path="/matchmaking" element={<Matchmaking />} />
              <Route path="/workspace" element={<Workspace />} />
              <Route path="/hackathon" element={<Hackathon />} />
              <Route path="/learning" element={<Placeholder title="Learning Paths" />} />
              <Route path="/recruiter" element={<RecruiterHub />} />
              <Route path="/portfolio" element={<Portfolio />} />
            </Routes>
          </div>
        </main>
      </div>

      <AuthModal 
        isOpen={isAuthOpen} 
        onClose={() => setIsAuthOpen(false)} 
        onLogin={handleLogin}
      />

      <ProfileSetup
        isOpen={isProfileSetupOpen}
        onComplete={handleProfileComplete}
      />
    </Router>
  );
}

export default App;
