import React from 'react';
import { History as HistoryIcon } from 'lucide-react';

const HistorySidebar = ({ history, onSelect }) => (
  <div className="flex-1 bg-slate-900/50 rounded-xl border border-slate-800 flex flex-col overflow-hidden">
    <div className="px-4 py-2 border-b border-slate-800 flex justify-between items-center bg-slate-900/80">
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
        <HistoryIcon size={12}/> History
      </span>
    </div>
    <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
      {history.map((item) => (
        <button 
          key={item._id} 
          onClick={() => onSelect(item)}
          className="w-full text-left p-2 rounded-lg hover:bg-blue-600/10 group transition-all border border-transparent hover:border-blue-500/30"
        >
          <p className="text-xs text-slate-300 truncate font-medium">{item.prompt}</p>
        </button>
      ))}
    </div>
  </div>
);

export default HistorySidebar;