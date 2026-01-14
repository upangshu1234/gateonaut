
import React, { useState } from 'react';
import { Mail, Lock, ArrowRight, Loader2, AlertCircle, CheckSquare, Square, Rocket, ExternalLink, ShieldAlert } from 'lucide-react';
import { authService } from '../services/authService';
import { User } from '../types';
import { setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import { auth } from '../firebase/firebase';

interface AuthProps {
  onLogin: (user: User) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rememberMe, setRememberMe] = useState(true);

  const isDomainError = error?.includes('DOMAIN_UNAUTHORIZED');

  const configurePersistence = async () => {
    try {
      await setPersistence(auth, rememberMe ? browserLocalPersistence : browserSessionPersistence);
    } catch (e) {
      console.warn("Persistence not supported in this environment");
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setIsLoading(true);
    await configurePersistence();
    
    try {
      const user = await authService.loginWithGoogle();
      onLogin(user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStandardAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setError(null);
    setIsLoading(true);
    await configurePersistence();

    try {
      const user = isLoginMode 
        ? await authService.loginWithEmail(email, password)
        : await authService.signupWithEmail(email, password);
      
      onLogin(user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[url('https://images.unsplash.com/photo-1517976487492-5750f3195933?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center relative p-4">
      {/* Dark Overlay with Indigo Tint for GATEONAUT Feel */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm bg-gradient-to-t from-slate-950 via-slate-950/80 to-indigo-900/30"></div>
      
      <div className="relative z-10 bg-slate-900/90 p-6 md:p-8 rounded-3xl shadow-2xl border border-indigo-500/20 max-w-md w-full animate-fade-in backdrop-blur-md">
        
        {/* Header Logo Area */}
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-600 p-4 rounded-2xl shadow-[0_0_40px_-5px_rgba(79,70,229,0.5)] border border-indigo-400/50 transform -rotate-3 hover:rotate-0 transition-transform duration-300">
            <Rocket className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
        </div>
        
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-1 tracking-tighter uppercase italic">GATEONAUT</h1>
          <p className="text-indigo-400 text-[10px] uppercase tracking-[0.3em] font-bold mb-2">Plan. Prep. Prosper.</p>
          <p className="text-slate-400 text-sm font-medium">Ignite your path to technical excellence.</p>
        </div>

        {error && (
          <div className={`mb-6 p-4 rounded-xl border flex flex-col gap-3 ${isDomainError ? 'bg-amber-950/30 border-amber-500/50 text-amber-200' : 'bg-red-950/30 border-red-500/50 text-red-200'}`}>
            <div className="flex items-start gap-3">
              <AlertCircle size={20} className={`shrink-0 mt-0.5 ${isDomainError ? 'text-amber-400' : 'text-red-400'}`} />
              <div className="text-sm">
                <span className="font-bold block mb-1">{isDomainError ? 'Domain Access Required' : 'Authorization Error'}</span>
                {error}
              </div>
            </div>
            
            {isDomainError && (
              <div className="mt-2 p-3 bg-slate-950/50 rounded-lg border border-amber-500/20">
                <p className="text-[11px] font-bold uppercase mb-2 text-amber-400 flex items-center gap-1">
                  <ShieldAlert size={12} /> Resolution Steps:
                </p>
                <ol className="text-[11px] space-y-1 list-decimal ml-4 opacity-80">
                  <li>Visit <a href="https://console.firebase.google.com" target="_blank" className="underline hover:text-white inline-flex items-center gap-0.5">Firebase Console <ExternalLink size={8} /></a></li>
                  <li>Go to <strong>Authentication</strong> {'>'} <strong>Settings</strong></li>
                  <li>Select <strong>Authorized Domains</strong></li>
                  <li>Add your domain: <code>{window.location.hostname}</code></li>
                </ol>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleStandardAuth} className="space-y-4 mb-6">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-slate-500 ml-1 tracking-widest">Entry ID (Email)</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-700 disabled:opacity-50"
                placeholder="cadet@gateonaut.com"
                required
                disabled={isLoading}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-slate-500 ml-1 tracking-widest">Security Key</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)} 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3.5 pl-10 pr-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all placeholder:text-slate-700 disabled:opacity-50"
                placeholder="••••••••"
                required
                minLength={6}
                disabled={isLoading}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 cursor-pointer group py-1" onClick={() => setRememberMe(!rememberMe)}>
             {rememberMe ? <CheckSquare size={16} className="text-indigo-500" /> : <Square size={16} className="text-slate-600 group-hover:text-slate-400" />}
             <span className="text-xs text-slate-500 select-none group-hover:text-slate-400 transition-colors">Keep me logged in on this terminal</span>
          </div>

          <button 
            type="submit"
            disabled={isLoading}
            className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-900/50 disabled:cursor-not-allowed text-white font-bold py-4 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-xl shadow-indigo-500/20 group mt-4 overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                <span className="tracking-widest uppercase">{isLoginMode ? 'Launch Mission' : 'Join Command'}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-black tracking-[0.3em]">
            <span className="px-3 bg-slate-900 text-slate-600">Unified Access</span>
          </div>
        </div>

        <button 
          type="button"
          onClick={handleGoogleLogin}
          disabled={isLoading}
          className="w-full bg-slate-950 border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white disabled:opacity-50 font-bold py-3.5 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-inner"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin text-slate-400" />
          ) : (
            <>
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 grayscale opacity-50 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
              <span className="text-xs uppercase tracking-widest">Connect with Google</span>
            </>
          )}
        </button>

        <p className="mt-8 text-center text-xs text-slate-500 font-medium">
          {isLoginMode ? "First time cadet? " : "Already registered? "}
          <button 
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setError(null);
            }}
            className="text-indigo-400 hover:text-indigo-300 font-black hover:underline focus:outline-none uppercase tracking-widest ml-1"
            disabled={isLoading}
          >
            {isLoginMode ? "Start Journey" : "Return to Post"}
          </button>
        </p>
      </div>
    </div>
  );
};

export default Auth;
