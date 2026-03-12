import React, { useState, useEffect } from 'react';
import { Search, Filter, Briefcase, Star, MapPin, Code, Trophy, ArrowUpRight } from 'lucide-react';
import './RecruiterHub.css';
import { collection, onSnapshot, query, orderBy } from 'firebase/firestore';
import { db } from '../firebase';

export default function RecruiterHub() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSkill, setFilterSkill] = useState('All');
  const [talent, setTalent] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) return;

    const q = query(collection(db, 'users'), orderBy('collabScore', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTalent(users);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredTalent = talent.filter(t => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = (t.name || '').toLowerCase().includes(searchLower) || 
                          (t.role || '').toLowerCase().includes(searchLower);
    const matchesSkill = filterSkill === 'All' || (t.skills && t.skills.includes(filterSkill));
    return matchesSearch && matchesSkill;
  });

  return (
    <div className="recruiter-container">
      <div className="recruiter-header">
        <div className="icon-badge">
          <Briefcase size={28} className="text-primary" />
        </div>
        <div>
          <h1 className="text-gradient">Talent Discovery</h1>
          <p className="text-muted">Find the top 1% of developers based on real project contributions.</p>
        </div>
      </div>

      <div className="search-filter-row mb-8">
        <div className="search-box-git glass-panel">
          <Search size={20} className="text-muted" />
          <input 
            type="text" 
            placeholder="Search by name, role or skill..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="filter-group flex-center gap-3">
          <button className="btn-secondary flex-center gap-2"><Filter size={16} /> Filters</button>
          <select 
            className="glass-select"
            value={filterSkill}
            onChange={(e) => setFilterSkill(e.target.value)}
          >
            <option>All Skills</option>
            <option>React</option>
            <option>Node.js</option>
            <option>System Design</option>
          </select>
        </div>
      </div>

      <div className="talent-grid">
        {loading && <div className="col-span-full text-center p-20 text-muted">Searching for top talent...</div>}
        {!loading && filteredTalent.length === 0 && <div className="col-span-full text-center p-20 text-muted">No developers found matching your criteria.</div>}
        {filteredTalent.map(talent => (
          <div key={talent.id} className="talent-card glass-panel h-card">
            <div className="talent-header flex-between">
              <div className="flex-center gap-4">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${talent.name}&backgroundColor=6366f1`} 
                  alt={talent.name} 
                  className="talent-avatar" 
                />
                <div>
                  <h3 className="text-lg font-bold">{talent.name}</h3>
                  <p className="text-primary text-sm font-semibold">{talent.role}</p>
                </div>
              </div>
              <div className="collab-score-badge">
                <p className="text-xs uppercase font-bold opacity-60">Collab Score</p>
                <p className="text-xl font-bold">{talent.collabScore}</p>
              </div>
            </div>

            <div className="talent-body mt-6">
              <div className="flex-center gap-4 mb-4" style={{ justifyContent: 'flex-start' }}>
                <span className="flex-center gap-1 text-xs text-muted"><MapPin size={12} /> {talent.location || 'Unknown'}</span>
                <span className="flex-center gap-1 text-xs text-muted"><Briefcase size={12} /> {talent.experience || 'Entry Level'}</span>
              </div>
              
              <div className="skills-row flex-center gap-2 flex-wrap mb-6" style={{ justifyContent: 'flex-start' }}>
                {(talent.skills || []).map(s => <span key={s} className="skill-pill-git">{s}</span>)}
              </div>

              <div className="talent-stats grid grid-cols-2 gap-4">
                <div className="t-stat">
                  <Trophy size={14} className="text-orange mb-1" />
                  <p className="text-lg font-bold">{talent.wins || 0}</p>
                  <p className="text-xs text-muted">Hackathon Wins</p>
                </div>
                <div className="t-stat">
                  <Code size={14} className="text-success mb-1" />
                  <p className="text-lg font-bold">150+</p>
                  <p className="text-xs text-muted">Project Commits</p>
                </div>
              </div>
            </div>

            <div className="talent-footer border-t mt-6 pt-4 flex-between">
              <span className={`status-badge ${(talent.status || 'Available').toLowerCase().replace(/\s/g, '-')}`}>
                {talent.status || 'Available'}
              </span>
              <button className="btn-primary-small flex-center gap-2">
                View Portfolio <ArrowUpRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
