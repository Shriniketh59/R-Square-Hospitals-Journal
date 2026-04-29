import React from 'react';
import { motion } from 'framer-motion';
import { Search, ChevronRight, Activity, Zap, Shield, Star } from 'lucide-react';

const Hero = () => {
  // Path to the generated medical background image
  const bgImage = "https://images.unsplash.com/photo-1622253692010-333f2da6031d?q=80&w=2000&auto=format&fit=crop"; // Using a high-quality fallback or the generated one if possible

  return (
    <div className="relative min-h-[90vh] flex items-center overflow-hidden bg-slate-900">
      {/* Dynamic Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <motion.img 
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.6 }}
            transition={{ duration: 1.5 }}
            src={bgImage} 
            className="w-full h-full object-cover"
            alt="Medical Research"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent"></div>
      </div>

      {/* Floating Medical Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none z-10">
          <motion.div 
            animate={{ y: [0, -20, 0], opacity: [0.2, 0.4, 0.2] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="absolute top-20 left-[10%] w-64 h-64 bg-primary-500 rounded-full blur-[100px]"
          ></motion.div>
          <motion.div 
            animate={{ y: [0, 20, 0], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 7, repeat: Infinity }}
            className="absolute bottom-20 right-[20%] w-96 h-96 bg-teal-500 rounded-full blur-[120px]"
          ></motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-8 text-left">
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-[10px] font-black uppercase tracking-widest mb-8"
                >
                    <Star className="h-3 w-3 fill-primary-400" />
                    <span>Premier Medical Research Destination</span>
                </motion.div>
                
                <motion.h1 
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-6xl font-black tracking-tight text-white sm:text-7xl md:text-8xl leading-[0.95]"
                >
                    The Future of <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-teal-300">Clinical Insights</span>
                </motion.h1>
                
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="mt-8 max-w-2xl text-xl text-slate-300 leading-relaxed font-medium"
                >
                    Advancing global healthcare through rigorous peer-reviewed research, 
                    innovative case studies, and groundbreaking clinical discoveries.
                </motion.p>
                
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mt-12 max-w-2xl"
                >
                    <div className="relative flex items-center group">
                        <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-teal-400 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
                        <div className="relative w-full flex items-center bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl p-2">
                            <input 
                                type="text" 
                                placeholder="Search clinical papers, DOIs, authors..." 
                                className="w-full px-6 py-4 bg-transparent text-white placeholder-slate-400 outline-none font-medium"
                            />
                            <button className="bg-primary-600 text-white p-4 rounded-xl hover:bg-primary-500 transition-all shadow-lg active:scale-95 flex items-center space-x-2 px-6">
                                <Search className="h-5 w-5" />
                                <span className="font-bold text-sm">Search</span>
                            </button>
                        </div>
                    </div>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mt-12 flex flex-wrap gap-6"
                >
                    <button className="px-10 py-5 rounded-2xl bg-white text-slate-900 font-black hover:bg-primary-50 transition-all shadow-xl flex items-center group">
                        Submit Manuscript <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <div className="flex items-center space-x-4">
                        <div className="flex -space-x-3">
                            {[1,2,3].map(i => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-slate-900 bg-slate-800 flex items-center justify-center overflow-hidden">
                                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="doctor" />
                                </div>
                            ))}
                        </div>
                        <div className="text-sm">
                            <p className="text-white font-bold">500+ Verified Authors</p>
                            <p className="text-slate-400 text-xs font-medium">Join the elite community</p>
                        </div>
                    </div>
                </motion.div>
            </div>

            <div className="lg:col-span-4 hidden lg:block">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/5 backdrop-blur-xl p-8 rounded-[3rem] border border-white/10 shadow-3xl"
                >
                    <div className="space-y-8">
                        <div className="flex items-center space-x-4">
                            <div className="bg-primary-500/20 p-3 rounded-2xl text-primary-400">
                                <Activity className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="text-white font-bold">Live Peer Review</h4>
                                <p className="text-slate-400 text-xs">Averaging 4 weeks to decision</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4">
                            <div className="bg-teal-500/20 p-3 rounded-2xl text-teal-400">
                                <Shield className="h-6 w-6" />
                            </div>
                            <div>
                                <h4 className="text-white font-bold">Full Indexing</h4>
                                <p className="text-slate-400 text-xs">PubMed, Scopus, and EMBASE</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-4 text-primary-400 font-black text-sm uppercase tracking-widest pt-4">
                            <div className="w-2 h-2 bg-primary-500 rounded-full animate-ping"></div>
                            <span>Vol. 15 | Issue 4 | 2026</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
