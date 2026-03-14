import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Hexagon,
  Home,
  BrainCircuit,
  Users,
  LayoutDashboard,
  Trophy,
  GraduationCap,
  Briefcase
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { path: '/', icon: Home, label: 'Dashboard' },
  { path: '/mentor', icon: BrainCircuit, label: 'AI Project Mentor' },
  { path: '/matchmaking', icon: Users, label: 'Find Team' },
  { path: '/workspace', icon: LayoutDashboard, label: 'Workspace' },
  { path: '/team', icon: Users, label: 'Team Rooms' },
  { path: '/hackathon', icon: Trophy, label: 'Hackathons' },
  { path: '/learning', icon: GraduationCap, label: 'Learning Paths' },
  { path: '/recruiter', icon: Briefcase, label: 'Recruiter Hub' },
  { path: '/portfolio', icon: Briefcase, label: 'My Portfolio' },
];

export function Sidebar({ user, onLoginClick, onLogout }) {
  return (
    <aside className="sidebar glass-panel">
      <div className="sidebar-header">
        <Hexagon size={32} className="logo-icon text-gradient" />
        <h2 className="logo-text">Collab<span className="text-gradient">Hive</span></h2>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <item.icon size={20} className="nav-icon" />
            <span className="nav-label">{item.label}</span>
            <div className="nav-indicator"></div>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">

        <div className="creator-badge mb-4">
          <p className="text-xs text-muted mb-1 uppercase tracking-wider font-semibold">Created By</p>
          <p className="creator-name text-gradient">Harshit Singh</p>
          <div className="creator-details mt-2">
            <span className="creator-tag">3rd Year AI/ML</span>
            <a href="tel:9792303434" className="creator-link flex-center gap-1 mt-1">📞 9792303434</a>
            <a href="https://www.linkedin.com/in/harshitsinghwebdevloper/" target="_blank" rel="noopener noreferrer" className="creator-link flex-center gap-1 mt-1">
              🔗 LinkedIn Profile
            </a>
          </div>
        </div>

        {user ? (
          <div className="user-profile">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name}&backgroundColor=6366f1`} alt="User" className="user-avatar" />
            <div className="user-info">
              <p className="user-name">{user.name}</p>
              <p className="user-role flex-between" style={{gap: '0.5rem'}}>
                <span>Logged In ({user.method})</span>
                <button onClick={onLogout} className="btn-text text-danger" style={{fontSize: '0.7rem'}}>Logout</button>
              </p>
            </div>
          </div>
        ) : (
          <button onClick={onLoginClick} className="btn-primary w-full flex-center p-3 text-sm">
            Sign In / Register
          </button>
        )}
      </div>
    </aside>
  );
}
