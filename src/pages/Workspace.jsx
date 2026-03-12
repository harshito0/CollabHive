import React, { useState, useRef } from 'react';
import { Layout, MessageSquare, MonitorPlay, Github, Plus, MoreHorizontal, Send, Trash2, GitBranch, Star } from 'lucide-react';
import { Whiteboard } from '../components/Whiteboard';
import './Workspace.css';

const TABS = [
  { id: 'tasks', label: 'Tasks', icon: Layout },
  { id: 'chat', label: 'Team Chat', icon: MessageSquare },
  { id: 'whiteboard', label: 'Whiteboard', icon: MonitorPlay },
  { id: 'github', label: 'GitHub', icon: Github },
];

const INITIAL_TASKS = {
  todo: [
    { id: 1, title: 'Design database schema', tag: 'Backend' },
    { id: 2, title: 'Configure Next.js routing', tag: 'Frontend' },
  ],
  inProgress: [
    { id: 3, title: 'Build AI Mentor UI', tag: 'Design' },
  ],
  done: [
    { id: 4, title: 'Project Initialization', tag: 'DevOps' },
  ]
};

const INITIAL_MESSAGES = [
  { id: 1, user: 'Sarah', avatar: 'Sarah', color: 'ec4899', text: 'Just pushed the new auth module 🎉', time: '2:30 PM' },
  { id: 2, user: 'Alex', avatar: 'Alex', color: '6366f1', text: 'Looks great! Can you review my PR?', time: '2:31 PM' },
  { id: 3, user: 'Raj', avatar: 'Raj', color: '10b981', text: 'On it. Standby for code review comments.', time: '2:33 PM' },
];

const COMMITS = [
  { hash: 'a3f1c2', author: 'Sarah', msg: 'feat: Add user authentication module', time: '2 hours ago', stars: 3 },
  { hash: 'b8d4e9', author: 'Alex', msg: 'fix: Resolve cart state race condition', time: '4 hours ago', stars: 1 },
  { hash: 'c9e2a7', author: 'Raj', msg: 'docs: Update API documentation', time: '1 day ago', stars: 2 },
];

