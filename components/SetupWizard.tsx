
import React, { useState } from 'react';
import { Stream, UserPreferences, AttemptType, TargetGoal } from '../types';
import { 
  ArrowRight, Target, Calendar, BookOpen, ChevronRight, 
  Shield, Crosshair, Cpu, Radio, Zap, Activity, Rocket, 
  CheckCircle2, AlertTriangle, Layers, Skull, Coffee, 
  Ghost, Terminal, Lock, Map
} from 'lucide-react';

interface SetupWizardProps {
  onComplete: (prefs: UserPreferences, stream: Stream) => void;
  loading: boolean;
}

const SetupWizard: React.FC<SetupWizardProps> = ({ onComplete, loading }) => {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState<Partial<UserPreferences>>({
    targetYear: '2026',
    attemptType: 'Serious',
    primaryGoal: 'Top 100 AIR',
    secondaryGoal: 'PSU Job',
    targetMarks: 65
  });
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else if (selectedStream && preferences.targetYear && preferences.primaryGoal) {
      onComplete(preferences as UserPreferences, selectedStream);
    }
  };

  const getScoreComment = (marks: number) => {
      if (marks < 40) return "Aiming for a participation trophy?";
      if (marks < 60) return "Mediocrity is safe. I respect it.";
      if (marks < 80) return "Ambitious. Do you even study?";
      return "Delusion Level: Maximum.";
  };

  return (
    <div className="min-h-screen bg-[#020617] flex font-mono-tech overflow-hidden relative selection:bg-primary-500/30">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-900/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-900/10 rounded-full blur-[100px] pointer-events-none"></div>
      
      {/* CRT Scanline Effect */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.03] z-50 bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_2px,3px_100%]"></div>

      {/* Main Content Container */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 relative z-10">
         
         <div className="max-w-5xl w-full bg-slate-950/80 border border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden backdrop-blur-xl flex flex-col md:flex-row h-auto md:h-[80vh]">
            
            {/* Left Sidebar: Status & Progress */}
            <div className="md:w-80 bg-slate-900/50 border-r border-slate-800 p-8 flex flex-col relative">
                <div className="mb-10">
                    <div className="flex items-center gap-2 mb-2 text-primary-500 animate-pulse">
                        <Terminal size={18} />
                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Bios v3.0</span>
                    </div>
                    <h1 className="text-2xl font-black text-white uppercase italic tracking-tighter">
                        Identity<br/>Initialization
                    </h1>
                </div>

                <div className="space-y-6 relative flex-1">
                    <div className="absolute left-[15px] top-2 bottom-2 w-px bg-slate-800 -z-10"></div>
                    
                    {[
                        { id: 1, label: 'Temporal Coordinates', icon: Calendar },
                        { id: 2, label: 'Delusion Config', icon: Target },
                        { id: 3, label: 'Class Selection', icon: Cpu }
                    ].map((s) => (
                        <div key={s.id} className={`flex items-center gap-4 transition-all duration-500 ${step === s.id ? 'opacity-100 translate-x-2' : step > s.id ? 'opacity-50' : 'opacity-30'}`}>
                            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
                                step === s.id ? 'bg-primary-600 border-primary-500 text-white shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 
                                step > s.id ? 'bg-emerald-500/20 border-emerald-500 text-emerald-500' : 
                                'bg-slate-950 border-slate-800 text-slate-600'
                            }`}>
                                {step > s.id ? <CheckCircle2 size={14} /> : <s.icon size={14} />}
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest">{s.label}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-auto pt-6 border-t border-slate-800/50">
                    <div className="flex items-center gap-3 p-3 bg-slate-950 border border-slate-800 rounded-xl">
                        <Activity className="text-emerald-500" size={16} />
                        <div>
                            <div className="text-[9px] font-black text-slate-500 uppercase tracking-wider">System Integrity</div>
                            <div className="text-xs font-bold text-slate-300">Optimal (For now)</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Content: The Forms */}
            <div className="flex-1 flex flex-col relative">
                
                {/* Scrollable Form Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 md:p-12 relative">
                    
                    {/* STEP 1: YEAR & MODE */}
                    {step === 1 && (
                        <div className="animate-fade-in space-y-10 max-w-2xl mx-auto">
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">When is D-Day?</h2>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wide">Select your deadline. Panic levels adjust accordingly.</p>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                {['2026', '2027', '2028'].map((year) => (
                                    <button
                                        key={year}
                                        onClick={() => setPreferences({ ...preferences, targetYear: year as any })}
                                        className={`group relative h-28 rounded-2xl border flex flex-col items-center justify-center transition-all duration-300 ${
                                            preferences.targetYear === year 
                                            ? 'bg-primary-600 border-primary-400 shadow-[0_0_20px_rgba(var(--color-primary-500),0.4)] translate-y-[-4px]' 
                                            : 'bg-slate-900/40 border-slate-800 hover:border-slate-600 hover:bg-slate-800'
                                        }`}
                                    >
                                        <span className={`text-2xl font-black tracking-tighter ${preferences.targetYear === year ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}`}>
                                            {year}
                                        </span>
                                        <span className={`text-[9px] uppercase font-bold tracking-widest mt-1 ${preferences.targetYear === year ? 'text-primary-200' : 'text-slate-600'}`}>
                                            {year === '2026' ? 'Imminent Doom' : year === '2027' ? 'Procrastination' : 'Zen Mode'}
                                        </span>
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] block text-center">Engagement Protocol</label>
                                <div className="grid grid-cols-1 gap-3">
                                    {[
                                        { id: 'Serious', label: 'Death March', desc: 'No sleep. No social life. Rank or perish.', icon: Skull },
                                        { id: 'Trial', label: 'Tourist', desc: 'Just looking around. Might study, might not.', icon: Map },
                                        { id: 'Foundation', label: 'Builder', desc: 'Slow and steady. Building concepts for next life.', icon: Layers }
                                    ].map((m) => (
                                        <button
                                            key={m.id}
                                            onClick={() => setPreferences({ ...preferences, attemptType: m.id as AttemptType })}
                                            className={`p-4 rounded-2xl border text-left transition-all flex items-center gap-4 group ${
                                                preferences.attemptType === m.id 
                                                ? 'bg-slate-800 border-primary-500 shadow-lg' 
                                                : 'bg-slate-900/30 border-slate-800 hover:bg-slate-900 hover:border-slate-700'
                                            }`}
                                        >
                                            <div className={`p-3 rounded-xl ${preferences.attemptType === m.id ? 'bg-primary-500 text-white' : 'bg-slate-950 text-slate-600'}`}>
                                                <m.icon size={18} />
                                            </div>
                                            <div>
                                                <div className={`text-sm font-black uppercase ${preferences.attemptType === m.id ? 'text-white' : 'text-slate-400'}`}>
                                                    {m.label}
                                                </div>
                                                <div className="text-[10px] text-slate-500 font-bold">{m.desc}</div>
                                            </div>
                                            {preferences.attemptType === m.id && <div className="ml-auto w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 2: TARGETS */}
                    {step === 2 && (
                        <div className="animate-fade-in space-y-10 max-w-2xl mx-auto">
                            <div className="text-center mb-8">
                                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">Define Your Delusion</h2>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wide">Be honest. We won't judge (much).</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { id: 'Top 100 AIR', label: 'God Complex', sub: 'AIR < 100' },
                                    { id: 'IIT Admission', label: 'Standard Dream', sub: 'IIT / IISc' },
                                    { id: 'PSU Job', label: 'Govt Slave', sub: 'PSU / Job' },
                                    { id: 'Qualify Only', label: 'Participation Trophy', sub: 'Qualify' }
                                ].map((goal) => (
                                    <button
                                        key={goal.id}
                                        onClick={() => setPreferences({ ...preferences, primaryGoal: goal.id as TargetGoal })}
                                        className={`p-5 rounded-2xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98] ${
                                            preferences.primaryGoal === goal.id 
                                            ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]' 
                                            : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-600'
                                        }`}
                                    >
                                        <span className="text-xs font-black uppercase tracking-wide block mb-1">{goal.label}</span>
                                        <span className="text-[9px] font-mono opacity-60">{goal.sub}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="bg-slate-900/80 border border-slate-800 p-6 rounded-3xl relative overflow-hidden">
                                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-5"></div>
                                
                                <div className="flex justify-between items-end mb-4 relative z-10">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                                        Delusion Meter
                                    </label>
                                    <div className="text-right">
                                        <span className="text-4xl font-black text-white italic">{preferences.targetMarks}</span>
                                        <span className="text-[10px] text-slate-600 ml-1 font-bold">MARKS</span>
                                    </div>
                                </div>
                                
                                <input 
                                    type="range" min="30" max="100" step="5"
                                    value={preferences.targetMarks}
                                    onChange={(e) => setPreferences({ ...preferences, targetMarks: parseInt(e.target.value) })}
                                    className="w-full h-2 bg-slate-800 rounded-full appearance-none cursor-pointer accent-primary-500 relative z-10 mb-4"
                                />
                                
                                <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/50 flex items-center gap-3">
                                    <Ghost size={16} className="text-slate-500" />
                                    <p className="text-[10px] text-slate-400 font-mono italic">
                                        "{getScoreComment(preferences.targetMarks || 0)}"
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* STEP 3: STREAM */}
                    {step === 3 && (
                        <div className="animate-fade-in space-y-8 max-w-2xl mx-auto">
                            <div className="text-center mb-6">
                                <h2 className="text-3xl font-black text-white uppercase italic tracking-tighter mb-2">Choose Your Weapon</h2>
                                <p className="text-slate-400 text-xs font-bold uppercase tracking-wide">Warning: Changing this later requires paperwork.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                                {Object.values(Stream).map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setSelectedStream(s)}
                                        className={`group p-4 rounded-xl border text-left transition-all relative overflow-hidden ${
                                            selectedStream === s 
                                            ? 'bg-slate-800 border-primary-500 text-white shadow-lg shadow-primary-500/10' 
                                            : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-600 hover:bg-slate-900'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center mb-2 relative z-10">
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${selectedStream === s ? 'text-primary-400' : 'text-slate-600 group-hover:text-slate-500'}`}>
                                                {s.split(' ')[0]}
                                            </span>
                                            {selectedStream === s && <Lock size={12} className="text-primary-500" />}
                                        </div>
                                        <span className="text-xs font-bold leading-tight block relative z-10">
                                            {s}
                                        </span>
                                        {selectedStream === s && (
                                            <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-transparent"></div>
                                        )}
                                    </button>
                                ))}
                            </div>
                            
                            {selectedStream && (
                                <div className="p-4 bg-amber-950/20 border border-amber-900/50 rounded-xl flex gap-3 animate-fade-in">
                                    <AlertTriangle className="text-amber-500 shrink-0" size={16} />
                                    <div className="text-[10px] text-amber-200/80 leading-relaxed font-mono">
                                        <span className="font-bold text-amber-500">CONFIRMATION REQUIRED:</span> You are about to lock your trajectory to {selectedStream}. There is no turning back (mostly).
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="p-6 md:p-8 border-t border-slate-800 bg-slate-900/50 backdrop-blur-md flex justify-between items-center z-20">
                    <button 
                        onClick={() => step > 1 && setStep(step - 1)}
                        className={`text-xs font-black uppercase tracking-[0.2em] transition-colors ${step > 1 ? 'text-slate-500 hover:text-white' : 'text-transparent cursor-default'}`}
                    >
                        Abort
                    </button>

                    <div className="flex gap-1">
                         {[1, 2, 3].map(i => (
                             <div key={i} className={`w-2 h-2 rounded-full transition-all ${step === i ? 'bg-primary-500 scale-125' : step > i ? 'bg-emerald-500' : 'bg-slate-800'}`}></div>
                         ))}
                    </div>

                    <button
                        onClick={handleNext}
                        disabled={loading || (step === 3 && !selectedStream)}
                        className={`
                            relative overflow-hidden group px-8 py-3 rounded-xl text-xs font-black uppercase tracking-[0.2em] transition-all flex items-center gap-2
                            ${loading || (step === 3 && !selectedStream) 
                                ? 'bg-slate-800 text-slate-600 cursor-not-allowed' 
                                : 'bg-primary-600 text-white hover:bg-primary-500 shadow-lg shadow-primary-500/20'}
                        `}
                    >
                        <span>{loading ? 'Initializing...' : step === 3 ? 'Launch' : 'Confirm'}</span>
                        {!loading && <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />}
                    </button>
                </div>

            </div>
         </div>
         
         <div className="mt-8 text-center opacity-40">
            <p className="text-[9px] font-mono text-slate-500 uppercase tracking-[0.3em]">Gateonaut System v1.0.4</p>
         </div>

      </div>
    </div>
  );
};

export default SetupWizard;
