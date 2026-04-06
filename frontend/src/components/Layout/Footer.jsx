import React from 'react';

const Footer = ({ modelName = "GEMINI_FLASH_2.5", developerName = "KRISH PADSHALA" }) => {
  return (
    <footer className="max-w-7xl mx-auto mt-6 flex flex-col md:flex-row justify-between items-center text-[8px] text-slate-600 font-mono border-t border-slate-900 pt-4 pb-2">

      {/* Centered Branding */}
      <div className="flex justify-center items-center italic mb-2 md:mb-0">
        <span className="tracking-widest opacity-80">
          DEVELOPED BY: KRISH PADSHALA
        </span>
      </div>

      {/* System Status Indicator */}
      <div className="flex items-center gap-2 bg-slate-900/50 px-3 py-1 rounded-full border border-slate-800/50">
        <div className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </div>
        <span className="tracking-tighter uppercase">
          SYSTEM ONLINE // {modelName}
        </span>
      </div>
    </footer>
  );
};

export default Footer;