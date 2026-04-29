import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, ArrowRight, FileText, Download } from 'lucide-react';

const SuccessModal = ({ isOpen, onClose, trackingId }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm"
          ></motion.div>

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-3xl overflow-hidden"
          >
            {/* Success Banner */}
            <div className="bg-green-500 p-12 text-center relative">
                <div className="absolute top-0 left-0 w-full h-full opacity-10">
                    <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                        <circle cx="50" cy="50" r="40" fill="white" fillOpacity="0.1" />
                    </svg>
                </div>
                <motion.div 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 10, delay: 0.2 }}
                    className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"
                >
                    <Check className="h-12 w-12 text-green-500 stroke-[4px]" />
                </motion.div>
                <h2 className="text-4xl font-black text-white mb-2 tracking-tight">Submission Successful!</h2>
                <p className="text-green-100 font-bold opacity-80 uppercase tracking-[0.2em] text-xs">R Square Hospitals Journal</p>
            </div>

            <div className="p-12 text-center">
                <p className="text-slate-500 text-lg mb-8 leading-relaxed">
                    Thank you for contributing to medical science. Your manuscript has been successfully 
                    uploaded to our editorial system.
                </p>

                <div className="grid grid-cols-2 gap-4 mb-10">
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Tracking ID</p>
                        <p className="text-xl font-black text-slate-900 font-mono">{trackingId}</p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Status</p>
                        <p className="text-xl font-black text-green-600">Pending Review</p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                    <button className="flex-1 py-4 px-8 bg-slate-900 text-white rounded-2xl font-black hover:bg-slate-800 transition-all flex items-center justify-center space-x-2">
                        <Download className="h-5 w-5" />
                        <span>Download Receipt</span>
                    </button>
                    <button 
                        onClick={onClose}
                        className="flex-1 py-4 px-8 bg-primary-600 text-white rounded-2xl font-black hover:bg-primary-700 transition-all flex items-center justify-center space-x-2"
                    >
                        <span>Dashboard</span>
                        <ArrowRight className="h-5 w-5" />
                    </button>
                </div>

                <p className="mt-8 text-xs text-slate-400">
                    A confirmation email has been sent to your registered account.
                </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default SuccessModal;
