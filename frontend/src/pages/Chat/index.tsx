import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import { colors } from '../../theme/colors';
import { useAuth } from '../../hooks/useAuth';
import { getChatMessages, createChatSocket, sendChatMessage, editChatMessage, deleteChatMessage, clearAllMessages } from '../../api/chat';
import Header from '../../components/layout/Header';

interface Message {
  id?: string;
  sender: string;
  sender_id?: string;
  text: string;
  timestamp?: string;
  edited?: boolean;
}

export default function Chat() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [text, setText] = useState('');
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user?.id) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs]);

  // Load previous messages only when user is authenticated
  useEffect(() => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    async function loadMessages() {
      try {
        const messages = await getChatMessages();
        setMsgs(messages || []);
      } catch (err) {
        console.error('Failed to load chat messages:', err);
      } finally {
        setLoading(false);
      }
    }
    loadMessages();
  }, [user]);

  // Socket.IO connection
  useEffect(() => {
    if (!user?.id) return;
    
    console.log('Connecting to Socket.IO with user ID:', user.id);
    const socketInstance = createChatSocket(user.id);
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Socket.IO connected successfully');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket.IO disconnected:', reason);
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      setIsConnected(false);
    });

    socketInstance.on('connected', (data) => {
      console.log('Chat connection confirmed:', data);
    });

    socketInstance.on('message', (msg: Message) => {
      console.log('Received message:', msg);
      setMsgs((prev) => {
        // Prevent duplicates by checking message ID
        if (msg.id && prev.some(m => m.id === msg.id)) {
          return prev;
        }
        return [...prev, msg];
      });
    });

    socketInstance.on('message_updated', (msg: Message) => {
      console.log('Message updated:', msg);
      setMsgs((prev) => prev.map(m => m.id === msg.id ? msg : m));
    });

    socketInstance.on('message_deleted', (data: { id: string }) => {
      console.log('Message deleted:', data.id);
      setMsgs((prev) => prev.filter(m => m.id !== data.id));
    });

    socketInstance.on('messages_cleared', () => {
      console.log('All messages cleared');
      setMsgs([]);
    });

    socketInstance.on('error', (error) => {
      console.error('Socket.IO error:', error);
      alert(`Chat Error: ${error.message || 'Unknown error'}`);
      setIsConnected(false);
    });

    return () => {
      console.log('Cleaning up Socket.IO connection');
      socketInstance.disconnect();
    };
  }, [user]);

  function send() {
    if (!isConnected || !socket) {
      alert('Chat connection not available. Please wait for the connection to be established.');
      return;
    }
    if (!socket.connected) {
      alert('Chat connection is not ready. Please wait a moment and try again.');
      return;
    }
    if (!text.trim()) return;
    
    try {
      sendChatMessage(socket, text.trim());
      setText('');
    } catch (err) {
      console.error('Error sending message:', err);
      alert('Failed to send message. Please try again.');
    }
  }

  async function handleEdit(messageId: string, currentText: string) {
    setEditingId(messageId);
    setEditText(currentText);
  }

  async function saveEdit() {
    if (!editingId || !editText.trim()) return;
    
    try {
      await editChatMessage(editingId, editText.trim());
      setEditingId(null);
      setEditText('');
    } catch (err: any) {
      alert(err.message || 'Failed to edit message');
    }
  }

  function cancelEdit() {
    setEditingId(null);
    setEditText('');
  }

  async function handleDelete(messageId: string) {
    if (!window.confirm('Are you sure you want to delete this message?')) return;
    
    try {
      await deleteChatMessage(messageId);
    } catch (err: any) {
      alert(err.message || 'Failed to delete message');
    }
  }

  async function handleClearAll() {
    if (!window.confirm('Are you sure you want to clear all messages? This action cannot be undone.')) return;
    
    try {
      await clearAllMessages();
    } catch (err: any) {
      alert(err.message || 'Failed to clear messages');
    }
  }

  function canEdit(message: Message): boolean {
    if (!message.id || !message.timestamp || !user?.id) return false;
    if (message.sender_id !== user.id) return false;
    
    const messageTime = new Date(message.timestamp).getTime();
    const now = Date.now();
    const oneMinute = 60 * 1000;
    
    return (now - messageTime) < oneMinute;
  }

  function canDelete(message: Message): boolean {
    if (!user?.id) return false;
    return message.sender_id === user.id || user.role === 'admin';
  }

  function handleKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (editingId) {
        saveEdit();
      } else {
        send();
      }
    }
  }

  const isAdmin = user?.role === 'admin';

  return (
    <>
      <Header />
      <div style={{ padding: '60px', minHeight: '100vh', background: 'linear-gradient(to bottom, #f5f5f5, #e0e0e0)' }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ color: colors.black, margin: 0, fontSize: '28px' }}>Community Chat</h2>
            <div style={{ display: 'flex', gap: '10px' }}>
              {isAdmin && (
                <button
                  onClick={handleClearAll}
                  style={{
                    padding: '10px 20px',
                    background: colors.red,
                    color: colors.beige,
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}
                >
                  🗑️ Clear All
                </button>
              )}
              <button
                onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/dashboard')}
                style={{
                  padding: '10px 20px',
                  background: colors.blue,
                  color: colors.beige,
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '14px'
                }}
              >
                ← Back to Dashboard
              </button>
            </div>
          </div>

          <div
            style={{
              border: `2px solid ${colors.black}`,
              height: '500px',
              padding: '20px',
              overflowY: 'auto',
              background: colors.beige,
              marginBottom: '20px',
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
          >
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>Loading messages...</div>
            ) : msgs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>No messages yet. Start the conversation!</div>
            ) : (
              msgs.map((m, i) => (
                <div key={m.id || i} style={{ marginBottom: '16px', padding: '12px', background: 'white', borderRadius: '8px', border: '1px solid #ddd' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                        <strong style={{ color: colors.black }}>{m.sender}</strong>
                        {m.edited && (
                          <span style={{ fontSize: '11px', color: '#999', fontStyle: 'italic' }}>(edited)</span>
                        )}
                        {m.timestamp && (
                          <span style={{ fontSize: '12px', color: '#666' }}>
                            {new Date(m.timestamp).toLocaleTimeString()}
                          </span>
                        )}
                      </div>
                      {editingId === m.id ? (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                          <input
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                            onKeyPress={handleKeyPress}
                            style={{ flex: 1, padding: '8px', border: `1px solid ${colors.black}`, borderRadius: '4px' }}
                            autoFocus
                          />
                          <button
                            onClick={saveEdit}
                            style={{ padding: '8px 16px', background: colors.blue, color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            style={{ padding: '8px 16px', background: '#ccc', color: 'black', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div style={{ color: '#333', marginTop: '4px' }}>{m.text}</div>
                      )}
                    </div>
                    {!editingId && canDelete(m) && (
                      <div style={{ display: 'flex', gap: '4px', marginLeft: '12px' }}>
                        {canEdit(m) && (
                          <button
                            onClick={() => handleEdit(m.id!, m.text)}
                            style={{
                              padding: '4px 8px',
                              background: colors.blue,
                              color: 'white',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '12px'
                            }}
                            title="Edit message (within 1 minute)"
                          >
                            ✏️
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(m.id!)}
                          style={{
                            padding: '4px 8px',
                            background: colors.red,
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                          title="Delete message"
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <input
              value={text}
              style={{ padding: '12px', flex: 1, border: `2px solid ${colors.black}`, borderRadius: '8px', fontSize: '16px' }}
              onChange={(e) => setText(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              disabled={!isConnected}
            />
            <button
              onClick={send}
              disabled={!isConnected}
              style={{
                background: isConnected ? colors.blue : '#ccc',
                color: colors.beige,
                padding: '12px 24px',
                border: 'none',
                borderRadius: '8px',
                cursor: isConnected ? 'pointer' : 'not-allowed',
                fontWeight: 'bold',
                fontSize: '16px'
              }}
            >
              Send
            </button>
          </div>
          {!isConnected && (
            <p style={{ color: colors.red, fontSize: '14px', marginTop: '10px' }}>
              {socket ? 'Connecting...' : 'Chat connection unavailable. Socket.IO server may not be running.'}
            </p>
          )}
          {isConnected && (
            <p style={{ color: 'green', fontSize: '14px', marginTop: '10px' }}>
              ✓ Connected
            </p>
          )}
        </div>
      </div>
    </>
  );
}
