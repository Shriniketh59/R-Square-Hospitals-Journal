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
  Loader2
} from 'lucide-react';
import RealTimePanel from '../components/RealTimePanel';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const navigate = useNavigate();

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
        alert('Failed to delete manuscript');
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
    { label: 'Total Submissions', value: articles.length, icon: FileText, color: 'bg-blue-500' },
    { label: 'Pending Review', value: articles.filter(a => a.status === 'pending').length, icon: Clock, color: 'bg-amber-500' },
    { label: 'Published', value: articles.filter(a => a.status === 'published').length, icon: CheckCircle, color: 'bg-emerald-500' },
    { label: 'Authors', value: new Set(articles.map(a => a.author_id)).size, icon: Users, color: 'bg-purple-500' },
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
            <button className="relative p-2 text-slate-400 hover:text-primary-600 transition-colors">
              <Bell className="h-6 w-6" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
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
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Date</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                      <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {articles.map((article) => (
                      <tr key={article.id} className="hover:bg-slate-50/50 transition-colors group">
                        <td className="px-8 py-6">
                          <p className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-primary-600 transition-colors">{article.title}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">{article.category_name}</p>
                        </td>
                        <td className="px-8 py-6 text-sm font-bold text-slate-600">{article.author_name}</td>
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

                        <div className="mb-8">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                <Eye className="h-4 w-4" /> Abstract Preview
                            </h3>
                            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                                <p className="text-slate-600 text-sm leading-relaxed font-medium italic">
                                    {selectedArticle.abstract || 'No abstract provided.'}
                                </p>
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
                            disabled={reviewLoading}
                            onClick={() => handleUpdateStatus(selectedArticle.id, 'rejected')}
                            className="flex-1 py-4 bg-white text-red-600 border border-red-100 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-red-50 transition-all flex items-center justify-center gap-2"
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
