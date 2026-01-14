
import React, { useState, useMemo } from 'react';
import { Subject, TopicProgress } from '../types';
import { ChevronDown, ChevronRight, BookOpen, RotateCcw, Crosshair, BrainCircuit, Zap, AlertTriangle, Shield, LayoutList, Search, Activity, Lock, Sparkles, Target, Flag, Skull, Coffee } from 'lucide-react';
import { askStudyAssistant, getSyllabusStrategy } from '../services/geminiService';
import { PremiumLock } from './PremiumLock';

interface SyllabusProps {
  syllabus: Subject[];
  onUpdateProgress: (subjectId: string, chapterId: string, topicId: string, progressType: keyof TopicProgress) => void;
  isPremium: boolean;
  onUpgrade: () => void;
}

const Syllabus: React.FC<SyllabusProps> = ({ syllabus, onUpdateProgress, isPremium, onUpgrade }) => {
  const [expandedSubjects, setExpandedSubjects] = useState<Record<string, boolean>>({});
  const [expandedChapters, setExpandedChapters] = useState<Record<string, boolean>>({});
  const [aiModal, setAiModal] = useState<{ isOpen: boolean; topicName: string; content: string; loading: boolean } | null>(null);
  const [strategyBriefing, setStrategyBriefing] = useState<{ isOpen: boolean; content: string; loading: boolean } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const toggleSubject = (id: string) => {
    setExpandedSubjects(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleChapter = (id: string) => {
    setExpandedChapters(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAskAI = async (topicName: string) => {
    if (!isPremium) {
      onUpgrade();
      return;
    }
    setAiModal({ isOpen: true, topicName, content: '', loading: true });
    try {
      const response = await askStudyAssistant(`Explain ${topicName} in detail with key formulas and concepts for GATE. Be sarcastic if it's a simple topic.`);
      setAiModal({ isOpen: true, topicName, content: response, loading: false });
    } catch (e) {
      setAiModal({ isOpen: true, topicName, content: "Error fetching data.", loading: false });
    }
  };

  const handleGenerateStrategy = async () => {
    if (!isPremium) {
      onUpgrade();
      return;
    }
    setStrategyBriefing({ isOpen: true, content: '', loading: true });
    try {
      const stream = "Computer Science"; // Context placeholder
      const daysLeft = 240; 
      const targetMarks = 75;
      
      const strategy = await getSyllabusStrategy(syllabus, stream, daysLeft, targetMarks);
      setStrategyBriefing({ isOpen: true, content: strategy, loading: false });
    } catch (e) {
      setStrategyBriefing({ isOpen: true, content: "Neural core timeout. Try again.", loading: false });
    }
  };

  // Calculate stats for progress bars
  const getSubjectProgress = (sub: Subject) => {
    let total = 0;
    let completed = 0;
    sub.chapters?.forEach(c => c.topics?.forEach(t => {
      total++;
      if (t.progress?.lecture) completed++;
    }));
    return total === 0 ? 0 : Math.round((completed / total) * 100);
  };

  const getProgressComment = (percent: number) => {
    if (percent === 0) return "Untouched (Like grass)";
    if (percent < 25) return "Loading... (Slowly)";
    if (percent < 50) return "Halfway to mediocrity";
    if (percent < 75) return "Actually trying?";
    if (percent < 100) return "Academic Weapon";
    return "Nerd Alert 🚨";
  };

  const weakTopicCount = useMemo(() => {
    let count = 0;
    (syllabus || []).forEach(s => s.chapters?.forEach(c => c.topics?.forEach(t => {
      if (t.progress?.pyqFailed) count++;
    })));
    return count;
  }, [syllabus]);

  const filteredSyllabus = (syllabus || []).map(sub => ({
    ...sub,
    chapters: (sub.chapters || []).map(chap => ({
        ...chap,
        topics: (chap.topics || []).filter(t => t.name.toLowerCase().includes(searchTerm.toLowerCase()))
    })).filter(chap => chap.topics.length > 0 || searchTerm === '')
  })).filter(sub => sub.chapters.length > 0);

  return (
    <div className="min-h-full p-4 md:p-8 space-y-8 max-w-6xl mx-auto pb-24 bg-slate-950 text-slate-200 font-mono-tech">
      
      {/* Header Panel */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-slate-800 pb-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
        
        <div className="w-full relative z-10">
            <div className="flex items-center gap-2 mb-2">
                <span className="bg-primary-500/10 text-primary-400 border border-primary-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-2">
                   <Skull size={12} /> The Syllabus of Suffering
                </span>
                {weakTopicCount > 0 && (
                   <span className="bg-red-500/10 text-red-400 border border-red-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 animate-pulse">
                      <AlertTriangle size={10} /> {weakTopicCount} Skill Issues Detected
                   </span>
                )}
            </div>
            <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight italic uppercase">
              Mission Objectives
            </h2>
            <p className="text-slate-500 text-xs md:text-sm mt-1 max-w-2xl font-bold uppercase tracking-wide">
              "A list of things you pretend to know during placements."
            </p>
        </div>
        
        <div className="w-full md:w-auto flex flex-col items-end gap-3 relative z-10">
            <div className="flex gap-2 w-full md:w-auto">
                <button 
                  onClick={handleGenerateStrategy}
                  className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary-500/20 transition-all border border-primary-400/30 whitespace-nowrap group active:scale-95"
                >
                  {isPremium ? <Sparkles size={14} className="text-amber-300" /> : <Lock size={14} />}
                  Generate Survival Plan
                </button>
                <div className="relative group w-full md:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 group-focus-within:text-primary-400 transition-colors" />
                    <input 
                      type="text" 
                      placeholder="SEARCH FOR TOPICS YOU'LL SKIP..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-9 pr-4 text-xs font-bold text-white focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 transition-all placeholder:text-slate-600 uppercase"
                    />
                </div>
            </div>
        </div>
      </div>

      <div className="space-y-4">
        {filteredSyllabus.map((subject, subIndex) => {
          const progress = getSubjectProgress(subject);
          const isExpanded = expandedSubjects[subject.id];
          const isLocked = !isPremium && subIndex > 1; // Lock 3rd subject onwards for free tier visuals

          return (
            <div key={subject.id} className={`rounded-2xl border transition-all duration-300 overflow-hidden relative ${isExpanded ? 'bg-slate-900/80 border-primary-500/30 shadow-[0_0_30px_-10px_rgba(var(--color-primary-500),0.15)]' : 'bg-slate-900 border-slate-800 hover:border-slate-700'}`}>
              
              {/* Subject Header */}
              <button 
                onClick={() => toggleSubject(subject.id)}
                className="w-full p-5 flex items-center justify-between group relative z-10"
              >
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`p-2.5 rounded-xl transition-colors shrink-0 ${isExpanded ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/40' : 'bg-slate-800 text-slate-500 group-hover:text-slate-300'}`}>
                    {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                  </div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className={`font-black text-lg transition-colors uppercase tracking-tight truncate ${isExpanded ? 'text-white' : 'text-slate-300 group-hover:text-white'}`}>
                          {subject.name}
                      </h3>
                      {isLocked && <Lock size={14} className="text-amber-500 shrink-0" />}
                    </div>
                    
                    {/* Progress Bar with Sarcastic Comment */}
                    <div className="flex items-center gap-3 mt-1.5 w-full max-w-md">
                        <div className="h-2 flex-1 bg-slate-800 rounded-full overflow-hidden border border-slate-700/50">
                            <div 
                              className={`h-full transition-all duration-700 ${
                                progress >= 80 ? 'bg-emerald-500' : 
                                progress >= 40 ? 'bg-primary-500' : 
                                'bg-red-500'
                              }`} 
                              style={{ width: `${progress}%` }}
                            ></div>
                        </div>
                        <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider whitespace-nowrap min-w-[120px]">
                           {getProgressComment(progress)}
                        </span>
                    </div>
                  </div>
                </div>
                <div className="hidden md:block text-[10px] font-black text-slate-600 bg-slate-950 px-3 py-2 rounded-lg border border-slate-800 uppercase tracking-widest shrink-0 ml-4">
                  {subject.chapters?.length || 0} Sectors
                </div>
              </button>

              {/* Chapters List */}
              {isExpanded && (
                <div className="border-t border-slate-800/50 p-2 space-y-2 bg-slate-950/30 relative">
                  {/* Decorative grid */}
                  <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[length:20px_20px] pointer-events-none"></div>

                  {isLocked ? (
                     <div className="p-8">
                         <PremiumLock isPremium={false} onUpgrade={onUpgrade} label="Advanced Modules" className="rounded-xl">
                            <div className="space-y-4 opacity-30 grayscale pointer-events-none select-none filter blur-[1px]">
                                {subject.chapters.slice(0, 3).map(c => (
                                    <div key={c.id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-1.5 h-10 rounded-full bg-slate-700"></div>
                                            <span className="text-lg font-black text-slate-500 uppercase">{c.name}</span>
                                        </div>
                                        <Lock size={16} className="text-slate-600" />
                                    </div>
                                ))}
                            </div>
                         </PremiumLock>
                     </div>
                  ) : (
                    subject.chapters?.map(chapter => (
                        <div key={chapter.id} className="rounded-xl overflow-hidden relative z-10">
                        <button 
                            onClick={() => toggleChapter(chapter.id)}
                            className="w-full p-4 flex items-center gap-4 hover:bg-slate-800/40 transition-colors text-left group"
                        >
                            <div className={`w-1.5 h-10 rounded-full transition-colors ${expandedChapters[chapter.id] ? 'bg-primary-500 shadow-[0_0_10px_rgba(var(--color-primary-500),0.6)]' : 'bg-slate-800 group-hover:bg-slate-700'}`}></div>
                            <span className={`text-xs font-black uppercase tracking-wider ${expandedChapters[chapter.id] ? 'text-primary-200' : 'text-slate-400 group-hover:text-slate-300'}`}>
                              {chapter.name}
                            </span>
                            <div className="flex-1 border-b border-dashed border-slate-800 ml-4 opacity-30 group-hover:opacity-50 transition-opacity"></div>
                            {expandedChapters[chapter.id] ? <ChevronDown size={14} className="text-primary-500" /> : <ChevronRight size={14} className="text-slate-600" />}
                        </button>

                        {expandedChapters[chapter.id] && (
                            <div className="space-y-2 p-2 pl-6">
                            {chapter.topics?.map(topic => (
                                <div key={topic.id} className="group relative flex flex-col xl:flex-row items-start xl:items-center justify-between bg-slate-900 border border-slate-800/80 p-4 rounded-xl hover:border-primary-500/30 hover:bg-slate-800 transition-all gap-4 shadow-sm">
                                
                                {/* Left: Topic Info */}
                                <div className="flex items-start gap-4 flex-1 min-w-0 w-full">
                                    <div className={`mt-1 shrink-0 p-1.5 rounded-lg ${topic.type === 'primary' ? 'bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/30' : 'bg-slate-800/50 text-slate-600'}`}>
                                        {topic.type === 'primary' ? <Zap size={14} fill="currentColor" /> : <Shield size={14} />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 mb-1">
                                            <span className={`text-sm font-bold truncate ${topic.progress?.lecture ? 'text-slate-200 line-through decoration-slate-600 decoration-2' : 'text-slate-300'}`}>
                                                {topic.name}
                                            </span>
                                            {topic.type === 'primary' && <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase font-black tracking-wider">Rank Decider</span>}
                                            {topic.progress?.pyqFailed && <span className="text-[8px] bg-red-500/10 text-red-400 border border-red-500/20 px-1.5 py-0.5 rounded uppercase font-black tracking-wider animate-pulse flex items-center gap-1"><AlertTriangle size={8} /> Skill Issue</span>}
                                        </div>
                                        
                                        <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button 
                                              onClick={() => handleAskAI(topic.name)}
                                              className="text-[9px] flex items-center gap-1.5 text-slate-500 hover:text-primary-400 font-bold uppercase tracking-wider transition-colors"
                                            >
                                                {isPremium ? <BrainCircuit size={10} /> : <Lock size={10} />}
                                                Explain like I'm 5
                                            </button>
                                        </div>
                                    </div>
                                </div>

                                {/* Right: Control Panel (Toggles) */}
                                <div className="flex items-center gap-2 shrink-0 w-full xl:w-auto justify-end border-t border-slate-800/50 xl:border-none pt-3 xl:pt-0">
                                    
                                    {/* LEC Toggle */}
                                    <button
                                    onClick={() => onUpdateProgress(subject.id, chapter.id, topic.id, 'lecture')}
                                    title="Did you watch it at 2x speed?"
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-[10px] font-black tracking-widest transition-all uppercase flex-1 xl:flex-none justify-center ${
                                        topic.progress?.lecture 
                                        ? 'bg-primary-500 text-white border-primary-400 shadow-[0_0_15px_rgba(var(--color-primary-500),0.4)]' 
                                        : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                                    }`}
                                    >
                                        <BookOpen size={12} className={topic.progress?.lecture ? 'text-white' : ''} />
                                        LEC
                                    </button>

                                    {/* REV Toggle */}
                                    <button
                                    onClick={() => onUpdateProgress(subject.id, chapter.id, topic.id, 'revision')}
                                    title="You definitely forgot it already"
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-[10px] font-black tracking-widest transition-all uppercase flex-1 xl:flex-none justify-center ${
                                        topic.progress?.revision 
                                        ? 'bg-fuchsia-600 text-white border-fuchsia-500 shadow-[0_0_15px_rgba(192,38,211,0.4)]' 
                                        : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                                    }`}
                                    >
                                        <RotateCcw size={12} className={topic.progress?.revision ? 'text-white' : ''} />
                                        REV
                                    </button>

                                    {/* PYQ Toggle */}
                                    <button
                                    onClick={() => onUpdateProgress(subject.id, chapter.id, topic.id, 'pyq')}
                                    title="Did you get humbled?"
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-[10px] font-black tracking-widest transition-all uppercase flex-1 xl:flex-none justify-center ${
                                        topic.progress?.pyq 
                                        ? 'bg-emerald-600 text-white border-emerald-500 shadow-[0_0_15px_rgba(5,150,105,0.4)]' 
                                        : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
                                    }`}
                                    >
                                        <Crosshair size={12} className={topic.progress?.pyq ? 'text-white' : ''} />
                                        PYQ
                                    </button>

                                    {/* Fail Toggle (Warning) */}
                                    <button
                                    onClick={() => onUpdateProgress(subject.id, chapter.id, topic.id, 'pyqFailed')}
                                    title="Mark as 'I cooked' vs 'I got cooked'"
                                    className={`p-2 rounded-lg border transition-all ${
                                        topic.progress?.pyqFailed 
                                            ? 'bg-red-500/20 border-red-500 text-red-500 shadow-[0_0_15px_rgba(239,68,68,0.3)] animate-pulse' 
                                            : 'bg-slate-950 border-slate-800 text-slate-700 hover:text-red-400 hover:border-red-900'
                                    }`}
                                    >
                                        <Skull size={14} />
                                    </button>

                                </div>

                                {/* Active Glow Overlay */}
                                {topic.progress?.lecture && topic.progress?.revision && topic.progress?.pyq && (
                                    <div className="absolute inset-0 border border-emerald-500/30 rounded-xl pointer-events-none shadow-[inset_0_0_30px_-15px_rgba(16,185,129,0.2)]"></div>
                                )}
                                </div>
                            ))}
                            </div>
                        )}
                        </div>
                    ))
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* AI Strategy Briefing Modal */}
      {strategyBriefing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in">
          <div className="bg-slate-950 border border-emerald-500/40 rounded-3xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-[0_0_50px_-10px_rgba(16,185,129,0.2)] relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-emerald-500 to-transparent"></div>
            
            <div className="p-8 border-b border-slate-800/50 flex justify-between items-center bg-slate-900/40">
              <div className="flex items-center gap-4">
                 <div className="p-3 bg-emerald-500/20 rounded-2xl text-emerald-400 border border-emerald-500/30 shadow-[0_0_15px_-5px_rgba(16,185,129,0.5)]">
                    <Target size={28} />
                 </div>
                 <div>
                    <h3 className="text-2xl font-black text-white tracking-tighter uppercase italic">Mission Briefing</h3>
                    <div className="flex items-center gap-2 mt-0.5">
                       <span className="text-[10px] text-emerald-500 font-mono uppercase tracking-widest px-2 py-0.5 bg-emerald-500/10 rounded">Generated Strategy</span>
                       <span className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">Protocol: 09-X-IITB</span>
                    </div>
                 </div>
              </div>
              <button 
                onClick={() => setStrategyBriefing(null)}
                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-red-500/20 flex items-center justify-center text-slate-400 hover:text-red-400 transition-all border border-slate-700"
              >
                ✕
              </button>
            </div>
            
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 text-slate-300 leading-relaxed relative bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]">
              {strategyBriefing.loading ? (
                 <div className="flex flex-col items-center justify-center py-20 gap-6">
                   <div className="relative">
                      <div className="w-20 h-20 border-2 border-emerald-500/10 rounded-full"></div>
                      <div className="absolute inset-0 w-20 h-20 border-t-2 border-emerald-500 rounded-full animate-spin"></div>
                      <div className="absolute inset-4 border border-emerald-500/20 rounded-full animate-pulse"></div>
                   </div>
                   <div className="text-center">
                      <p className="text-emerald-400 font-black text-sm uppercase tracking-[0.3em] animate-pulse">Analyzing Your Mistakes</p>
                      <p className="text-slate-600 font-mono text-[10px] mt-2">Computing Survival Chances...</p>
                   </div>
                 </div>
              ) : (
                <div className="prose prose-invert prose-emerald max-w-none prose-headings:italic prose-headings:font-black prose-headings:tracking-tighter prose-headings:uppercase prose-p:text-slate-300 prose-strong:text-emerald-400">
                  <div className="whitespace-pre-wrap font-medium">{strategyBriefing.content}</div>
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-slate-800/50 bg-slate-900/80 flex justify-between items-center">
               <span className="text-[10px] text-slate-600 font-mono uppercase tracking-widest flex items-center gap-2">
                  <Flag size={10} /> Operation Powai 2026
               </span>
               <button 
                 onClick={() => setStrategyBriefing(null)}
                 className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20"
               >
                  I Accept My Fate
               </button>
            </div>
          </div>
        </div>
      )}

      {/* Existing AI Modal */}
      {aiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-950 border border-primary-500/50 rounded-3xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent"></div>
            
            <div className="p-6 border-b border-slate-800/50 flex justify-between items-center bg-slate-900/50 backdrop-blur-md">
              <div className="flex items-center gap-3">
                 <div className="p-2 bg-primary-500/20 rounded-lg text-primary-400 border border-primary-500/30">
                    <BrainCircuit size={20} />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-white tracking-tight">Neural Analysis</h3>
                    <p className="text-xs text-primary-400 font-mono uppercase tracking-wider">Target: {aiModal.topicName}</p>
                 </div>
              </div>
              <button 
                onClick={() => setAiModal(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors border border-slate-700"
              >
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 text-slate-300 leading-relaxed relative">
              <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] opacity-10"></div>
              
              {aiModal.loading ? (
                 <div className="flex flex-col items-center justify-center py-12 gap-4">
                   <div className="relative">
                      <div className="w-12 h-12 border-4 border-slate-800 rounded-full"></div>
                      <div className="absolute inset-0 w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                   </div>
                   <p className="text-primary-400 animate-pulse font-mono text-xs uppercase tracking-widest">Pretending to think...</p>
                 </div>
              ) : (
                <div className="prose prose-invert prose-indigo max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-p:text-slate-300 prose-strong:text-white">
                  <div className="whitespace-pre-wrap">{aiModal.content}</div>
                </div>
              )}
            </div>
            
            <div className="p-3 border-t border-slate-800/50 bg-slate-900/50 text-center">
               <span className="text-[10px] text-slate-600 font-mono uppercase">End of Transmission</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Syllabus;
