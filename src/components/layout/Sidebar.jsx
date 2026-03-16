import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  Hexagon,
  Home,
  BrainCircuit,
  Users,
  LayoutDashboard,
  Trophy,
  GraduationCap,
  Briefcase,
  X,
  Settings,
  ChevronRight
} from 'lucide-react';
import './Sidebar.css';
import logo from '../../assets/logo.png';

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
  { path: '/settings', icon: Settings, label: 'Profile Settings' },
];

export function Sidebar({ user, onLoginClick, onLogout, isOpen, onClose }) {
  return (
    <aside className={`sidebar glass-panel ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="flex-center gap-2">
          <img src={logo} alt="CollabHive Logo" className="logo-img" style={{ width: 32, height: 32, objectFit: 'contain' }} />
          <h2 className="logo-text">Collab<span className="text-gradient">Hive</span></h2>
        </div>
        <button className="close-sidebar icon-btn" onClick={onClose}>
          <X size={24} />
        </button>
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
          <Link to="/settings" className="user-profile">
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name || user.email}&backgroundColor=6366f1`} alt="User" className="user-avatar" />
            <div className="user-info">
              <p className="user-name">{user.name || user.email?.split('@')[0] || 'User'}</p>
              <p className="user-role flex-between" style={{gap: '0.5rem'}}>
                <span>{user.profession || 'Developer'}</span>
                <ChevronRight size={14} className="text-muted" />
              </p>
            </div>
          </Link>
        ) : (
          <button onClick={onLoginClick} className="btn-primary w-full flex-center p-3 text-sm">
            Sign In / Register
          </button>
        )}
      </div>
    </aside>
  );
}
