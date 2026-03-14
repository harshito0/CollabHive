import React from 'react';
import { Bell, Search, MessageSquare } from 'lucide-react';
import './Header.css';

export function Header() {
  return (
    <header className="app-header glass-panel">
      <div className="header-search">
        <div className="search-bar">
          <Search size={18} className="search-icon text-muted" />
          <input 
            type="text" 
            placeholder="Search projects, teammates, tasks..." 
            className="search-input"
          />
        </div>
      </div>

      <div className="header-actions">
        <button className="icon-btn" onClick={() => alert('Messages opening...')}>
          <MessageSquare size={20} />
          <span className="badge">3</span>
        </button>
        <button className="icon-btn" onClick={() => alert('Notifications opening...')}>
          <Bell size={20} />
          <span className="badge warning">2</span>
        </button>
        <button className="btn-primary flex-center" style={{ gap: '0.5rem', padding: '0.5rem 1rem' }} onClick={() => alert('Opening New Project Modal...')}>
          <span>+ New Project</span>
        </button>
      </div>
    </header>
  );
}
