
import React, { useState, useEffect, useMemo } from 'react';
import { 
  PenTool, Calendar, History, TrendingUp, Sparkles, 
  AlertTriangle, Zap, BrainCircuit, Activity, ChevronRight, 
  MessageSquare, RotateCcw, ThumbsUp, ThumbsDown, Target,
  Trash2, ShieldCheck, Cpu, Lock, Skull, Ghost, Terminal,
  Siren, FileX
} from 'lucide-react';
import { persistenceService } from '../services/persistenceService';
import { Reflection } from '../types';
import { PremiumLock } from './PremiumLock';

interface JournalProps {
  userId: string;
  isPremium: boolean;
  onUpgrade: () => void;
}

const SARCASTIC_PROMPTS = [
  "Who hurt you today? (Was it Calculus?)",
  "Rate your imposter syndrome on a scale of 'Student' to 'Fraud'.",
  "How much time did you waste scrolling Reels instead of solving PYQs?",
  "What concept made you question your life choices today?",
  "Did you actually study or just organize your desk for 2 hours?",
  "If your brain was an operating system, what error code is it throwing?",
  "List 3 things you pretended to understand but definitely didn't."
];

const Journal: React.FC<JournalProps> = ({ userId, isPremium, onUpgrade }) => {
  const [reflections, setReflections] = useState<Reflection[]>([]);
  const [wins, setWins] = useState('');
  const [blockers, setBlockers] = useState('');
  const [mood, setMood] = useState(3);
  const [isSaving, setIsSaving] = useState(false);
  const [activePromptIndex, setActivePromptIndex] = useState(0);

  useEffect(() => {
    persistenceService.getReflections(userId).then(setReflections);
    // Randomize initial prompt based on date to keep it somewhat fresh
    setActivePromptIndex(new Date().getDate() % SARCASTIC_PROMPTS.length);
  }, [userId]);

  const cyclePrompt = () => {
    if (!isPremium) {
      onUpgrade();
      return;
    }
    setActivePromptIndex(prev => (prev + 1) % SARCASTIC_PROMPTS.length);
  };

  const handleSubmit = async () => {
    if (!wins.trim() && !blockers.trim()) return;

    setIsSaving(true);
    const newReflection: Reflection = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      wins,
      blockers,
      mood,
      tags: []
    };

    await persistenceService.saveReflection(userId, newReflection);
    setReflections([newReflection, ...reflections]);
    setWins('');
    setBlockers('');
    setMood(3);
    setIsSaving(false);
  };

  const moodTrendData = useMemo(() => {
    return reflections.slice(0, 10).reverse().map(r => ({
      val: r.mood,
      date: new Date(r.date).toLocaleDateString(undefined, { day: 'numeric', month: 'short' })
    }));
  }, [reflections]);

  const getSanityLabel = (m: number) => {
    switch(m) {
      case 5: return { text: 'God Complex', color: 'text-emerald-400', border: 'border-emerald-500', bg: 'bg-emerald-500/10' };
      case 4: return { text: 'Actually Functional', color: 'text-blue-400', border: 'border-blue-500', bg: 'bg-blue-500/10' };
      case 3: return { text: 'NPC Mode', color: 'text-slate-400', border: 'border-slate-500', bg: 'bg-slate-500/10' };
      case 2: return { text: 'Brain Rot', color: 'text-orange-400', border: 'border-orange-500', bg: 'bg-orange-500/10' };
      default: return { text: 'Vegetative State', color: 'text-red-500', border: 'border-red-500', bg: 'bg-red-500/10' };
    }
  };

  return (
    <div className="h-full flex flex-col lg:flex-row bg-[#020617] font-mono-tech relative overflow-hidden text-slate-200">
      
      {/* ---------------- LEFT PANEL: THE BLACK BOX ---------------- */}
      <div className="flex-1 flex flex-col p-4 md:p-8 overflow-y-auto custom-scrollbar relative z-10">
         <div className="max-w-4xl mx-auto w-full space-y-8">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-6 border-b border-slate-800 pb-6">
               <div>
                  <div className="flex items-center gap-2 mb-2 text-red-500 animate-pulse">
                     <Activity size={14} />
                     <span className="text-[10px] font-black uppercase tracking-[0.3em]">Recording in Progress</span>
                  </div>
                  <h2 className="text-3xl md:text-5xl font-black text-white italic uppercase tracking-tighter">
                    Daily Damage Report
                  </h2>
                  <p className="text-slate-500 text-xs font-bold uppercase tracking-wide mt-1">
                    "Documentation of your struggle is required for insurance purposes."
                  </p>
               </div>
               
               <div className="flex flex-col items-end">
                  <div className="text-[10px] font-black text-slate-600 uppercase tracking-widest bg-slate-950 px-3 py-1 rounded border border-slate-800">
                    Log Date: {new Date().toLocaleDateString(undefined, { month: 'numeric', day: 'numeric', year: '2-digit' })}
                  </div>
               </div>
            </div>

            {/* AI Interrogator */}
            <div className="bg-slate-900/50 border border-primary-500/30 rounded-2xl p-6 md:p-8 relative group overflow-hidden">
                <div className="scanline opacity-10"></div>
                <div className="absolute top-0 left-0 w-1 h-full bg-primary-500"></div>
                
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-slate-950 border border-primary-500/30 rounded-lg text-primary-400">
                            <Terminal size={20} />
                        </div>
                        <span className="text-[10px] font-black text-primary-500 uppercase tracking-[0.2em]">The Interrogation</span>
                    </div>
                    <button onClick={cyclePrompt} className="text-slate-600 hover:text-white transition-colors">
                        {isPremium ? <RotateCcw size={16} /> : <Lock size={16} />}
                    </button>
                </div>
                
                <p className="text-lg md:text-2xl font-bold text-slate-200 italic leading-snug">
                   "{SARCASTIC_PROMPTS[activePromptIndex]}"
                </p>
            </div>

            {/* Input Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Wins / Copium */}
                <div className="flex flex-col h-full bg-slate-950/30 border border-slate-800 rounded-2xl p-1 focus-within:border-emerald-500/50 transition-colors">
                    <div className="flex items-center justify-between p-4 pb-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500 flex items-center gap-2">
                            <Zap size={12} /> Rare Ws / Copium
                        </span>
                    </div>
                    <textarea 
                       value={wins}
                       onChange={(e) => setWins(e.target.value)}
                       className="flex-1 w-full bg-transparent border-none focus:ring-0 text-slate-300 text-sm p-4 h-40 resize-none font-medium leading-relaxed placeholder:text-slate-700"
                       placeholder="List the one thing you didn't screw up today..."
                    />
                </div>

                {/* Blockers / Skill Issues */}
                <div className="flex flex-col h-full bg-slate-950/30 border border-slate-800 rounded-2xl p-1 focus-within:border-red-500/50 transition-colors">
                    <div className="flex items-center justify-between p-4 pb-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-red-500 flex items-center gap-2">
                            <Skull size={12} /> Skill Issues / Meltdowns
                        </span>
                    </div>
                    <textarea 
                       value={blockers}
                       onChange={(e) => setBlockers(e.target.value)}
                       className="flex-1 w-full bg-transparent border-none focus:ring-0 text-slate-300 text-sm p-4 h-40 resize-none font-medium leading-relaxed placeholder:text-slate-700"
                       placeholder="Detail your failures. Be specific."
                    />
                </div>
            </div>

            {/* Sanity Meter (Footer Control) */}
            <div className="pt-6 border-t border-slate-800/50 flex flex-col xl:flex-row items-center justify-between gap-8">
                
                <div className="flex flex-col gap-3 w-full xl:w-auto">
                    <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Sanity Integrity</span>
                        <span className={`text-[10px] font-black uppercase tracking-widest ${getSanityLabel(mood).color}`}>
                            {getSanityLabel(mood).text}
                        </span>
                    </div>
                    <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map(m => {
                            const styles = getSanityLabel(m);
                            return (
                                <button
                                    key={m}
                                    onClick={() => setMood(m)}
                                    className={`h-12 flex-1 xl:w-16 rounded-lg border-2 transition-all flex items-center justify-center relative overflow-hidden group ${
                                        mood === m 
                                        ? `${styles.bg} ${styles.border} ${styles.color} shadow-lg scale-105 z-10` 
                                        : 'bg-slate-900 border-slate-800 text-slate-600 hover:border-slate-600'
                                    }`}
                                >
                                    <span className="relative z-10 font-black text-lg">
                                        {m === 1 ? '💀' : m === 5 ? '⚡' : m}
                                    </span>
                                    {mood === m && <div className={`absolute inset-0 opacity-20 ${styles.bg} animate-pulse`}></div>}
                                </button>
                            )
                        })}
                    </div>
                </div>

                <button 
                  onClick={handleSubmit}
                  disabled={isSaving || (!wins && !blockers)}
                  className="w-full xl:w-auto px-10 py-4 bg-primary-600 hover:bg-primary-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-xl shadow-primary-500/20 active:scale-95 group border border-primary-500/50 flex items-center justify-center gap-3"
                >
                   {isSaving ? <Cpu className="animate-spin" size={16} /> : <ShieldCheck size={16} />}
                   {isSaving ? 'ENCRYPTING SHAME...' : 'COMMIT LOG TO ARCHIVE'}
                </button>

            </div>
         </div>
      </div>

      {/* ---------------- RIGHT PANEL: ARCHIVES OF SHAME ---------------- */}
      <div className="w-full lg:w-[420px] border-l border-slate-800 bg-slate-950 flex flex-col overflow-hidden relative">
         <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>

         {/* Chart Section - Locked */}
         <PremiumLock isPremium={isPremium} onUpgrade={onUpgrade} label="Mental Stability Chart" className="border-b border-slate-800 bg-slate-900/50">
           <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em]">Mental Stability</h3>
                  <TrendingUp size={14} className="text-emerald-500" />
              </div>
              
              <div className="h-32 flex items-end gap-1.5 px-2 relative">
                 {/* Decorative line */}
                 <div className="absolute top-1/2 w-full h-px bg-slate-800 border-t border-dashed border-slate-700/50"></div>

                 {moodTrendData.map((d, i) => (
                   <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-help">
                     <div 
                       className={`w-full rounded-sm transition-all duration-700 relative ${
                         d.val >= 4 ? 'bg-emerald-500' : 
                         d.val >= 3 ? 'bg-primary-500' : 
                         'bg-red-500'
                       }`}
                       style={{ height: `${d.val * 20}%`, opacity: 0.6 + (i/20) }}
                     >
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-900 border border-slate-700 px-2 py-1 rounded text-[8px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-20">
                           Sanity: {d.val}/5
                        </div>
                     </div>
                   </div>
                 ))}
                 {moodTrendData.length === 0 && (
                     <div className="absolute inset-0 flex items-center justify-center text-[10px] uppercase text-slate-600 font-bold tracking-widest">
                         No Data Found
                     </div>
                 )}
              </div>
           </div>
         </PremiumLock>

         {/* List Section */}
         <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-950/80">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
               <History size={12} /> Archives of Shame
            </h3>

            <div className="space-y-4">
               {reflections.map((ref) => {
                 const moodConfig = getSanityLabel(ref.mood);
                 return (
                   <div key={ref.id} className="p-5 border border-slate-800 bg-slate-900/40 hover:bg-slate-900 hover:border-slate-700 transition-all rounded-xl group relative overflow-hidden">
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${moodConfig.bg.replace('/10', '')}`}></div>
                      
                      <div className="flex items-center justify-between mb-3 pl-2">
                         <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                           {new Date(ref.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                         </span>
                         <div className={`px-2 py-0.5 rounded text-[8px] font-black uppercase border border-current ${moodConfig.color}`}>
                           {moodConfig.text}
                         </div>
                      </div>
                      
                      <div className="space-y-2 pl-2">
                        {ref.wins && (
                          <div className="flex gap-2 items-start">
                             <Zap size={10} className="text-emerald-500 mt-0.5 shrink-0" />
                             <p className="text-[10px] text-slate-300 line-clamp-2 leading-relaxed font-medium opacity-80">{ref.wins}</p>
                          </div>
                        )}
                        {ref.blockers && (
                          <div className="flex gap-2 items-start">
                             <Skull size={10} className="text-red-500 mt-0.5 shrink-0" />
                             <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed font-medium">{ref.blockers}</p>
                          </div>
                        )}
                      </div>
                   </div>
                 );
               })}
               
               {reflections.length === 0 && (
                 <div className="mt-6 p-8 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-950/50 flex flex-col items-center text-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
                    
                    <div className="relative z-10 transform group-hover:-translate-y-1 transition-transform duration-500">
                        <div className="w-20 h-20 bg-slate-900 rounded-2xl flex items-center justify-center mb-6 border border-slate-800 shadow-[0_0_30px_rgba(0,0,0,0.5)] rotate-3 group-hover:rotate-0 transition-transform duration-300">
                            <FileX size={32} className="text-slate-700 group-hover:text-slate-500 transition-colors" />
                        </div>
                    </div>
                    
                    <h3 className="text-lg font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">
                        Tabula Rasa
                    </h3>
                    <p className="text-[10px] text-slate-500 font-bold max-w-xs leading-relaxed uppercase tracking-wide relative z-10">
                        No entries found. Are you actually happy, or just repressing everything? Start logging your daily breakdowns for future analysis.
                    </p>
                 </div>
               )}
            </div>
         </div>

         {/* AI Analysis - Locked */}
         <PremiumLock isPremium={isPremium} onUpgrade={onUpgrade} label="Trauma Analysis" className="border-t border-slate-800">
             <div className="p-6 bg-slate-900">
                <div className="flex items-center gap-2 mb-2 text-primary-400">
                    <BrainCircuit size={16} />
                    <span className="text-[10px] font-black uppercase tracking-widest">AI Trauma Analysis</span>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                    <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                       <span className="text-red-400 font-bold">WARNING:</span> Frequent mentions of "Procrastination" detected. Correlation with low Sanity levels is 85%. Recommendation: Touch grass immediately.
                    </p>
                </div>
             </div>
         </PremiumLock>

      </div>

    </div>
  );
};

export default Journal;
