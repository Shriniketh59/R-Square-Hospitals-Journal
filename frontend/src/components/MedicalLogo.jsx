import React from 'react';
import { Stethoscope } from 'lucide-react';

const MedicalLogo = ({ className = "" }) => {
  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      <div className="relative group">
        <div className="bg-blue-600 w-12 h-12 rounded-xl shadow-xl shadow-blue-500/20 flex items-center justify-center relative overflow-hidden transition-all duration-300 group-hover:scale-105 group-hover:bg-blue-700">
          {/* Background medical grid pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%">
              <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
                <path d="M 10 0 L 0 0 0 10" fill="none" stroke="white" strokeWidth="0.5"/>
              </pattern>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          {/* The R Square Branding */}
          <span className="text-2xl font-black text-white relative z-10">R</span>
          {/* Decorative medical cross corner */}
          <div className="absolute top-1 right-1">
            <div className="bg-white/20 w-3 h-3 rounded-sm flex items-center justify-center">
              <div className="bg-white w-[1px] h-2"></div>
              <div className="bg-white w-2 h-[1px] absolute"></div>
            </div>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <div className="flex items-center space-x-1">
          <span className="text-xl font-black text-blue-900 leading-none tracking-tight">R SQUARE</span>
        </div>
        <span className="text-[10px] font-bold text-blue-600 tracking-[0.2em] uppercase">Hospitals Journal</span>
      </div>
    </div>
  );
};

export default MedicalLogo;
