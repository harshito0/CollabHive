import React, { useState, useEffect, useRef } from 'react';
import { Send, Sparkles, Code2, Database, LayoutTemplate, Server, MessageCircle, Bot, User } from 'lucide-react';
import './AIMentor.css';

export function AIMentor() {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState(null);
  
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

  const handleGenerate = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    
    setIsGenerating(true);
    setResult(null);
    setMessages([{ role: 'ai', text: 'Hello! I am your lead architect. How can I help you refine this roadmap?' }]);
    
    // Simulate AI generation delay
    setTimeout(() => {
      setResult({
        features: ['User Authentication', 'Product Catalog', 'Shopping Cart', 'Payment Gateway Integration', 'Admin Dashboard'],
        folderStructure: `src/
  components/
  pages/
  context/
  services/
  utils/`,
        schema: `User { id, email, password }
Product { id, name, price, stock }
Order { id, userId, total, status }`,
        endpoints: `GET /api/products
POST /api/orders
POST /api/auth/login`
      });
      setIsGenerating(false);
    }, 1500);
  };

  const handleQuery = (e) => {
    e.preventDefault();
    if (!queryInput.trim() || isQuerying) return;

    const userText = queryInput;
    setQueryInput('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsQuerying(true);

    // Simulate AI response delay
    setTimeout(() => {
      let aiResponse = "That's an interesting technical challenge. Specifically for this architecture, I recommend ";
      
      if (userText.toLowerCase().includes('security') || userText.toLowerCase().includes('auth')) {
        aiResponse += "implementing JWT with rotation and using HttpOnly cookies for token storage to prevent XSS attacks.";
      } else if (userText.toLowerCase().includes('database') || userText.toLowerCase().includes('mongo') || userText.toLowerCase().includes('sql')) {
        aiResponse += "optimizing your indexes for high-read throughput and considering a caching layer like Redis for frequently accessed product data.";
      } else if (userText.toLowerCase().includes('testing')) {
        aiResponse += "setting up a CI/CD pipeline with Cypress for E2E tests and Vitest for unit testing your core logic.";
      } else {
        aiResponse += "scaling your backend services using Docker containers and an orchestrator like Kubernetes for high availability.";
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
          <p className="text-muted">Describe your idea, and I'll generate the complete technical roadmap.</p>
        </div>
      </div>

      <form className="prompt-box glass-panel" onSubmit={handleGenerate}>
        <input 
          type="text" 
          placeholder="e.g. Build an E-commerce Website" 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isGenerating}
        />
        <button type="submit" className="btn-primary flex-center gap-2" disabled={isGenerating}>
          {isGenerating ? 'Thinking...' : 'Generate Plan'} <Send size={16} />
        </button>
      </form>

      {result && (
        <>
          <div className="mentor-results">
            <div className="result-card glass-panel">
              <div className="card-header border-b">
                <LayoutTemplate size={20} className="text-primary" />
                <h3>Core Features List</h3>
              </div>
              <ul className="feature-list">
                {result.features.map((f, i) => (
                  <li key={i}>
                    <div className="check-circle"></div>
                    {f}
                  </li>
                ))}
              </ul>
            </div>

            <div className="result-card glass-panel">
              <div className="card-header border-b">
                <Database size={20} className="text-secondary" />
                <h3>Database Schema</h3>
              </div>
              <pre className="code-block">{result.schema}</pre>
            </div>

            <div className="result-card glass-panel">
              <div className="card-header border-b">
                <Server size={20} className="text-accent" />
                <h3>API Endpoints</h3>
              </div>
              <pre className="code-block">{result.endpoints}</pre>
            </div>

            <div className="result-card glass-panel">
              <div className="card-header border-b">
                <Code2 size={20} className="text-success" />
                <h3>Folder Structure</h3>
              </div>
              <pre className="code-block">{result.folderStructure}</pre>
            </div>
          </div>

          {/* AI CHAT SECTION */}
          <div className="mentor-chat-section glass-panel mt-8">
            <div className="chat-header border-b">
               <MessageCircle size={20} className="text-primary" />
               <h3>AI Architect Query</h3>
               <span className="live-badge">Live Chat</span>
            </div>
            
            <div className="mentor-chat-messages">
              {messages.map((msg, i) => (
                <div key={i} className={`mentor-msg-row ${msg.role === 'user' ? 'user-row' : 'ai-row'}`}>
                  <div className="msg-avatar">
                    {msg.role === 'ai' ? <Bot size={16} /> : <User size={16} />}
                  </div>
                  <div className="mentor-msg-bubble">
                    {msg.text}
                  </div>
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
                placeholder="Ask a technical question about this plan..."
                value={queryInput}
                onChange={(e) => setQueryInput(e.target.value)}
                disabled={isQuerying}
              />
              <button type="submit" className="icon-btn-chat" disabled={isQuerying || !queryInput.trim()}>
                <Send size={18} />
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
