import { 
  Layout, MessageSquare, MonitorPlay, Plus, 
  Send, Trash2, GitBranch, Folder, FileCode, Upload, 
  Activity, CheckCircle2, Code2, Terminal, Users2, AlertCircle
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, serverTimestamp, where } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { updateCollabScore } from '../utils/collabScore';
import { Whiteboard } from '../components/Whiteboard';
import './Workspace.css';

const TABS = [
  { id: 'tasks', label: 'Tasks', icon: Layout },
  { id: 'chat', label: 'Team Chat', icon: MessageSquare },
  { id: 'whiteboard', label: 'Whiteboard', icon: MonitorPlay },
  { id: 'minigit', label: 'Mini Git', icon: GitBranch },
  { id: 'livecode', label: 'Live Code', icon: Code2 },
];

export function Workspace({ user }) {
  const [activeTab, setActiveTab] = useState('tasks');
  const [projects, setProjects] = useState([]);
  const [currentProjectId, setCurrentProjectId] = useState(null);
  const [activeProject, setActiveProject] = useState(null);
  const [tasks, setTasks] = useState({ todo: [], inProgress: [], done: [] });
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [newTaskInput, setNewTaskInput] = useState({ todo: '', inProgress: '', done: '' });
  const [addingIn, setAddingIn] = useState(null);
  
  // Mini Git State
  const [files, setFiles] = useState([]);
  const [activities, setActivities] = useState([]);
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // Live Code State
  const [code, setCode] = useState(`function ProjectInitializer() {\n  console.log("CollabHive is Live! 🚀");\n  return (\n    <div className="hive-core">\n      <h1>Welcome to the Shared Hive Room</h1>\n    </div>\n  );\n}`);
  const [activeUsers] = useState(['Sarah (Architect)', 'Alex (Lead)', 'You']);

  // ── FIREBASE EFFECTS ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!db || !auth.currentUser) return;

    // 1. Fetch Projects where user is a member
    const projectsQuery = query(
      collection(db, 'projects'),
      where('members', 'array-contains', auth.currentUser.uid)
    );

    const unsubscribeProjects = onSnapshot(projectsQuery, (snapshot) => {
      const projs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(projs);
      if (projs.length > 0 && !currentProjectId) {
        setCurrentProjectId(projs[0].id);
        setActiveProject(projs[0]);
      }
    });

    return () => unsubscribeProjects();
  }, [user]);

  useEffect(() => {
    if (!db || !currentProjectId) return;

    // 2. Chat Listener (Project Specific)
    const chatQuery = query(
      collection(db, 'projects', currentProjectId, 'messages'), 
      orderBy('timestamp', 'asc')
    );
    const unsubscribeChat = onSnapshot(chatQuery, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
    });

    // 3. Tasks Listener (Project Specific)
    const unsubscribeTasks = onSnapshot(
      collection(db, 'projects', currentProjectId, 'tasks'), 
      (snapshot) => {
        const allTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const organized = {
          todo: allTasks.filter(t => t.status === 'todo'),
          inProgress: allTasks.filter(t => t.status === 'inProgress'),
          done: allTasks.filter(t => t.status === 'done')
        };
        setTasks(organized);
      }
    );

    // 4. Files Listener (Project Specific)
    const unsubscribeFiles = onSnapshot(
      collection(db, 'projects', currentProjectId, 'files'), 
      (snapshot) => {
        const allFiles = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setFiles(allFiles);
      }
    );

    // 5. Activities Listener (Project Specific)
    const activityQuery = query(
      collection(db, 'projects', currentProjectId, 'activities'), 
      orderBy('timestamp', 'desc')
    );
    const unsubscribeActivities = onSnapshot(activityQuery, (snapshot) => {
      const allActivities = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setActivities(allActivities);
    });

    return () => {
      unsubscribeChat();
      unsubscribeTasks();
      unsubscribeFiles();
      unsubscribeActivities();
    };
  }, [currentProjectId]);

  // ── HANDLERS (FIRESTORE WRITES) ──────────────────────────────────────────
  const handleAddTask = async (col) => {
    const title = newTaskInput[col].trim();
    if (!title || !db) return;
    
    try {
      await addDoc(collection(db, 'projects', currentProjectId, 'tasks'), {
        title,
        tag: col === 'todo' ? 'New' : col === 'inProgress' ? 'Active' : 'Done',
        status: col,
        timestamp: serverTimestamp(),
        authorId: auth.currentUser?.uid,
        authorName: user?.name || 'Anonymous'
      });
      setNewTaskInput(prev => ({ ...prev, [col]: '' }));
      setAddingIn(null);
      
      // Update Real Collab Score
      await updateCollabScore('TASK');
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!db) return;
    try {
      await deleteDoc(doc(db, 'projects', currentProjectId, 'tasks', id));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || !db) return;

    try {
      await addDoc(collection(db, 'projects', currentProjectId, 'messages'), {
        user: user?.name || 'You',
        avatar: user?.name || 'User',
        color: '6366f1',
        text: chatInput,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        timestamp: serverTimestamp(),
        userId: auth.currentUser?.uid
      });
      setChatInput('');
      
      // Update Real Collab Score
      await updateCollabScore('CHAT');
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // ── MINI GIT HANDLERS ──────────────────────────────────────────────────────
  const simulateUpload = async () => {
    if (!db) return;
    setIsUploading(true);
    try {
      const fileName = `component_${Math.floor(Math.random()*100)}.jsx`;
      const newFile = { 
        name: fileName, 
        type: 'file', 
        size: '1.5 KB', 
        contributor: 'You',
        timestamp: serverTimestamp()
      };
      
      await addDoc(collection(db, 'projects', currentProjectId, 'files'), newFile);
      
      await addDoc(collection(db, 'projects', currentProjectId, 'activities'), {
        user: user?.name || 'You',
        action: 'Uploaded',
        target: fileName,
        time: 'Just now',
        timestamp: serverTimestamp()
      });
      
      setProgress(prev => Math.min(100, prev + 2));
      
      // Update Real Collab Score
      await updateCollabScore('GIT');
    } catch (error) {
      console.error("Error simulating upload:", error);
    } finally {
      setIsUploading(false);
    }
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
              <button className="icon-btn-small text-muted" onClick={() => handleDeleteTask(task.id)}>
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
            <span className="badge-project-status">{activeProject?.status || 'Active Project'}</span>
            <span className="text-muted text-sm">
              {projects.length > 1 ? (
                <select 
                  className="glass-select-small" 
                  value={currentProjectId}
                  onChange={(e) => {
                    const p = projects.find(proj => proj.id === e.target.value);
                    setCurrentProjectId(e.target.value);
                    setActiveProject(p);
                  }}
                >
                  {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              ) : (
                activeProject?.name || 'My Workspace'
              )}
            </span>
          </div>
          <h1 className="mt-2 text-gradient">{activeProject?.name || 'Shared Workspace'}</h1>
        </div>
        <div className="header-team flex-center">
          <div className="avatar-stack">
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex&backgroundColor=6366f1" alt="Alex" />
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah&backgroundColor=ec4899" alt="Sarah" />
            <div className="avatar-more">+{messages.length > 0 ? messages.length : 0}</div>
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
              {messages.length === 0 && <div className="text-center text-muted p-8">No messages yet. Lead the conversation!</div>}
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
