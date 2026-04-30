import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Menu, LogOut, User, History, Bell, MessageCircle, X, MessageSquare, LayoutDashboard } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import MedicalLogo from './MedicalLogo';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [notifications, setNotifications] = React.useState([]);
  const [showNotifications, setShowNotifications] = React.useState(false);
  const [unreadCount, setUnreadCount] = React.useState(0);

  const fetchNotifications = async () => {
    if (!user) return;
    try {
      const response = await axios.get(`/api/author/notifications?email=${encodeURIComponent(user.email)}`);
      setNotifications(response.data);
      // For demo: count messages from the last 24h as unread or just use length if first fetch
      setUnreadCount(response.data.filter(n => new Date(n.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)).length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  React.useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, [user]);

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="group">
              <MedicalLogo />
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/archive" className="nav-link">Archive</Link>
            <Link to="/submit" className="nav-link font-bold text-primary-600">Submit Journal</Link>
            {user && (
              <>
                <Link to="/dashboard" className="nav-link flex items-center">
                  <LayoutDashboard className="h-4 w-4 mr-1.5 opacity-50" />
                  Dashboard
                </Link>
                <Link to="/history" className="nav-link flex items-center">
                  <History className="h-4 w-4 mr-1.5 opacity-50" />
                  Submission History
                </Link>
              </>
            )}
            <Link to="/about" className="nav-link">About</Link>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-400 hover:text-primary-600 transition-colors">
              <Search className="h-5 w-5" />
            </button>
            
            {user ? (
              <>
                <div className="relative">
                  <button 
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 text-slate-400 hover:text-primary-600 transition-colors relative"
                  >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotifications && (
                      <>
                        <div 
                          className="fixed inset-0 z-40" 
                          onClick={() => setShowNotifications(false)}
                        ></div>
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 mt-4 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-50"
                        >
                          <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">Recent Discussions</h3>
                            <div className="flex items-center gap-2">
                              {notifications.length > 0 && (
                                  <button 
                                      onClick={async (e) => {
                                          e.stopPropagation();
                                          if (window.confirm("Clear all notifications? This will delete the message history.")) {
                                              try {
                                                  await axios.delete(`/api/author/notifications/clear?email=${encodeURIComponent(user.email)}`);
                                                  fetchNotifications();
                                              } catch (err) {
                                                  console.error("Failed to clear notifications", err);
                                              }
                                          }
                                      }}
                                      className="text-[9px] font-black text-red-500 uppercase tracking-tighter hover:underline"
                                  >
                                      Clear All
                                  </button>
                              )}
                              <button onClick={() => setShowNotifications(false)}><X className="h-4 w-4 text-slate-400" /></button>
                            </div>
                          </div>
                          <div className="max-h-96 overflow-y-auto">
                            {notifications.length === 0 ? (
                              <div className="p-8 text-center">
                                <MessageCircle className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No recent messages</p>
                              </div>
                            ) : (
                              notifications.map((msg) => (
                                <div 
                                  key={msg.id} 
                                  className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer"
                                  onClick={() => {
                                      setShowNotifications(false);
                                      window.location.href = '/history';
                                  }}
                                >
                                  <div className="flex justify-between items-start mb-1">
                                    <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 text-[8px] font-black uppercase tracking-tighter">
                                      Editor Reply
                                    </span>
                                    <span className="text-[9px] font-bold text-slate-400">
                                      {new Date(msg.created_at).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <p className="text-[11px] font-bold text-slate-900 truncate mb-0.5">{msg.article_title}</p>
                                  <p className="text-[10px] text-slate-500 line-clamp-1 italic">"{msg.content || 'Sent an attachment'}"</p>
                                </div>
                              ))
                            )}
                          </div>
                          <div className="p-3 bg-slate-50 text-center border-t border-slate-100">
                              <button 
                                  onClick={() => { setShowNotifications(false); window.location.href = '/history'; }}
                                  className="text-[10px] font-black text-primary-600 uppercase tracking-widest hover:underline"
                              >
                                  View All Submissions
                              </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-center space-x-4 pl-4 border-l border-slate-100">
                  <Link to="/profile" className="flex items-center space-x-2 group/profile">
                    {user.picture ? (
                      <img 
                        src={user.picture} 
                        alt="profile" 
                        referrerPolicy="no-referrer"
                        className="w-8 h-8 rounded-full border border-slate-200 group-hover:border-primary-500 transition-colors" 
                      />
                    ) : (
                      <img 
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0D8ABC&color=fff`} 
                        alt="profile" 
                        className="w-8 h-8 rounded-full border border-slate-200 group-hover:border-primary-500 transition-colors" 
                      />
                    )}
                    <span className="text-sm font-medium text-slate-700 hidden lg:block group-hover:text-primary-600 transition-colors">{user.name}</span>
                  </Link>
                  <button 
                    onClick={logout}
                    className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              </>
            ) : (
              <Link to="/login" className="flex items-center space-x-2 px-6 py-2.5 rounded-full bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95">
                <User className="h-4 w-4" />
                <span>Login</span>
              </Link>
            )}

            <button className="md:hidden p-2 text-slate-500">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
