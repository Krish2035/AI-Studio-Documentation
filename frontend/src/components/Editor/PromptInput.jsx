import React from 'react';
import { FileText, Sparkles } from 'lucide-react';

const PromptInput = ({ prompt, setPrompt, disabled }) => {
  const charCount = prompt.length;

  return (
    <div className="h-1/2 flex flex-col bg-slate-900 rounded-xl border border-slate-800 overflow-hidden ring-1 ring-blue-500/20 transition-all focus-within:ring-blue-500/50">
      {/* Header */}
      <div className="px-4 py-2 bg-slate-800/50 border-b border-slate-800 flex justify-between items-center">
        <div className="flex items-center gap-2 text-blue-400 font-bold text-[10px] uppercase tracking-wider">
          <FileText size={12} /> 
          <span>Requirements</span>
        </div>
        <div className="text-[9px] text-slate-500 font-mono">
          {charCount} chars
        </div>
      </div>

      {/* Input Area */}
      <div className="flex-1 relative group">
        <textarea
          className="w-full h-full p-4 bg-transparent outline-none resize-none text-slate-300 text-sm placeholder:text-slate-700 custom-scrollbar disabled:opacity-50"
          placeholder="Describe the logic flow here... (e.g., 'A user logs in, if successful redirect to dashboard, else show error')"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={disabled}
        />
        
        {/* Floating Hint for Empty State */}
        {!prompt && (
          <div className="absolute bottom-4 right-4 pointer-events-none opacity-20 group-hover:opacity-40 transition-opacity">
            <Sparkles size={16} className="text-blue-400" />
          </div>
        )}
      </div>
    </div>
  );
};

export default PromptInput;