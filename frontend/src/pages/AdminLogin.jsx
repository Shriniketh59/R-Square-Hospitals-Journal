import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, User, ArrowRight, ShieldCheck, Activity, ChevronLeft, AlertCircle } from 'lucide-react';
import axios from 'axios';

const AdminLogin = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [securityCode, setSecurityCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetMessage, setResetMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/api/admin/login', { username, password });
      localStorage.setItem('adminUser', JSON.stringify(response.data));
      // Add a slight delay for better UX feel during transition
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 500);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid administrative credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResetMessage('');

    try {
      await axios.post('/api/admin/reset-password', { 
        username, 
        newPassword, 
        securityCode 
      });
      setResetMessage('Password reset successful. You can now login.');
      setTimeout(() => {
        setIsResetting(false);
        setPassword('');
        setError('');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. Check security code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center overflow-hidden bg-slate-950 font-sans">
      {/* Dynamic Background */}
      <div 
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
        style={{ 
          backgroundImage: "url('/images/admin_bg.png')",
        }}
      >
        <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[2px]"></div>
      </div>

      {/* Decorative Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-500/20 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]"></div>
      </div>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-5xl px-6 flex flex-col lg:flex-row items-center justify-between gap-12 py-12">
        
        {/* Left Side: Branding/Info */}
        <motion.div 
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="flex-1 text-white text-center lg:text-left"
        >
          <div className="inline-flex items-center space-x-3 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8">
            <Activity className="h-5 w-5 text-primary-400" />
            <span className="text-xs font-bold tracking-[0.2em] uppercase text-slate-300">Administrative Portal</span>
          </div>
          
          <h1 className="text-5xl lg:text-7xl font-black tracking-tighter mb-6 leading-tight">
            Editorial <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-blue-500">Excellence</span>
          </h1>
          
          <p className="text-lg text-slate-300 max-w-md mb-10 leading-relaxed font-medium">
            Welcome to the R Square Hospitals Journal editorial management system. 
            Secure access for authorized medical editors and administrative staff.
          </p>

          <div className="flex flex-wrap items-center gap-6 justify-center lg:justify-start">
            <div className="flex flex-col">
              <span className="text-3xl font-black text-white">2.4k+</span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Submissions</span>
            </div>
            <div className="w-px h-10 bg-white/10 hidden sm:block"></div>
            <div className="flex flex-col">
              <span className="text-3xl font-black text-white">450+</span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Peer Reviewers</span>
            </div>
            <div className="w-px h-10 bg-white/10 hidden sm:block"></div>
            <div className="flex flex-col">
              <span className="text-3xl font-black text-white">98%</span>
              <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Accuracy Rate</span>
            </div>
          </div>
        </motion.div>

        {/* Right Side: Login Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/5 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden group">
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-primary-500 to-blue-600"></div>
            
            <div className="mb-10 flex flex-col items-center text-center">
              <div className="p-4 rounded-3xl bg-white/5 border border-white/10 mb-6 shadow-inner transition-transform group-hover:scale-110 duration-500">
                <ShieldCheck className="h-10 w-10 text-primary-400" />
              </div>
              <h2 className="text-2xl font-bold text-white tracking-tight">System Authentication</h2>
              <p className="text-slate-400 text-sm mt-2">Enter your credentials to manage journals</p>
            </div>

            <AnimatePresence mode="wait">
              {!isResetting ? (
                <motion.form 
                  key="login-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleSubmit} 
                  className="space-y-6"
                >
                  <AnimatePresence mode="wait">
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start space-x-3"
                      >
                        <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-red-200 text-xs font-semibold leading-relaxed">{error}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Administrative ID</label>
                    <div className="relative group/input">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors group-focus-within/input:text-primary-400">
                        <User className="h-5 w-5 text-slate-500" />
                      </div>
                      <input
                        required
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="block w-full pl-14 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-white/10 focus:border-primary-500/50 transition-all font-medium"
                        placeholder="Enter username"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center px-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Secret Key</label>
                      <button 
                        type="button"
                        onClick={() => { setIsResetting(true); setError(''); }}
                        className="text-[10px] font-bold text-primary-400 hover:text-primary-300 transition-colors uppercase tracking-widest"
                      >
                        Forgot?
                      </button>
                    </div>
                    <div className="relative group/input">
                      <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none transition-colors group-focus-within/input:text-primary-400">
                        <Lock className="h-5 w-5 text-slate-500" />
                      </div>
                      <input
                        required
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="block w-full pl-14 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:bg-white/10 focus:border-primary-500/50 transition-all font-medium"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>

                  <button
                    disabled={loading}
                    type="submit"
                    className="relative w-full group overflow-hidden bg-gradient-to-r from-primary-600 to-blue-700 hover:from-primary-500 hover:to-blue-600 p-4 rounded-2xl transition-all duration-300 shadow-xl shadow-primary-500/20 flex items-center justify-center space-x-3 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="absolute inset-0 w-full h-full bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        <span className="font-black text-sm text-white uppercase tracking-widest">Verifying...</span>
                      </div>
                    ) : (
                      <>
                        <span className="font-black text-sm text-white uppercase tracking-widest">Authorize Access</span>
                        <ArrowRight className="h-5 w-5 text-white transition-transform group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </motion.form>
              ) : (
                <motion.form 
                  key="reset-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleReset} 
                  className="space-y-6"
                >
                  <div className="mb-4 flex items-center text-primary-400 text-xs font-bold">
                    <button type="button" onClick={() => setIsResetting(false)} className="flex items-center hover:text-white transition-colors">
                      <ChevronLeft className="h-4 w-4 mr-1" /> Back to Login
                    </button>
                  </div>

                  <AnimatePresence mode="wait">
                    {error && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-start space-x-3"
                      >
                        <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                        <p className="text-red-200 text-xs font-semibold leading-relaxed">{error}</p>
                      </motion.div>
                    )}
                    {resetMessage && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start space-x-3"
                      >
                        <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
                        <p className="text-emerald-200 text-xs font-semibold leading-relaxed">{resetMessage}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
                    <input
                      required
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="block w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-medium"
                      placeholder="Admin username"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Master Security Code</label>
                    <input
                      required
                      type="text"
                      value={securityCode}
                      onChange={(e) => setSecurityCode(e.target.value)}
                      className="block w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-medium"
                      placeholder="Enter RSQ2026"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Secret Key</label>
                    <input
                      required
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="block w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all font-medium"
                      placeholder="••••••••"
                    />
                  </div>

                  <button
                    disabled={loading}
                    type="submit"
                    className="relative w-full group overflow-hidden bg-white/10 hover:bg-white/20 p-4 rounded-2xl transition-all duration-300 flex items-center justify-center space-x-3 disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    ) : (
                      <span className="font-black text-sm text-white uppercase tracking-widest">Update Credentials</span>
                    )}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="mt-10 pt-8 border-t border-white/10 flex flex-col items-center space-y-4">
              <button 
                onClick={() => navigate('/')}
                className="flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Return to Public Site</span>
              </button>
            </div>
          </div>
          
          <p className="text-center mt-8 text-[10px] font-bold text-slate-600 uppercase tracking-[0.3em]">
            Secure Shell Access • v2.0.4-Stable
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminLogin;
