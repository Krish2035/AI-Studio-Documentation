import React from 'react';
import { Code, Copy, Check } from 'lucide-react';

const CodeEditor = ({ code, setCode, onCopy, copied }) => {
  // Split code into lines to generate line numbers
  const lines = code.split('\n');

  return (
    <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
      {/* toolbar */}
      <div className="px-4 py-2 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Code size={14} className="text-emerald-500" />
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
            Source Output
          </span>
        </div>
        <button 
          onClick={onCopy}
          className="flex items-center gap-2 px-2 py-1 rounded hover:bg-slate-800 transition-colors text-[10px] text-slate-400 hover:text-emerald-400 font-bold uppercase"
        >
          {copied ? <Check size={12} /> : <Copy size={12} />}
          {copied ? "Copied!" : "Copy Code"}
        </button>
      </div>

      {/* Editor Area */}
      <div className="flex-1 flex overflow-hidden font-mono text-sm">
        {/* Line Numbers */}
        <div className="w-10 bg-slate-900/50 border-r border-slate-800 text-slate-700 text-right p-4 select-none">
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>

        {/* Textarea */}
        <textarea
          className="flex-1 p-4 bg-transparent outline-none resize-none text-emerald-400 caret-white selection:bg-emerald-500/30 custom-scrollbar"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck="false"
          placeholder="graph TD;..."
        />
      </div>
    </div>
  );
};

export default CodeEditor;