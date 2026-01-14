
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Note, NoteType, NotePriority, Subject, Attachment } from '../types';
import { 
  FileText, Plus, Trash2, Wand2, Search, Filter, 
  Lightbulb, Sigma, AlertTriangle, BookOpen, Clock, 
  MoreVertical, CheckCircle2, ChevronRight, Paperclip, 
  ImageIcon, FileIcon, X, Loader2,
  Cloud, CloudOff, Activity, ShieldCheck, Terminal, Cpu,
  Sparkles, Lock, Skull, Brain, Ghost, Zap
} from 'lucide-react';
import { persistenceService } from '../services/persistenceService';
import { generateNoteContent } from '../services/geminiService';
import { uploadService } from '../services/uploadService';
import { PremiumLock } from './PremiumLock';

interface NotesProps {
  streamName: string;
  syllabus: Subject[];
  userId: string;
  isPremium: boolean;
  onUpgrade: () => void;
}

const Notes: React.FC<NotesProps> = ({ streamName, syllabus, userId, isPremium, onUpgrade }) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [loadingAI, setLoadingAI] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | NoteType>('all');
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const loadNotes = async () => {
      const fetchedNotes = await persistenceService.getNotes(userId);
      setNotes(fetchedNotes);
    };
    loadNotes();
  }, [userId]);

  const debouncedSave = useCallback((noteToSave: Note) => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    setIsSaving(true);
    saveTimeoutRef.current = setTimeout(async () => {
      await persistenceService.saveNote(userId, noteToSave);
      setIsSaving(false);
    }, 1500);
  }, [userId]);

  const updateActiveNote = (updates: Partial<Note>) => {
    if (!activeNote) return;
    const updatedNote = { ...activeNote, ...updates, lastModified: new Date().toISOString() };
    setActiveNote(updatedNote);
    setNotes(prevNotes => prevNotes.map(n => n.id === updatedNote.id ? updatedNote : n));
    debouncedSave(updatedNote);
  };

  const createNote = async () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'New Mental Breakdown',
      content: '',
      subject: syllabus.length > 0 ? syllabus[0].name : 'General',
      type: 'general',
      priority: 'medium',
      tags: [],
      attachments: [],
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    setNotes([newNote, ...notes]);
    setActiveNote(newNote);
    await persistenceService.saveNote(userId, newNote);
  };

  const deleteNote = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (!window.confirm("Yeet this knowledge into the void?")) return;
    setNotes(notes.filter(n => n.id !== id));
    if (activeNote?.id === id) setActiveNote(null);
    await persistenceService.deleteNote(userId, id);
  };

  const handleAIGenerate = async () => {
    if (!isPremium) {
      onUpgrade();
      return;
    }
    if (!activeNote) return;
    setLoadingAI(true);
    const context = `${activeNote.subject} - ${activeNote.type}`;
    const content = await generateNoteContent(activeNote.title + ` (${context})`, streamName);
    updateActiveNote({ content: (activeNote.content ? activeNote.content + '\n\n' : '') + content });
    setLoadingAI(false);
  };

  const getTypeConfig = (type: NoteType) => {
    switch(type) {
      case 'formula': return { icon: <Sigma size={14} />, label: "Hieroglyphics", color: "text-purple-400" };
      case 'mistake': return { icon: <Skull size={14} />, label: "Skill Issues", color: "text-red-400" };
      case 'concept': return { icon: <Brain size={14} />, label: "Big Brain Energy", color: "text-amber-400" };
      default: return { icon: <Ghost size={14} />, label: "Random Yapping", color: "text-slate-400" };
    }
  };

  const getPriorityBorder = (p: NotePriority) => {
    switch(p) {
      case 'high': return 'border-red-500/40 shadow-[inset_4px_0_0_0_rgba(239,68,68,0.5)]';
      case 'medium': return 'border-primary-500/40 shadow-[inset_4px_0_0_0_rgba(99,102,241,0.5)]';
      case 'low': return 'border-slate-800 shadow-[inset_4px_0_0_0_rgba(148,163,184,0.2)]';
    }
  };

  const filteredNotes = useMemo(() => {
    return notes.filter(n => {
      const matchesSearch = n.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            n.subject.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = filterType === 'all' || n.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [notes, searchQuery, filterType]);

  return (
    <div className="h-screen max-h-screen flex bg-[#020617] text-slate-200 overflow-hidden font-mono-tech">
      
      {/* ---------------- LEFT PANEL: HUD LIST ---------------- */}
      <div className="w-[400px] border-r border-slate-800 flex flex-col bg-slate-950/20 backdrop-blur-xl relative z-20">
        <div className="scanline"></div>
        
        {/* Header Section */}
        <div className="p-6 border-b border-slate-800 space-y-5">
          <div className="flex items-center justify-between">
            <div>
                <h2 className="text-xl font-black text-white tracking-tighter flex items-center gap-2 italic uppercase">
                <FileText className="w-5 h-5 text-primary-500" />
                The Archives
                </h2>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Grimoire of Pain</p>
            </div>
            <button 
              onClick={createNote}
              title="Add new hallucination"
              className="bg-primary-600 hover:bg-primary-500 text-white p-2 rounded-xl transition-all shadow-lg shadow-primary-500/20 border border-primary-400/50 active:scale-95 hover:rotate-90 duration-300"
            >
              <Plus size={20} />
            </button>
          </div>

          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 group-focus-within:text-primary-400 transition-colors" />
            <input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="SEARCH YOUR INCOMPETENCE..."
              className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-3 pl-10 pr-3 text-xs text-white focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 placeholder:text-slate-600 font-bold uppercase tracking-wide"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
            {['all', 'concept', 'formula', 'mistake', 'general'].map(type => {
                const config = type === 'all' ? { label: 'ALL TRASH', icon: null } : getTypeConfig(type as NoteType);
                return (
                <button
                    key={type}
                    onClick={() => setFilterType(type as any)}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black border transition-all uppercase tracking-widest flex items-center gap-1.5 whitespace-nowrap ${filterType === type 
                    ? 'bg-primary-500/20 border-primary-500/50 text-primary-300 shadow-[0_0_10px_rgba(var(--color-primary-500),0.2)]' 
                    : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300 hover:border-slate-600'}`}
                >
                    {config.icon}
                    {config.label}
                </button>
                );
            })}
          </div>
        </div>

        {/* Notes List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-3">
          {filteredNotes.length === 0 ? (
            <div className="text-center mt-20 opacity-30 flex flex-col items-center">
              <Brain className="w-16 h-16 mb-4 animate-pulse text-slate-600" />
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">No thoughts, head empty.</p>
              <p className="text-[9px] text-slate-600 mt-2">Start typing before you forget everything.</p>
            </div>
          ) : (
            filteredNotes.map((note, index) => {
              const typeConfig = getTypeConfig(note.type);
              return (
                <PremiumLock 
                    key={note.id} 
                    isPremium={isPremium || index < 3} 
                    onUpgrade={onUpgrade} 
                    label="Encrypted File" 
                    className="rounded-xl"
                >
                    <div 
                        onClick={() => setActiveNote(note)}
                        className={`group p-4 rounded-xl border transition-all cursor-pointer relative bg-slate-900/40 hover:bg-slate-900 ${getPriorityBorder(note.priority)} ${
                        activeNote?.id === note.id ? 'border-primary-500/50 bg-slate-900' : 'border-slate-800 hover:border-slate-700'
                        } ${!isPremium && index >= 3 ? 'pointer-events-none' : ''}`}
                    >
                        <div className="flex justify-between items-start mb-2">
                            <h4 className={`font-black text-xs uppercase tracking-tight line-clamp-1 italic ${activeNote?.id === note.id ? 'text-primary-300' : 'text-slate-300 group-hover:text-white'}`}>
                                {note.title || "UNTITLED DISASTER"}
                            </h4>
                            {note.priority === 'high' && <span className="text-[8px] bg-red-500/10 text-red-400 px-1.5 py-0.5 rounded uppercase font-black tracking-wider animate-pulse">Critical</span>}
                        </div>
                        
                        <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-2">
                                <span className={`flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider ${typeConfig.color}`}>
                                    {typeConfig.icon} {typeConfig.label}
                                </span>
                            </div>
                            <span className="text-[9px] text-slate-600 font-mono">
                                {new Date(note.lastModified).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                        </div>

                        <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button 
                                onClick={(e) => deleteNote(e, note.id)}
                                title="Yeet into void"
                                className="p-1.5 text-slate-600 hover:text-red-400 transition-colors bg-slate-950 rounded-lg border border-slate-800"
                            >
                                <Trash2 size={12} />
                            </button>
                        </div>
                    </div>
                </PremiumLock>
              );
            })
          )}
        </div>
      </div>

      {/* ---------------- RIGHT PANEL: NEURAL EDITOR ---------------- */}
      <div className="flex-1 flex flex-col bg-[#020617] relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
        
        {activeNote ? (
          <>
            {/* Metadata Ribbon */}
            <div className="h-16 border-b border-slate-800 flex items-center justify-between px-8 bg-slate-950/80 backdrop-blur-md z-10 sticky top-0">
               <div className="flex items-center gap-6">
                  <div className="relative group">
                    <select 
                      value={activeNote.subject}
                      onChange={(e) => updateActiveNote({ subject: e.target.value })}
                      className="appearance-none bg-transparent text-[10px] font-black text-primary-400 uppercase tracking-widest cursor-pointer focus:outline-none pr-5 hover:text-white transition-colors"
                    >
                      <option value="General">System Wide</option>
                      {syllabus.map(s => <option key={s.id} value={s.name}>{s.name.toUpperCase()}</option>)}
                    </select>
                    <ChevronRight className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 text-slate-600 pointer-events-none" />
                  </div>

                  <div className="h-4 w-px bg-slate-800"></div>

                  <div className="flex bg-slate-900/50 rounded-lg p-1 border border-slate-800">
                    {(['concept', 'formula', 'mistake', 'general'] as NoteType[]).map(t => {
                        const config = getTypeConfig(t);
                        return (
                            <button
                                key={t}
                                onClick={() => updateActiveNote({ type: t })}
                                title={config.label}
                                className={`p-1.5 rounded-md transition-all ${activeNote.type === t ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-600 hover:text-slate-400'}`}
                            >
                                {config.icon}
                            </button>
                        );
                    })}
                  </div>

                  <div className="h-4 w-px bg-slate-800"></div>

                  <div className="flex gap-1">
                     {(['low', 'medium', 'high'] as NotePriority[]).map(p => (
                        <button
                            key={p}
                            onClick={() => updateActiveNote({ priority: p })}
                            className={`w-3 h-3 rounded-full border border-slate-800 transition-all ${activeNote.priority === p 
                                ? (p === 'high' ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]' : p === 'medium' ? 'bg-primary-500 shadow-[0_0_10px_rgba(99,102,241,0.5)]' : 'bg-slate-500')
                                : 'bg-slate-900 hover:bg-slate-800'}`}
                            title={`Priority: ${p.toUpperCase()}`}
                        />
                     ))}
                  </div>
               </div>

               <div className="flex items-center gap-4">
                  <span className="text-[9px] font-bold flex items-center gap-2">
                    {loadingAI ? (
                       <span className="flex items-center gap-2 text-primary-400 animate-pulse">
                          <Activity size={10} /> PRETENDING TO THINK...
                       </span>
                    ) : isSaving ? (
                        <span className="flex items-center gap-2 text-slate-500">
                          <Cloud size={10} className="animate-bounce" /> SYNCING...
                        </span>
                    ) : (
                       <span className="flex items-center gap-2 text-emerald-500/60 uppercase tracking-widest">
                         <ShieldCheck size={10} /> SECURE
                       </span>
                    )}
                  </span>
                  
                  <button 
                    onClick={handleAIGenerate}
                    disabled={loadingAI}
                    className="flex items-center gap-2 px-4 py-2 bg-primary-600/10 hover:bg-primary-600 text-primary-400 hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-primary-500/30 group shadow-lg shadow-primary-500/10 active:scale-95"
                  >
                    {isPremium ? <Sparkles size={12} className="group-hover:rotate-12 transition-transform" /> : <Lock size={12} />}
                    Cheat with AI
                  </button>
               </div>
            </div>

            {/* Editor Area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col relative">
               <div className="max-w-4xl mx-auto w-full flex flex-col py-12 px-10 min-h-full">
                  <input 
                    value={activeNote.title}
                    onChange={(e) => updateActiveNote({ title: e.target.value })}
                    className="bg-transparent text-4xl md:text-5xl font-black text-white placeholder:text-slate-800 focus:outline-none mb-6 italic uppercase tracking-tighter"
                    placeholder="ENTER SCREAM TITLE..."
                  />

                  <div className="h-[2px] w-full bg-gradient-to-r from-primary-500/50 via-slate-800 to-transparent mb-10"></div>
                  
                  <textarea 
                    value={activeNote.content}
                    onChange={(e) => updateActiveNote({ content: e.target.value })}
                    className="flex-1 bg-transparent text-slate-300 resize-none focus:outline-none leading-relaxed text-sm placeholder:text-slate-800 min-h-[500px] font-mono"
                    placeholder={`> INITIATE LOG SEQUENCE...\n\n> Document your failures here.\n> Paste code you don't understand.\n> Cry about thermodynamics.`}
                  />
               </div>
            </div>

            <div className="h-8 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between px-6 text-[9px] font-black text-slate-600 uppercase tracking-[0.2em] z-10 select-none">
               <div className="flex gap-6">
                  <span>CHAR COUNT: {activeNote.content.length}</span>
                  <span>ID: {activeNote.id.slice(-6)}</span>
               </div>
               <span className="text-primary-500/50">ENCRYPTION: AES-256 (HOPEFULLY)</span>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-700 p-8 animate-fade-in relative">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500/5 rounded-full blur-[100px]"></div>
             
             <div className="w-32 h-32 bg-slate-900/50 border border-slate-800 rounded-3xl flex items-center justify-center mb-8 relative group overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-primary-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <Terminal size={48} className="text-primary-500/40 group-hover:scale-110 transition-transform duration-500" />
               <div className="absolute inset-0 animate-[pulse_4s_ease-in-out_infinite] border border-primary-500/20 rounded-3xl"></div>
             </div>
             
             <h2 className="text-3xl font-black text-white mb-3 uppercase tracking-tighter italic">Station Standby</h2>
             <p className="text-slate-500 text-center max-w-sm mb-10 text-xs font-bold leading-relaxed tracking-wide">
               SELECT A FILE TO PRETEND YOU ARE WORKING OR INITIALIZE A NEW LOG TO DOCUMENT YOUR SUFFERING.
             </p>
             
             <button 
               onClick={createNote}
               className="px-10 py-4 bg-slate-900 hover:bg-primary-600 text-primary-400 hover:text-white font-black rounded-xl text-xs transition-all border border-slate-800 hover:border-primary-400 shadow-xl uppercase tracking-[0.3em] flex items-center gap-3 group"
             >
               <Zap size={16} className="group-hover:fill-current" />
               Initialize Entry
             </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notes;
