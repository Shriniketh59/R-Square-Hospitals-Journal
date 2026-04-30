import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  MessageSquare, 
  ArrowRight, 
  BookOpen, 
  FileUp,
  LayoutDashboard,
  Bell,
  History
} from 'lucide-react';
import { Link } from 'react-router-dom';

const AuthorDashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({ total: 0, pending: 0, published: 0 });
  const [recentNotifications, setRecentNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        // Fetch submissions for stats
        const subRes = await axios.get(`/api/my-submissions?email=${encodeURIComponent(user.email)}`);
        const submissions = subRes.data;
        
        const newStats = submissions.reduce((acc, sub) => {
          acc.total++;
          if (sub.status?.toLowerCase() === 'published') acc.published++;
          else if (sub.status?.toLowerCase() === 'pending') acc.pending++;
          return acc;
        }, { total: 0, pending: 0, published: 0 });
        
        setStats(newStats);

        // Fetch recent notifications
        const notifRes = await axios.get(`/api/author/notifications?email=${encodeURIComponent(user.email)}`);
        setRecentNotifications(notifRes.data.slice(0, 3)); // Only show top 3
      } catch (err) {
        console.error("Failed to fetch dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Welcome Section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tight">
              Welcome back, <span className="text-primary-600">{user.name.split(' ')[0]}</span>!
            </h1>
            <p className="text-slate-500 mt-1 font-medium">Manage your research and track publication progress.</p>
          </div>
          <Link 
            to="/submit" 
            className="inline-flex items-center px-6 py-3 rounded-2xl bg-slate-900 text-white font-bold text-sm hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 active:scale-95 group"
          >
            <FileUp className="h-4 w-4 mr-2 group-hover:translate-y-[-2px] transition-transform" />
            Submit New Manuscript
          </Link>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Left Column - Stats & Actions */}
          <div className="lg:col-span-2 space-y-8">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[
                { label: 'Total Submissions', value: stats.total, icon: FileText, color: 'blue' },
                { label: 'Under Review', value: stats.pending, icon: Clock, color: 'amber' },
                { label: 'Published Articles', value: stats.published, icon: CheckCircle, color: 'emerald' },
              ].map((stat, idx) => (
                <motion.div 
                  key={idx}
                  variants={itemVariants}
                  className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 group hover:shadow-xl hover:shadow-primary-100/50 transition-all"
                >
                  <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`h-6 w-6 text-${stat.color}-600`} />
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                  <h3 className="text-3xl font-black text-slate-900 mt-1">{stat.value}</h3>
                </motion.div>
              ))}
            </div>

            {/* Recent Notifications Card */}
            <motion.div 
              variants={itemVariants}
              className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden"
            >
              <div className="p-8 border-b border-slate-50 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary-50 p-2 rounded-xl text-primary-600">
                    <Bell className="h-5 w-5" />
                  </div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Recent Activity</h3>
                </div>
                <Link to="/history" className="text-xs font-bold text-primary-600 hover:underline flex items-center">
                  View All <ArrowRight className="h-3 w-3 ml-1" />
                </Link>
              </div>
              <div className="p-4">
                {recentNotifications.length === 0 ? (
                  <div className="py-12 text-center">
                    <MessageSquare className="h-10 w-10 text-slate-200 mx-auto mb-3" />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No recent updates</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {recentNotifications.map((notif) => (
                      <Link 
                        to="/history" 
                        key={notif.id}
                        className="flex items-start p-4 rounded-3xl hover:bg-slate-50 transition-colors group"
                      >
                        <div className="bg-amber-100 p-2 rounded-xl text-amber-600 mr-4 group-hover:scale-110 transition-transform">
                          <MessageSquare className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h4 className="text-sm font-bold text-slate-900 truncate pr-4">{notif.article_title}</h4>
                            <span className="text-[10px] font-bold text-slate-400 whitespace-nowrap">
                                {new Date(notif.created_at).toLocaleDateString('en-US', { day: 'numeric', month: 'short' })}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-1 mt-1 font-medium">
                            Editor replied: "{notif.content || 'Sent an attachment'}"
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Guidelines & Quick Links */}
          <div className="space-y-8">
            {/* Guidelines Card */}
            <motion.div 
              variants={itemVariants}
              className="bg-slate-900 rounded-[2.5rem] shadow-2xl p-8 text-white relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-125 transition-transform">
                <BookOpen className="h-24 w-24" />
              </div>
              
              <h3 className="text-xl font-black mb-6 flex items-center">
                <BookOpen className="h-5 w-5 mr-3 text-primary-400" />
                Author Guidelines
              </h3>
              <ul className="space-y-4 text-slate-300 text-sm">
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-1.5 mr-3 shrink-0"></div>
                  Manuscripts must be in PDF or Word format.
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-1.5 mr-3 shrink-0"></div>
                  Abstract should be limited to 250 words.
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-1.5 mr-3 shrink-0"></div>
                  Include at least 3-5 keywords for indexing.
                </li>
                <li className="flex items-start">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-400 mt-1.5 mr-3 shrink-0"></div>
                  Ensure all authors are properly listed.
                </li>
              </ul>
              <button className="mt-8 w-full py-4 bg-white/10 hover:bg-white/20 rounded-2xl text-xs font-black uppercase tracking-widest transition-all border border-white/10">
                Download Template
              </button>
            </motion.div>

            {/* Quick Actions Card */}
            <motion.div 
              variants={itemVariants}
              className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8"
            >
              <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Quick Links</h3>
              <div className="space-y-3">
                <Link 
                  to="/profile" 
                  className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 hover:border-primary-100 hover:bg-primary-50/30 transition-all group"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center mr-3">
                      <LayoutDashboard className="h-4 w-4 text-blue-600" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">Update Profile</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                </Link>
                <Link 
                  to="/history" 
                  className="flex items-center justify-between p-4 rounded-2xl border border-slate-50 hover:border-primary-100 hover:bg-primary-50/30 transition-all group"
                >
                  <div className="flex items-center">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center mr-3">
                      <History className="h-4 w-4 text-emerald-600" />
                    </div>
                    <span className="text-sm font-bold text-slate-700">Submission History</span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-primary-600 group-hover:translate-x-1 transition-all" />
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthorDashboard;
