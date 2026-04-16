import React from 'react';
import { Sparkles, Palette } from 'lucide-react';

const DiagramPreview = ({ diagram, mermaidRef, exportRef }) => {
  return (
    <div className="flex-1 relative overflow-hidden flex bg-white min-h-[400px]">
      {diagram ? (
        /* The Export Container: Captured by html-to-image */
        <div 
          ref={exportRef} 
          className="w-full h-full p-8 overflow-auto flex items-start justify-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px] bg-slate-50"
        >
          {/* The Mermaid Rendering Target */}
          <div 
            ref={mermaidRef} 
            id="mermaid-render-target"
            className="mermaid-container w-full flex justify-center transition-opacity duration-500 ease-in-out" 
          />
        </div>
      ) : (
        /* Empty State / Welcome Screen */
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 z-10">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-6 border border-slate-700">
              <Palette className="text-slate-500 animate-pulse" size={32} />
            </div>
            <Sparkles 
              className="absolute -top-2 -right-2 text-blue-500 animate-bounce" 
              size={20} 
            />
          </div>
          <h3 className="text-slate-300 font-bold text-sm tracking-widest uppercase">
            Visual Logic Engine Offline
          </h3>
          <p className="text-[10px] text-slate-600 mt-2 uppercase tracking-tighter text-center px-4">
            Enter a description on the left to initialize visualization
          </p>
        </div>
      )}

      {/* Decorative Status Light */}
      {diagram && (
        <div className="absolute top-4 right-4 flex items-center gap-2 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full border border-slate-200 shadow-sm z-20">
          <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[8px] font-bold text-slate-500 uppercase font-mono tracking-widest">
            Live Preview
          </span>
        </div>
      )}

      {/* Standard React CSS injection to fix the 'jsx' attribute warning */}
      <style dangerouslySetInnerHTML={{ __html: `
        .mermaid-container svg {
          max-width: 100% !important;
          height: auto !important;
          display: block;
          margin: 0 auto;
        }
      `}} />
    </div>
  );
};

export default DiagramPreview;