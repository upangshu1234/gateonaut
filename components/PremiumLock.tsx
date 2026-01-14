
import React from 'react';
import { Lock, Crown, AlertTriangle } from 'lucide-react';

interface PremiumLockProps {
  isPremium: boolean;
  onUpgrade: () => void;
  children: React.ReactNode;
  label?: string;
  className?: string;
}

export const PremiumLock: React.FC<PremiumLockProps> = ({ 
  isPremium, 
  onUpgrade, 
  children, 
  label = "Premium Feature", 
  className = "" 
}) => {
  if (isPremium) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`relative group ${className} overflow-hidden`}>
      {/* Blurred Content */}
      <div className="filter blur-sm opacity-40 pointer-events-none select-none grayscale transition-all duration-500 group-hover:blur-md">
        {children}
      </div>

      {/* Lock Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center z-10 p-4 bg-slate-950/20 group-hover:bg-slate-950/40 transition-colors">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onUpgrade();
          }}
          className="relative overflow-hidden bg-slate-900 border border-slate-700/50 p-6 rounded-2xl shadow-2xl backdrop-blur-md transform transition-all duration-300 hover:scale-105 hover:border-amber-500/50 group/btn flex flex-col items-center gap-3 text-center max-w-[200px]"
        >
          {/* Scanline Effect in Button */}
          <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(245,158,11,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_infinite] pointer-events-none"></div>

          <div className="w-12 h-12 bg-slate-950 rounded-full flex items-center justify-center border border-slate-800 group-hover/btn:border-amber-500 group-hover/btn:shadow-[0_0_15px_rgba(245,158,11,0.3)] transition-all">
             <Lock size={20} className="text-slate-500 group-hover/btn:text-amber-500 transition-colors" />
          </div>

          <div>
             <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover/btn:text-amber-500 mb-1 transition-colors">
               Paywall Alert
             </div>
             <div className="text-xs font-bold text-slate-300 leading-tight">
               {label} is locked.
             </div>
             <div className="text-[9px] text-slate-500 mt-2 font-mono italic">
               "Imagine not investing in yourself."
             </div>
          </div>
        </button>
      </div>
      
      {/* Decorative corners for the locked container */}
      <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-slate-800 rounded-tl-xl opacity-50"></div>
      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-slate-800 rounded-br-xl opacity-50"></div>
    </div>
  );
};
