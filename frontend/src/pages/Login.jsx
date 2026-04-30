import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, ArrowRight, BookOpen, User, Phone, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import PhoneInputPkg from 'react-phone-input-2';
const PhoneInput = PhoneInputPkg.default || PhoneInputPkg;
import 'react-phone-input-2/lib/style.css';

const Login = () => {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '']);
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
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    if (!phone) {
        setError('Please enter a phone number');
        return;
    }
    setLoading(true);
    setError('');
    try {
        await axios.post('/api/auth/send-otp', { phone: '+' + phone });
        setOtpSent(true);
    } catch (err) {
        setError(err.response?.data?.message || 'Failed to send OTP');
    } finally {
        setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    const otpValue = otp.join('');
    if (otpValue.length < 4) {
        setError('Please enter complete OTP');
        return;
    }
    setLoading(true);
    setError('');
    try {
        const response = await axios.post('/api/auth/verify-otp', { phone: '+' + phone, otp: otpValue });
        login(response.data);
        navigate(from, { replace: true });
    } catch (err) {
        setError(err.response?.data?.message || 'Invalid OTP');
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
      const payload = { username, newPassword, securityCode };
      
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
                  <span className="px-2 bg-white text-slate-400 font-bold uppercase text-[10px] tracking-widest">Or continue with phone</span>
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
                  Admin Username
                </label>
                <input
                  required
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full px-4 py-3 border border-slate-100 rounded-2xl bg-slate-50 text-sm"
                  placeholder="admin_id"
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
                  placeholder="Enter RSQ2026"
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
                <>
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
                    className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-black text-white transition-all ${loading ? 'bg-slate-400' : 'bg-slate-900 hover:bg-black'} flex items-center space-x-2`}
                  >
                    {loading ? 'Authenticating...' : 'Access Dashboard'}
                    {!loading && <ArrowRight className="h-5 w-5" />}
                  </button>
                </>
              ) : (
                !otpSent ? (
                  <>
                    <div>
                      <label className="block text-xs font-black text-slate-500 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
                      <div className="phone-input-wrapper">
                        <PhoneInput
                          country={'us'}
                          value={phone}
                          onChange={phone => setPhone(phone)}
                          inputStyle={{
                            width: '100%',
                            height: '52px',
                            borderRadius: '1rem',
                            borderColor: '#f1f5f9',
                            backgroundColor: '#f8fafc',
                            fontSize: '0.875rem'
                          }}
                          buttonStyle={{
                            borderRadius: '1rem 0 0 1rem',
                            borderColor: '#f1f5f9',
                            backgroundColor: '#f8fafc',
                            paddingLeft: '4px'
                          }}
                          dropdownStyle={{
                            borderRadius: '1rem',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
                            border: '1px solid #f1f5f9'
                          }}
                        />
                      </div>
                    </div>
                    <button
                      disabled={loading || !phone}
                      type="button"
                      onClick={handleSendOTP}
                      className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-black text-white transition-all ${loading || !phone ? 'bg-primary-400' : 'bg-primary-600 hover:bg-primary-700'} flex items-center space-x-2`}
                    >
                      {loading ? 'Sending...' : 'Generate OTP'}
                      {!loading && <ArrowRight className="h-5 w-5" />}
                    </button>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-center text-xs font-black text-slate-500 uppercase tracking-widest mb-4">Enter 4-Digit PIN</label>
                      <div className="flex justify-center space-x-4">
                        {otp.map((digit, index) => (
                          <input
                            key={index}
                            id={`otp-${index}`}
                            type="text"
                            maxLength="1"
                            value={digit}
                            onChange={(e) => {
                              const val = e.target.value;
                              if (/^[0-9]$/.test(val) || val === '') {
                                const newOtp = [...otp];
                                newOtp[index] = val;
                                setOtp(newOtp);
                                if (val && index < 3) {
                                  document.getElementById(`otp-${index + 1}`).focus();
                                }
                              }
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Backspace' && !digit && index > 0) {
                                document.getElementById(`otp-${index - 1}`).focus();
                              }
                            }}
                            className="w-14 h-14 text-center text-2xl font-bold border border-slate-200 rounded-2xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:bg-white transition-all shadow-sm"
                          />
                        ))}
                      </div>
                      <div className="text-center mt-4">
                        <p className="text-xs text-slate-500">OTP sent via SMS to +{phone}</p>
                        <button type="button" onClick={() => setOtpSent(false)} className="text-xs font-bold text-primary-600 hover:underline mt-1">Change Number</button>
                      </div>
                    </div>
                    <button
                      disabled={loading || otp.join('').length < 4}
                      type="button"
                      onClick={handleVerifyOTP}
                      className={`w-full flex justify-center py-4 px-4 border border-transparent rounded-2xl shadow-lg text-sm font-black text-white transition-all ${loading || otp.join('').length < 4 ? 'bg-primary-400' : 'bg-primary-600 hover:bg-primary-700'} flex items-center space-x-2`}
                    >
                      {loading ? 'Verifying...' : 'Verify OTP'}
                      {!loading && <ShieldCheck className="h-5 w-5" />}
                    </button>
                  </>
                )
              )}
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
