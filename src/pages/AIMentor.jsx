import React, { useState, useEffect, useRef } from 'react';
import { 
  Send, Sparkles, Code2, Database, LayoutTemplate, Server, 
  MessageCircle, Bot, User, Target, BarChart3, Coins, AlertCircle, Activity 
} from 'lucide-react';
import './AIMentor.css';

export function AIMentor() {
  const [activeMode, setActiveMode] = useState('roadmap'); // 'roadmap' or 'validator'
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [validationResult, setValidationResult] = useState(null);
  
  // Chat state
  const [queryInput, setQueryInput] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'ai', text: 'Hello! I am your lead architect. How can I help you refine this roadmap?' }
  ]);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleAction = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setResult(null);
    setValidationResult(null);
    
    if (activeMode === 'roadmap') {
      // Simulate Roadmap generation
      setTimeout(() => {
        setResult({
          features: ['User Authentication', 'Product Catalog', 'Shopping Cart', 'Payment Gateway Integration', 'Admin Dashboard'],
          folderStructure: `src/\n  components/\n  pages/\n  context/\n  services/\n  utils/`,
          schema: `User { id, email, password }\nProduct { id, name, price, stock }\nOrder { id, userId, total, status }`,
          endpoints: `GET /api/products\nPOST /api/orders\nPOST /api/auth/login`
        });
        setIsGenerating(false);
        setMessages([{ role: 'ai', text: 'Roadmap generated! How can I help you refine the technical architecture?' }]);
      }, 1500);
    } else {
      // Simulate Idea Validation
      setTimeout(() => {
        setValidationResult({
          score: 8.5,
          marketDemand: 'High',
          competition: 'Medium',
          monetization: 'SaaS Subscription / Freemium',
          analysis: [
            { category: 'Technical Feasibility', score: 90 },
            { category: 'Profitability', score: 82 },
            { category: 'Community Interest', score: 88 }
          ],
          suggestions: [
            'Focus on a niche developer audience first.',
            'Integrate with existing CI/CD tools to increase stickiness.',
            'Implement a "Creator Fund" to drive viral growth.'
          ]
        });
        setIsGenerating(false);
        setMessages([{ role: 'ai', text: 'Analysis complete! The monetization model looks promising. Any specific questions on the market strategy?' }]);
      }, 1500);
    }
  };

  const handleQuery = (e) => {
    e.preventDefault();
    if (!queryInput.trim() || isQuerying) return;

    const userText = queryInput;
    setQueryInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsQuerying(true);

    setTimeout(() => {
      let aiResponse = "Regarding your query, ";
      
      if (userText.toLowerCase().includes('security') || userText.toLowerCase().includes('auth')) {
        aiResponse += "I recommend JWT with rotation for secure session management.";
      } else if (userText.toLowerCase().includes('market') || userText.toLowerCase().includes('money')) {
        aiResponse += "the B2B SaaS model is likely your best path to recurring revenue.";
      } else {
        aiResponse += "that's a solid approach for scaling this kind of platform.";
      }

      setMessages(prev => [...prev, { role: 'ai', text: aiResponse }]);
      setIsQuerying(false);
    }, 1200);
  };

  return (
    <div className="ai-mentor-container">
      <div className="mentor-header">
        <div className="icon-badge">
          <Sparkles size={28} className="text-primary" />
        </div>
        <div>
          <h1 className="text-gradient">AI Project Mentor</h1>
          <p className="text-muted">Turn your idea into a technical roadmap or a validated startup concept.</p>
        </div>
      </div>

      <div className="mode-toggle glass-panel mb-6">
        <button 
          className={`mode-btn ${activeMode === 'roadmap' ? 'active' : ''}`}
          onClick={() => { setActiveMode('roadmap'); setResult(null); setValidationResult(null); }}
        >
          <Code2 size={18} /> Roadmap Generator
        </button>
        <button 
          className={`mode-btn ${activeMode === 'validator' ? 'active' : ''}`}
          onClick={() => { setActiveMode('validator'); setResult(null); setValidationResult(null); }}
        >
          <Target size={18} /> Idea Validator
        </button>
      </div>

      <form className="prompt-box glass-panel" onSubmit={handleAction}>
        <input 
          type="text" 
          placeholder={activeMode === 'roadmap' ? "e.g. Build an E-commerce Website" : "e.g. A marketplace for 3D printed tools"} 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isGenerating}
        />
        <button type="submit" className="btn-primary flex-center gap-2" disabled={isGenerating}>
          {isGenerating ? 'Thinking...' : activeMode === 'roadmap' ? 'Generate Plan' : 'Validate Idea'} <Send size={16} />
        </button>
      </form>

      {/* ── ROADMAP RESULTS ── */}
      {result && activeMode === 'roadmap' && (
        <div className="mentor-results">
          <div className="result-card glass-panel">
            <div className="card-header border-b">
              <LayoutTemplate size={20} className="text-primary" />
              <h3>Core Features</h3>
            </div>
            <ul className="feature-list">
              {result.features.map((f, i) => <li key={i}><div className="check-circle"></div> {f}</li>)}
            </ul>
          </div>
          <div className="result-card glass-panel">
            <div className="card-header border-b"><Database size={20} className="text-secondary" /><h3>Schema</h3></div>
            <pre className="code-block">{result.schema}</pre>
          </div>
          <div className="result-card glass-panel">
            <div className="card-header border-b"><Server size={20} className="text-accent" /><h3>Endpoints</h3></div>
            <pre className="code-block">{result.endpoints}</pre>
          </div>
          <div className="result-card glass-panel">
            <div className="card-header border-b"><Code2 size={20} className="text-success" /><h3>Folder Structure</h3></div>
            <pre className="code-block">{result.folderStructure}</pre>
          </div>
        </div>
      )}

      {/* ── VALIDATION RESULTS ── */}
      {validationResult && activeMode === 'validator' && (
        <div className="mentor-results validator">
          <div className="result-card score-card glass-panel">
            <div className="flex-between">
              <div>
                <h2 className="text-3xl font-bold">{validationResult.score}/10</h2>
                <p className="text-muted">Overall Idea Score</p>
              </div>
              <Activity size={40} className="text-primary opacity-20" />
            </div>
            <div className="score-bars mt-6 flex-col gap-4">
              {validationResult.analysis.map((a, i) => (
                <div key={i}>
                  <div className="flex-between text-xs mb-1">
                    <span>{a.category}</span>
                    <span>{a.score}%</span>
                  </div>
                  <div className="progress-bar-bg-git"><div className="progress-bar-fill-git" style={{ width: `${a.score}%` }}></div></div>
                </div>
              ))}
            </div>
          </div>

          <div className="result-card glass-panel">
            <div className="card-header border-b"><BarChart3 size={20} className="text-secondary" /><h3>Market Analysis</h3></div>
            <div className="market-stats grid grid-cols-2 gap-4 mt-2">
              <div className="stat-box-git">
                <p className="text-xs text-muted">Demand</p>
                <p className="font-bold text-success">{validationResult.marketDemand}</p>
              </div>
              <div className="stat-box-git">
                <p className="text-xs text-muted">Competition</p>
                <p className="font-bold text-orange">{validationResult.competition}</p>
              </div>
            </div>
            <div className="stat-box-git mt-4">
              <p className="text-xs text-muted">Suggested Model</p>
              <p className="font-semibold">{validationResult.monetization}</p>
            </div>
          </div>

          <div className="result-card glass-panel col-span-full">
            <div className="card-header border-b"><AlertCircle size={20} className="text-accent" /><h3>Strategic Suggestions</h3></div>
            <ul className="feature-list mt-2">
              {validationResult.suggestions.map((s, i) => <li key={i}><div className="check-circle"></div> {s}</li>)}
            </ul>
          </div>
        </div>
      )}

      {(result || validationResult) && (
        <div className="mentor-chat-section glass-panel mt-8">
          <div className="chat-header border-b">
             <MessageCircle size={20} className="text-primary" />
             <h3>AI Architect Query</h3>
             <span className="live-badge">Live Chat</span>
          </div>
          <div className="mentor-chat-messages">
            {messages.map((msg, i) => (
              <div key={i} className={`mentor-msg-row ${msg.role === 'user' ? 'user-row' : 'ai-row'}`}>
                <div className="msg-avatar">{msg.role === 'ai' ? <Bot size={16} /> : <User size={16} />}</div>
                <div className="mentor-msg-bubble">{msg.text}</div>
              </div>
            ))}
            {isQuerying && (
              <div className="mentor-msg-row ai-row">
                <div className="msg-avatar"><Bot size={16} /></div>
                <div className="mentor-msg-bubble thinking">AI is typing...</div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>
          <form className="mentor-chat-input" onSubmit={handleQuery}>
            <input 
              type="text" 
              placeholder="Ask about technical details or market strategy..."
              value={queryInput}
              onChange={(e) => setQueryInput(e.target.value)}
              disabled={isQuerying}
            />
            <button type="submit" className="icon-btn-chat" disabled={isQuerying || !queryInput.trim()}><Send size={18} /></button>
          </form>
        </div>
      )}
    </div>
  );
}
