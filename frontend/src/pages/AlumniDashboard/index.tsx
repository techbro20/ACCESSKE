import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import { useAuth } from '../../hooks/useAuth';
import { getEvents } from '../../api/events';
import { getNotices } from '../../api/notices';
import { getChatMessages, createChatSocket, sendChatMessage } from '../../api/chat';
import Header from '../../components/layout/Header';

interface EventItem {
  id: string;
  title: string;
  date: string;
  venue: string;
  description: string;
}

interface Notice {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

interface Message {
  id?: string;
  sender: string;
  sender_id?: string;
  text: string;
  timestamp?: string;
  edited?: boolean;
}

export default function AlumniDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [upcomingEvents, setUpcomingEvents] = useState<EventItem[]>([]);
  const [recentNotices, setRecentNotices] = useState<Notice[]>([]);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [chatText, setChatText] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isChatConnected, setIsChatConnected] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadData();
    loadChatMessages();
  }, [user, navigate]);

  async function loadChatMessages() {
    try {
      const messages = await getChatMessages(10); // Load last 10 messages for widget
      setChatMessages(messages || []);
    } catch (err) {
      console.error('Failed to load chat messages:', err);
    }
  }

  useEffect(() => {
    if (!user?.id) return;
    
    const socketInstance = createChatSocket(user.id);
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      console.log('Socket.IO connected');
      setIsChatConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket.IO disconnected');
      setIsChatConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket.IO connection error:', error);
      setIsChatConnected(false);
    });

    socketInstance.on('message', (msg: Message) => {
      console.log('Received new message in dashboard:', msg);
      setChatMessages((prev) => {
        // Avoid duplicates
        if (msg.id && prev.some(m => m.id === msg.id)) {
          return prev;
        }
        return [...prev, msg];
      });
    });

    socketInstance.on('message_updated', (msg: Message) => {
      setChatMessages((prev) => prev.map(m => m.id === msg.id ? msg : m));
    });

    socketInstance.on('message_deleted', (data: { id: string }) => {
      setChatMessages((prev) => prev.filter(m => m.id !== data.id));
    });

    socketInstance.on('messages_cleared', () => {
      setChatMessages([]);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [user]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  async function loadData() {
    try {
      const events = await getEvents();
      const notices = await getNotices();
      
      // Filter upcoming events (within next 30 days)
      const now = new Date();
      const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const upcoming = events.filter((ev: EventItem) => {
        const eventDate = new Date(ev.date);
        return eventDate >= now && eventDate <= nextMonth;
      });
      setUpcomingEvents(upcoming.slice(0, 5));
      
      // Get recent notices (last 5)
      setRecentNotices(notices.slice(0, 5));
    } catch (err) {
      console.error('Failed to load data:', err);
    }
  }

  function handleSendChatMessage() {
    if (!socket || !socket.connected || !chatText.trim()) return;
    
    sendChatMessage(socket, chatText.trim());
    setChatText('');
  }

  function handleChatKeyPress(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendChatMessage();
    }
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-acces-black mb-2">
              Welcome back, {user?.firstName || user?.name || 'Alumni'}! 👋
            </h1>
            <p className="text-lg text-gray-600">Stay connected with the ACCES Kenya community</p>
          </div>

          {/* Event Alerts - Prominent Display */}
          {upcomingEvents.length > 0 && (
            <div className="mb-8 bg-gradient-to-r from-acces-red to-acces-blue text-white p-6 rounded-xl shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <span>🔔</span> Upcoming Events
                </h2>
                <Link 
                  to="/events" 
                  className="text-white/90 hover:text-white underline text-sm font-medium"
                >
                  View All
                </Link>
              </div>
              <div className="space-y-3">
                {upcomingEvents.slice(0, 3).map((ev) => (
                  <div 
                    key={ev.id}
                    className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/20 hover:bg-white/20 transition-all cursor-pointer"
                    onClick={() => navigate('/events')}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{ev.title}</h3>
                        <p className="text-sm text-white/90 mb-2 line-clamp-2">{ev.description}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1">
                            <span>📅</span>
                            {new Date(ev.date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </span>
                          <span className="flex items-center gap-1">
                            <span>📍</span>
                            {ev.venue}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Notice Board Widget */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 border-2 border-acces-black">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-acces-black flex items-center gap-2">
                  <span>📋</span> Notice Board
                </h2>
                <Link 
                  to="/notices" 
                  className="text-acces-blue hover:text-acces-red font-medium text-sm"
                >
                  View All →
                </Link>
              </div>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {recentNotices.length > 0 ? (
                  recentNotices.map((notice) => (
                    <div 
                      key={notice.id}
                      className="p-4 bg-acces-beige rounded-lg border border-acces-black/20 hover:border-acces-blue transition-all cursor-pointer"
                      onClick={() => navigate('/notices')}
                    >
                      <h3 className="font-semibold text-acces-black mb-2">{notice.title}</h3>
                      <p className="text-sm text-gray-700 line-clamp-2 mb-2">{notice.content}</p>
                      <p className="text-xs text-acces-blue">
                        {new Date(notice.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No notices available</p>
                )}
              </div>
            </div>

            {/* Quick Access Cards */}
            <div className="space-y-4">
              <Link
                to="/events"
                className="block p-6 bg-acces-beige border-2 border-acces-black rounded-xl hover:bg-acces-blue hover:text-acces-beige hover:border-acces-blue transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1"
              >
                <div className="text-3xl mb-3">📅</div>
                <div className="font-semibold text-lg">All Events</div>
                <div className="text-sm mt-1 opacity-75">View calendar</div>
              </Link>

              <Link
                to="/profile"
                className="block p-6 bg-acces-beige border-2 border-acces-black rounded-xl hover:bg-acces-blue hover:text-acces-beige hover:border-acces-blue transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-1"
              >
                <div className="text-3xl mb-3">👤</div>
                <div className="font-semibold text-lg">My Profile</div>
                <div className="text-sm mt-1 opacity-75">Edit details</div>
              </Link>
            </div>
          </div>

          {/* Chat Widget */}
          <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-acces-black">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-acces-black flex items-center gap-2">
                <span>💬</span> Community Chat
              </h2>
              <Link 
                to="/chat" 
                className="text-acces-blue hover:text-acces-red font-medium text-sm"
              >
                Open Full Chat →
              </Link>
            </div>
            
            <div className="bg-gray-50 rounded-lg border border-gray-200 h-64 flex flex-col">
              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    <p>No messages yet. Start the conversation!</p>
                  </div>
                ) : (
                  chatMessages.slice(-10).map((msg, idx) => (
                    <div 
                      key={msg.id || idx}
                      className={`flex ${msg.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                        msg.sender_id === user?.id
                          ? 'bg-acces-blue text-white'
                          : 'bg-acces-beige text-acces-black'
                      }`}>
                        <div className="text-xs font-semibold mb-1 opacity-75">{msg.sender}</div>
                        <div className="text-sm">{msg.text}</div>
                        {msg.timestamp && (
                          <div className="text-xs opacity-60 mt-1">
                            {new Date(msg.timestamp).toLocaleTimeString()}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
                <div ref={chatEndRef} />
              </div>
              
              {/* Input Area */}
              <div className="border-t border-gray-200 p-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatText}
                    onChange={(e) => setChatText(e.target.value)}
                    onKeyPress={handleChatKeyPress}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border-2 border-acces-black rounded-lg focus:outline-none focus:border-acces-blue"
                    disabled={!socket || !socket.connected}
                  />
                  <button
                    onClick={handleSendChatMessage}
                    disabled={!socket || !socket.connected || !chatText.trim()}
                    className="px-6 py-2 bg-acces-blue text-white rounded-lg font-semibold hover:bg-acces-red transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </div>
                {(!socket || !socket.connected) && (
                  <p className="text-xs text-red-500 mt-2">
                    Chat connection unavailable. Click "Open Full Chat" to reconnect.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
