import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { FileText, Clock, CheckCircle, AlertCircle, ExternalLink, ChevronRight, Search, MessageSquare, X, FileUp, Loader2 } from 'lucide-react';
import JournalChat from '../components/JournalChat';
import { AnimatePresence } from 'framer-motion';

const SubmissionHistory = () => {
  const { user } = useAuth();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  const [newToast, setNewToast] = useState(null);
  const [lastMessageCount, setLastMessageCount] = useState({});
  const [revisionArticle, setRevisionArticle] = useState(null);
  const [revisionFile, setRevisionFile] = useState(null);
  const [revisionLoading, setRevisionLoading] = useState(false);

  const checkNewMessages = async () => {
    if (!user || submissions.length === 0) return;
    
    try {
        // Fetch all messages for all user's articles
        const counts = { ...lastMessageCount };
        let foundNew = false;
        
        for (const sub of submissions) {
            const response = await axios.get(`/api/messages/${sub.id}`);
            const messages = response.data;
            
            if (counts[sub.id] !== undefined && messages.length > counts[sub.id]) {
                const newest = messages[messages.length - 1];
                if (newest.sender_role === 'admin' && !foundNew) {
                    setNewToast({ ...newest, article_title: sub.title });
                    setTimeout(() => setNewToast(null), 5000);
                    foundNew = true;
                }
            }
            counts[sub.id] = messages.length;
        }
        setLastMessageCount(counts);
    } catch (err) {
        console.error("Error checking new messages", err);
    }
  };

  useEffect(() => {
    const fetchSubmissions = async () => {
      if (!user) return;
      try {
        const response = await axios.get(`/api/my-submissions?email=${encodeURIComponent(user.email)}`);
        setSubmissions(response.data);
      } catch (err) {
        console.error("Failed to fetch submissions", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [user]);

  useEffect(() => {
    const interval = setInterval(checkNewMessages, 7000); // Check every 7s
    return () => clearInterval(interval);
  }, [submissions, lastMessageCount]);

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

  const handleRevisionSubmit = async (e) => {
    e.preventDefault();
    if (!revisionFile || !revisionArticle) return;

    setRevisionLoading(true);
    try {
        const reader = new FileReader();
        reader.readAsDataURL(revisionFile);
        reader.onload = async () => {
            const base64Content = reader.result;
            await axios.put(`/api/articles/${revisionArticle.id}/revision`, {
                manuscriptContent: base64Content,
                manuscriptName: revisionFile.name,
                manuscriptType: revisionFile.type
            });
            
            // Refresh submissions
            const response = await axios.get(`/api/my-submissions?email=${encodeURIComponent(user.email)}`);
            setSubmissions(response.data);
            setRevisionArticle(null);
            setRevisionFile(null);
            alert("Revision uploaded successfully! The status has been reset to Pending.");
        };
    } catch (err) {
        console.error("Failed to upload revision", err);
        alert("Failed to upload revision. Please try again.");
    } finally {
        setRevisionLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'published': return 'bg-green-100 text-green-700 border-green-200';
      case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
      case 'needs revision': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <>
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
                            {sub.status?.toLowerCase() === 'needs revision' && (
                              <button 
                                onClick={() => setRevisionArticle(sub)}
                                className="inline-flex items-center px-4 py-2 rounded-xl bg-amber-500 text-white text-[10px] font-black uppercase tracking-widest hover:bg-amber-600 transition-all shadow-lg shadow-amber-200 group"
                              >
                                <FileUp className="h-3 w-3 mr-2 group-hover:translate-y-[-2px] transition-transform" />
                                Revise
                              </button>
                            )}
                            <button 
                                onClick={() => setActiveChat(sub)}
                                className="flex-1 py-4 px-6 bg-slate-900 text-white rounded-2xl font-black text-sm hover:bg-primary-600 transition-all flex items-center justify-center group/btn"
                            >
                                <MessageSquare className="mr-2 h-4 w-4" /> Discussion
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

      {/* Chat Modal */}
      <AnimatePresence>
        {activeChat && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveChat(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
            ></motion.div>
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-2xl h-[80vh]"
            >
              <JournalChat 
                articleId={activeChat.id}
                senderRole="author"
                senderName={user.name}
                senderEmail={user.email}
                onClose={() => setActiveChat(null)}
              />
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
                const sub = submissions.find(s => s.id === newToast.article_id);
                if (sub) setActiveChat(sub);
                setNewToast(null);
            }}
            className="fixed bottom-8 right-8 z-[200] w-96 bg-white rounded-[2rem] shadow-2xl border border-slate-100 p-6 cursor-pointer hover:shadow-primary-100/50 transition-all group"
          >
            <div className="flex items-center space-x-4">
              <div className="bg-primary-600 p-3 rounded-2xl text-white shadow-lg shadow-primary-200">
                <MessageSquare className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mb-1">Editor Sent a Message</p>
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
      {/* Revision Modal */}
      <AnimatePresence>
        {revisionArticle && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setRevisionArticle(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            ></motion.div>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-[2.5rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-50 bg-slate-50/50 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-black text-slate-900">Revise Manuscript</h3>
                  <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mt-0.5">Upload corrected version</p>
                </div>
                <button onClick={() => setRevisionArticle(null)} className="p-2 hover:bg-white rounded-full transition-colors">
                  <X className="h-5 w-5 text-slate-400" />
                </button>
              </div>

              <form onSubmit={handleRevisionSubmit} className="p-8 space-y-6">
                <div className="bg-slate-50 p-4 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs font-bold text-slate-500 mb-2">Original Title:</p>
                  <p className="text-sm font-black text-slate-900 line-clamp-2">{revisionArticle.title}</p>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-1">Revised Manuscript File</label>
                  <div className="relative">
                    <input 
                      type="file" 
                      onChange={(e) => setRevisionFile(e.target.files[0])}
                      className="hidden" 
                      id="rev-file"
                      required
                    />
                    <label 
                      htmlFor="rev-file"
                      className="flex flex-col items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-slate-200 border-dashed rounded-3xl appearance-none cursor-pointer hover:border-primary-400 focus:outline-none group"
                    >
                      <span className="flex items-center space-x-2">
                        <FileUp className="w-6 h-6 text-slate-400 group-hover:text-primary-600 transition-colors" />
                        <span className="text-sm font-bold text-slate-500">
                          {revisionFile ? revisionFile.name : "Select new file"}
                        </span>
                      </span>
                    </label>
                  </div>
                </div>

                <div className="pt-4">
                  <button 
                    type="submit"
                    disabled={revisionLoading || !revisionFile}
                    className="w-full py-4 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-primary-700 transition-all shadow-xl shadow-primary-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {revisionLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                      <>
                        <CheckCircle className="h-5 w-5" />
                        <span>Submit Revision</span>
                      </>
                    )}
                  </button>
                  <p className="text-center text-[10px] text-slate-400 mt-4 font-medium uppercase tracking-tighter">
                    Status will be reset to Pending for editor review
                  </p>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default SubmissionHistory;
