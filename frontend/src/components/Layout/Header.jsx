import React from 'react';
import { Sparkles, Loader2, Play } from 'lucide-react';

const Header = ({ theme, setTheme, handleGenerate, loading }) => (
  <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center mb-6 gap-4 border-b border-slate-800 pb-5">
    <div className="flex items-center gap-3">
      <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-900/40">
        <Sparkles className="text-white" size={20} />
      </div>
      <div>
        <h1 className="text-xl font-bold tracking-tight italic">Studio Documentation</h1>
        <p className="text-[9px] text-blue-400 font-bold uppercase tracking-[0.2em]">Professional Logic Designer</p>
      </div>
    </div>

    <div className="flex items-center gap-3">
      <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
        {['neutral', 'forest', 'dark'].map((t) => (
          <button 
            key={t}
            onClick={() => setTheme(t)} 
            className={`px-3 py-1 text-[10px] rounded capitalize ${theme === t ? 'bg-slate-700 text-white' : 'text-slate-500'}`}
          >
            {t === 'dark' ? 'Cyber' : t}
          </button>
        ))}
      </div>
      
      <button 
        onClick={handleGenerate} 
        disabled={loading}
        className="flex items-center gap-2 px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 transition-all text-xs font-bold shadow-lg shadow-blue-900/20"
      >
        {loading ? <Loader2 className="animate-spin" size={14} /> : <Play size={14} fill="currentColor" />}
        {loading ? "ANALYZING..." : "GENERATE"}
      </button>
    </div>
  </header>
);

export default Header;