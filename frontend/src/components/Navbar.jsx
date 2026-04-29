import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Menu, LogOut, User, History } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import MedicalLogo from './MedicalLogo';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          <div className="flex items-center">
            <Link to="/" className="group">
              <MedicalLogo />
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/submit" className="nav-link font-bold text-primary-600">Submit Journal</Link>
            {user && (
                <Link to="/history" className="nav-link flex items-center">
                    <History className="h-4 w-4 mr-1.5 opacity-50" />
                    Submission History
                </Link>
            )}
            <Link to="/about" className="nav-link">About</Link>
          </div>

          <div className="flex items-center space-x-4">
            <button className="p-2 text-slate-400 hover:text-primary-600 transition-colors">
              <Search className="h-5 w-5" />
            </button>
            
            {user ? (
              <div className="flex items-center space-x-4 pl-4 border-l border-slate-100">
                <Link to="/profile" className="flex items-center space-x-2 group/profile">
                  {user.picture ? (
                    <img 
                      src={user.picture} 
                      alt="profile" 
                      referrerPolicy="no-referrer"
                      className="w-8 h-8 rounded-full border border-slate-200 group-hover:border-primary-500 transition-colors" 
                    />
                  ) : (
                    <img 
                      src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0D8ABC&color=fff`} 
                      alt="profile" 
                      className="w-8 h-8 rounded-full border border-slate-200 group-hover:border-primary-500 transition-colors" 
                    />
                  )}
                  <span className="text-sm font-medium text-slate-700 hidden lg:block group-hover:text-primary-600 transition-colors">{user.name}</span>
                </Link>
                <button 
                  onClick={logout}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                  title="Logout"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="flex items-center space-x-2 px-6 py-2.5 rounded-full bg-slate-900 text-white text-sm font-bold hover:bg-slate-800 transition-all shadow-lg shadow-slate-900/10 active:scale-95">
                <User className="h-4 w-4" />
                <span>Login</span>
              </Link>
            )}

            <button className="md:hidden p-2 text-slate-500">
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
