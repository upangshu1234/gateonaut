
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Play, Pause, RotateCcw, Brain, Zap, Volume2, VolumeX, 
  Target, AlertCircle, History, Activity,
  CloudRain, Wind, Waves, Radio, Shield, LayoutGrid, Timer,
  Rocket, X, Lock, Music, Headphones
} from 'lucide-react';
import { persistenceService } from '../services/persistenceService';
import { StudySession } from '../types';

interface FocusModeProps {
  userId: string;
  isPremium: boolean;
  onUpgrade: () => void;
}

const AMBIENCE_STREAMS = [
  { id: 'rain', name: 'Rainy Day Blues', icon: CloudRain, url: 'https://assets.mixkit.co/active_storage/sfx/2418/2418-preview.mp3' },
  { id: 'space', name: 'Void of Silence', icon: Wind, url: 'https://assets.mixkit.co/active_storage/sfx/2405/2405-preview.mp3' },
  { id: 'white', name: 'Fan Noise (Cheap)', icon: Waves, url: 'https://assets.mixkit.co/active_storage/sfx/2391/2391-preview.mp3' },
];

const NIFIX_TRACKS = [
  { id: 'fight', name: 'Fight Back', url: 'https://assets.mixkit.co/music/preview/mixkit-driving-ambition-32.mp3' },
  { id: 'destiny', name: 'Destiny', url: 'https://assets.mixkit.co/music/preview/mixkit-dreaming-big-31.mp3' },
  { id: 'grateful', name: 'Grateful', url: 'https://assets.mixkit.co/music/preview/mixkit-raising-me-higher-34.mp3' },
];

