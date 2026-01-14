import React, { useMemo, useState, useEffect } from 'react';
import { Subject, StudyProfile, Stream, UserPreferences } from '../types';
import { 
  Flame, Target, Calendar, Zap, Crown, Swords, AlertTriangle, 
  ChevronRight, BookOpen, Terminal, Activity, BarChart3, Map, Shield,
  Skull, Ghost, Coffee, Hourglass, Siren, TrendingDown, BrainCircuit,
  Lock, Frown, Rocket
} from 'lucide-react';
import { PremiumLock } from './PremiumLock';
import { persistenceService } from '../services/persistenceService';

interface DashboardProps {
  syllabus: Subject[];
  profile: StudyProfile;
  stream: Stream;
  preferences: UserPreferences;
  userId: string;
  userName?: string;
  onNavigate: (tab: 'dashboard' | 'syllabus' | 'notes' | 'focus' | 'journal' | 'resources') => void;
  isPremium: boolean;
  onUpgrade: () => void;
}

const Dashboard: React.FC<DashboardProps> = ({ syllabus, profile, preferences, userId, userName, onNavigate, isPremium, onUpgrade }) => {
  const [activityDates, setActivityDates] = useState<Set<string>>(new Set());

  useEffect(() => {
    persistenceService.getRecentSessions(userId).then(sessions => {
        const dates = new Set(sessions.map(s => new Date(s.timestamp).toLocaleDateString()));
        setActivityDates(dates);
    });
  }, [userId]);

  // --- Statistics Calculation Engine ---
  const stats = useMemo(() => {
    let totalTopics = 0;
    let totalPrimary = 0;
    let lectureDone = 0;
    let primaryDone = 0;
    let pyqDone = 0;
    let weakCount = 0;
    let nextTopic: { sub: string; chap: string; top: string } | null = null;

    const subjectData = (syllabus || []).map(sub => {
      let subTotal = 0;
      let subLec = 0;
      
      sub.chapters?.forEach(chap => {
        chap.topics?.forEach(top => {
          totalTopics++;
          subTotal++;
          if (top.type === 'primary') totalPrimary++;
          if (top.progress?.lecture) {
              lectureDone++;
              subLec++;
              if (top.type === 'primary') primaryDone++;
          } else if (!nextTopic) {
              nextTopic = { sub: sub.name, chap: chap.name, top: top.name };
          }
          if (top.progress?.pyq) {
              pyqDone++;
          }
          if (top.progress?.pyqFailed) {
              weakCount++;
          }
        });
      });

      return {
          id: sub.id,
          name: sub.name,
          progress: subTotal > 0 ? (subLec / subTotal) * 100 : 0,
          total: subTotal
      };
    });

    const overallProgress = totalTopics > 0 ? Math.round((lectureDone / totalTopics) * 100) : 0;
    const currentPotentialMarks = Math.round(overallProgress * 0.85); 

    const today = new Date();
    const examYear = parseInt(preferences.targetYear);
    const examDate = new Date(examYear, 1, 1); 
    const daysLeft = Math.ceil((examDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    return {
        overallProgress,
        currentPotentialMarks,
        daysLeft,
        totalTopics,
        lectureDone,
        pyqDone,
        weakCount,
        subjectData,
        nextTopic
    };
  }, [syllabus, preferences.targetYear]);

  // --- Meme Rank System ---
  const rank = useMemo(() => {
    const p = stats.overallProgress;
    if (p >= 90) return { title: 'Absolute Unit', icon: Crown, color: 'text-amber-400', glow: 'shadow-amber-500/20', border: 'border-amber-500/50', desc: "Please go touch some grass." };
    if (p >= 75) return { title: 'Academic Weapon', icon: Swords, color: 'text-fuchsia-400', glow: 'shadow-fuchsia-500/20', border: 'border-fuchsia-500/50', desc: "Relatives are actually proud." };
    if (p >= 50) return { title: 'Mid-Tier Normie', icon: Activity, color: 'text-emerald-400', glow: 'shadow-emerald-500/20', border: 'border-emerald-500/50', desc: "Better than 90% of engineers." };
    if (p >= 25) return { title: 'Canteen Enjoyer', icon: Coffee, color: 'text-blue-400', glow: 'shadow-blue-500/20', border: 'border-blue-500/50', desc: "At least you started... sort of." };
    return { title: 'Professional Procrastinator', icon: Skull, color: 'text-slate-400', glow: 'shadow-slate-500/20', border: 'border-slate-800', desc: "Cooked. Absolutely cooked." };
  }, [stats.overallProgress]);

  // --- Sarcastic Greetings ---
  const greeting = useMemo(() => {
     const hours = new Date().getHours();
     const isNight = hours < 5 || hours > 22;
     
     if (stats.overallProgress < 5) return "Welcome back. Zero progress detected.";
     if (isNight) return "Sleep is for people with job offers.";
     if (stats.daysLeft < 100) return "Panic mode initialized.";
     return "Ready to pretend to study?";
  }, [stats.overallProgress, stats.daysLeft]);

  // --- Delusion Calculator ---
  const delusionLevel = useMemo(() => {
     const gap = preferences.targetMarks - stats.currentPotentialMarks;
     if (gap > 60) return { text: "Hallucinating", color: "text-red-500" };
     if (gap > 40) return { text: "Highly Delusional", color: "text-orange-500" };
     if (gap > 20) return { text: "Optimistic", color: "text-amber-500" };
     return { text: "Realistic (Boring)", color: "text-emerald-500" };
  }, [preferences.targetMarks, stats.currentPotentialMarks]);

  const renderCalendar = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startingDay = new Date(year, month, 1).getDay();
    
    const days = [];
    for (let i = 0; i < startingDay; i++) days.push(<div key={`pad-${i}`} className="h-6 w-6"></div>);
    
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = new Date(year, month, d).toLocaleDateString();
        const isActive = activityDates.has(dateStr);
        const isToday = d === today.getDate();
        
        days.push(
            <div key={d} className="flex items-center justify-center h-6 w-6 relative group cursor-help">
                {isActive && <div className="absolute inset-0 bg-primary-500/20 rounded-md blur-[2px]"></div>}
                <div className={`h-5 w-5 rounded flex items-center justify-center text-[9px] font-black border transition-all ${isActive ? 'bg-primary-600 text-white border-primary-500' : isToday ? 'bg-slate-800 text-slate-300 border-slate-600' : 'text-slate-800 border-transparent bg-slate-900/50'}`}>
                    {d}
                </div>
                {!isActive && !isToday && d < today.getDate() && (
                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-red-400 text-[8px] px-2 py-1 rounded border border-slate-800 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none">
                        You slacked off.
                    </div>
                )}
            </div>
        );
    }
    
    return (
        <div className="mt-auto pt-6 border-t border-slate-800/50">
            <div className="flex justify-between items-center mb-4">
                <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                    <Calendar size={12} /> The Grid of Shame
                </span>
                <span className="text-[9px] font-bold text-slate-600 uppercase">Consistency? Never heard of her.</span>
            </div>
            <div className="grid grid-cols-7 gap-1.5 opacity-80 hover:opacity-100 transition-opacity">{days}</div>
        </div>
    );
  };

  return (
    <div className="min-h-full p-4 md:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto pb-24 bg-[#020617] relative font-mono-tech">
      
      {/* 1. TOP HUD: PILOT PROFILE */}
      <div className="flex flex-col xl:flex-row gap-6">
        
        {/* Pilot ID Card */}
        <div className={`xl:w-1/3 hud-card p-0 relative overflow-hidden group transition-all duration-500 rounded-3xl border bg-slate-950 ${rank.border} ${rank.glow} flex flex-col`}>
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 pointer-events-none"></div>
            <div className="scanline"></div>
            
            <div className="p-6 relative z-10 flex-1">
                <div className="flex justify-between items-start mb-6">
                    <div className="relative">
                        <div className={`w-20 h-20 rounded-2xl bg-slate-900 border-2 ${rank.border} flex items-center justify-center float shadow-2xl relative overflow-hidden`}>
                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent"></div>
                            <rank.icon className={`${rank.color} w-10 h-10 relative z-10`} />
                        </div>
                        <div className="absolute -bottom-2 -right-2 bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-md text-[8px] font-black uppercase tracking-widest text-slate-400 shadow-xl">
                            Lvl {Math.floor(stats.overallProgress / 10)}
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1 flex items-center justify-end gap-1.5">
                            <Terminal size={10} /> Status
                        </div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-900 rounded-lg border border-slate-800 text-[10px] font-bold text-slate-300 uppercase tracking-wide">
                            <span className={`w-1.5 h-1.5 rounded-full ${stats.overallProgress > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`}></span>
                            {stats.overallProgress > 0 ? 'Barely Functioning' : 'System Dormant'}
                        </div>
                    </div>
                </div>

                <div>
                    <div className="text-[10px] font-bold text-primary-400 uppercase tracking-widest mb-1 flex items-center gap-2 opacity-80">
                        <Ghost size={12} /> {greeting}
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic line-clamp-1 mb-2">
                       {userName || "Subject #404"}
                    </h1>
                    
                    <PremiumLock isPremium={isPremium} onUpgrade={onUpgrade} label="Rank" className="rounded-xl inline-block">
                        <div className="px-3 py-1.5 bg-slate-900/80 rounded-lg border border-slate-800 text-[10px] font-black text-slate-400 uppercase tracking-widest inline-flex items-center gap-2">
                            <Crown size={12} className={rank.color} />
                            {rank.title}
                        </div>
                    </PremiumLock>
                    
                    <div className="mt-6 space-y-3 bg-slate-900/30 p-4 rounded-xl border border-slate-800/50">
                        <div className="flex justify-between text-[10px] text-slate-500 uppercase font-black tracking-wider">
                            <span>Brain Rot Level</span>
                            <span>{100 - stats.overallProgress}%</span>
                        </div>
                        <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800/50">
                            <div className="h-full bg-gradient-to-r from-red-500 via-orange-500 to-emerald-500 rounded-full" style={{ width: `${stats.overallProgress}%` }}></div>
                        </div>
                        <p className="text-[10px] text-center text-slate-500 italic font-medium">"{rank.desc}"</p>
                    </div>
                </div>
            </div>

            <div className="bg-slate-900/50 p-6 border-t border-slate-800 backdrop-blur-sm">
                {renderCalendar()}
            </div>
        </div>

        {/* Mission Control Panel */}
        <div className="flex-1 flex flex-col gap-6">
            
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Delusion Index */}
                <PremiumLock isPremium={isPremium} onUpgrade={onUpgrade} label="Delusion Meter" className="rounded-2xl h-full">
                    <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between h-full group hover:border-red-500/30 transition-all relative overflow-hidden">
                        <div className="absolute -right-4 -top-4 opacity-5 rotate-12 group-hover:opacity-10 transition-opacity"><BrainCircuit size={80} /></div>
                        <div className="flex justify-between items-start mb-2 relative z-10">
                            <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-slate-500 group-hover:text-red-400 transition-colors">
                                <Target size={18} />
                            </div>
                            <span className="text-[9px] font-black uppercase text-slate-600 tracking-widest bg-slate-950 px-2 py-1 rounded">Target: {preferences.targetMarks}</span>
                        </div>
                        <div className="relative z-10">
                            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Delusion Index</div>
                            <div className={`text-lg font-black uppercase tracking-tight ${delusionLevel.color}`}>{delusionLevel.text}</div>
                        </div>
                    </div>
                </PremiumLock>

                {/* Skill Issues */}
                <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between h-full group hover:border-amber-500/30 transition-all relative overflow-hidden">
                     <div className="absolute -right-4 -top-4 opacity-5 rotate-12 group-hover:opacity-10 transition-opacity"><AlertTriangle size={80} /></div>
                     <div className="flex justify-between items-start mb-2 relative z-10">
                        <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-slate-500 group-hover:text-amber-400 transition-colors">
                            <Skull size={18} />
                        </div>
                        {stats.weakCount > 0 && <span className="text-[9px] font-black uppercase text-amber-500 tracking-widest bg-amber-500/10 px-2 py-1 rounded animate-pulse">Critical</span>}
                    </div>
                    <div className="relative z-10">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Skill Issues</div>
                        <div className="text-2xl font-black text-white group-hover:text-amber-400 transition-colors">{stats.weakCount} <span className="text-xs text-slate-600 font-bold">Topics</span></div>
                    </div>
                </div>

                {/* Panic Timer */}
                <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between h-full group hover:border-blue-500/30 transition-all relative overflow-hidden">
                     <div className="absolute -right-4 -top-4 opacity-5 rotate-12 group-hover:opacity-10 transition-opacity"><Hourglass size={80} /></div>
                     <div className="flex justify-between items-start mb-2 relative z-10">
                        <div className="p-2 bg-slate-950 rounded-lg border border-slate-800 text-slate-500 group-hover:text-blue-400 transition-colors">
                            <Siren size={18} />
                        </div>
                    </div>
                    <div className="relative z-10">
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Days to Doom</div>
                        <div className="text-2xl font-black text-white group-hover:text-blue-400 transition-colors">{stats.daysLeft} <span className="text-xs text-slate-600 font-bold">Days</span></div>
                    </div>
                </div>
            </div>

            {/* Next Task & Actions */}
            <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 md:p-8 relative overflow-hidden flex flex-col md:flex-row gap-8">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
                
                {/* Left: Next Task */}
                <div className="md:w-1/2 flex flex-col justify-center relative z-10">
                    <div className="flex items-center gap-2 text-primary-400 mb-6">
                        <Map size={18} className="animate-pulse" />
                        <h2 className="text-xs font-black uppercase tracking-[0.2em]">Recommended Torture</h2>
                    </div>
                    
                    {stats.nextTopic ? (
                      <div className="bg-slate-950 border border-slate-800 hover:border-primary-500/50 rounded-2xl p-6 hover:bg-slate-900 transition-all cursor-pointer group relative overflow-hidden shadow-2xl" onClick={() => onNavigate('syllabus')}>
                        <div className="absolute -right-8 -top-8 opacity-5 rotate-12 group-hover:opacity-10 transition-opacity"><Swords size={120} /></div>
                        
                        <div className="flex items-center gap-2 mb-3">
                            <span className="bg-primary-500/10 text-primary-400 border border-primary-500/20 px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider">
                                Priority Target
                            </span>
                        </div>
                        
                        <div className="text-white font-black text-2xl leading-tight group-hover:text-primary-300 transition-colors relative z-10 mb-2">
                           {stats.nextTopic.top}
                        </div>
                        <div className="text-xs text-slate-500 font-mono font-bold uppercase mb-6 flex items-center gap-2">
                           <Shield size={12} /> {stats.nextTopic.sub}
                        </div>
                        
                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest group-hover:text-white transition-colors">
                            <span>Initiate Protocol</span>
                            <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform text-primary-500" />
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 text-slate-500 text-sm font-bold border-2 border-dashed border-slate-800 rounded-2xl text-center">
                        <p className="mb-2 italic">"Wow, such empty."</p>
                        <p className="text-[10px] uppercase tracking-widest opacity-60">No topics marked. Start pretending.</p>
                      </div>
                    )}
                </div>

                {/* Right: Actions */}
                <div className="md:w-1/2 grid grid-cols-2 gap-4 relative z-10">
                    <button onClick={() => onNavigate('syllabus')} className="flex flex-col items-center justify-center gap-3 p-4 bg-slate-950 rounded-2xl border border-slate-800 hover:border-primary-500/50 transition-all hover:bg-slate-900 group shadow-lg">
                        <div className="p-3 bg-slate-900 rounded-xl group-hover:bg-primary-500/20 group-hover:text-primary-400 transition-colors text-slate-500">
                             <BookOpen size={24} />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white">Choose Poison</span>
                    </button>
                    
                    <button onClick={() => onNavigate('focus')} className="flex flex-col items-center justify-center gap-3 p-4 bg-slate-950 rounded-2xl border border-slate-800 hover:border-amber-500/50 transition-all hover:bg-slate-900 group shadow-lg">
                        <div className="p-3 bg-slate-900 rounded-xl group-hover:bg-amber-500/20 group-hover:text-amber-400 transition-colors text-slate-500">
                             <Zap size={24} />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white">Lock In Mode</span>
                    </button>
                    
                    <button onClick={() => onNavigate('journal')} className="col-span-2 flex flex-row items-center justify-between px-8 py-4 bg-slate-950 rounded-2xl border border-slate-800 hover:border-purple-500/50 transition-all hover:bg-slate-900 group shadow-lg">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-slate-900 rounded-xl group-hover:bg-purple-500/20 group-hover:text-purple-400 transition-colors text-slate-500">
                                <Terminal size={24} />
                            </div>
                            <div className="text-left">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400 block group-hover:text-white">Trauma Dump</span>
                                <span className="text-[8px] font-bold text-slate-600 uppercase">Log your daily failures</span>
                            </div>
                        </div>
                        <ChevronRight size={16} className="text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>
        </div>
      </div>

      {/* 3. SECTOR MASTERY */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
                <BarChart3 className="text-primary-500" size={18} />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Department of Trauma</h3>
            </div>
            <button onClick={() => onNavigate('syllabus')} className="text-[10px] font-bold text-slate-500 hover:text-white transition-colors uppercase tracking-widest flex items-center gap-1 group">
                See All Nightmares <ChevronRight size={10} className="group-hover:translate-x-1 transition-transform" />
            </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {stats.subjectData.slice(0, 8).map((sub, index) => (
                <div key={sub.id} className="relative h-full">
                    <PremiumLock 
                      isPremium={isPremium || index === 0} 
                      onUpgrade={onUpgrade} 
                      label="Subject Data" 
                      className="h-full rounded-2xl"
                    >
                        <div 
                          className="bg-slate-900/40 p-5 border border-slate-800 hover:border-primary-500/30 transition-all group cursor-pointer h-full flex flex-col justify-between rounded-2xl hover:bg-slate-900"
                          onClick={() => onNavigate('syllabus')}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1 min-w-0 pr-4">
                                    <h4 className="text-xs font-black text-slate-300 uppercase tracking-tight line-clamp-1 group-hover:text-white transition-colors">
                                        {sub.name}
                                    </h4>
                                    <div className="text-[9px] font-mono-tech text-slate-600 mt-1 uppercase">{sub.total} Levels of Grief</div>
                                </div>
                                <div className={`text-[9px] font-black px-2 py-1 rounded border uppercase tracking-wider ${
                                    sub.progress >= 75 ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 
                                    sub.progress >= 30 ? 'bg-primary-500/10 text-primary-400 border-primary-500/20' : 
                                    'bg-red-500/10 text-red-400 border-red-500/20'
                                }`}>
                                    {Math.round(sub.progress)}%
                                </div>
                            </div>
                            
                            <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                                <div 
                                  className={`h-full transition-all duration-700 ${sub.progress >= 75 ? 'bg-emerald-500' : sub.progress >= 30 ? 'bg-primary-500' : 'bg-red-500'}`}
                                  style={{ width: `${sub.progress}%` }}
                                ></div>
                            </div>
                            
                            <div className="mt-2 text-[8px] font-bold text-slate-600 uppercase text-right opacity-0 group-hover:opacity-100 transition-opacity">
                                {sub.progress === 0 ? "Cooked" : sub.progress < 50 ? "Raw" : "Medium Rare"}
                            </div>
                        </div>
                    </PremiumLock>
                </div>
            ))}
        </div>
      </div>

      {/* FOOTER STATS RIBBON */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 h-8 bg-slate-950/90 backdrop-blur-md border-t border-slate-800 flex items-center px-6 justify-between text-[9px] font-mono-tech text-slate-600 uppercase tracking-widest z-40">
          <div className="hidden md:flex items-center gap-6">
              <span className="flex items-center gap-2"><Coffee size={10} /> Blood Type: Red Bull</span>
              <span className="flex items-center gap-2"><Frown size={10} /> Social Life: 404</span>
          </div>
          <div className="flex items-center gap-6 ml-auto md:ml-0">
              <span className="flex items-center gap-2 text-primary-500/50"><Activity size={10} /> Gateonaut v3.3.0</span>
              <span className="text-red-500 animate-pulse font-bold flex items-center gap-2"><Siren size={10} /> EXAM APPROACHING</span>
          </div>
      </div>
    </div>
  );
};

export default Dashboard;