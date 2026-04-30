import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Archive from './pages/Archive';
import SubmitManuscript from './pages/SubmitManuscript';
import SubmissionHistory from './pages/SubmissionHistory';
import Profile from './pages/Profile';
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AuthorDashboard from './pages/AuthorDashboard';
import ReviewerDashboard from './pages/ReviewerDashboard';
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider } from './context/AuthContext';

// IMPORTANT: Replace with your actual Google Client ID
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

function AppContent() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith('/admin');

  return (
    <div className="flex flex-col min-h-screen">
      {!isAdminPath && <Navbar />}
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/archive" element={<Archive />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <AuthorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/reviewer/dashboard" 
            element={
              <ProtectedRoute>
                <ReviewerDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/submit" 
            element={
              <ProtectedRoute>
                <SubmitManuscript />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/history" 
            element={
              <ProtectedRoute>
                <SubmissionHistory />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </main>
      {!isAdminPath && (
        <footer className="bg-slate-50 border-t border-slate-200 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-2">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="bg-primary-600 p-1 rounded">
                    <div className="w-4 h-4 text-white font-bold text-[10px] flex items-center justify-center">R</div>
                  </div>
                  <span className="text-lg font-bold text-slate-900 tracking-tight uppercase">R SQUARE HOSPITALS JOURNAL</span>
                </div>
                <p className="text-slate-500 text-sm max-w-sm">
                  An international peer-reviewed journal dedicated to clinical and diagnostic research, 
                  committed to the advancement of medicine and healthcare.
                </p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Resources</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li><a href="#" className="hover:text-primary-600 transition-colors">Author Guidelines</a></li>
                  <li><a href="#" className="hover:text-primary-600 transition-colors">Peer Review Process</a></li>
                  <li><a href="#" className="hover:text-primary-600 transition-colors">Open Access Policy</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 mb-4 text-sm uppercase tracking-wider">Contact</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li>editorial@rsquare.com</li>
                  <li>+1 (555) 000-0000</li>
                  <li>New Delhi, India</li>
                </ul>
              </div>
            </div>
            <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row justify-between items-center text-slate-400 text-xs">
              <p>&copy; 2026 R Square Hospitals Journal. All rights reserved.</p>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <a href="#" className="hover:text-slate-600 transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-slate-600 transition-colors">Terms of Service</a>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
