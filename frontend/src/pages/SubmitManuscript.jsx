import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Upload, FileText, CheckCircle, AlertCircle, ArrowRight, X, File, BookOpen, User as UserIcon, Loader2, Tag, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import SuccessModal from '../components/SuccessModal';
import axios from 'axios';

const SubmitManuscript = () => {
  const { user } = useAuth();
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    category_id: '',
    abstract: '',
    corresponding_author: ''
  });
  const [trackingId] = useState(`RSQ-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  
  const fileInputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      setFormData(prev => ({...prev, corresponding_author: user.name || ''}));
    }
    fetchCategories();
  }, [user, navigate]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      if (response.data && response.data.length > 0) {
        setCategories(response.data);
      } else {
        // Fallback categories if DB is empty
        setCategories([
          { id: 1, name: 'Clinical Research' },
          { id: 2, name: 'Case Reports' },
          { id: 3, name: 'Review Articles' }
        ]);
      }
    } catch (err) {
      console.error("Failed to fetch categories", err);
      // Fallback categories on error
      setCategories([
        { id: 1, name: 'Clinical Research' },
        { id: 2, name: 'Case Reports' },
        { id: 3, name: 'Review Articles' }
      ]);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Validate file type
      const validTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword'];
      if (!validTypes.includes(selectedFile.type) && !selectedFile.name.endsWith('.docx') && !selectedFile.name.endsWith('.doc')) {
        alert("Please upload a PDF or Word document (.doc, .docx)");
        removeFile();
        return;
      }
      // Validate file size (25MB)
      if (selectedFile.size > 25 * 1024 * 1024) {
        alert("File size exceeds 25MB limit.");
        removeFile();
        return;
      }
      setFile(selectedFile);
    }
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      alert("Please upload your manuscript file.");
      return;
    }
    
    setLoading(true);
    try {
      // Read file as base64
      const reader = new FileReader();
      const base64Promise = new Promise((resolve, reject) => {
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
      reader.readAsDataURL(file);
      const base64File = await base64Promise;

      await axios.post('/api/articles/submit', {
        title: formData.title,
        abstract: formData.abstract,
        email: user.email,
        author_name: user.name,
        category_id: formData.category_id,
        file_name: file.name,
        file_content: base64File // Sending the actual content
      }, { timeout: 10000 });

      setShowSuccess(true);
    } catch (err) {
      console.error("Submission error:", err);
      const msg = err.response?.data?.message || err.message || "Submission failed.";
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent py-16 px-4">
      <SuccessModal 
        isOpen={showSuccess} 
        onClose={() => navigate('/history')} 
        trackingId={trackingId} 
      />

      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="max-w-2xl">
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center space-x-2 text-primary-600 font-bold text-xs uppercase tracking-widest mb-4"
            >
                <div className="h-px w-8 bg-primary-600"></div>
                <span>Author Portal</span>
            </motion.div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tight">Submit Your <span className="text-primary-600">Research</span></h1>
            <p className="text-slate-500 text-lg font-medium leading-relaxed">
              Join our network of prestigious contributors. Our peer-review process is designed to be 
              constructive, efficient, and transparent.
            </p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-lg border border-slate-100 flex items-center space-x-4">
            <div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center text-primary-600">
                <BookOpen className="h-6 w-6" />
            </div>
            <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Guidelines</p>
                <p className="text-sm font-black text-slate-900">v4.2 April 2026</p>
            </div>
          </div>
        </div>

        <motion.div 
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-white/70 backdrop-blur-xl rounded-[3rem] shadow-3xl overflow-hidden border border-white/50 relative"
        >
          {/* Decorative Background Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl opacity-50 -mr-32 -mt-32"></div>
          
          <div className="grid grid-cols-1 lg:grid-cols-12">
            <div className="lg:col-span-4 bg-slate-900 p-12 text-white relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-2xl font-black mb-10 flex items-center space-x-3">
                    <div className="w-2 h-8 bg-primary-500 rounded-full"></div>
                    <span>Checklist</span>
                </h3>
                <ul className="space-y-10">
                    {[
                        { t: 'Title Page', d: 'Include all author affiliations and ORCID IDs.' },
                        { t: 'Structured Abstract', d: 'Background, Methods, Results, and Conclusions.' },
                        { t: 'Blinded Review', d: 'Remove all identifying information from manuscript.' },
                        { t: 'Disclosure', d: 'Declare all financial and non-financial interests.' }
                    ].map((item, i) => (
                        <li key={i} className="flex items-start space-x-5 group">
                            <div className="mt-1 bg-white/10 p-2 rounded-xl group-hover:bg-primary-500 transition-colors">
                                <CheckCircle className="h-5 w-5" />
                            </div>
                            <div>
                                <h4 className="font-bold text-white text-lg">{item.t}</h4>
                                <p className="text-slate-400 text-sm mt-1 leading-relaxed">{item.d}</p>
                            </div>
                        </li>
                    ))}
                </ul>
              </div>
              <div className="absolute bottom-[-10%] right-[-10%] opacity-10">
                  <BookOpen className="h-64 w-64 rotate-12" />
              </div>
            </div>

            <div className="lg:col-span-8 p-12 sm:p-20 relative bg-white/40">
              <form onSubmit={handleSubmit} className="space-y-10">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Article Title *</label>
                        <input 
                            required 
                            type="text" 
                            value={formData.title}
                            onChange={(e) => setFormData({...formData, title: e.target.value})}
                            className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all text-slate-900 font-bold" 
                            placeholder="e.g. Longitudinal Analysis of Neural Plasticity..." 
                        />
                    </div>

                    <div className="relative md:col-span-1">
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Category *</label>
                        <div className="relative group">
                            <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors pointer-events-none z-10">
                                <Tag className="h-5 w-5" />
                            </div>
                            <select 
                                required 
                                value={formData.category_id}
                                onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                                className="relative w-full pl-16 pr-12 py-4 rounded-2xl border-2 border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all text-slate-900 font-bold appearance-none cursor-pointer z-0"
                            >
                                <option value="" disabled>{categories.length > 0 ? "Select Research Area" : "Loading Categories..."}</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id} className="text-slate-900">{cat.name}</option>
                                ))}
                            </select>
                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-focus-within:text-primary-500 transition-colors z-10">
                                <ChevronRight className="h-5 w-5 rotate-90" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Corresponding Author *</label>
                        <div className="relative">
                            <UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-300" />
                            <input 
                                required 
                                type="text" 
                                value={formData.corresponding_author}
                                onChange={(e) => setFormData({...formData, corresponding_author: e.target.value})}
                                className="w-full pl-16 pr-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all text-slate-900 font-bold" 
                                placeholder="Full Name" 
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3">Abstract *</label>
                    <textarea 
                        required 
                        rows="6" 
                        value={formData.abstract}
                        onChange={(e) => setFormData({...formData, abstract: e.target.value})}
                        className="w-full px-6 py-4 rounded-2xl border border-slate-100 bg-slate-50 focus:bg-white focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all text-slate-900 font-medium leading-relaxed" 
                        placeholder="Summarize your research objectives and findings..."
                    ></textarea>
                </div>

                <div 
                  onClick={() => fileInputRef.current.click()}
                  className={`p-12 border-2 border-dashed rounded-[2.5rem] transition-all cursor-pointer group flex flex-col items-center justify-center relative overflow-hidden ${file ? 'border-green-400 bg-green-50/50' : 'border-slate-100 bg-slate-50/50 hover:border-primary-400 hover:bg-primary-50/10'}`}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    className="hidden" 
                    accept=".pdf,.doc,.docx"
                  />
                  
                  {file ? (
                    <motion.div 
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex flex-col items-center"
                    >
                      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center mb-4 shadow-lg">
                        <FileText className="h-10 w-10" />
                      </div>
                      <p className="text-lg font-black text-slate-900">{file.name}</p>
                      <p className="text-xs text-slate-400 mt-1">{(file.size / (1024 * 1024)).toFixed(2)} MB • Ready for upload</p>
                      <button 
                        type="button"
                        onClick={(e) => { e.stopPropagation(); removeFile(); }}
                        className="mt-6 px-6 py-2 bg-red-50 text-red-500 rounded-full text-xs font-bold hover:bg-red-100 transition-colors flex items-center"
                      >
                        <X className="h-4 w-4 mr-2" /> Change File
                      </button>
                    </motion.div>
                  ) : (
                    <>
                      <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-6 shadow-xl group-hover:scale-110 transition-transform duration-500">
                        <Upload className="h-10 w-10 text-primary-600" />
                      </div>
                      <h4 className="text-xl font-black text-slate-900">Upload Manuscript</h4>
                      <p className="text-slate-400 mt-2 font-medium">Drag & drop your research paper here or <span className="text-primary-600 underline">browse files</span></p>
                      <p className="text-[10px] text-slate-300 font-bold mt-6 uppercase tracking-widest">Supports PDF, DOCX (Max 25MB)</p>
                    </>
                  )}
                </div>

                <div className="bg-slate-50 p-6 rounded-3xl flex items-start space-x-4 border border-slate-100">
                  <div className="mt-1">
                      <input required type="checkbox" id="terms" className="w-5 h-5 text-primary-600 rounded-lg border-slate-200 focus:ring-primary-500 focus:ring-offset-0" />
                  </div>
                  <label htmlFor="terms" className="text-xs text-slate-500 leading-relaxed font-medium">
                      I certify that this submission is my own original work and does not contain any material 
                      that violates international copyright laws or ethical standards in clinical research.
                  </label>
                </div>

                <button 
                  disabled={loading}
                  type="submit" 
                  className={`group relative w-full py-6 rounded-[2rem] font-black text-white text-xl transition-all shadow-2xl overflow-hidden ${loading ? 'bg-slate-400' : 'bg-primary-600 hover:bg-primary-700 hover:shadow-primary-500/30'}`}
                >
                  <div className="relative z-10 flex items-center justify-center space-x-3">
                    {loading ? (
                        <Loader2 className="h-6 w-6 animate-spin" />
                    ) : (
                        <>
                            <span>Finish Submission</span>
                            <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                        </>
                    )}
                  </div>
                  {!loading && (
                      <motion.div 
                        initial={{ x: '-100%' }}
                        whileHover={{ x: '100%' }}
                        transition={{ duration: 0.8 }}
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                      ></motion.div>
                  )}
                </button>
              </form>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SubmitManuscript;
