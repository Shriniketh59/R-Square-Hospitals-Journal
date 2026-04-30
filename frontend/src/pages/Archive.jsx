import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Library, 
  Calendar, 
  ChevronRight, 
  FileText, 
  ArrowRight,
  Book,
  Download,
  ExternalLink,
  Search
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Archive = () => {
  const [issues, setIssues] = useState([]);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [articlesLoading, setArticlesLoading] = useState(false);

  useEffect(() => {
    const fetchIssues = async () => {
      try {
        const response = await axios.get('/api/issues');
        setIssues(response.data);
        if (response.data.length > 0) {
          handleIssueClick(response.data[0]);
        }
      } catch (err) {
        console.error("Failed to fetch issues", err);
      } finally {
        setLoading(false);
      }
    };
    fetchIssues();
  }, []);

  const handleIssueClick = async (issue) => {
    setSelectedIssue(issue);
    setArticlesLoading(true);
    try {
      const response = await axios.get(`/api/issues/${issue.id}/articles`);
      setArticles(response.data);
    } catch (err) {
      console.error("Failed to fetch articles for issue", err);
    } finally {
      setArticlesLoading(false);
    }
  };

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
      <div className="min-h-screen flex items-center justify-center bg-slate-50 pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-primary-50 text-primary-600 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
            Journal Repository
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
            The <span className="text-primary-600 italic">Archive</span>
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto font-medium">
            Browse through our past volumes and issues. Access peer-reviewed clinical research and case reports from the R Square Hospitals community.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Issue Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-6 px-4">Available Issues</h3>
            <div className="space-y-2">
              {issues.map((issue) => (
                <button
                  key={issue.id}
                  onClick={() => handleIssueClick(issue)}
                  className={`w-full text-left p-4 rounded-3xl transition-all flex items-center justify-between group ${
                    selectedIssue?.id === issue.id 
                    ? 'bg-primary-600 text-white shadow-xl shadow-primary-200' 
                    : 'bg-white text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-tighter ${selectedIssue?.id === issue.id ? 'text-primary-100' : 'text-slate-400'}`}>
                      Vol {issue.volume} • Issue {issue.issue_number}
                    </p>
                    <p className="text-sm font-bold mt-0.5">{issue.publication_month} {issue.publication_year}</p>
                  </div>
                  <ChevronRight className={`h-4 w-4 transition-transform group-hover:translate-x-1 ${selectedIssue?.id === issue.id ? 'text-white' : 'text-slate-300'}`} />
                </button>
              ))}
            </div>
          </div>

          {/* Articles Content */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              {selectedIssue && (
                <motion.div
                  key={selectedIssue.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-8"
                >
                  <div className="bg-white rounded-[3rem] p-8 md:p-12 shadow-sm border border-slate-100 relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div>
                                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                                    Volume {selectedIssue.volume}, Issue {selectedIssue.issue_number}
                                </h2>
                                <p className="text-slate-500 font-bold mt-2 flex items-center">
                                    <Calendar className="h-4 w-4 mr-2 text-primary-500" />
                                    Published {selectedIssue.publication_month} {selectedIssue.publication_year}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="px-6 py-3 rounded-2xl bg-slate-900 text-white text-xs font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10 flex items-center gap-2">
                                    <Download className="h-4 w-4" />
                                    Full Issue PDF
                                </button>
                            </div>
                        </div>

                        <div className="mt-12">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-8 border-b border-slate-50 pb-4">
                                Table of Contents
                            </h3>
                            
                            {articlesLoading ? (
                                <div className="py-20 flex justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-primary-600"></div>
                                </div>
                            ) : articles.length === 0 ? (
                                <div className="py-20 text-center">
                                    <FileText className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No articles published in this issue yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-8">
                                    {articles.map((article, idx) => (
                                        <motion.div 
                                            key={article.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="group cursor-pointer"
                                        >
                                            <div className="flex gap-6">
                                                <div className="text-primary-600 font-black text-lg pt-1">
                                                    {String(idx + 1).padStart(2, '0')}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-tighter">
                                                            {article.doi || 'DOI Pending'}
                                                        </span>
                                                        <span className="text-[10px] font-bold text-slate-400">
                                                            Page {idx * 10 + 1}-{idx * 10 + 10}
                                                        </span>
                                                    </div>
                                                    <h4 className="text-xl font-black text-slate-900 group-hover:text-primary-600 transition-colors mb-2 leading-tight">
                                                        {article.title}
                                                    </h4>
                                                    <p className="text-sm text-slate-500 font-bold mb-4">{article.author_name}</p>
                                                    <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button className="text-[10px] font-black text-primary-600 uppercase tracking-widest flex items-center gap-1.5 hover:underline">
                                                            Abstract <ArrowRight className="h-3 w-3" />
                                                        </button>
                                                        <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5 hover:text-slate-900 transition-colors">
                                                            PDF <ExternalLink className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                    
                    {/* Abstract background shape */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-[100px] -mr-32 -mt-32 opacity-50"></div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Archive;
