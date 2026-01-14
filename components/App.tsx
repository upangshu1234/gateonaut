import React, { useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/firebase';
import { authService } from '../services/authService';
import { User, Stream, Subject, TopicProgress, StudyProfile, UserPreferences, ThemeColor } from '../types';
import Auth from './Auth';
import Dashboard from './Dashboard';
import Syllabus from './Syllabus';
import Notes from './Notes';
import SetupWizard from './SetupWizard';
import FocusMode from './FocusMode';
import Journal from './Journal';
import Resources from './Resources';
import SubscriptionGate from './SubscriptionGate';
import Settings from './Settings';
import { SYLLABUS_DATA } from '../data/syllabusData';
import { persistenceService } from '../services/persistenceService';
import { userService } from '../services/userService';
import { LayoutDashboard, BookOpen, FileText, Rocket, LogOut, Loader2, Clock, PenTool, Library, Activity, Settings as SettingsIcon, Crown } from 'lucide-react';

// RGB values for themes (50-950)
const THEME_COLORS: Record<ThemeColor, Record<string, string>> = {
  indigo: {
    50: '238 242 255', 100: '224 231 255', 200: '199 210 254', 300: '165 180 252',
    400: '129 140 248', 500: '99 102 241', 600: '79 70 229', 700: '67 56 202',
    800: '55 48 163', 900: '49 46 129', 950: '30 27 75'
  },
  cyan: {
    50: '236 254 255', 100: '207 250 254', 200: '165 243 252', 300: '103 232 249',
    400: '34 211 238', 500: '6 182 212', 600: '8 145 178', 700: '14 116 144',
    800: '21 94 117', 900: '22 78 99', 950: '8 51 68'
  },
  emerald: {
    50: '236 253 245', 100: '209 250 229', 200: '167 243 208', 300: '110 231 183',
    400: '52 211 153', 500: '16 185 129', 600: '5 150 105', 700: '4 120 87',
    800: '6 95 70', 900: '6 78 59', 950: '2 44 34'
  },
  rose: {
    50: '255 241 242', 100: '255 228 230', 200: '254 205 211', 300: '253 164 175',
    400: '251 113 133', 500: '244 63 94', 600: '225 29 72', 700: '190 18 60',
    800: '159 18 57', 900: '136 19 55', 950: '76 5 25'
  },
  amber: {
    50: '255 251 235', 100: '254 243 199', 200: '253 230 138', 300: '252 211 77',
    400: '251 191 36', 500: '245 158 11', 600: '217 119 6', 700: '180 83 9',
    800: '146 64 14', 900: '120 53 15', 950: '69 26 3'
  },
  violet: {
    50: '245 243 255', 100: '237 233 254', 200: '221 214 254', 300: '196 181 253',
    400: '167 139 250', 500: '139 92 246', 600: '124 58 237', 700: '109 40 217',
    800: '91 33 182', 900: '76 29 149', 950: '46 16 101'
  }
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [stream, setStream] = useState<Stream | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'syllabus' | 'notes' | 'focus' | 'journal' | 'resources'>('dashboard');
  const [syllabus, setSyllabus] = useState<Subject[]>([]);
  const [profile, setProfile] = useState<StudyProfile | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [wizardLoading, setWizardLoading] = useState(false);
  const [syncStatus, setSyncStatus] = useState<string>('Initializing Mission Control...');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  const isPremium = profile?.isPaid || false;

  // --- Theme Application ---
  useEffect(() => {
    if (preferences?.themeColor) {
      const colors = THEME_COLORS[preferences.themeColor] || THEME_COLORS.indigo;
      const root = document.documentElement;
      Object.entries(colors).forEach(([shade, value]) => {
        root.style.setProperty(`--color-primary-${shade}`, value as string);
      });
    }
  }, [preferences?.themeColor]);

  // --- 1. Session & Data Auto-Restore ---
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setLoadingData(true);
        setSyncStatus('Restoring Session...');
        const mappedUser = authService.mapUser(firebaseUser);
        setUser(mappedUser);

        try {
          setSyncStatus('Syncing Profile & Preferences...');
          const [userInit, savedStream, savedPrefs] = await Promise.all([
             userService.initializeUser(mappedUser),
             persistenceService.getUserStream(mappedUser.id).catch(() => null),
             persistenceService.getUserPreferences(mappedUser.id).catch(() => null)
          ]) as [{ profile: StudyProfile }, Stream | null, UserPreferences | null];

          setProfile(userInit.profile);
          setPreferences(savedPrefs);

          if (savedStream) {
            setStream(savedStream);
            setSyncStatus(`Loading ${savedStream} Syllabus...`);
            await loadSyllabusData(savedStream as Stream, mappedUser.id);
          }
          setSyncStatus('Finalizing Mission Parameters...');
        } catch (error: any) {
          console.error("Restoration error:", error);
          setSyncStatus('Sync Failed. Local Override Active.');
        } finally {
          setLoadingData(false);
        }
      } else {
        setUser(null);
        setStream(null);
        setSyllabus([]);
        setProfile(null);
        setPreferences(null);
        setSyncStatus('Ready for Launch');
      }
      setInitializing(false);
    });

    return () => unsubscribe();
  }, []);

  const loadSyllabusData = async (currentStream: Stream, userId: string) => {
    const staticData = SYLLABUS_DATA[currentStream] || [];
    setSyllabus(staticData);

    try {
        const progressMap = await persistenceService.getProgress(userId, currentStream);
        
        if (progressMap && Object.keys(progressMap).length > 0) {
            const mergedSyllabus = staticData.map(subject => ({
              ...subject,
              chapters: (subject.chapters || []).map(chapter => ({
                ...chapter,
                topics: (chapter.topics || []).map(topic => {
                    const savedProgress = progressMap[topic.id];
                    return savedProgress ? { ...topic, progress: savedProgress } : topic;
                })
              }))
            }));
            setSyllabus(mergedSyllabus);
        }
    } catch (e) {
        console.warn("Could not fetch progress (offline), keeping static data.");
    }
  };

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleSetupComplete = async (prefs: UserPreferences, selectedStream: Stream) => {
    if (!user) return;
    setWizardLoading(true);

    const prefsWithDefaultTheme = { ...prefs, themeColor: 'indigo' as ThemeColor };
    setPreferences(prefsWithDefaultTheme);
    setStream(selectedStream);
    loadSyllabusData(selectedStream, user.id);

    try {
      await Promise.all([
        persistenceService.saveUserPreferences(user.id, prefsWithDefaultTheme),
        persistenceService.setUserStream(user.id, selectedStream)
      ]);
    } catch (e) {
      console.error("Setup error", e);
    } finally {
      setWizardLoading(false);
    }
  };

  const handleUpdatePreferences = async (newPrefs: Partial<UserPreferences>) => {
    if (!user || !preferences) return;
    const updated = { ...preferences, ...newPrefs };
    setPreferences(updated);
    await persistenceService.saveUserPreferences(user.id, updated);
  };

  const handleLogout = async () => {
    try {
      await authService.logoutUser();
      setActiveTab('dashboard');
      setStream(null);
      setProfile(null);
      setPreferences(null);
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const updateProgress = async (subId: string, chapId: string, topId: string, type: keyof TopicProgress) => {
    if (!user || !stream || !profile) return;

    const updatedSyllabus = syllabus.map(sub => {
      if (sub.id !== subId) return sub;
      return {
        ...sub,
        chapters: (sub.chapters || []).map(chap => {
          if (chap.id !== chapId) return chap;
          return {
            ...chap,
            topics: (chap.topics || []).map(top => {
              if (top.id !== topId) return top;
              const newProgress = { ...top.progress, [type]: !top.progress[type] };
              persistenceService.updateTopicProgress(user.id, stream, top.id, newProgress);
              return { ...top, progress: newProgress };
            })
          };
        })
      };
    });
    setSyllabus(updatedSyllabus);

    if (type !== 'pyqFailed') { 
       try {
           const newProfile = await userService.incrementStreak(user.id, profile);
           setProfile(newProfile);
       } catch (e) { }
    }
  };

  const handleUpgradeSuccess = (newProfile: StudyProfile) => {
    setProfile(newProfile);
    setShowUpgradeModal(false);
  };

  // --- Render Logic ---

  if (initializing || (user && loadingData && !profile)) {
    return (
      <div className="min-h-screen bg-[#020617] flex flex-col items-center justify-center gap-6 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-600/10 rounded-full blur-[120px]"></div>
        <div className="relative group">
            <div className="absolute -inset-4 bg-primary-500/20 rounded-full blur-xl animate-pulse"></div>
            <Loader2 className="w-16 h-16 text-primary-500 animate-spin relative z-10" />
        </div>
        <div className="text-center space-y-2 relative z-10">
          <div className="flex items-center justify-center gap-2 text-primary-400 font-mono text-[10px] uppercase tracking-widest font-black">
            <Activity size={12} className="animate-pulse" />
            System Link Established
          </div>
          <h2 className="text-white text-lg font-black tracking-tight uppercase italic">{syncStatus}</h2>
          <div className="w-48 h-1 bg-slate-800 rounded-full mx-auto overflow-hidden mt-4">
             <div className="h-full bg-primary-500 animate-[loading_2s_ease-in-out_infinite]"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  // --- APP FLOW: SetupWizard -> Main App (with embedded locks) ---
  
  if (!preferences || !stream) {
    return <SetupWizard onComplete={handleSetupComplete} loading={wizardLoading} />;
  }

  return (
    <div className="min-h-screen bg-slate-900 flex text-slate-200 font-sans">
      <aside className="w-64 bg-slate-800 border-r border-slate-700 hidden md:flex flex-col fixed h-full z-20 overflow-y-auto">
        <div className="p-6 border-b border-slate-700 flex items-center gap-3 shrink-0">
          <div className="bg-primary-600 p-2 rounded-lg shadow-lg shadow-primary-500/20">
            <Rocket className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-white tracking-wide">GATEONAUT</h1>
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">Plan. Prep. Prosper.</p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 mt-4">
          <div className="text-xs font-semibold text-slate-500 px-4 mb-2 uppercase tracking-wider">Academics</div>
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'dashboard' ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 translate-x-1' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
          >
            <LayoutDashboard size={20} />
            <span className="font-medium">Mission Control</span>
          </button>
          <button 
             onClick={() => setActiveTab('syllabus')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'syllabus' ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 translate-x-1' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
          >
            <BookOpen size={20} />
            <span className="font-medium">Syllabus</span>
          </button>
          <button 
             onClick={() => setActiveTab('notes')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'notes' ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 translate-x-1' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
          >
            <FileText size={20} />
            <span className="font-medium">Notes</span>
          </button>
          <button 
             onClick={() => setActiveTab('resources')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'resources' ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 translate-x-1' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
          >
            <Library size={20} />
            <span className="font-medium">Vault</span>
          </button>

          <div className="text-xs font-semibold text-slate-500 px-4 mt-6 mb-2 uppercase tracking-wider">Productivity</div>
          <button 
             onClick={() => setActiveTab('focus')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'focus' ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 translate-x-1' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
          >
            <Clock size={20} />
            <span className="font-medium">Focus Mode</span>
          </button>
          <button 
             onClick={() => setActiveTab('journal')}
             className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === 'journal' ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/30 translate-x-1' : 'text-slate-400 hover:bg-slate-700 hover:text-white'}`}
          >
            <PenTool size={20} />
            <span className="font-medium">Reflection</span>
          </button>

          {/* Upgrade Button */}
          {!isPremium && (
            <div className="mt-6 mx-2">
              <button 
                onClick={() => setShowUpgradeModal(true)}
                className="w-full bg-gradient-to-r from-amber-500 to-orange-600 text-white p-4 rounded-2xl shadow-lg shadow-orange-500/20 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                <div className="flex items-center gap-3 relative z-10">
                  <div className="p-2 bg-white/20 rounded-lg">
                    <Crown size={20} className="text-white" />
                  </div>
                  <div className="text-left">
                    <div className="text-xs font-black uppercase tracking-wider">Upgrade</div>
                    <div className="text-[10px] opacity-90">Unlock Full Access</div>
                  </div>
                </div>
              </button>
            </div>
          )}
        </nav>

        <div className="p-4 border-t border-slate-700 bg-slate-800/50 shrink-0">
          <div className="flex items-center gap-3 mb-4 px-2">
            <img src={user.avatarUrl} alt="User" className="w-10 h-10 rounded-full border-2 border-slate-600" />
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-xs text-slate-500 truncate">{stream || 'Unconfigured'}</p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-2">
             <button 
                onClick={() => setIsSettingsOpen(true)}
                className="col-span-1 flex items-center justify-center p-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                title="Settings"
             >
                <SettingsIcon size={16} />
             </button>
             <button 
                onClick={handleLogout}
                className="col-span-3 flex items-center justify-center gap-2 text-slate-400 hover:text-red-400 hover:bg-red-500/10 py-2 rounded-lg transition-colors text-sm bg-slate-900 border border-slate-700"
             >
                <LogOut size={16} />
                <span>Sign Out</span>
             </button>
          </div>
        </div>
      </aside>

      <div className="md:hidden fixed top-0 w-full bg-slate-800 border-b border-slate-700 z-30 p-4 flex justify-between items-center shadow-xl">
        <div className="flex items-center gap-2">
           <Rocket className="text-primary-500 w-6 h-6" />
           <span className="font-bold text-white">GATEONAUT</span>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setActiveTab('dashboard')} className={activeTab === 'dashboard' ? 'text-primary-400' : 'text-slate-400'}><LayoutDashboard /></button>
          <button onClick={() => setActiveTab('notes')} className={activeTab === 'notes' ? 'text-primary-400' : 'text-slate-400'}><FileText /></button>
          <button onClick={() => setActiveTab('focus')} className={activeTab === 'focus' ? 'text-primary-400' : 'text-slate-400'}><Clock /></button>
          <button onClick={() => setIsSettingsOpen(true)} className="text-slate-400"><SettingsIcon /></button>
        </div>
      </div>

      <main className="flex-1 md:ml-64 mt-16 md:mt-0 overflow-y-auto h-screen scroll-smooth bg-slate-900">
        {activeTab === 'dashboard' && profile && preferences && stream && (
            <Dashboard 
                syllabus={syllabus} 
                profile={profile} 
                stream={stream} 
                preferences={preferences} 
                userId={user.id} 
                userName={user.name}
                onNavigate={setActiveTab}
                isPremium={isPremium}
                onUpgrade={() => setShowUpgradeModal(true)}
            />
        )}
        {activeTab === 'syllabus' && (
          <Syllabus 
            syllabus={syllabus} 
            onUpdateProgress={updateProgress}
            isPremium={isPremium}
            onUpgrade={() => setShowUpgradeModal(true)}
          />
        )}
        {activeTab === 'notes' && stream && (
          <Notes 
            streamName={stream} 
            syllabus={syllabus} 
            userId={user.id} 
            isPremium={isPremium}
            onUpgrade={() => setShowUpgradeModal(true)}
          />
        )}
        {activeTab === 'focus' && (
          <FocusMode 
            userId={user.id} 
            isPremium={isPremium}
            onUpgrade={() => setShowUpgradeModal(true)}
          />
        )}
        {activeTab === 'journal' && (
          <Journal 
            userId={user.id}
            isPremium={isPremium}
            onUpgrade={() => setShowUpgradeModal(true)} 
          />
        )}
        {activeTab === 'resources' && (
           <Resources 
              userId={user.id} 
              subjects={syllabus} 
              isPremium={isPremium} 
              onUpgrade={() => setShowUpgradeModal(true)}
           />
        )}
      </main>

      {/* Upgrade Modal */}
      {showUpgradeModal && profile && (
        <SubscriptionGate 
          userId={user.id} 
          profile={profile} 
          onSuccess={handleUpgradeSuccess}
          onClose={() => setShowUpgradeModal(false)}
        />
      )}

      {isSettingsOpen && preferences && (
         <Settings 
            preferences={preferences} 
            onUpdate={handleUpdatePreferences} 
            onClose={() => setIsSettingsOpen(false)} 
         />
      )}
    </div>
  );
};

export default App;