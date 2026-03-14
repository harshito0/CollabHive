import React, { useState, useEffect } from 'react';
import { Activity, Clock, Users, ArrowRight, Code, Calendar, Flame, Star, Hexagon, LogIn } from 'lucide-react';
import './Dashboard.css';
import { db, auth } from '../firebase';
import { doc, onSnapshot, updateDoc, setDoc, getDoc, collection, query, orderBy } from 'firebase/firestore';
import { useToast } from '../components/layout/ToastContainer';
import { Github, RefreshCw } from 'lucide-react';
import { logActivity } from '../utils/activityUtils';

const MOCK_PROJECTS = [
  { id: 1, name: 'E-commerce Redesign', role: 'Frontend Lead', progress: 75, members: 4, tech: ['React', 'Node'] },
  { id: 2, name: 'AI Mentor Dashboard', role: 'Full Stack', progress: 30, members: 2, tech: ['Vite', 'Gemini API'] },
];

// ... (HEATMAP_DATA logic)
const HEATMAP_DATA = Array.from({ length: 365 }, () => Math.floor(Math.random() * 5));

export function Dashboard({ user, onLoginClick }) {
  const [collabScore, setCollabScore] = useState(0);
  const [stats, setStats] = useState({ tasksCompleted: 0, hoursCollaborated: 0 });
  const [repositories, setRepositories] = useState([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [heatmapData, setHeatmapData] = useState(Array.from({ length: 365 }, () => 0));
  const { toast } = useToast();

  useEffect(() => {
    const currentUser = auth?.currentUser;
    if (!currentUser || !db) return;

    const unsubscribe = onSnapshot(doc(db, 'users', currentUser.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        setCollabScore(data.collabScore || 0);
        setStats(data.stats || { tasksCompleted: 0, hoursCollaborated: 0 });
        setRepositories(data.repositories || []);
      }
    });

    // Sub-collection listener for Activity Heatmap
    const activitiesQuery = query(
      collection(db, 'users', currentUser.uid, 'activities'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribeActivities = onSnapshot(activitiesQuery, (snapshot) => {
      const freshHeatmap = Array.from({ length: 365 }, () => 0);
      const now = new Date();
      
      snapshot.docs.forEach(doc => {
        const activity = doc.data();
        if (activity.timestamp) {
          const activityDate = activity.timestamp.toDate();
          const diffTime = Math.abs(now - activityDate);
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          
          if (diffDays < 365) {
            // Index 364 is today, 0 is 365 days ago
            const index = 364 - diffDays;
            freshHeatmap[index] = Math.min((freshHeatmap[index] || 0) + 1, 4);
          }
        }
      });
      setHeatmapData(freshHeatmap);
    });

    return () => {
      unsubscribe();
      unsubscribeActivities();
    };
  }, [user]);

  const syncGithubRepos = async () => {
    if (!user?.githubToken) {
      toast.info('Please sign in with GitHub to sync repositories.');
      return;
    }

    setIsSyncing(true);
    try {
      const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=6', {
        headers: {
          'Authorization': `token ${user.githubToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch repositories');

      const data = await response.json();
      const formattedRepos = data.map(repo => ({
        id: repo.id,
        name: repo.name,
        role: 'Maintainer',
        progress: Math.floor(Math.random() * 40) + 60, // Random mock progress for imported repos
        members: 1,
        tech: [repo.language || 'Code'],
        url: repo.html_url,
        description: repo.description,
        stars: repo.stargazers_count
      }));

      // Update Firestore
      const userRef = doc(db, 'users', auth.currentUser.uid);
      await updateDoc(userRef, {
        repositories: formattedRepos,
        lastSynced: new Date().toISOString()
      });

      // Log activity and award points for syncing
      await logActivity(auth.currentUser.uid, 'commit', `Synced ${formattedRepos.length} GitHub repositories`);

      setRepositories(formattedRepos);
      toast.success(`Successfully synced ${formattedRepos.length} repositories!`);
    } catch (err) {
      console.error('GitHub Sync Error:', err);
      toast.error('Failed to sync with GitHub. Please check your permissions.');
    } finally {
      setIsSyncing(false);
    }
  };

  /* ── NOT LOGGED IN → Landing Screen ── */
  if (!user) {
    return (
      <div className="dashboard-landing">
        <div className="landing-content glass-panel animation-fade-in">
          <div className="landing-icon-wrapper">
            <Hexagon size={64} className="text-primary" />
          </div>
          <h1>Welcome to <span className="text-gradient">CollabHive</span></h1>
          <p className="text-muted landing-sub">
            Find your perfect hackathon team, collaborate in real-time, and build amazing projects together.
          </p>
          <button className="btn-primary landing-cta flex-center gap-2" onClick={onLoginClick}>
            <LogIn size={20} /> Sign In to Get Started
          </button>
          <div className="landing-features">
            <div className="landing-feature">
              <Code size={20} className="text-primary" />
              <span>Real-time Collaboration</span>
            </div>
            <div className="landing-feature">
              <Users size={20} className="text-primary" />
              <span>Smart Matchmaking</span>
            </div>
            <div className="landing-feature">
              <Star size={20} className="text-primary" />
              <span>Collab Score Tracking</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ── LOGGED IN → Full Dashboard ── */
  const displayName = user.name || user.email || 'User';

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Welcome back, {displayName}! 👋</h1>
          <p className="text-muted">Here's what's happening with your projects today.</p>
        </div>
        <button className="btn-primary" onClick={() => toast.info('Generating new project idea with AI...')}>Generate New Idea 💡</button>
      </div>
      
      <div className="stats-grid">
        <div className="stat-card glass-panel collab-score-card">
          <div className="stat-icon-wrapper golden">
            <Star size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Collab Score</p>
            <h3 className="stat-value">{collabScore.toFixed(1)}</h3>
            <p className="stat-trend positive">Live Metric</p>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper blue">
            <Activity size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Tasks Completed</p>
            <h3 className="stat-value">{stats.tasksCompleted}</h3>
            <p className="stat-trend positive">↑ {stats.tasksCompleted > 0 ? 'Active' : 'Get started!'}</p>
          </div>
        </div>
        <div className="stat-card glass-panel">
          <div className="stat-icon-wrapper purple">
            <Clock size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Hours Collaborated</p>
            <h3 className="stat-value">{stats.hoursCollaborated}h</h3>
            <p className="stat-trend">Total engagement</p>
          </div>
        </div>
      </div>

      {/* ── ACTIVITY HEATMAP ── */}
      <div className="heatmap-section glass-panel">
        <div className="heatmap-header flex-between mb-4">
          <div className="flex-center gap-2">
            <Calendar size={20} className="text-primary" />
            <h3>Contribution Activity</h3>
          </div>
          <div className="flex-center gap-2">
            <Flame size={16} className="text-orange" />
            <span className="text-sm font-semibold">12 day streak!</span>
          </div>
        </div>
        
        <div className="heatmap-grid-container">
          <div className="heatmap-days-labels">
            <span>Mon</span>
            <span>Wed</span>
            <span>Fri</span>
          </div>
          <div className="heatmap-grid">
            {heatmapData.map((level, i) => (
              <div 
                key={i} 
                className={`heatmap-cell level-${level}`}
                title={`${level} activities recorded`}
              ></div>
            ))}
          </div>
        </div>
        <div className="heatmap-footer mt-4 flex-between text-xs text-muted">
          <span>Less</span>
          <div className="flex-center gap-1">
            <div className="heatmap-cell level-0"></div>
            <div className="heatmap-cell level-1"></div>
            <div className="heatmap-cell level-2"></div>
            <div className="heatmap-cell level-3"></div>
            <div className="heatmap-cell level-4"></div>
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="projects-section">
        <div className="section-header flex-between">
          <h2>{repositories.length > 0 ? 'Your Projects' : 'Active Projects'}</h2>
          <div className="flex-center gap-3">
            {user?.githubToken && (
               <button 
                className={`btn-secondary text-sm flex-center gap-2 ${isSyncing ? 'syncing' : ''}`} 
                onClick={syncGithubRepos}
                disabled={isSyncing}
               >
                 <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
                 {isSyncing ? 'Syncing...' : 'Sync GitHub'}
               </button>
            )}
            <button className="btn-secondary text-sm flex-center gap-2" onClick={() => toast.info('Navigating to Projects tab...')}>
              View All <ArrowRight size={16} />
            </button>
          </div>
        </div>

        <div className="projects-grid">
          {repositories.length > 0 ? (
            repositories.map(repo => (
              <div key={repo.id} className="project-card glass-panel animation-slide-up">
                <div className="project-header flex-between">
                  <div className="project-icon">
                    <Github size={20} />
                  </div>
                  <div className="flex-center gap-2">
                    <Star size={14} className="text-yellow" />
                    <span className="text-xs font-semibold">{repo.stars}</span>
                  </div>
                </div>
                <h3 className="project-name">{repo.name}</h3>
                <p className="project-desc text-xs text-muted mb-3 line-clamp-2">
                  {repo.description || 'No description provided.'}
                </p>
                
                <div className="tech-stack flex-center gap-2" style={{justifyContent: 'flex-start'}}>
                  {repo.tech.map(t => <span key={t} className="tech-badge">{t}</span>)}
                </div>

                <div className="project-footer mt-4">
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${repo.progress}%` }}></div>
                  </div>
                  <div className="flex-between mt-2 text-sm text-muted">
                    <span>{repo.progress}% Impact</span>
                    <a href={repo.url} target="_blank" rel="noopener noreferrer" className="btn-text text-xs flex-center gap-1">
                      GitHub <ArrowRight size={12} />
                    </a>
                  </div>
                </div>
              </div>
            ))
          ) : (
            MOCK_PROJECTS.map(project => (
              <div key={project.id} className="project-card glass-panel">
                <div className="project-header flex-between">
                  {/* ... (keep same content for mock) ... */}
                  <div className="project-icon">
                    <Code size={20} />
                  </div>
                  <span className="badge-role">{project.role}</span>
                </div>
                <h3 className="project-name">{project.name}</h3>
                
                <div className="tech-stack flex-center gap-2" style={{justifyContent: 'flex-start'}}>
                  {project.tech.map(t => <span key={t} className="tech-badge">{t}</span>)}
                </div>

                <div className="project-footer mt-4">
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${project.progress}%` }}></div>
                  </div>
                  <div className="flex-between mt-2 text-sm text-muted">
                    <span>{project.progress}% Complete</span>
                    <div className="flex-center gap-1">
                      <Users size={14} /> {project.members} members
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