export function Workspace() {
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [chatInput, setChatInput] = useState('');
  const [newTaskInput, setNewTaskInput] = useState({ todo: '', inProgress: '', done: '' });
  const [addingIn, setAddingIn] = useState(null); // which column is in "add" mode
  const canvasRef = useRef(null);
  const [drawing, setDrawing] = useState(false);
  const [lastPos, setLastPos] = useState(null);

  // ── ADD TASK ───────────────────────────────────────────────────────────────
  const handleAddTask = (col) => {
    const title = newTaskInput[col].trim();
    if (!title) return;
    const newTask = { id: Date.now(), title, tag: col === 'todo' ? 'New' : col === 'inProgress' ? 'Active' : 'Done' };
    setTasks(prev => ({ ...prev, [col]: [...prev[col], newTask] }));
    setNewTaskInput(prev => ({ ...prev, [col]: '' }));
    setAddingIn(null);
  };

  // ── DELETE TASK ─────────────────────────────────────────────────────────────
  const handleDeleteTask = (col, id) => {
    setTasks(prev => ({ ...prev, [col]: prev[col].filter(t => t.id !== id) }));
  };

  // ── SEND CHAT ───────────────────────────────────────────────────────────────
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatInput.trim()) return;
    setMessages(prev => [...prev, {
      id: Date.now(),
      user: 'You',
      avatar: 'User',
      color: '6366f1',
      text: chatInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }]);
    setChatInput('');
  };

  // ── WHITEBOARD CANVAS ──────────────────────────────────────────────────────
  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const client = e.touches ? e.touches[0] : e;
    return { x: client.clientX - rect.left, y: client.clientY - rect.top };
  };

  const startDraw = (e) => { setDrawing(true); setLastPos(getPos(e)); };
  const stopDraw  = ()    => { setDrawing(false); setLastPos(null); };
  const draw = (e) => {
    if (!drawing || !canvasRef.current) return;
    const ctx = canvasRef.current.getContext('2d');
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPos.x, lastPos.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = '#818cf8';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();
    setLastPos(pos);
  };

  const clearCanvas = () => {
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  };

  // ── RENDER TASK COLUMN ─────────────────────────────────────────────────────
  const renderColumn = (colId, label, dotClass, taskClass) => (
    <div className="kanban-column glass-panel">
      <div className="column-header flex-between mb-4">
        <div className="flex-center gap-2">
          <div className={`dot ${dotClass}`}></div>
          <h3>{label}</h3>
          <span className="task-count">{tasks[colId].length}</span>
        </div>
        <button className="icon-btn-small" onClick={() => setAddingIn(addingIn === colId ? null : colId)}>
          <Plus size={16} />
        </button>
      </div>

      {addingIn === colId && (
        <div className="add-task-form mb-3">
          <input
            className="form-input text-sm"
            placeholder="Task name..."
            value={newTaskInput[colId]}
            onChange={e => setNewTaskInput(p => ({ ...p, [colId]: e.target.value }))}
            onKeyDown={e => e.key === 'Enter' && handleAddTask(colId)}
            autoFocus
          />
          <div className="flex-center gap-2 mt-2">
            <button className="btn-primary text-xs py-1 px-3" onClick={() => handleAddTask(colId)}>Add</button>
            <button className="btn-secondary text-xs py-1 px-3" onClick={() => setAddingIn(null)}>Cancel</button>
          </div>
        </div>
      )}

      <div className="task-list">
        {tasks[colId].map(task => (
          <div key={task.id} className={`task-card ${taskClass ?? ''}`} draggable="true">
            <div className="flex-between mb-2">
              <span className={`task-tag ${colId === 'inProgress' ? 'blue' : colId === 'done' ? 'green' : ''}`}>{task.tag}</span>
              <button className="icon-btn-small text-muted" onClick={() => handleDeleteTask(colId, task.id)}>
                <Trash2 size={12} />
              </button>
            </div>
            <p className={`task-title ${colId === 'done' ? 'line-through' : ''}`}>{task.title}</p>
            <div className="task-footer mt-4 flex-between">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=6366f1`} className="task-avatar" alt="Assignee" />
              {colId === 'done' && <span className="text-success text-xs">Completed</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="workspace-container">
      <div className="workspace-header">
        <div>
          <div className="flex-center gap-2" style={{ justifyContent: 'flex-start' }}>
            <span className="badge-project-status">Active Sprint</span>
            <span className="text-muted text-sm">Ends in 3 days</span>
          </div>
          <h1 className="mt-2 text-gradient">E-commerce Redesign</h1>
        </div>
        <div className="header-team flex-center">
          <div className="avatar-stack">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=6366f1" alt="Alex" />
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=ec4899" alt="Sarah" />
            <div className="avatar-more">+2</div>
          </div>
          <button className="btn-secondary ml-4 flex-center gap-2" onClick={() => alert('Invite link copied! Share it with your teammate.')}>
            <Plus size={16} /> Invite
          </button>
        </div>
      </div>

      <div className="workspace-tabs border-b">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab-btn flex-center gap-2 ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="workspace-content">
        {/* ─── KANBAN ─── */}
        {activeTab === 'tasks' && (
          <div className="kanban-board">
            {renderColumn('todo', 'To Do', 'dot-gray', '')}
            {renderColumn('inProgress', 'In Progress', 'dot-blue', '')}
            {renderColumn('done', 'Done', 'dot-green', 'opacity-muted')}
          </div>
        )}

        {/* ─── TEAM CHAT ─── */}
        {activeTab === 'chat' && (
          <div className="chat-container glass-panel">
            <div className="chat-messages">
              {messages.map(msg => (
                <div key={msg.id} className={`chat-msg ${msg.user === 'You' ? 'self' : ''}`}>
                  {msg.user !== 'You' && (
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.avatar}&backgroundColor=${msg.color}`} className="task-avatar mr-3" alt={msg.user} />
                  )}
                  <div className="msg-bubble">
                    {msg.user !== 'You' && <p className="msg-author">{msg.user}</p>}
                    <p>{msg.text}</p>
                    <p className="msg-time">{msg.time}</p>
                  </div>
                </div>
              ))}
            </div>
            <form className="chat-input-row" onSubmit={handleSendMessage}>
              <input
                className="form-input"
                placeholder="Type a message..."
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
              />
              <button type="submit" className="btn-primary flex-center gap-2 ml-3">
                <Send size={16} />
              </button>
            </form>
          </div>
        )}

        {/* ─── WHITEBOARD ─── */}
        {activeTab === 'whiteboard' && (
          <div className="whiteboard-tab-content">
            <Whiteboard />
          </div>
        )}

        {/* ─── GITHUB ─── */}
        {activeTab === 'github' && (
          <div className="glass-panel" style={{ padding: '1.5rem' }}>
            <div className="flex-between mb-6">
              <div className="flex-center gap-3">
                <GitBranch size={24} className="text-primary" />
                <div>
                  <h3>team/e-commerce-redesign</h3>
                  <p className="text-muted text-sm">main branch · 24 commits</p>
                </div>
              </div>
              <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="btn-secondary text-sm flex-center gap-2">
                <Github size={16} /> View on GitHub
              </a>
            </div>
            <h4 className="text-muted text-sm mb-4 font-semibold uppercase tracking-wider">Recent Commits</h4>
            <div className="flex-col gap-3">
              {COMMITS.map(c => (
                <div key={c.hash} className="commit-row glass-panel">
                  <div>
                    <p className="font-semibold">{c.msg}</p>
                    <p className="text-muted text-xs mt-1">{c.hash} · {c.author} · {c.time}</p>
                  </div>
                  <div className="flex-center gap-1 text-muted text-sm">
                    <Star size={14} /> {c.stars}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
