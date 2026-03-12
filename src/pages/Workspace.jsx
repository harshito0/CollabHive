import React, { useState, useRef, useEffect } from 'react';
import { 
  Layout, MessageSquare, MonitorPlay, Github, Plus, MoreHorizontal, 
  Send, Trash2, GitBranch, Star, FileCode, Folder, Upload, HardDrive, 
  Activity, CheckCircle2, Code2, Terminal, Users2, Shield, AlertCircle
} from 'lucide-react';
import { Whiteboard } from '../components/Whiteboard';
import './Workspace.css';

const TABS = [
  { id: 'tasks', label: 'Tasks', icon: Layout },
  { id: 'chat', label: 'Team Chat', icon: MessageSquare },
  { id: 'whiteboard', label: 'Whiteboard', icon: MonitorPlay },
  { id: 'minigit', label: 'Mini Git', icon: GitBranch },
  { id: 'livecode', label: 'Live Code', icon: Code2 },
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

const INITIAL_FILES = [
  { name: 'src', type: 'folder', children: [
    { name: 'components', type: 'folder', children: [
      { name: 'Auth.jsx', type: 'file', size: '2.4 KB', contributor: 'Sarah' },
      { name: 'Navbar.jsx', type: 'file', size: '1.8 KB', contributor: 'Raj' }
    ]},
    { name: 'App.jsx', type: 'file', size: '4.2 KB', contributor: 'Alex' },
    { name: 'index.css', type: 'file', size: '0.8 KB', contributor: 'Sarah' }
  ]},
  { name: 'package.json', type: 'file', size: '1.2 KB', contributor: 'Alex' },
  { name: 'README.md', type: 'file', size: '3.1 KB', contributor: 'Raj' }
];

const ACTIVITIES = [
  { id: 1, user: 'Sarah', action: 'Uploaded', target: 'login_v2.js', time: '10 mins ago' },
  { id: 2, user: 'Alex', action: 'Modified', target: 'App.jsx', time: '45 mins ago' },
  { id: 3, user: 'Raj', action: 'Deleted', target: 'temp.txt', time: '2 hours ago' },
];

export function Workspace() {
  const [activeTab, setActiveTab] = useState('tasks');
  const [tasks, setTasks] = useState(INITIAL_TASKS);
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [chatInput, setChatInput] = useState('');
  const [newTaskInput, setNewTaskInput] = useState({ todo: '', inProgress: '', done: '' });
  const [addingIn, setAddingIn] = useState(null);
  
  // Mini Git State
  const [files, setFiles] = useState(INITIAL_FILES);
  const [activities, setActivities] = useState(ACTIVITIES);
  const [progress, setProgress] = useState(68);
  const [isUploading, setIsUploading] = useState(false);

  // Live Code State
  const [code, setCode] = useState(`function ProjectInitializer() {\n  console.log("CollabHive is Live! 🚀");\n  return (\n    <div className="hive-core">\n      <h1>Welcome to the Shared Hive Room</h1>\n    </div>\n  );\n}`);
  const [activeUsers, setActiveUsers] = useState(['Sarah (Architect)', 'Alex (Lead)', 'You']);

  // ── ADD TASK ───────────────────────────────────────────────────────────────
  const handleAddTask = (col) => {
    const title = newTaskInput[col].trim();
    if (!title) return;
    const newTask = { id: Date.now(), title, tag: col === 'todo' ? 'New' : col === 'inProgress' ? 'Active' : 'Done' };
    setTasks(prev => ({ ...prev, [col]: [...prev[col], newTask] }));
    setNewTaskInput(prev => ({ ...prev, [col]: '' }));
    setAddingIn(null);
  };

  const handleDeleteTask = (col, id) => {
    setTasks(prev => ({ ...prev, [col]: prev[col].filter(t => t.id !== id) }));
  };

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

  // ── MINI GIT HANDLERS ──────────────────────────────────────────────────────
  const simulateUpload = () => {
    setIsUploading(true);
    setTimeout(() => {
      const newFile = { name: `component_${Math.floor(Math.random()*100)}.jsx`, type: 'file', size: '1.5 KB', contributor: 'You' };
      setFiles(prev => [...prev, newFile]);
      setActivities(prev => [{
        id: Date.now(),
        user: 'You',
        action: 'Uploaded',
        target: newFile.name,
        time: 'Just now'
      }, ...prev]);
      setProgress(prev => Math.min(100, prev + 2));
      setIsUploading(false);
    }, 1500);
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

        {/* ─── MINI GIT ─── */}
        {activeTab === 'minigit' && (
          <div className="minigit-container">
            <div className="minigit-main">
              <div className="file-explorer glass-panel">
                <div className="explorer-header flex-between mb-4">
                  <div className="flex-center gap-2"><Folder size={18} className="text-primary" /><span className="font-semibold">Project Files</span></div>
                  <button className="upload-btn-git" onClick={simulateUpload} disabled={isUploading}>
                    {isUploading ? 'Uploading...' : <><Upload size={14} /> Upload File</>}
                  </button>
                </div>
                <div className="file-list-git">
                  {files.map((file, idx) => (
                    <div key={idx} className="file-item-git">
                      <div className="flex-center gap-3">
                        {file.type === 'folder' ? <Folder size={16} className="text-secondary" /> : <FileCode size={16} className="text-muted" />}
                        <span className="file-name-git">{file.name}</span>
                      </div>
                      <div className="file-meta-git"><span className="contributor-badge">{file.contributor || 'Shared'}</span><span className="file-size-git">{file.size || '--'}</span></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="minigit-sidebar">
                <div className="progress-hub glass-panel mb-4">
                  <div className="flex-between mb-3"><h4 className="text-sm font-semibold">Project Progress</h4><span className="text-primary font-bold">{progress}%</span></div>
                  <div className="progress-bar-bg-git"><div className="progress-bar-fill-git" style={{ width: `${progress}%` }}></div></div>
                  <div className="progress-stats mt-4 grid grid-cols-2 gap-4">
                    <div className="stat-box-git"><p className="text-xs text-muted">Tasks</p><p className="font-semibold">12/18</p></div>
                    <div className="stat-box-git"><p className="text-xs text-muted">Uptime</p><p className="font-semibold text-success">99.9%</p></div>
                  </div>
                </div>
                <div className="activity-feed glass-panel">
                  <h4 className="text-sm font-semibold mb-3 flex-center gap-2" style={{ justifyContent: 'flex-start' }}><Activity size={14} className="text-primary" /> Live Activity</h4>
                  <div className="activity-list-git">
                    {activities.map(act => (
                      <div key={act.id} className="activity-item-git">
                        <div className="flex-between"><span className="act-user-git">{act.user}</span><span className="act-time-git">{act.time}</span></div>
                        <p className="act-text-git">{act.action} <span className="text-primary">{act.target}</span></p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ─── LIVE CODE ─── */}
        {activeTab === 'livecode' && (
          <div className="livecode-container">
            <div className="livecode-main">
              <div className="editor-chrome glass-panel">
                <div className="chrome-header flex-between px-4 py-2 border-b">
                  <div className="flex-center gap-2">
                    <Terminal size={14} className="text-muted" />
                    <span className="text-xs font-mono text-muted">ProjectInitializer.jsx</span>
                  </div>
                  <div className="flex-center gap-4">
                    <span className="text-xs text-success flex-center gap-1"><CheckCircle2 size={12} /> Syncing</span>
                    <button className="btn-primary text-xs py-1 px-3">Run Code</button>
                  </div>
                </div>
                <div className="editor-surface">
                  <div className="line-numbers">
                    {code.split('\n').map((_, i) => <div key={i}>{i+1}</div>)}
                  </div>
                  <textarea 
                    className="code-textarea"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    spellCheck="false"
                  />
                  {/* Mock Multi-Cursors */}
                  {activeTab === 'livecode' && (
                    <>
                      <div className="mock-cursor s-cursor" style={{ top: '60px', left: '200px' }}><span className="cursor-label">Sarah</span></div>
                      <div className="mock-cursor a-cursor" style={{ top: '120px', left: '150px' }}><span className="cursor-label">Alex</span></div>
                    </>
                  )}
                </div>
              </div>

              <div className="livecode-sidebar">
                <div className="active-users-box glass-panel mb-4">
                  <h4 className="text-sm font-semibold mb-3 flex-center gap-2" style={{ justifyContent: 'flex-start' }}><Users2 size={14} className="text-primary" /> Coding Together</h4>
                  <div className="user-pills">
                    {activeUsers.map((u, i) => (
                      <div key={i} className="user-pill-git">
                        <div className="online-dot"></div>
                        <span>{u}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="debug-output glass-panel">
                  <h4 className="text-sm font-semibold mb-2 flex-center gap-2" style={{ justifyContent: 'flex-start' }}><AlertCircle size={14} className="text-orange" /> Debug Output</h4>
                  <div className="terminal-output font-mono text-xs">
                    <p className="text-muted">[10:24:01] Initializing Hive Server...</p>
                    <p className="text-success">[10:24:02] hot reload active</p>
                    <p className="text-primary text-xs mt-2">$ npm run dev</p>
                    <p className="opacity-50 mt-1">Ready at http://localhost:5173</p>
                    <div className="terminal-cursor"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
