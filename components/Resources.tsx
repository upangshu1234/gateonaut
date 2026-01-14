
import React, { useState, useEffect } from 'react';
import { Link, Video, FileText, Plus, Trash2, ExternalLink, Library, Youtube, Shield, Search, Filter, Rocket, Activity, Box, Database, X, Ghost, Save, Globe, ListVideo } from 'lucide-react';
import { persistenceService } from '../services/persistenceService';
import { ResourceLink, Subject } from '../types';
import { PremiumLock } from './PremiumLock';

interface ResourcesPropsWithPremium {
  userId: string;
  subjects: Subject[];
  isPremium?: boolean;
  onUpgrade?: () => void;
}

const Resources: React.FC<ResourcesPropsWithPremium> = ({ userId, subjects, isPremium = false, onUpgrade = () => {} }) => {
  const [resources, setResources] = useState<ResourceLink[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'video' | 'pdf'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [url, setUrl] = useState('');
  const [type, setType] = useState<ResourceLink['type']>('video');
  const [subject, setSubject] = useState(subjects[0]?.name || 'General');

  useEffect(() => {
    persistenceService.getResources(userId).then(setResources);
  }, [userId]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url) return;

    const newRes: ResourceLink = {
      id: Date.now().toString(),
      title,
      url: url.startsWith('http') ? url : `https://${url}`,
      type,
      subject,
      addedAt: new Date().toISOString()
    };

    await persistenceService.saveResource(userId, newRes);
    setResources([newRes, ...resources]);
    setIsModalOpen(false);
    setTitle(''); setUrl('');
  };

  const handleDelete = async (id: string) => {
    if(!window.confirm("Delete this? You probably haven't even opened it yet.")) return;
    await persistenceService.deleteResource(userId, id);
    setResources(resources.filter(r => r.id !== id));
  };

  const getTypeConfig = (t: string) => {
    switch(t) {
      case 'video': return { icon: <Youtube size={18} />, label: "YouTube Uni", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" };
      case 'playlist': return { icon: <ListVideo size={18} />, label: "Binge Mode", color: "text-red-400", bg: "bg-red-500/10 border-red-500/20" };
      case 'pdf': return { icon: <FileText size={18} />, label: "Wall of Text", color: "text-orange-400", bg: "bg-orange-500/10 border-orange-500/20" };
      default: return { icon: <Globe size={18} />, label: "Yap Session", color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20" };
    }
  };

  const filteredResources = resources.filter(r => {
    const matchesFilter = filter === 'all' || (filter === 'video' ? (r.type === 'video' || r.type === 'playlist') : (r.type === 'pdf' || r.type === 'article'));
    const matchesSearch = r.title.toLowerCase().includes(searchQuery.toLowerCase()) || r.subject.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="h-full bg-[#020617] p-6 md:p-10 overflow-y-auto font-mono-tech relative custom-scrollbar">
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 pointer-events-none"></div>
      
      {/* Header */}
      <div className="relative z-10 mb-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-slate-800/50 pb-6">
        <div>
           <div className="flex items-center gap-2 mb-2">
             <span className="bg-primary-500/10 text-primary-400 border border-primary-500/20 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider flex items-center gap-2">
                <Database size={12} /> The Copium Archive
             </span>
           </div>
           <h2 className="text-3xl md:text-4xl font-black text-white italic uppercase tracking-tighter">
             Digital Hoard
           </h2>
           <p className="text-slate-500 text-xs font-bold uppercase tracking-wide mt-1">
             "Stuff you bookmarked and will definitely watch later. (Lie)"
           </p>
        </div>
        
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary-600 hover:bg-primary-500 text-white px-6 py-4 rounded-xl text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:shadow-[0_0_30px_rgba(99,102,241,0.5)] transition-all active:scale-95 group border border-primary-400/50"
        >
          <Save size={16} className="group-hover:-translate-y-0.5 transition-transform" />
          Hoard More
        </button>
      </div>

      {/* Filters */}
      <div className="relative z-10 mb-8 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1 group">
           <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4 group-focus-within:text-primary-400 transition-colors" />
           <input 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             placeholder="FIND THAT ONE VIDEO..."
             className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-4 pl-12 pr-4 text-xs text-white focus:outline-none focus:border-primary-500/50 focus:ring-1 focus:ring-primary-500/50 placeholder:text-slate-600 font-bold uppercase tracking-wide transition-all hover:bg-slate-900"
           />
        </div>
        <div className="flex bg-slate-900/80 border border-slate-800 rounded-xl p-1.5 gap-1">
           {(['all', 'video', 'pdf'] as const).map(t => (
             <button
               key={t}
               onClick={() => setFilter(t)}
               className={`px-5 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${
                 filter === t 
                 ? 'bg-primary-600 text-white shadow-lg' 
                 : 'text-slate-500 hover:text-slate-300 hover:bg-slate-800'
               }`}
             >
               {t === 'all' ? 'All Junk' : t === 'video' ? 'Videos' : 'Scrolls'}
             </button>
           ))}
        </div>
      </div>

      {/* List */}
      <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
         {filteredResources.map((res, index) => {
           const typeConfig = getTypeConfig(res.type);
           return (
             <PremiumLock 
               key={res.id} 
               isPremium={isPremium || index < 3} 
               onUpgrade={onUpgrade} 
               label="Encrypted File" 
               className="rounded-2xl h-full"
             >
                <div className="bg-slate-900/40 border border-slate-800 hover:border-primary-500/30 p-5 rounded-2xl transition-all group relative h-full flex flex-col hover:bg-slate-900/80 hover:shadow-2xl hover:shadow-primary-500/5">
                    
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-2 rounded-lg border ${typeConfig.bg} ${typeConfig.color}`}>
                          {typeConfig.icon}
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button 
                            onClick={() => handleDelete(res.id)} 
                            className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                            title="Purge from existence"
                          >
                              <Trash2 size={14} />
                          </button>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <div className={`text-[9px] font-black uppercase tracking-widest mb-2 ${typeConfig.color} opacity-80`}>
                        {typeConfig.label}
                      </div>
                      <h3 className="text-sm font-bold text-slate-200 mb-2 line-clamp-2 leading-snug group-hover:text-white transition-colors">
                        {res.title}
                      </h3>
                    </div>
                    
                    <div className="pt-4 mt-2 border-t border-slate-800/50 flex items-center justify-between">
                      <span className="text-[9px] font-mono text-slate-600 uppercase">
                          {new Date(res.addedAt).toLocaleDateString(undefined, {month: 'short', day: 'numeric'})}
                      </span>
                      <a 
                        href={res.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-2 text-[9px] font-black text-slate-500 hover:text-primary-400 uppercase tracking-widest transition-colors group/link"
                      >
                        Pretend to Read <ExternalLink size={10} className="group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5 transition-transform" />
                      </a>
                    </div>
                </div>
             </PremiumLock>
           );
         })}
      </div>

      {filteredResources.length === 0 && (
        <div className="col-span-full py-24 flex flex-col items-center justify-center text-center p-8 border border-slate-800 rounded-3xl bg-slate-950/50 relative overflow-hidden group">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(99,102,241,0.03),transparent_70%)] pointer-events-none"></div>
            <div className="scanline opacity-5"></div>
            
            <div className="relative z-10 mb-6">
                <div className="w-24 h-24 bg-slate-900 rounded-full flex items-center justify-center border-4 border-slate-800 group-hover:border-slate-700 transition-colors shadow-2xl">
                    <Box size={40} className="text-slate-700 group-hover:text-slate-500 transition-colors" />
                </div>
                <div className="absolute -bottom-2 -right-2 bg-slate-950 border border-slate-800 px-3 py-1 rounded-full text-[9px] font-black text-slate-500 uppercase tracking-widest">
                    0 Bytes
                </div>
            </div>
            
            <h3 className="text-2xl font-black text-slate-500 uppercase tracking-tighter italic mb-3 group-hover:text-slate-400 transition-colors">
                The Vault is Empty
            </h3>
            <p className="text-xs text-slate-600 font-bold max-w-md mx-auto leading-relaxed uppercase tracking-wide">
                Your resource collection is as barren as your dating life. Add some YouTube playlists you'll definitely "watch later" to feel productive.
            </p>
            
            <div className="mt-8 flex gap-2 opacity-50 pointer-events-none grayscale">
                {[1,2,3].map(i => (
                    <div key={i} className="w-12 h-16 border border-slate-800 rounded bg-slate-900"></div>
                ))}
            </div>
        </div>
      )}

      {/* Add Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4 animate-fade-in">
           <div className="bg-slate-950 border border-primary-500/30 w-full max-w-lg rounded-3xl p-8 relative shadow-[0_0_50px_-10px_rgba(var(--color-primary-500),0.2)] overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent"></div>
              
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="absolute top-6 right-6 text-slate-600 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="mb-8">
                 <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-primary-500/20 rounded-lg text-primary-400">
                       <Plus size={20} />
                    </div>
                    <span className="text-[10px] text-primary-500 font-black uppercase tracking-[0.3em]">Vault Ingestion</span>
                 </div>
                 <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Inject Knowledge</h3>
                 <p className="text-xs text-slate-500 font-bold mt-1">Add to the pile of things you'll "totally study later".</p>
              </div>

              <form onSubmit={handleAdd} className="space-y-6">
                 <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">What is this nonsense called?</label>
                    <input 
                      value={title} onChange={e => setTitle(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/50 transition-all font-bold placeholder:text-slate-700"
                      placeholder="e.g. '100 PYQs in 1 Hour (SCAM)'..."
                      required
                    />
                 </div>
                 <div>
                    <label className="block text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Paste the sacred link</label>
                    <input 
                      value={url} onChange={e => setUrl(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl p-4 text-sm text-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500/50 transition-all font-mono text-xs placeholder:text-slate-700"
                      placeholder="https://youtube.com/..."
                      required
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-5">
                    <div>
                       <label className="block text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Format</label>
                       <select 
                         value={type} onChange={e => setType(e.target.value as any)}
                         className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-primary-500 focus:outline-none font-bold uppercase"
                       >
                          <option value="video">YouTube Video</option>
                          <option value="playlist">Full Playlist</option>
                          <option value="article">Blog / Article</option>
                          <option value="pdf">PDF Document</option>
                       </select>
                    </div>
                    <div>
                       <label className="block text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] mb-2">Category</label>
                       <select 
                         value={subject} onChange={e => setSubject(e.target.value)}
                         className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-white focus:border-primary-500 focus:outline-none font-bold uppercase"
                       >
                          {subjects.map(s => <option key={s.id} value={s.name}>{s.name.substring(0, 20)}...</option>)}
                          <option value="General">General Noise</option>
                       </select>
                    </div>
                 </div>

                 <button 
                   type="submit" 
                   className="w-full bg-primary-600 hover:bg-primary-500 text-white py-4 rounded-xl text-xs font-black uppercase tracking-[0.3em] mt-4 shadow-xl shadow-primary-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 group"
                 >
                    <Save size={16} className="group-hover:animate-bounce" />
                    Save for Later (Never)
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default Resources;
