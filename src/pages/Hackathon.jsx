import React, { useState, useEffect } from 'react';
import { Trophy, Timer, Globe, CheckCircle2, CloudLightning } from 'lucide-react';
import './Hackathon.css';

export function Hackathon() {
  const [timeLeft, setTimeLeft] = useState({ hours: 48, minutes: 0, seconds: 0 });

  // Simple countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        let { hours, minutes, seconds } = prev;
        if (seconds > 0) {
          seconds--;
        } else if (minutes > 0) {
          minutes--;
          seconds = 59;
        } else if (hours > 0) {
          hours--;
          minutes = 59;
          seconds = 59;
        }
        return { hours, minutes, seconds };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="hackathon-container">
      
      {/* Active Hackathon Hero Banner */}
      <div className="hackathon-hero glass-panel">
        <div className="hero-content text-center">
          <div className="flex-center mb-4">
            <div className="icon-badge border-warning">
              <Trophy size={32} className="text-warning" />
            </div>
          </div>
          <h1>Global AI Innovators Hackathon</h1>
          <p className="text-muted text-lg mt-2">Build the future of decentralized AI systems.</p>
          
          <div className="countdown-timer mt-6">
            <div className="time-block">
              <span className="time-value">{timeLeft.hours.toString().padStart(2, '0')}</span>
              <span className="time-label">HOURS</span>
            </div>
            <span className="time-separator">:</span>
            <div className="time-block">
              <span className="time-value">{timeLeft.minutes.toString().padStart(2, '0')}</span>
              <span className="time-label">MINUTES</span>
            </div>
            <span className="time-separator">:</span>
            <div className="time-block">
              <span className="time-value text-primary">{timeLeft.seconds.toString().padStart(2, '0')}</span>
              <span className="time-label text-primary">SECONDS</span>
            </div>
          </div>
        </div>
      </div>

      <div className="hackathon-grid">
        
        {/* Submission Panel */}
        <div className="submission-panel glass-panel">
          <div className="panel-header mb-4 border-b pb-4">
             <h2>Submission Panel</h2>
             <p className="text-muted text-sm mt-1">Ensure all fields are completed before the deadline.</p>
          </div>

          <form className="submission-form">
            <div className="form-group">
              <label>Project Name</label>
              <input type="text" placeholder="e.g. NextGen AI Platform" className="form-input" />
            </div>
            <div className="form-group">
              <label>Demo Video URL</label>
              <input type="url" placeholder="https://youtube.com/..." className="form-input" />
            </div>
            <div className="form-group">
              <label>GitHub Repository</label>
              <input type="url" placeholder="https://github.com/..." className="form-input" />
            </div>
            <div className="form-group">
              <label>Live Deployment (Optional)</label>
              <input type="url" placeholder="https://..." className="form-input" />
            </div>

            <button type="button" className="btn-primary w-full mt-4 flex-center gap-2 text-lg" onClick={() => alert('Project Submitted successfully!')}>
              <CloudLightning size={20} /> Submit Project
            </button>
            <p className="text-center text-xs text-muted mt-2">You can update your submission until the timer ends.</p>
          </form>
        </div>

        {/* Status and Requirements Panel */}
        <div className="sidebar-panels flex-col gap-4">
          
          <div className="glass-panel text-center flex-center" style={{ flexDirection: 'column', padding: '2rem' }}>
             <div className="mb-4 text-success">
               <CheckCircle2 size={48} />
             </div>
             <h3>Team Eligible</h3>
             <p className="text-muted text-sm mt-2">Your team size (4/4) meets the hackathon requirements. All members have verified their accounts.</p>
          </div>

          <div className="glass-panel flex-1">
             <h3 className="mb-4 flex-center gap-2" style={{justifyContent: 'flex-start'}}><Globe size={18}/> Judging Criteria</h3>
             <ul className="criteria-list">
               <li>
                 <span className="criteria-title">Innovation (30%)</span>
                 <p className="text-xs text-muted">How unique and forward-thinking is the solution?</p>
               </li>
               <li>
                 <span className="criteria-title">Execution (30%)</span>
                 <p className="text-xs text-muted">Is the product functional and well-designed?</p>
               </li>
               <li>
                 <span className="criteria-title">Technical Complexity (20%)</span>
                 <p className="text-xs text-muted">Complexity of the algorithms or technologies used.</p>
               </li>
               <li>
                 <span className="criteria-title">Business Impact (20%)</span>
                 <p className="text-xs text-muted">Viability of the project in the real world.</p>
               </li>
             </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
