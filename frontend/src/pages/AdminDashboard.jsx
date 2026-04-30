import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  LogOut, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Search,
  Bell,
  Menu,
  ChevronRight,
  X,
  User,
  Calendar,
  Tag,
  Eye,
  Check,
  Loader2,
  MessageSquare
} from 'lucide-react';
import RealTimePanel from '../components/RealTimePanel';
import JournalChat from '../components/JournalChat';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [articles, setArticles] = useState([]);
  const [reviewers, setReviewers] = useState([]);
  const [assigning, setAssigning] = useState(false);
  const [selectedReviewer, setSelectedReviewer] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [allMessages, setAllMessages] = useState([]);
  const [newToast, setNewToast] = useState(null);
  const navigate = useNavigate();

  const fetchAllMessages = async () => {
    try {
      const response = await axios.get('/api/admin/all-messages');
      const latestMessages = response.data;
      
      // If we have new messages that we didn't have before, and the latest one is from an author
      if (allMessages.length > 0 && latestMessages.length > allMessages.length) {
        const newest = latestMessages[0]; // DESC order
        if (newest.sender_role === 'author') {
            setNewToast(newest);
            setTimeout(() => setNewToast(null), 5000);
        }
      }
      
      setAllMessages(latestMessages);
    } catch (err) {
      console.error('Error fetching messages:', err);
    }
  };

  const fetchReviewers = async () => {
    try {
      const response = await axios.get('/api/reviewers');
      setReviewers(response.data);
    } catch (err) {
      console.error('Error fetching reviewers:', err);
    }
  };

  const handleAssignReviewer = async () => {
    if (!selectedReviewer || !selectedArticle) return;
    setAssigning(true);
    try {
      await axios.post('/api/review-assignments', {
        articleId: selectedArticle.id,
        reviewerId: selectedReviewer
      });
      alert('Reviewer assigned successfully!');
      setSelectedReviewer('');
    } catch (err) {
      console.error('Error assigning reviewer:', err);
      alert('Failed to assign reviewer.');
    } finally {
      setAssigning(false);
    }
  };

  useEffect(() => {
    fetchAllMessages();
    fetchReviewers();
    const interval = setInterval(() => {
      fetchArticles();
      fetchAllMessages();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Real‑time data is now handled by the RealTimePanel component.
  // The component fetches server health, updates client clock and uptime internally.
  // No additional state or effects are needed here.


  useEffect(() => {
    const adminUser = localStorage.getItem('adminUser');
    if (!adminUser) {
      navigate('/admin/login');
    }
    fetchArticles();
  }, [navigate]);

  const fetchArticles = async () => {
    try {
      const response = await axios.get('/api/articles');
      setArticles(response.data);
    } catch (err) {
      console.error('Error fetching articles:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    setReviewLoading(true);
    try {
      await axios.put(`/api/articles/${id}/status`, { status });
      await fetchArticles();
      setSelectedArticle(null);
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status');
    } finally {
      setReviewLoading(false);
    }
  };

  const handleDeleteManuscript = async (id) => {
    if (!window.confirm("Are you sure you want to permanently delete this manuscript? This action cannot be undone.")) {
        return;
    }

    setReviewLoading(true);
    try {
        await axios.delete(`/api/articles/${id}`);
        await fetchArticles();
        setSelectedArticle(null);
        alert("Manuscript deleted successfully.");
    } catch (err) {
        console.error('Error deleting manuscript:', err);
        alert('Failed to deleting manuscript');
    } finally {
        setReviewLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminUser');
    navigate('/admin/login');
  };

  const openManuscript = (content) => {
    if (!content) {
      alert("No manuscript file available.");
      return;
    }

    if (content.startsWith('data:')) {
      try {
        const mimeType = content.split(';')[0].split(':')[1];
        const base64WithoutPrefix = content.split(',')[1];
        const byteCharacters = atob(base64WithoutPrefix);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: mimeType });
        const url = URL.createObjectURL(blob);
        
        // For PDFs we open in new tab, for others it might trigger a download
        const win = window.open(url, '_blank');
        if (!win) alert("Please allow popups to view the document.");
      } catch (err) {
        console.error("Error opening document:", err);
        alert("Failed to decode the document content.");
      }
    } else if (content.startsWith('http')) {
      // Try to open as URL if it's an external link
      window.open(content, '_blank');
    } else {
      // It's just a filename string with no content data
      alert("No digital manuscript file is attached to this submission record.");
    }
  };

  const stats = [
    { label: 'Total Submissions', value: (articles || []).length, icon: FileText, color: 'bg-blue-500' },
    { label: 'Pending Review', value: (articles || []).filter(a => a?.status === 'pending').length, icon: Clock, color: 'bg-amber-500' },
    { label: 'Published', value: (articles || []).filter(a => a?.status === 'published').length, icon: CheckCircle, color: 'bg-emerald-500' },
    { label: 'Authors', value: new Set((articles || []).map(a => a?.author_id)).size, icon: Users, color: 'bg-purple-500' },
  ];

  return (
    <div className="min-h-screen bg-transparent flex">
      {/* Sidebar */}
      <aside className="w-72 bg-white/80 backdrop-blur-xl border-r border-slate-200 hidden lg:flex flex-col">
        <div className="p-8">
          <div className="flex items-center space-x-2 mb-10">
            <div className="bg-slate-900 p-1.5 rounded-lg">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black text-slate-900 tracking-tight">ADMIN PANEL</span>
          </div>
          
          <nav className="space-y-2">
            <SidebarItem 
              icon={LayoutDashboard} 
              label="Overview" 
              active={activeTab === 'overview'} 
              onClick={() => setActiveTab('overview')} 
            />
            <SidebarItem 
              icon={FileText} 
              label="Manuscripts" 
              active={activeTab === 'manuscripts'} 
              onClick={() => setActiveTab('manuscripts')} 
            />
            <SidebarItem 
              icon={Users} 
              label="Authors" 
              active={activeTab === 'authors'} 
              onClick={() => setActiveTab('authors')} 
            />
            <SidebarItem 
              icon={Settings} 
              label="Settings" 
              active={activeTab === 'settings'} 
              onClick={() => setActiveTab('settings')} 
            />
          </nav>
        </div>
        
        <div className="mt-auto p-8">
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 text-slate-500 hover:text-red-600 font-bold text-sm transition-colors w-full"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-20 bg-white/60 backdrop-blur-md border-b border-slate-200 flex items-center justify-between px-8 z-10">
          <div className="flex items-center space-x-4 lg:hidden">
            <Menu className="h-6 w-6 text-slate-600" />
            <span className="font-bold text-slate-900">Admin</span>
          </div>
          
          <div className="hidden md:flex items-center bg-slate-100 rounded-2xl px-4 py-2 w-96">
            <Search className="h-4 w-4 text-slate-400 mr-2" />
            <input 
              type="text" 
              placeholder="Search manuscripts, authors..." 
              className="bg-transparent border-none focus:outline-none text-sm w-full font-medium"
            />
          </div>
          
          <div className="flex items-center space-x-6">
            <div className="relative">
              <button 
                onClick={() => {
                    setShowMessages(!showMessages);
                    if (!showMessages) fetchAllMessages();
                }}
                className="relative p-2 text-slate-400 hover:text-primary-600 transition-colors"
              >
                <Bell className="h-6 w-6" />
                {allMessages.length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                )}
              </button>

              <AnimatePresence>
                {showMessages && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-4 w-[400px] bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-[110]"
                  >
                    <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="h-4 w-4" />
                        <span className="text-xs font-black uppercase tracking-widest">Recent Discussions</span>
                      </div>
                      <div className="flex items-center gap-3">
                        {allMessages.length > 0 && (
                            <button 
                                onClick={async () => {
                                    if (window.confirm("Clear all recent discussions? This will delete author messages from the history.")) {
                                        try {
                                            await axios.delete('/api/messages/all');
                                            fetchAllMessages();
                                        } catch (err) {
                                            console.error("Failed to clear messages", err);
                                        }
                                    }
                                }}
                                className="text-[10px] font-black text-red-400 hover:text-red-300 uppercase tracking-tighter transition-colors"
                            >
                                Clear All
                            </button>
                        )}
                        <button onClick={() => setShowMessages(false)}><X className="h-4 w-4" /></button>
                      </div>
                    </div>
                    <div className="max-h-[500px] overflow-y-auto">
                      {allMessages.length === 0 ? (
                        <div className="p-10 text-center text-slate-400">
                          <MessageSquare className="h-10 w-10 mx-auto mb-3 opacity-20" />
                          <p className="text-xs font-bold uppercase tracking-widest">No recent messages</p>
                        </div>
                      ) : (
                        allMessages.map((msg, i) => (
                          <div 
                            key={i} 
                            onClick={() => {
                                const article = articles.find(a => a.id === msg.article_id);
                                if (article) setSelectedArticle(article);
                                setShowMessages(false);
                            }}
                            className="p-4 border-b border-slate-50 hover:bg-slate-50 cursor-pointer transition-colors"
                          >
                            <div className="flex justify-between items-start mb-1">
                              <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-tighter ${
                                msg.sender_role === 'admin' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {msg.sender_role === 'admin' ? 'Response Sent' : 'New Message'}
                              </span>
                              <span className="text-[9px] font-bold text-slate-400">
                                {new Date(msg.created_at).toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })} • {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-xs font-bold text-slate-900 truncate mb-1">{msg.article_title}</p>
                            <p className="text-[11px] text-slate-500 line-clamp-1">{msg.content || (msg.file_name ? '📎 Attachment' : '')}</p>
                            <div className="flex items-center mt-2 text-[8px] font-black text-slate-300 uppercase tracking-widest">
                                <span className="mr-2">{msg.sender_name}</span>
                                {msg.sender_email && (
                                    <span className="opacity-50">{msg.sender_email.includes('@phone.auth') ? msg.sender_email.split('@')[0] : msg.sender_email}</span>
                                )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-black text-slate-900">Dr. Editorial</p>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Chief Editor</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-black">
                DE
              </div>
            </div>
          </div>
        </header>

      <RealTimePanel />

        {/* Dashboard Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 flex justify-between items-end">
              <div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Welcome back, Admin</h1>
                <p className="text-slate-500 font-medium">Here is what is happening with the journal today.</p>
              </div>
              <button 
                onClick={fetchArticles}
                className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-sm"
              >
                <Clock className={`h-5 w-5 text-slate-400 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              {stats.map((stat, i) => (
                <motion.div 
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className="bg-white/70 backdrop-blur-sm p-6 rounded-[2rem] shadow-sm border border-white/50"
                >
                  <div className={`${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center mb-4 text-white shadow-lg`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <p className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">{stat.label}</p>
                  <h3 className="text-3xl font-black text-slate-900">{stat.value}</h3>
                </motion.div>
              ))}
            </div>

            {/* Recent Submissions Table */}
            <div className="bg-white/70 backdrop-blur-md rounded-[2.5rem] shadow-xl border border-white/50 overflow-hidden mb-12">
              <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                <h2 className="text-xl font-black text-slate-900">Recent Submissions</h2>
                <div className="flex gap-2">
                    <span className="px-4 py-1.5 bg-slate-100 text-slate-600 rounded-full text-[10px] font-black uppercase tracking-widest">Live Updates</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-slate-50">
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Title</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Author</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Contact Info</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(articles || []).map((article) => (
                      <tr key={article.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-6">
                          <p className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-primary-600 transition-colors">{article.title}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">{article.category_name}</p>
                        </td>
                        <td className="px-8 py-6 text-sm font-bold text-slate-600">{article.author_name}</td>
                        <td className="px-8 py-6">
                          <p className="text-[11px] font-bold text-slate-900">{article.author_email?.includes('@phone.auth') ? article.author_phone || article.author_email.split('@')[0] : article.author_email}</p>
                          <p className="text-[9px] font-black text-primary-500 uppercase tracking-tighter">{article.author_email?.includes('@phone.auth') ? 'Phone User' : 'Email User'}</p>
                        </td>
                        <td className="px-8 py-6 text-sm text-slate-500 font-medium">
                          {new Date(article.created_at || article.published_date).toLocaleDateString()}
                        </td>
                        <td className="px-8 py-6">
                          <StatusBadge status={article.status} />
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button 
                            onClick={() => setSelectedArticle(article)}
                            className="px-4 py-2 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-primary-600 transition-all shadow-md shadow-slate-200"
                          >
                            Review
                          </button>
                        </td>
                      </tr>
                    ))}
                    {loading && (
                      <tr>
                        <td colSpan="5" className="px-8 py-12 text-center">
                            <div className="flex flex-col items-center justify-center space-y-3">
                                <Loader2 className="h-8 w-8 text-primary-500 animate-spin" />
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Loading database...</p>
                            </div>
                        </td>
                      </tr>
                    )}
                    {!loading && articles.length === 0 && (
                        <tr>
                            <td colSpan="5" className="px-8 py-12 text-center text-slate-400 font-bold">No submissions found.</td>
                        </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Review Modal */}
      <AnimatePresence>
        {selectedArticle && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setSelectedArticle(null)}
                    className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                ></motion.div>
                
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 20 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 20 }}
                    className="relative w-full max-w-3xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
                >
                    <div className="p-8 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                        <div>
                            <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-[10px] font-black uppercase tracking-widest mb-2 inline-block">Manuscript Review</span>
                            <h2 className="text-2xl font-black text-slate-900 leading-tight line-clamp-2">{selectedArticle.title}</h2>
                        </div>
                        <button 
                            onClick={() => setSelectedArticle(null)}
                            className="p-2 hover:bg-white rounded-full transition-colors border border-transparent hover:border-slate-200 shadow-sm"
                        >
                            <X className="h-6 w-6 text-slate-400" />
                        </button>
                    </div>

                    <div className="p-8 max-h-[60vh] overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                            <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                                    <User className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Submitted By</p>
                                    <p className="font-bold text-slate-900">{selectedArticle.author_name}</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                                    <Tag className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Category</p>
                                    <p className="font-bold text-slate-900">{selectedArticle.category_name}</p>
                                </div>
                            </div>
                            <div className="flex items-start space-x-4">
                                <div className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                                    <Calendar className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Submission Date</p>
                                    <p className="font-bold text-slate-900">
                                        {selectedArticle.created_at ? new Date(selectedArticle.created_at).toLocaleString() : 'N/A'}
                                    </p>
                                </div>
                            </div>
                            <div 
                                onClick={() => openManuscript(selectedArticle.content)}
                                className="flex items-start space-x-4 cursor-pointer group"
                            >
                                <div className="w-10 h-10 bg-white shadow-sm border border-slate-100 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-primary-600 group-hover:border-primary-200 transition-all">
                                    <FileText className="h-5 w-5" />
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5 group-hover:text-primary-500 transition-colors">Manuscript File</p>
                                    <div className="flex items-center gap-2">
                                        <p className="font-bold text-primary-600 underline">{selectedArticle.file_name || (selectedArticle.content?.startsWith('data:') ? 'manuscript.pdf' : selectedArticle.content) || 'manuscript.pdf'}</p>
                                        <Eye className="h-4 w-4 text-primary-500 opacity-0 group-hover:opacity-100 transition-all transform group-hover:translate-x-1" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {showChat ? (
                            <div className="h-[400px] mb-8">
                                <JournalChat 
                                    articleId={selectedArticle.id}
                                    senderRole="admin"
                                    senderName="Editorial Board"
                                    senderEmail="admin@rsquare.com"
                                    onClose={() => setShowChat(false)}
                                />
                            </div>
                        ) : (
                            <div className="mb-8">
                                <div className="flex items-center justify-between mb-3">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Eye className="h-4 w-4" /> Abstract Preview
                                    </h3>
                                    <button 
                                        onClick={() => setShowChat(true)}
                                        className="flex items-center gap-1.5 text-[10px] font-black text-primary-600 uppercase tracking-widest hover:text-primary-700"
                                    >
                                        <MessageSquare className="h-3.5 w-3.5" /> Suggest Improvements
                                    </button>
                                </div>
                                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                    <p className="text-slate-600 text-sm leading-relaxed font-medium italic">
                                        {selectedArticle.abstract || 'No abstract provided.'}
                                    </p>
                                </div>
                            </div>
                        )}
                        {/* Reviewer Assignment Section */}
                        <div className="mt-8 pt-8 border-t border-slate-100">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Peer Review Assignment</h3>
                            <div className="flex gap-4">
                                <select 
                                    value={selectedReviewer}
                                    onChange={(e) => setSelectedReviewer(e.target.value)}
                                    className="flex-1 bg-white border border-slate-200 rounded-2xl px-4 py-3 text-sm font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all"
                                >
                                    <option value="">Select a Reviewer</option>
                                    {reviewers.map(r => (
                                        <option key={r.id} value={r.id}>{r.name} ({r.expertise || 'General'})</option>
                                    ))}
                                </select>
                                <button 
                                    onClick={handleAssignReviewer}
                                    disabled={!selectedReviewer || assigning}
                                    className="px-6 py-3 bg-slate-900 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-lg disabled:opacity-50"
                                >
                                    {assigning ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Assign'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
                        <button 
                            disabled={reviewLoading}
                            onClick={() => handleUpdateStatus(selectedArticle.id, 'published')}
                            className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
                        >
                            {reviewLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CheckCircle className="h-4 w-4" /> Approve & Publish</>}
                        </button>
                        <button 
                            onClick={() => handleUpdateStatus(selectedArticle.id, 'Needs Revision')}
                            className="flex-1 py-4 bg-amber-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg shadow-amber-200 flex items-center justify-center space-x-2"
                        >
                           <Clock className="h-4 w-4" />
                           <span>Needs Revision</span>
                        </button>
                        <button 
                            disabled={reviewLoading}
                            onClick={() => handleUpdateStatus(selectedArticle.id, 'rejected')}
                            className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                        >
                            {reviewLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><XCircle className="h-4 w-4" /> Reject</>}
                        </button>
                        <button 
                            disabled={reviewLoading}
                            onClick={() => handleDeleteManuscript(selectedArticle.id)}
                            className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-700 transition-all flex items-center justify-center gap-2"
                        >
                            {reviewLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <><X className="h-4 w-4" /> Delete</>}
                        </button>
                    </div>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
      {/* Notification Toast */}
      <AnimatePresence>
        {newToast && (
          <motion.div
            initial={{ opacity: 0, x: 100, y: 0 }}
            animate={{ opacity: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            onClick={() => {
                const article = articles.find(a => a.id === newToast.article_id);
                if (article) setSelectedArticle(article);
                setNewToast(null);
            }}
            className="fixed bottom-8 right-8 z-[200] w-96 bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-6 cursor-pointer hover:shadow-primary-100/50 transition-all group"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-primary-600 p-3 rounded-2xl text-white shadow-lg shadow-primary-200">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-1">New Message Received</p>
                <h4 className="text-sm font-black text-slate-900 line-clamp-1">{newToast.article_title}</h4>
                <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-medium">{newToast.content || 'Sent an attachment'}</p>
              </div>
            </div>
            <div className="absolute top-4 right-4 text-[9px] font-black text-slate-300 uppercase tracking-tighter">
                {new Date(newToast.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SidebarItem = ({ icon: Icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3.5 rounded-2xl transition-all ${
      active 
        ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20' 
        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
    }`}
  >
    <Icon className="h-5 w-5" />
    <span className="font-bold text-sm">{label}</span>
  </button>
);

const StatusBadge = ({ status }) => {
  const styles = {
    pending: 'bg-amber-50 text-amber-600 border-amber-100',
    published: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    rejected: 'bg-red-50 text-red-600 border-red-100',
  };
  
  return (
    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${styles[status] || styles.pending}`}>
      {status}
    </span>
  );
};

export default AdminDashboard;