const FocusMode: React.FC<FocusModeProps> = ({ userId, isPremium, onUpgrade }) => {
  const [mode, setMode] = useState<'pomodoro' | 'deep-work' | 'custom'>('pomodoro');
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [customMinutes, setCustomMinutes] = useState(45);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessionHistory, setSessionHistory] = useState<StudySession[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(false);
  
  // Audio State
  const [activeAmbience, setActiveAmbience] = useState<string | null>(null);
  const [activeMusic, setActiveMusic] = useState<string | null>(null);
  
  // HUD Data
  const [intent, setIntent] = useState('');
  const [distractions, setDistractions] = useState(0);
  const [showIntentModal, setShowIntentModal] = useState(true);

  const initialTime = useMemo(() => {
    if (mode === 'pomodoro') return 25 * 60;
    if (mode === 'deep-work') return 90 * 60;
    return customMinutes * 60;
  }, [mode, customMinutes]);

  const breakTime = 5 * 60;
  
  // Audio management
  const ambienceRef = useRef<HTMLAudioElement | null>(null);
  const musicRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    let interval: any;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && isActive) {
      handleComplete();
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  useEffect(() => {
    if (!isActive && !isBreak) setTimeLeft(initialTime);
  }, [initialTime, isActive, isBreak]);

  // Handle Ambience
  useEffect(() => {
    if (activeAmbience && soundEnabled) {
      const stream = AMBIENCE_STREAMS.find(s => s.id === activeAmbience);
      if (stream) {
        if (ambienceRef.current) ambienceRef.current.pause();
        ambienceRef.current = new Audio(stream.url);
        ambienceRef.current.loop = true;
        ambienceRef.current.volume = 0.3;
        ambienceRef.current.play().catch(() => {});
      }
    } else {
      if (ambienceRef.current) {
        ambienceRef.current.pause();
        ambienceRef.current = null;
      }
    }
  }, [activeAmbience, soundEnabled]);

  // Handle Music (Nifix)
  useEffect(() => {
    if (activeMusic && soundEnabled) {
      const track = NIFIX_TRACKS.find(t => t.id === activeMusic);
      if (track) {
        if (musicRef.current) musicRef.current.pause();
        musicRef.current = new Audio(track.url);
        musicRef.current.loop = true;
        musicRef.current.volume = 0.4;
        musicRef.current.play().catch(() => {});
      }
    } else {
      if (musicRef.current) {
        musicRef.current.pause();
        musicRef.current = null;
      }
    }
  }, [activeMusic, soundEnabled]);

  const handleComplete = async () => {
    setIsActive(false);
    
    if (!isBreak) {
      const session: StudySession = {
        id: Date.now().toString(),
        durationMinutes: Math.round(initialTime / 60),
        type: mode,
        timestamp: new Date().toISOString(),
        completed: true,
        intent,
        distractions
      };
      await persistenceService.logSession(userId, session);
      setSessionHistory(prev => [session, ...prev]);
      setIsBreak(true);
      setTimeLeft(breakTime);
    } else {
      setIsBreak(false);
      setTimeLeft(initialTime);
      setShowIntentModal(true);
    }
    setDistractions(0);
  };

  const startSession = () => {
    if (!intent.trim()) {
      alert("You need to at least PRETEND to have a goal.");
      return;
    }
    setShowIntentModal(false);
    setIsActive(true);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleModeChange = (m: 'pomodoro' | 'deep-work' | 'custom') => {
    if (m !== 'pomodoro' && !isPremium) {
      onUpgrade();
      return;
    }
    setMode(m);
  };

  const handleAmbienceToggle = (id: string) => {
    if (!isPremium) {
      onUpgrade();
      return;
    }
    setActiveAmbience(activeAmbience === id ? null : id);
    if (!soundEnabled) setSoundEnabled(true);
  };

  const handleMusicToggle = (id: string) => {
    if (!isPremium) {
      onUpgrade();
      return;
    }
    setActiveMusic(activeMusic === id ? null : id);
    if (!soundEnabled) setSoundEnabled(true);
  };

  const handleSoundToggle = () => {
    if (!isPremium) {
      onUpgrade();
      return;
    }
    setSoundEnabled(!soundEnabled);
  };

  const progress = (( (isBreak ? breakTime : initialTime) - timeLeft) / (isBreak ? breakTime : initialTime)) * 100;
  const strokeDashoffset = 754 - (progress / 100) * 754;

  return (
    <div className="h-full bg-[#020617] flex flex-col lg:flex-row font-mono-tech relative overflow-hidden">
      
      {/* ---------------- BACKGROUND HUD ELEMENTS ---------------- */}
      <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary-500/10 via-transparent to-transparent"></div>
          <div className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%] bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
          
          <div className="absolute top-10 left-10 w-32 h-32 border-t-2 border-l-2 border-primary-500/20"></div>
          <div className="absolute bottom-10 right-10 w-32 h-32 border-b-2 border-r-2 border-primary-500/20"></div>
      </div>

      {/* ---------------- SIDE PANEL: SYSTEM STATUS ---------------- */}
      <div className="w-full lg:w-80 border-r border-slate-800 p-6 md:p-8 flex flex-col gap-8 bg-slate-950/50 backdrop-blur-xl relative z-10 overflow-y-auto custom-scrollbar">
          <div>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
              <Shield size={12} className="text-primary-500" /> Focus Metrics
            </h3>
            <div className="space-y-4">
              <div className="hud-card p-4 border-slate-800/50">
                 <div className="flex justify-between items-center mb-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase">Attention Span</span>
                    <span className="text-xs font-black text-primary-400">{Math.max(0, 100 - distractions * 10)}%</span>
                 </div>
                 <div className="h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                    <div className="h-full bg-primary-500 transition-all duration-500" style={{ width: `${Math.max(0, 100 - distractions * 10)}%` }}></div>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                 <div className="hud-card p-3 border-slate-800/50 flex flex-col items-center">
                    <Activity size={14} className="text-slate-500 mb-1" />
                    <span className="text-sm font-black text-white">{sessionHistory.length}</span>
                    <span className="text-[8px] font-bold text-slate-500 uppercase">Attempts</span>
                 </div>
                 <div className="hud-card p-3 border-slate-800/50 flex flex-col items-center">
                    <AlertCircle size={14} className="text-red-500 mb-1" />
                    <span className="text-sm font-black text-white">{distractions}</span>
                    <span className="text-[8px] font-bold text-slate-500 uppercase">Squirrel Moments</span>
                 </div>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
              <Radio size={12} className="text-emerald-500" /> Ambience Generators
            </h3>
            <div className="space-y-2">
               {AMBIENCE_STREAMS.map(s => (
                 <button
                   key={s.id}
                   onClick={() => handleAmbienceToggle(s.id)}
                   className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all relative overflow-hidden group ${activeAmbience === s.id 
                     ? 'bg-emerald-500/10 border-emerald-500/50 text-emerald-400' 
                     : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                 >
                    <div className="flex items-center gap-3">
                       <s.icon size={14} />
                       {s.name}
                    </div>
                    {activeAmbience === s.id && <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>}
                    {!isPremium && <Lock size={12} className="absolute right-3 text-slate-700 group-hover:text-slate-500" />}
                 </button>
               ))}
            </div>
          </div>

          <div>
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
              <Headphones size={12} className="text-rose-500" /> Adrenaline Injection (Nifix)
            </h3>
            <div className="space-y-2">
               {NIFIX_TRACKS.map(t => (
                 <button
                   key={t.id}
                   onClick={() => handleMusicToggle(t.id)}
                   className={`w-full flex items-center justify-between p-3 rounded-xl border text-xs font-bold transition-all relative overflow-hidden group ${activeMusic === t.id 
                     ? 'bg-rose-500/10 border-rose-500/50 text-rose-400' 
                     : 'bg-slate-900 border-slate-800 text-slate-500 hover:border-slate-700'}`}
                 >
                    <div className="flex items-center gap-3">
                       <Music size={14} className={activeMusic === t.id ? 'animate-bounce' : ''} />
                       {t.name}
                    </div>
                    {activeMusic === t.id && <div className="w-1.5 h-1.5 bg-rose-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(244,63,94,0.8)]"></div>}
                    {!isPremium && <Lock size={12} className="absolute right-3 text-slate-700 group-hover:text-slate-500" />}
                 </button>
               ))}
            </div>
            <p className="text-[9px] text-slate-600 mt-2 font-bold uppercase tracking-wide px-1">
               *Main Character Energy Protocol
            </p>
          </div>
          
          <button 
              onClick={handleSoundToggle}
              className={`w-full py-3 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest border rounded-xl transition-all ${soundEnabled 
                ? 'bg-indigo-600/20 border-indigo-500 text-indigo-400' 
                : 'bg-transparent border-dashed border-slate-700 text-slate-500 hover:text-slate-300'}`}
            >
              {soundEnabled ? <Volume2 size={12} /> : <VolumeX size={12} />}
              Master Audio: {soundEnabled ? 'ONLINE' : 'OFF'}
          </button>

          <div className="mt-auto pt-8 border-t border-slate-800/50">
             <div className="flex items-center gap-2 text-slate-600 mb-4">
                <History size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">Recent Torture Sessions</span>
             </div>
             <div className="space-y-3">
                {sessionHistory.slice(0, 3).map(s => (
                  <div key={s.id} className="text-[10px] text-slate-500 border-l border-primary-500/30 pl-3">
                    <p className="font-bold text-slate-400 truncate">{s.intent}</p>
                    <p className="opacity-60">{s.durationMinutes}m • {s.distractions} Distractions</p>
                  </div>
                ))}
                {sessionHistory.length === 0 && <p className="text-[10px] italic text-slate-700">Go start a session, lazy.</p>}
             </div>
          </div>
      </div>

      {/* ---------------- MAIN HUD: REACTOR CORE ---------------- */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
          
          {/* Reactor Rings Visual */}
          <div className="relative w-72 h-72 md:w-[450px] md:h-[450px] flex items-center justify-center">
              
              {/* Spinning Decoration */}
              <div className={`absolute inset-0 border border-primary-500/10 rounded-full transition-transform duration-1000 ${isActive ? 'animate-[spin_40s_linear_infinite]' : ''}`}>
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-primary-500/20 rounded-full blur-sm"></div>
                 <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-primary-500/20 rounded-full blur-sm"></div>
              </div>
              
              {/* SVG Circular Timer */}
              <svg className="absolute w-full h-full -rotate-90 pointer-events-none">
                 <circle cx="50%" cy="50%" r="44%" className="fill-none stroke-slate-800/40" strokeWidth="2" />
                 <circle 
                   cx="50%" cy="50%" r="44%" 
                   className="fill-none transition-all duration-1000 ease-linear"
                   stroke={isBreak ? '#10b981' : 'rgb(var(--color-primary-500))'}
                   strokeWidth="10"
                   strokeDasharray="754" 
                   strokeDashoffset={strokeDashoffset}
                   strokeLinecap="round"
                   style={{ strokeDasharray: '1250', strokeDashoffset: `${1250 - (progress/100)*1250}` }} // Scaling r=44% to pixels
                 />
              </svg>

              {/* Reactor Status & Core */}
              <div className="relative z-10 flex flex-col items-center text-center px-10">
                  <div className={`flex items-center gap-2 mb-4 px-3 py-1 rounded-full border text-[10px] font-black uppercase tracking-[0.4em] transition-all ${
                    isBreak ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 
                    isActive ? 'bg-primary-500/10 border-primary-500/30 text-primary-400 animate-pulse' :
                    'bg-slate-900 border-slate-800 text-slate-600'
                  }`}>
                    {isBreak ? 'Touching Grass' : isActive ? 'Locked In' : 'Procrastinating'}
                  </div>
                  
                  <div className={`text-7xl md:text-9xl font-black tracking-tighter transition-all duration-700 ${
                    isActive ? 'text-white drop-shadow-[0_0_20px_rgba(var(--color-primary-500),0.6)]' : 'text-slate-700'
                  }`}>
                    {formatTime(timeLeft)}
                  </div>

                  <div className="mt-8 space-y-4 max-w-sm">
                     <div className="flex flex-col items-center">
                        <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1">Current Pretense</span>
                        <p className={`text-sm md:text-lg font-bold uppercase transition-colors line-clamp-2 ${isActive ? 'text-primary-200' : 'text-slate-800'}`}>
                          {intent || 'DOING NOTHING'}
                        </p>
                     </div>
                     
                     {isActive && !isBreak && (
                       <button 
                         onClick={() => setDistractions(prev => prev + 1)}
                         className="px-6 py-2 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white rounded-full text-[10px] font-black uppercase tracking-widest transition-all border border-red-500/30 active:scale-95 flex items-center gap-2 mx-auto"
                       >
                         <AlertCircle size={14} />
                         I Got Distracted
                       </button>
                     )}
                  </div>
              </div>
          </div>

          {/* Controls HUD */}
          <div className="mt-20 flex items-center gap-10">
              <button 
                onClick={() => handleModeChange(mode === 'pomodoro' ? 'deep-work' : mode === 'deep-work' ? 'custom' : 'pomodoro')}
                disabled={isActive}
                className="w-14 h-14 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-center text-slate-500 hover:text-white transition-all disabled:opacity-20 active:scale-90 relative"
                title="Toggle Mode"
              >
                <LayoutGrid size={20} />
                <span className="text-[8px] font-black uppercase mt-1">{mode.slice(0, 4)}</span>
                {!isPremium && <Lock size={10} className="absolute top-1 right-1 text-amber-500" />}
              </button>

              <button 
                onClick={() => isActive ? setIsActive(false) : startSession()}
                className={`w-28 h-28 rounded-3xl flex items-center justify-center transition-all duration-500 group relative ${isActive 
                  ? 'bg-slate-950 border border-primary-500/40 text-primary-400 shadow-[0_0_40px_rgba(var(--color-primary-500),0.3)]' 
                  : 'bg-primary-600 text-white shadow-2xl shadow-primary-500/40 hover:scale-110 active:scale-95'}`}
              >
                <div className={`absolute inset-0 bg-primary-500/20 rounded-3xl blur-xl transition-opacity ${isActive ? 'opacity-100' : 'opacity-0'}`}></div>
                {isActive ? <Pause size={48} className="relative z-10" /> : <Play size={48} className="ml-2 fill-current relative z-10" />}
              </button>

              <button 
                onClick={() => { setIsActive(false); setIsBreak(false); setTimeLeft(initialTime); }}
                className="w-14 h-14 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-center text-slate-500 hover:text-red-400 transition-all active:scale-90"
                title="Reset Core"
              >
                <RotateCcw size={20} />
                <span className="text-[8px] font-black uppercase mt-1">Reset</span>
              </button>
          </div>
      </div>

      {/* ---------------- INTENT CONFIGURATION MODAL ---------------- */}
      {showIntentModal && !isActive && !isBreak && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-xl p-6 animate-fade-in">
           <div className="hud-card p-10 max-w-xl w-full border-primary-500/40 relative overflow-hidden">
              <div className="scanline"></div>
              <div className="flex items-center justify-between mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-primary-600 flex items-center justify-center shadow-2xl shadow-primary-500/30">
                      <Target size={32} className="text-white" />
                  </div>
                  <div>
                      <h3 className="text-2xl font-black text-white italic uppercase tracking-tighter">Mission Prep</h3>
                      <p className="text-[10px] text-primary-400 font-bold uppercase tracking-widest">Don't lie to yourself.</p>
                  </div>
                </div>
                <button onClick={() => setShowIntentModal(false)} className="text-slate-600 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 block">What are you pretending to study?</label>
                    <input 
                      value={intent}
                      onChange={e => setIntent(e.target.value)}
                      placeholder="e.g., Pretending to understand Thermodynamics..."
                      className="w-full bg-slate-900/80 border border-slate-800 rounded-2xl p-5 text-base text-white focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500/30 placeholder:text-slate-700 font-bold"
                    />
                 </div>

                 <div className="space-y-4">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Choose Difficulty</label>
                   <div className="grid grid-cols-3 gap-4">
                      {(['pomodoro', 'deep-work', 'custom'] as const).map(m => (
                        <button
                          key={m}
                          onClick={() => handleModeChange(m)}
                          className={`p-5 rounded-2xl border text-[10px] font-black uppercase transition-all flex flex-col items-center gap-2 relative overflow-hidden ${mode === m 
                            ? 'bg-primary-600/20 border-primary-500 text-primary-400 shadow-[0_0_20px_rgba(var(--color-primary-500),0.2)]' 
                            : 'bg-slate-900 border-slate-800 text-slate-600 hover:border-slate-700'}`}
                        >
                          {m === 'pomodoro' ? <Timer size={20} /> : m === 'deep-work' ? <Brain size={20} /> : <Zap size={20} />}
                          {m === 'pomodoro' ? 'Casual' : m === 'deep-work' ? 'Hardcore' : 'Custom'}
                          {m !== 'pomodoro' && !isPremium && (
                            <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center backdrop-blur-[1px]">
                              <Lock size={12} className="text-amber-500" />
                            </div>
                          )}
                        </button>
                      ))}
                   </div>
                 </div>

                 {mode === 'custom' && (
                   <div className="animate-fade-in space-y-4 p-4 bg-slate-950 rounded-2xl border border-slate-800">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-500 uppercase">Duration (Minutes)</span>
                        <span className="text-xl font-black text-primary-400">{customMinutes}M</span>
                      </div>
                      <input 
                        type="range" min="5" max="180" step="5"
                        value={customMinutes}
                        onChange={e => setCustomMinutes(parseInt(e.target.value))}
                        className="w-full accent-primary-500 h-1.5 bg-slate-800 rounded-full"
                      />
                   </div>
                 )}

                 <div className="flex gap-4 pt-6">
                    <button 
                      onClick={startSession}
                      className="flex-1 bg-primary-600 hover:bg-primary-500 text-white font-black py-5 rounded-2xl text-sm uppercase tracking-[0.4em] transition-all shadow-2xl shadow-primary-500/40 group active:scale-95"
                    >
                      <span className="flex items-center justify-center gap-3">
                        <Rocket size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        Start Suffering
                      </span>
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default FocusMode;
