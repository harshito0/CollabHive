import React, { useState, useEffect, useRef } from 'react';
import { Send, Users, MessageSquare, CheckCircle, Plus, Hash, Settings, MoreVertical } from 'lucide-react';
import { db, auth } from '../firebase';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  addDoc, 
  serverTimestamp,
  where
} from 'firebase/firestore';
import { useToast } from '../components/layout/ToastContainer';
import { logActivity } from '../utils/activityUtils';
import './TeamRoom.css';

const MOCK_ROOMS = [
  { id: 'room-1', name: 'Frontend Squad', description: 'React & Tailwind discussions' },
  { id: 'room-2', name: 'Backend Boys', description: 'Node & Firebase architecture' },
  { id: 'room-3', name: 'Design Review', description: 'UI/UX feedback loop' }
];

export function TeamRoom({ user }) {
  const [activeRoom, setActiveRoom] = useState(MOCK_ROOMS[0]);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [tasks, setTasks] = useState([
    { id: 1, title: 'Fix Header Glitch', status: 'In Progress' },
    { id: 2, title: 'Implement OAuth', status: 'Done' }
  ]);
  const scrollRef = useRef(null);
  const { toast } = useToast();

  // Load messages from Firestore
  useEffect(() => {
    if (!activeRoom) return;

    const q = query(
      collection(db, 'messages'),
      where('roomId', '==', activeRoom.id),
      orderBy('createdAt', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMessages(msgs);
      setTimeout(() => {
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    });

    return () => unsubscribe();
  }, [activeRoom]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await addDoc(collection(db, 'messages'), {
        text: newMessage,
        senderName: user?.name || 'Anonymous',
        senderId: auth.currentUser?.uid || 'anon',
        roomId: activeRoom.id,
        createdAt: serverTimestamp()
      });
      
      // Award points for participation
      if (auth.currentUser) {
        logActivity(auth.currentUser.uid, 'chat', `Engaged in room: ${activeRoom.name}`);
      }

      setNewMessage('');
    } catch (err) {
      console.error('Send message error:', err);
      toast.error('Failed to send message.');
    }
  };

  return (
    <div className="team-room-container animation-fade-in">
      {/* ── LEFT: ROOMS ── */}
      <aside className="team-sidebar">
        <div className="flex-between mb-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted">Rooms</h3>
          <Plus size={16} className="cursor-pointer text-primary" onClick={() => toast.info('New room creation coming soon!')} />
        </div>
        <div className="room-list">
          {MOCK_ROOMS.map(room => (
            <div 
              key={room.id} 
              className={`room-item flex-center gap-3 ${activeRoom.id === room.id ? 'active' : ''}`}
              onClick={() => setActiveRoom(room)}
            >
              <Hash size={18} className={activeRoom.id === room.id ? 'text-primary' : 'text-muted'} />
              <div className="room-info">
                <h4>{room.name}</h4>
                <p className="line-clamp-1">{room.description}</p>
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* ── MIDDLE: CHAT ── */}
      <main className="chat-section">
        <header className="chat-header">
          <div className="flex-center gap-3">
            <div className="stat-icon-wrapper blue" style={{ width: 40, height: 40 }}>
              <Users size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold">{activeRoom.name}</h3>
              <p className="text-xs text-muted">4 members online</p>
            </div>
          </div>
          <div className="ml-auto flex-center gap-4">
            <Settings size={20} className="text-muted cursor-pointer hover:text-white transition" />
            <MoreVertical size={20} className="text-muted cursor-pointer hover:text-white transition" />
          </div>
        </header>

        <div className="chat-messages">
          {messages.length === 0 ? (
            <div className="flex-center flex-col h-full text-muted opacity-50">
              <MessageSquare size={48} className="mb-4" />
              <p>No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={msg.id} className={`message ${msg.senderId === auth.currentUser?.uid ? 'own' : ''}`}>
                <div className="message-meta flex-center gap-2" style={{ justifyContent: msg.senderId === auth.currentUser?.uid ? 'flex-end' : 'flex-start' }}>
                  <span className="font-bold">{msg.senderName}</span>
                  <span>{msg.createdAt?.toDate ? msg.createdAt.toDate().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '...'}</span>
                </div>
                <div className="message-bubble glass-panel">
                  {msg.text}
                </div>
              </div>
            ))
          )}
          <div ref={scrollRef} />
        </div>

        <div className="chat-input-area">
          <form className="chat-input-wrapper" onSubmit={handleSendMessage}>
            <input 
              type="text" 
              placeholder={`Message #${activeRoom.name}...`}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button type="submit" className="btn-primary" style={{ padding: '0 1.25rem' }}>
              <Send size={18} />
            </button>
          </form>
        </div>
      </main>

      {/* ── RIGHT: TASKS ── */}
      <aside className="task-panel">
        <div className="flex-between mb-2">
          <h3 className="text-sm font-bold uppercase tracking-wider text-muted">Active Tasks</h3>
          <Plus size={16} className="cursor-pointer text-primary" onClick={() => toast.info('Task creation coming soon!')} />
        </div>
        <div className="task-list">
          {tasks.map(task => (
            <div key={task.id} className="task-card">
              <h5>{task.title}</h5>
              <div className="task-footer flex-between">
                <span className={`badge-role ${task.status === 'Done' ? 'bg-green' : 'bg-blue'}`} style={{fontSize: '0.7rem'}}>
                  {task.status}
                </span>
                <CheckCircle size={14} className={task.status === 'Done' ? 'text-green' : 'text-muted'} />
              </div>
            </div>
          ))}
        </div>
      </aside>
    </div>
  );
}
