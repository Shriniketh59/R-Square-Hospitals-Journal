import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ClipboardList, 
  FileText, 
  CheckCircle, 
  Clock, 
  Star, 
  MessageSquare, 
  X, 
  Download,
  Send,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ReviewerDashboard = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState([]);
  const [selectedAssignment, setSelectedAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [score, setScore] = useState(5);

  const fetchAssignments = async () => {
    if (!user) return;
    try {
      const response = await axios.get(`/api/reviewer/assignments?email=${encodeURIComponent(user.email)}`);
      setAssignments(response.data);
    } catch (err) {
      console.error('Error fetching assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, [user]);

  const handleSubmitFeedback = async (e) => {
    e.preventDefault();
    if (!selectedAssignment) return;
    setSubmitting(true);
    try {
      await axios.put(`/api/review-assignments/${selectedAssignment.id}`, {
        feedback,
        score
      });
      alert('Feedback submitted successfully!');
      setSelectedAssignment(null);
      setFeedback('');
      setScore(5);
      fetchAssignments();
    } catch (err) {
      console.error('Error submitting feedback:', err);
      alert('Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  const openManuscript = (content) => {
    if (!content) return;
    const win = window.open();
    win.document.write(`<iframe src="${content}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe>`);
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
        <div className="mb-12">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Reviewer <span className="text-primary-600">Portal</span>
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Assigned manuscripts and review progress.</p>
        </div>

        <div className="grid grid-cols-1 gap-8">
          {assignments.length === 0 ? (
            <div className="bg-white rounded-[2.5rem] p-12 text-center shadow-sm border border-slate-100">
              <ClipboardList className="h-16 w-16 text-slate-100 mx-auto mb-4" />
              <h3 className="text-xl font-black text-slate-900">No assignments yet</h3>
              <p className="text-slate-500 mt-2">You will see manuscripts here once the editorial board assigns them to you.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {assignments.map((asgn) => (
                <motion.div 
                  key={asgn.id}
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex justify-between items-start mb-4">
                      <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                        asgn.status === 'completed' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                      }`}>
                        {asgn.status === 'completed' ? 'Reviewed' : 'Action Required'}
                      </span>
                      <div className="text-[10px] font-bold text-slate-400">
                        {new Date(asgn.assigned_at).toLocaleDateString()}
                      </div>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 leading-tight mb-4 group-hover:text-primary-600 transition-colors">
                      {asgn.article_title}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    <button 
                      onClick={() => openManuscript(asgn.manuscript_content)}
                      className="w-full py-3 bg-slate-50 text-slate-700 rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center justify-center gap-2"
                    >
                      <FileText className="h-4 w-4" /> View Manuscript
                    </button>
                    {asgn.status !== 'completed' ? (
                      <button 
                        onClick={() => setSelectedAssignment(asgn)}
                        className="w-full py-3 bg-primary-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-primary-700 transition-all shadow-lg shadow-primary-200"
                      >
                        Submit Review
                      </button>
                    ) : (
                      <div className="p-4 bg-emerald-50 rounded-2xl">
                        <div className="flex items-center text-emerald-700 text-xs font-black uppercase tracking-widest mb-2">
                          <CheckCircle className="h-3 w-3 mr-2" /> Score: {asgn.score}/10
                        </div>
                        <p className="text-[11px] text-emerald-600 italic line-clamp-2">"{asgn.feedback}"</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Feedback Modal */}
      <AnimatePresence>
        {selectedAssignment && (
          <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedAssignment(null)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            ></motion.div>
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-black text-slate-900">Manuscript Review</h3>
                  <p className="text-[10px] font-black text-primary-600 uppercase tracking-widest mt-1">Submit your evaluation</p>
                </div>
                <button onClick={() => setSelectedAssignment(null)}><X className="h-6 w-6 text-slate-300" /></button>
              </div>

              <form onSubmit={handleSubmitFeedback} className="p-8 space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-1">Reviewer Score (1-10)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setScore(s)}
                        className={`flex-1 h-10 rounded-xl font-black text-sm transition-all ${
                          score === s ? 'bg-primary-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 pl-1">Detailed Feedback</label>
                  <textarea 
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    rows={6}
                    required
                    placeholder="Provide your professional evaluation of the manuscript..."
                    className="w-full bg-slate-50 border border-slate-100 rounded-[2rem] p-6 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-100 transition-all resize-none"
                  ></textarea>
                </div>

                <div className="pt-4 flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setSelectedAssignment(null)}
                    className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex-[2] py-4 bg-primary-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-primary-700 transition-all shadow-xl shadow-primary-200 flex items-center justify-center gap-2"
                  >
                    {submitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Send className="h-4 w-4" /> Submit Evaluation</>}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReviewerDashboard;
