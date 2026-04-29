import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, BookOpen, User } from 'lucide-react';
import axios from 'axios';

const Login = () => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isResetting, setIsResetting] = useState(false);
  const [securityCode, setSecurityCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetMessage, setResetMessage] = useState('');

  const from = location.state?.from?.pathname || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      if (isAdminMode) {
        const response = await axios.post('/api/admin/login', { username, password });
        localStorage.setItem('adminUser', JSON.stringify(response.data));
        navigate('/admin/dashboard');
      } else {
        const response = await axios.post('/api/auth/login', { email, password });
        login(response.data);
        navigate(from, { replace: true });
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      await loginWithGoogle(credentialResponse.credential);
      navigate(from, { replace: true });
    } catch (err) {
      setError('Google Authentication failed at server');
    }
  };

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResetMessage('');

    try {
      const endpoint = isAdminMode ? '/api/admin/reset-password' : '/api/auth/reset-password';
      const payload = isAdminMode ? { username, newPassword, securityCode } : { email, newPassword, securityCode };
      
      await axios.post(endpoint, payload);
      setResetMessage('Password updated successfully.');
      setTimeout(() => {
        setIsResetting(false);
        setResetMessage('');
        setPassword('');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Reset failed. Check your credentials and security code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="flex justify-center mb-6">
            <div className="bg-primary-600 p-3 rounded-2xl shadow-lg shadow-primary-500/20">
                <BookOpen className="h-10 w-10 text-white" />
            </div>
        </div>
        <h2 className="text-center text-3xl font-extrabold text-slate-900 font-serif">
          {isAdminMode ? 'Admin Editorial Portal' : 'Journal Login'}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-600 font-medium">
          {isAdminMode ? 'Authorized Editorial Access Only' : 'Sign in to submit or track your manuscripts'}
        </p>
      </motion.div>

      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mt-8 sm:mx-auto sm:w-full sm:max-w-md"
      >
        <div className="bg-white py-10 px-6 shadow-2xl rounded-[2.5rem] border border-slate-100 sm:px-10">
          {!isAdminMode && (
            <>
              <div className="mb-6">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google Login Failed')}
                  useOneTap
                  theme="outline"
                  width="100%"
                  shape="pill"
                />
              </div>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-100"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-slate-400 font-bold uppercase text-[10px] tracking-widest">Or continue with email</span>
                </div>
              </div>
            </>
          )}

          {isResetting ? (
            <form className="space-y-5" onSubmit={handleReset}>
              <div className="flex items-center mb-4">
                <button type="button" onClick={() => setIsResetting(false)} className="text-xs font-bold text-primary-600 uppercase tracking-widest flex items-center">
                   Return to Login
                </button>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 text-red-600 text-xs font-bold">{error}</div>
              )}
              {resetMessage && (
                <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-bold">{resetMessage}</div>
              )}

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                  {isAdminMode ? 'Admin Username' : 'Registered Email'}
                </label>
                <input
                  required
                  type={isAdminMode ? "text" : "email"}
                  value={isAdminMode ? username : email}
                  onChange={(e) => isAdminMode ? setUsername(e.target.value) : setEmail(e.target.value)}
                  className="block w-full px-4 py-3 border border-slate-100 rounded-2xl bg-slate-50 text-sm"
                  placeholder={isAdminMode ? "admin_id" : "name@university.edu"}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">
                  Master Security Code
                </label>
                <input
                  required
                  type="text"
                  value={securityCode}
                  onChange={(e) => setSecurityCode(e.target.value)}
                  className="block w-full px-4 py-3 border border-slate-100 rounded-2xl bg-slate-50 text-sm"
                  placeholder={isAdminMode ? "Enter RSQ2026" : "Enter AUTH2026"}
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2">New Password</label>
                <input
                  required
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="block w-full px-4 py-3 border border-slate-100 rounded-2xl bg-slate-50 text-sm"
                  placeholder="••••••••"
                />
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest"
              >
                {loading ? 'Updating...' : 'Reset Secret Key'}
              </button>
            </form>
          ) : (
            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs font-bold flex items-center"
                >
                  <div className="w-1.5 h-1.5 bg-red-600 rounded-full mr-2"></div>
                  {error}
                </motion.div>
              )}

              {isAdminMode ? (
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Admin Username</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      required
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="block w-full pl-12 pr-4 py-3.5 border border-slate-100 rounded-2xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm"
                      placeholder="admin_id"
                    />
                  </div>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-slate-400" />
                    </div>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-12 pr-4 py-3.5 border border-slate-100 rounded-2xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm"
                      placeholder="name@university.edu"
                    />
                  </div>
                </div>
              )}

              <div>
                <div className="flex justify-between items-center mb-2 px-1">
                  <label className="block text-xs font-black text-slate-500 uppercase tracking-widest">Password</label>
                  <button 
                    type="button" 
                    onClick={() => setIsResetting(true)}
                    className="text-[10px] font-bold text-primary-600 hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-slate-400" />
                  </div>
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-12 pr-4 py-3.5 border border-slate-100 rounded-2xl leading-5 bg-slate-50 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all text-sm"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                disabled={loading}
                type="submit"
                className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-black text-white transition-all ${loading ? 'bg-slate-400' : (isAdminMode ? 'bg-slate-900 hover:bg-black' : 'bg-primary-600 hover:bg-primary-700')} flex items-center space-x-2`}
              >
                {loading ? 'Authenticating...' : (isAdminMode ? 'Access Dashboard' : 'Sign In')}
                {!loading && <ArrowRight className="h-5 w-5" />}
              </button>
            </form>
          )}

          <div className="mt-8 pt-8 border-t border-slate-100 text-center space-y-4">
            <button 
              onClick={() => {
                setIsAdminMode(!isAdminMode);
                setError('');
              }}
              className="text-xs font-bold text-primary-600 hover:text-primary-700 transition-colors uppercase tracking-widest"
            >
              {isAdminMode ? 'Switch to Author Login' : 'Are you an Editor? Login as Admin'}
            </button>
            
            {!isAdminMode && (
              <p className="text-xs text-slate-500 font-medium">
                Not a member? <a href="#" className="font-bold text-slate-900 hover:underline">Register as an Author</a>
              </p>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
