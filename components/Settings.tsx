
import React, { useState } from 'react';
import { UserPreferences, ThemeColor } from '../types';
import { Palette, X, Monitor, Shield, Target, Zap } from 'lucide-react';

interface SettingsProps {
  preferences: UserPreferences;
  onUpdate: (prefs: Partial<UserPreferences>) => void;
  onClose: () => void;
}

const THEMES: { id: ThemeColor; name: string; color: string }[] = [
  { id: 'indigo', name: 'Command Indigo', color: 'bg-indigo-500' },
  { id: 'cyan', name: 'Cyber Cyan', color: 'bg-cyan-500' },
  { id: 'emerald', name: 'Matrix Emerald', color: 'bg-emerald-500' },
  { id: 'rose', name: 'Red Alert', color: 'bg-rose-500' },
  { id: 'amber', name: 'Industrial Amber', color: 'bg-amber-500' },
  { id: 'violet', name: 'Nebula Violet', color: 'bg-violet-500' },
];

const Settings: React.FC<SettingsProps> = ({ preferences, onUpdate, onClose }) => {
  const [simulatePremium, setSimulatePremium] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in font-mono-tech">
      <div className="bg-slate-950 border border-primary-500/30 w-full max-w-2xl rounded-3xl shadow-[0_0_50px_-10px_rgba(var(--color-primary-500),0.3)] relative overflow-hidden flex flex-col max-h-[90vh]">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent"></div>
        
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div className="flex items-center gap-3">
             <div className="p-2 bg-primary-500/20 rounded-lg text-primary-400 border border-primary-500/30">
                <Monitor size={20} />
             </div>
             <div>
                <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">System Configuration</h3>
                <p className="text-[10px] text-primary-400 font-bold uppercase tracking-widest">Visual & Operational Settings</p>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-8 overflow-y-auto custom-scrollbar space-y-10">
          
          {/* Theme Selection */}
          <section>
             <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
               <Palette size={12} /> Interface Theme
             </h4>
             <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {THEMES.map(theme => (
                   <button
                     key={theme.id}
                     onClick={() => onUpdate({ themeColor: theme.id })}
                     className={`p-4 rounded-xl border text-left transition-all relative overflow-hidden group ${
                        (preferences.themeColor || 'indigo') === theme.id 
                        ? 'bg-slate-900 border-primary-500 ring-1 ring-primary-500/50' 
                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                     }`}
                   >
                      <div className="flex items-center gap-3 mb-2">
                         <div className={`w-4 h-4 rounded-full ${theme.color} shadow-[0_0_10px_currentColor]`}></div>
                         <span className={`text-xs font-bold uppercase ${
                            (preferences.themeColor || 'indigo') === theme.id ? 'text-white' : 'text-slate-400'
                         }`}>{theme.name}</span>
                      </div>
                      {(preferences.themeColor || 'indigo') === theme.id && (
                         <div className="absolute inset-0 bg-gradient-to-r from-primary-500/5 to-transparent pointer-events-none"></div>
                      )}
                   </button>
                ))}
             </div>
          </section>

          {/* Mission Params */}
          <section>
             <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
               <Target size={12} /> Mission Parameters
             </h4>
             <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div>
                   <label className="text-xs text-slate-400 font-bold uppercase block mb-2">Target Score</label>
                   <div className="flex items-center gap-4">
                      <input 
                         type="range" min="30" max="100" step="5"
                         value={preferences.targetMarks}
                         onChange={(e) => onUpdate({ targetMarks: parseInt(e.target.value) })}
                         className="flex-1 h-2 bg-slate-800 rounded-full appearance-none accent-primary-500"
                      />
                      <span className="text-xl font-black text-white w-16 text-right">{preferences.targetMarks}</span>
                   </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="text-xs text-slate-400 font-bold uppercase block mb-2">Target Year</label>
                      <select 
                         value={preferences.targetYear}
                         onChange={(e) => onUpdate({ targetYear: e.target.value as any })}
                         className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-primary-500"
                      >
                         <option value="2026">2026</option>
                         <option value="2027">2027</option>
                         <option value="2028">2028</option>
                      </select>
                   </div>
                   <div>
                      <label className="text-xs text-slate-400 font-bold uppercase block mb-2">Mode</label>
                      <select 
                         value={preferences.attemptType}
                         onChange={(e) => onUpdate({ attemptType: e.target.value as any })}
                         className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-primary-500"
                      >
                         <option value="Serious">Serious</option>
                         <option value="Trial">Trial</option>
                         <option value="Foundation">Foundation</option>
                      </select>
                   </div>
                </div>
             </div>
          </section>

          {/* Developer Override (Visual Testing) */}
          <section>
             <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
               <Zap size={12} className="text-amber-500" /> Developer Override
             </h4>
             <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 flex items-center justify-between">
                <div>
                   <div className="text-sm font-bold text-white mb-1">Simulate Premium Status</div>
                   <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Visual Testing Only (No Logic Impact)</div>
                </div>
                <button 
                  onClick={() => setSimulatePremium(!simulatePremium)}
                  className={`w-12 h-6 rounded-full transition-colors relative border ${simulatePremium ? 'bg-primary-600 border-primary-500' : 'bg-slate-800 border-slate-700'}`}
                >
                  <div className={`w-3 h-3 bg-white rounded-full absolute top-1.5 transition-all shadow-sm ${simulatePremium ? 'left-7' : 'left-1.5'}`}></div>
                </button>
             </div>
          </section>

        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-900/50 flex justify-end">
           <button 
             onClick={onClose}
             className="px-8 py-3 bg-primary-600 hover:bg-primary-500 text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-primary-500/20 transition-all"
           >
             Save Configuration
           </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
