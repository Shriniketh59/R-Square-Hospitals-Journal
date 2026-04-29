import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { FileText, Clock, CheckCircle, AlertCircle, ExternalLink, ChevronRight, Search } from 'lucide-react';

const SubmissionHistory = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!user) return;
      try {
        const response = await axios.get(`/api/my-submissions?email=${user.email}`);
        setSubmissions(response.data);
      } catch (err) {
        console.error("Failed to fetch submissions", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [user]);

  const openManuscript = (content) => {
    if (!content) return;

    if (content.startsWith('data:application/pdf')) {
      try {
        const base64WithoutPrefix = content.split(',')[1];
        const byteCharacters = atob(base64WithoutPrefix);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank');
      } catch (err) {
        window.open(content, '_blank');
      }
    } else {
      window.open(content, '_blank');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'published': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="min-h-screen bg-transparent py-16 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Submission <span className="text-primary-600">History</span></h1>
            <p className="text-slate-500 mt-2 font-medium">Track the status and progress of your research manuscripts.</p>
          </div>
          <div className="flex bg-white p-2 rounded-2xl shadow-sm border border-slate-100 items-center px-4 w-full md:w-auto">
            <Search className="h-5 w-5 text-slate-400 mr-2" />
            <input type="text" placeholder="Filter manuscripts..." className="bg-transparent outline-none text-sm font-medium w-full" />
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map(n => (
              <div key={n} className="h-32 rounded-3xl bg-white animate-pulse border border-slate-100"></div>
            ))}
          </div>
        ) : submissions.length > 0 ? (
          <div className="grid grid-cols-1 gap-6">
            {submissions.map((sub, idx) => (
              <motion.div 
                key={sub.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-200/30 border border-slate-100 group hover:border-primary-200 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-4">
                      <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border ${getStatusColor(sub.status)}`}>
                        {sub.status || 'Under Review'}
                      </span>
                      <span className="text-xs font-bold text-slate-400 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        Submitted: {new Date(sub.created_at || sub.published_date).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-3 group-hover:text-primary-600 transition-colors">{sub.title}</h3>
                    <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">{sub.abstract}</p>
                  </div>
                  
                  <div className="flex flex-wrap lg:flex-col gap-4 lg:min-w-[200px]">
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex-1 lg:flex-none">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Category</p>
                        <p className="text-sm font-bold text-slate-900">{sub.category_name || 'Medical Research'}</p>
                    </div>
                    <div className="flex gap-2 w-full">
                        <button 
                            onClick={() => openManuscript(sub.content)}
                            className="flex-1 py-4 px-6 bg-slate-100 text-slate-900 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all flex items-center justify-center group/btn"
                        >
                            View PDF
                        </button>
                        <button className="flex-1 py-4 px-6 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-primary-600 transition-all flex items-center justify-center group/btn">
                            Details <ChevronRight className="ml-2 h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
                        </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-20 rounded-[3rem] shadow-xl border border-slate-100 text-center"
          >
            <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="h-10 w-10" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">No Submissions Found</h2>
            <p className="text-slate-500 mb-10 max-w-sm mx-auto">You haven't submitted any manuscripts yet. Start your journey by submitting your first paper.</p>
            <button 
                onClick={() => window.location.href='/submit'}
                className="px-10 py-4 bg-primary-600 text-white rounded-full font-black hover:bg-primary-700 transition-all shadow-lg shadow-primary-500/20"
            >
                Submit Manuscript Now
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default SubmissionHistory;
