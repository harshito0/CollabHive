import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search, Home, BrainCircuit, Users, LayoutDashboard,
  Trophy, GraduationCap, Briefcase, FolderOpen, Globe
} from 'lucide-react';
import './CommandPalette.css';

const NAV_ITEMS = [
  { path: '/',            icon: Home,            label: 'Dashboard',        group: 'Pages' },
  { path: '/mentor',      icon: BrainCircuit,    label: 'AI Project Mentor',group: 'Pages' },
  { path: '/matchmaking', icon: Users,           label: 'Find Team',        group: 'Pages' },
  { path: '/workspace',   icon: LayoutDashboard, label: 'Workspace',        group: 'Pages' },
  { path: '/hackathon',   icon: Trophy,          label: 'Hackathons',       group: 'Pages' },
  { path: '/learning',    icon: GraduationCap,   label: 'Learning Paths',   group: 'Pages' },
  { path: '/recruiter',   icon: Briefcase,       label: 'Recruiter Hub',    group: 'Pages' },
  { path: '/portfolio',   icon: FolderOpen,      label: 'My Portfolio',     group: 'Pages' },
  { path: '/landing',     icon: Globe,           label: 'Landing Page',     group: 'Pages' },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  /* ── Keyboard shortcut: Ctrl+K / ⌘K ── */
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setOpen(prev => !prev);
      }
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  /* Focus input on open */
  useEffect(() => {
    if (open) {
      setQuery('');
      setActiveIdx(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  /* ── Filter results ── */
  const filtered = NAV_ITEMS.filter(item =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  /* Reset active index when filter changes */
  useEffect(() => { setActiveIdx(0); }, [query]);

  /* ── Navigate to selection ── */
  const select = useCallback((item) => {
    setOpen(false);
    navigate(item.path);
  }, [navigate]);

  /* ── Arrow keys + Enter ── */
  const handleKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx(i => (i + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx(i => (i - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter' && filtered[activeIdx]) {
      select(filtered[activeIdx]);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="cmd-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={() => setOpen(false)}
        >
          <motion.div
            className="cmd-palette"
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            transition={{ duration: 0.15 }}
            onClick={e => e.stopPropagation()}
          >
            {/* Search input */}
            <div className="cmd-input-wrap">
              <Search size={18} />
              <input
                ref={inputRef}
                className="cmd-input"
                placeholder="Search pages…"
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <span className="cmd-kbd">ESC</span>
            </div>

            {/* Results */}
            <div className="cmd-results">
              {filtered.length > 0 ? (
                <>
                  <div className="cmd-group-label">Pages</div>
                  {filtered.map((item, i) => (
                    <div
                      key={item.path}
                      className={`cmd-item ${i === activeIdx ? 'active' : ''}`}
                      onClick={() => select(item)}
                      onMouseEnter={() => setActiveIdx(i)}
                    >
                      <item.icon size={18} />
                      <span>{item.label}</span>
                      <span className="cmd-item-right">→</span>
                    </div>
                  ))}
                </>
              ) : (
                <div className="cmd-empty">No results for "{query}"</div>
              )}
            </div>

            {/* Footer hints */}
            <div className="cmd-footer">
              <span><span className="cmd-kbd">↑↓</span> Navigate</span>
              <span><span className="cmd-kbd">↵</span> Open</span>
              <span><span className="cmd-kbd">ESC</span> Close</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
