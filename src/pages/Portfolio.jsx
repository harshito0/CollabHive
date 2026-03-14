import React, { useState } from 'react';
import { Briefcase, Download, Share2, Layout as LayoutIcon, Code, Eye, Star } from 'lucide-react';
import './Portfolio.css';

export function Portfolio() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setPreviewReady(true);
    }, 2000);
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
          <p className="text-muted mb-8">We will extract data from your 3 completed projects and 24 tasks.</p>
          
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
                 <h2 className="text-gradient">Harshit Singh</h2>
                 <nav className="flex-center gap-4 text-sm font-semibold">
                   <span>About</span>
                   <span>Projects</span>
                   <span>Skills</span>
                   <span>Contact</span>
                 </nav>
               </header>

               <section className="mock-hero text-center mt-12 mb-12">
                 <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Harshit&backgroundColor=6366f1" width="100" className="mock-avatar mb-4" alt="Harshit Singh" />
                 <h1 style={{fontSize: '2.5rem', marginBottom: '1rem'}}>Hi, I'm Harshit Singh.</h1>
                 <p className="text-muted max-w-xl mx-auto">A 3rd Year AI/ML student & Web Developer who loves building scalable systems. Generated automatically using CollabHive metrics.</p>
                 <div className="flex-center mt-4 gap-4">
                   <a href="https://www.linkedin.com/in/harshitsinghwebdevloper/" target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm">Follow on LinkedIn</a>
                 </div>
               </section>

               <section className="mock-projects mb-8">
                  <h3 className="mb-4">Recent Work (Verified via CollabHive)</h3>
                  <div className="mock-grid">
                    <div className="mock-card">
                       <Code size={20} className="mb-2 text-primary" />
                       <h4>E-commerce Redesign</h4>
                       <p className="text-xs text-muted mt-2">Frontend Lead • React, Node • 75% Complete</p>
                    </div>
                    <div className="mock-card">
                       <Star size={20} className="mb-2 text-warning" />
                       <h4>AI Mentor Dashboard</h4>
                       <p className="text-xs text-muted mt-2">Full Stack • Vite, AI • 15 Commits</p>
                    </div>
                  </div>
               </section>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
