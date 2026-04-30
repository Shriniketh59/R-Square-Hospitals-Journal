import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import EditProfileModal from '../components/EditProfileModal';
import { 
  User, 
  Mail, 
  FileText, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Settings,
  LogOut,
  Building,
  Info
} from 'lucide-react';

const Profile = () => {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    published: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch stats
        const statsRes = await axios.get(`/api/my-submissions?email=${encodeURIComponent(user.email)}`);
        const submissions = statsRes.data;
        
        const newStats = submissions.reduce((acc, sub) => {
          acc.total++;
          const status = sub.status?.toLowerCase() || 'pending';
          if (status === 'published') acc.published++;
          else if (status === 'rejected') acc.rejected++;
          else acc.pending++;
          return acc;
        }, { total: 0, pending: 0, published: 0, rejected: 0 });
        
        setStats(newStats);

        // Fetch full profile
        const profileRes = await axios.get(`/api/authors/${encodeURIComponent(user.email)}`);
        setProfile(profileRes.data);
      } catch (err) {
        console.error("Failed to fetch data", err);
        // Fallback profile from auth context
        setProfile({ name: user.name, email: user.email });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleProfileUpdate = (updatedProfile) => {
    setProfile(updatedProfile);
    updateUser({ name: updatedProfile.name });
  };

  if (!user || !profile) return (
    <div className="min-h-screen bg-slate-50/50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-bold tracking-widest uppercase text-xs">Loading Profile...</p>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Header/Profile Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden mb-8"
        >
          <div className="h-48 bg-gradient-to-r from-primary-600 to-indigo-600 relative">
            <div className="absolute -bottom-16 left-10 p-2 bg-white rounded-full shadow-xl">
              {user.picture ? (
                <img 
                  src={user.picture} 
                  alt={profile.name} 
                  referrerPolicy="no-referrer"
                  className="w-32 h-32 rounded-full border-4 border-white object-cover" 
                />
              ) : (
                <img 
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name)}&background=0D8ABC&color=fff`} 
                  alt={profile.name} 
                  className="w-32 h-32 rounded-full border-4 border-white object-cover" 
                />
              )}
            </div>
          </div>
          
          <div className="pt-20 pb-10 px-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                {profile.name}
                <ShieldCheck className="h-6 w-6 text-primary-500" />
              </h1>
              <p className="text-slate-500 font-medium flex items-center mt-1">
                <Mail className="h-4 w-4 mr-2" />
                {profile.email}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-4 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full uppercase tracking-wider">Author</span>
                <span className="px-4 py-1 bg-primary-50 text-primary-600 text-xs font-bold rounded-full uppercase tracking-wider">Verified Researcher</span>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button 
                onClick={() => setIsEditModalOpen(true)}
                className="px-6 py-3 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-slate-800 transition-all flex items-center"
              >
                <Settings className="h-4 w-4 mr-2" />
                Edit Profile
              </button>
              <button 
                onClick={logout}
                className="p-3 bg-red-50 text-red-600 rounded-2xl hover:bg-red-100 transition-all"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Submissions', value: stats.total, icon: FileText, color: 'text-primary-600', bg: 'bg-primary-50' },
            { label: 'Published', value: stats.published, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Under Review', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Returned', value: stats.rejected, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
          ].map((item, idx) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
            >
              <div className={`w-12 h-12 ${item.bg} rounded-2xl flex items-center justify-center mb-4`}>
                <item.icon className={`h-6 w-6 ${item.color}`} />
              </div>
              <p className="text-3xl font-black text-slate-900 mb-1">{loading ? '...' : item.value}</p>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Content Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Account Details */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100"
          >
            <h2 className="text-xl font-black text-slate-900 mb-6">Account Details</h2>
            <div className="space-y-6">
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Full Name</p>
                <p className="font-bold text-slate-900">{profile.name}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Email Address</p>
                <p className="font-bold text-slate-900">{profile.email}</p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Affiliation</p>
                <p className="font-bold text-slate-900 flex items-center gap-2">
                    <Building className="h-4 w-4 text-slate-400" />
                    {profile.affiliation || 'Not specified'}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Professional Bio</p>
                <p className="text-sm text-slate-600 leading-relaxed italic">
                    {profile.bio ? `"${profile.bio}"` : 'No bio provided yet.'}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Quick Actions / Recent Activity Placeholder */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100"
          >
            <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-black text-slate-900">Quick Actions</h2>
                <button className="text-sm font-bold text-primary-600 hover:underline">View All</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button 
                    onClick={() => navigate('/submit')}
                    className="p-6 bg-slate-50 border border-slate-100 rounded-3xl text-left hover:border-primary-200 hover:bg-white transition-all group"
                >
                    <div className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                        <FileText className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">Submit New Journal</h3>
                    <p className="text-xs text-slate-500">Start a new manuscript submission</p>
                </button>
                
                <button 
                    onClick={() => navigate('/history')}
                    className="p-6 bg-slate-50 border border-slate-100 rounded-3xl text-left hover:border-primary-200 hover:bg-white transition-all group"
                >
                    <div className="w-10 h-10 bg-white shadow-sm rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                        <ExternalLink className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-slate-900 mb-1">Review History</h3>
                    <p className="text-xs text-slate-500">Check status of existing papers</p>
                </button>
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900">Recent Notifications</h3>
                </div>
                <div className="space-y-4">
                    <div className="flex items-start gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100/50">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-slate-900">Welcome to R Square Journals!</p>
                            <p className="text-[10px] text-slate-500">Your account has been successfully verified via Google.</p>
                        </div>
                    </div>
                </div>
            </div>
          </motion.div>
        </div>
      </div>

      <EditProfileModal 
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={user}
        onUpdate={handleProfileUpdate}
      />
    </div>
  );
};

export default Profile;
