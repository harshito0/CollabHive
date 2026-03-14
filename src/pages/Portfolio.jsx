import { Briefcase, Download, Share2, Layout as LayoutIcon, Code, Eye, Star, Trophy, Clock, CheckCircle } from 'lucide-react';
import { db, auth } from '../firebase';
import { collection, query, where, onSnapshot, doc } from 'firebase/firestore';
import './Portfolio.css';

export function Portfolio({ user: initialUser }) {
  const [user, setUser] = useState(initialUser);
  const [projects, setProjects] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);

  // ── FIREBASE LISTENERS ─────────────────────────────────────────────────────
  React.useEffect(() => {
    if (!db || !auth.currentUser) return;

    // 1. Listen for User Profile & Stats
    const unsubscribeUser = onSnapshot(doc(db, 'users', auth.currentUser.uid), (snapshot) => {
      if (snapshot.exists()) setUser({ id: snapshot.id, ...snapshot.data() });
    });

    // 2. Listen for Projects where user is a member (Verified Work)
    const projectsQuery = query(
      collection(db, 'projects'),
      where('members', 'array-contains', auth.currentUser.uid)
    );
    const unsubscribeProjects = onSnapshot(projectsQuery, (snapshot) => {
      const projs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(projs);
    });

    return () => {
      unsubscribeUser();
      unsubscribeProjects();
    };
  }, []);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setPreviewReady(true);
    }, 1500);
  };

  return (
    <div className="portfolio-container">
      <div className="portfolio-header text-center mb-8">
        <h1 className="text-gradient" style={{ fontSize: '3rem' }}>Portfolio Auto Builder</h1>
        <p className="text-muted text-lg mt-2 max-w-2xl mx-auto">
          Turn your CollabHive activity into a stunning, recruiter-ready portfolio in seconds. 
          We automatically compile your projects, skills, and contribution graphs.
        </p>
      </div>

      {!previewReady ? (
        <div className="generation-box glass-panel text-center">
          <div className="flex-center mb-6">
            <div className={`icon-badge large ${isGenerating ? 'pulse' : ''}`}>
               <Briefcase size={40} className="text-primary" />
            </div>
          </div>
          
          <h2 className="mb-2">Ready to shine?</h2>
          <p className="text-muted mb-8">
            We will extract data from your {projects.length} verified projects and {user?.stats?.tasksCompleted || 0} completed tasks.
          </p>
          
          <div className="options-grid mb-8">
            <div className="option-card active">
              <LayoutIcon size={24} className="mb-2 text-primary" />
              <h4>Modern Dark</h4>
            </div>
            <div className="option-card">
              <LayoutIcon size={24} className="mb-2 text-muted" />
              <h4>Minimal Light</h4>
            </div>
            <div className="option-card">
              <LayoutIcon size={24} className="mb-2 text-muted" />
              <h4>Terminal Retro</h4>
            </div>
          </div>

          <button 
            className="btn-primary" 
            style={{ fontSize: '1.2rem', padding: '1rem 3rem' }}
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? 'Compiling Stats & Synthesizing...' : 'Generate My Portfolio 🚀'}
          </button>
        </div>
      ) : (
        <div className="preview-container animation-fade-in">
          <div className="preview-actions flex-between mb-4">
            <h3 className="flex-center gap-2"><Eye size={20} /> Live Preview</h3>
            <div className="flex-center gap-4">
              <button className="btn-secondary text-sm flex-center gap-2" onClick={() => alert('Link copied to clipboard!')}>
                <Share2 size={16} /> Share Link
              </button>
              <button className="btn-primary text-sm flex-center gap-2" onClick={() => alert('Exporting portfolio code as ZIP...')}>
                <Download size={16} /> Export Code
              </button>
            </div>
          </div>

          {/* The Actual Generated Portfolio Mockup inner frame */}
          <div className="portfolio-frame glass-panel">
            <div className="browser-bar">
              <div className="dots">
                <span></span><span></span><span></span>
              </div>
              <div className="url-bar">harshitsingh.collabhive.app</div>
            </div>
            
            <div className="frame-content">
               <header className="mock-header flex-between">
                  <h2 className="text-gradient">{user?.name || 'Developer Name'}</h2>
                  <nav className="flex-center gap-4 text-sm font-semibold">
                    <div className="flex-center gap-1 text-primary">
                      <Trophy size={14} /> {user?.collabScore || '0.0'}
                    </div>
                    <span>Projects</span>
                    <span>Skills</span>
                  </nav>
               </header>

               <section className="mock-hero text-center mt-12 mb-12">
                  <img src={user?.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'Dev'}&backgroundColor=6366f1`} width="100" className="mock-avatar mb-4" alt="User Avatar" />
                  <h1 style={{fontSize: '2.5rem', marginBottom: '0.5rem'}}>Hi, I'm {user?.name || 'a Developer'}.</h1>
                  <p className="text-primary font-bold mb-2">{user?.profession || 'Full Stack Engineer'}</p>
                  <p className="text-muted max-w-xl mx-auto">{user?.bio || 'Building the future of web collaboration.'}</p>
                  
                  <div className="flex-center mt-6 gap-8">
                    <div className="impact-stat">
                      <CheckCircle className="text-success mb-1" size={20} />
                      <span className="block font-bold">{user?.stats?.tasksCompleted || 0}</span>
                      <span className="text-xs text-muted caps">Tasks</span>
                    </div>
                    <div className="impact-stat">
                      <Clock className="text-primary mb-1" size={20} />
                      <span className="block font-bold">{user?.stats?.hoursCollaborated?.toFixed(1) || 0}</span>
                      <span className="text-xs text-muted caps">Hours</span>
                    </div>
                    <div className="impact-stat">
                      <Star className="text-warning mb-1" size={20} />
                      <span className="block font-bold">{projects.length}</span>
                      <span className="text-xs text-muted caps">Projects</span>
                    </div>
                  </div>
               </section>

               <section className="mock-projects mb-8">
                  <h3 className="mb-4">Verified Collaboration History</h3>
                  <div className="mock-grid">
                    {projects.length > 0 ? projects.map(p => (
                      <div key={p.id} className="mock-card">
                         <Code size={20} className="mb-2 text-primary" />
                         <h4>{p.name}</h4>
                         <p className="text-xs text-muted mt-2">{p.status || 'Active'} • {p.members?.length || 1} Collaborators</p>
                      </div>
                    )) : (
                      <div className="mock-card opacity-50">
                        <p className="text-xs text-muted">Join a project to show your impact here.</p>
                      </div>
                    )}
                    
                    {user?.repositories?.slice(0, 2).map(repo => (
                      <div key={repo.id} className="mock-card">
                         <Star size={20} className="mb-2 text-warning" />
                         <h4>{repo.name}</h4>
                         <p className="text-xs text-muted mt-2">GitHub Repos • {repo.stars || 0} stars</p>
                      </div>
                    ))}
                  </div>
               </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
