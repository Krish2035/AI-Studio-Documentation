import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import mermaid from 'mermaid';
import { toPng } from 'html-to-image';

// Component Imports
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import HistorySidebar from './components/History/HistorySidebar';
import PromptInput from './components/Editor/PromptInput';
import CodeEditor from './components/Editor/CodeEditor';
import DiagramPreview from './components/Viewer/DiagramPreview';

function App() {
  // --- State Management ---
  const [prompt, setPrompt] = useState('');
  const [diagram, setDiagram] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [viewMode, setViewMode] = useState('preview'); // 'preview' or 'code'
  const [theme, setTheme] = useState('neutral');
  const [copied, setCopied] = useState(false);
  
  // --- Refs ---
  const mermaidRef = useRef(null);
  const exportRef = useRef(null);

  // --- Effects ---
  
  // Initialize/Update Mermaid configuration when theme changes
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme,
      securityLevel: 'loose',
      fontFamily: 'Inter, system-ui, sans-serif',
      flowchart: { useMaxWidth: false, htmlLabels: true }
    });
    if (diagram) renderDiagram();
  }, [theme]);

  // Fetch history on initial mount
  useEffect(() => { 
    fetchHistory(); 
  }, []);

  // Re-render diagram whenever the diagram code changes
  useEffect(() => { 
    renderDiagram(); 
  }, [diagram]);

  // --- Logic Handlers ---

  const fetchHistory = async () => {
    try {
      const res = await axios.get('http://localhost:5000/history');
      setHistory(res.data);
    } catch (err) { 
      console.error("Failed to fetch history from server."); 
    }
  };

  const renderDiagram = async () => {
    if (diagram && mermaidRef.current) {
      try {
        mermaidRef.current.innerHTML = '';
        const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, diagram);
        mermaidRef.current.innerHTML = svg;
      } catch (e) { 
        console.error("Mermaid Rendering Error:", e); 
      }
    }
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      const { data } = await axios.post('http://localhost:5000/generate', { prompt });
      setDiagram(data.diagram);
      fetchHistory(); // Refresh history after successful save
    } catch (e) { 
      alert("Backend connection failed. Please ensure the server is running."); 
    } finally { 
      setLoading(false); 
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(diagram);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportAsPng = () => {
    if (!exportRef.current) return;
    toPng(exportRef.current, { backgroundColor: '#ffffff', cacheBust: true })
      .then((url) => {
        const link = document.createElement('a');
        link.download = `logic-export-${Date.now()}.png`;
        link.href = url;
        link.click();
      })
      .catch((err) => console.error("Export failed:", err));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-4 md:p-6 font-sans selection:bg-blue-500/30">
      {/* 1. Modular Header */}
      <Header 
        theme={theme} 
        setTheme={setTheme} 
        handleGenerate={handleGenerate} 
        loading={loading} 
      />

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)]">
        
        {/* Left Column: History & Prompt */}
        <div className="lg:col-span-4 flex flex-col gap-4 overflow-hidden">
          <HistorySidebar 
            history={history} 
            onSelect={(item) => { 
              setPrompt(item.prompt); 
              setDiagram(item.diagramCode); 
            }} 
          />
          
          <PromptInput 
            prompt={prompt} 
            setPrompt={setPrompt} 
            disabled={loading} 
          />
        </div>

        {/* Right Column: Studio Viewer & Code Editor */}
        <div className="lg:col-span-8 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
          
          {/* Studio Navigation & Toolbar */}
          <div className="px-4 py-1 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
            <div className="flex gap-1">
              <button 
                onClick={() => setViewMode('preview')} 
                className={`px-4 py-2 text-[10px] font-bold uppercase transition-all ${viewMode === 'preview' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Preview
              </button>
              <button 
                onClick={() => setViewMode('code')} 
                className={`px-4 py-2 text-[10px] font-bold uppercase transition-all ${viewMode === 'code' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500 hover:text-slate-300'}`}
              >
                Code
              </button>
            </div>

            {/* Quick Actions (Copy/Export) */}
            {diagram && (
              <div className="flex gap-2">
                <button 
                  onClick={copyToClipboard}
                  className="p-2 transition-colors"
                  title="Copy Mermaid Code"
                >
                  {copied ? <Check size={16} className="text-emerald-500"/> : <Copy size={16} className="text-slate-400 hover:text-white"/>}
                </button>
                <button 
                  onClick={exportAsPng} 
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                  title="Export as PNG"
                >
                  <ImageIcon size={16}/>
                </button>
              </div>
            )}
          </div>
          
          {/* Dynamic Content Area */}
          <div className="flex-1 flex overflow-hidden">
            {viewMode === 'preview' ? (
              <DiagramPreview 
                diagram={diagram} 
                mermaidRef={mermaidRef} 
                exportRef={exportRef} 
              />
            ) : (
              <CodeEditor 
                code={diagram} 
                setCode={setDiagram} 
                onCopy={copyToClipboard} 
                copied={copied} 
              />
            )}
          </div>
        </div>
      </main>

      {/* 2. Modular Footer */}
      <Footer modelName="GEMINI_FLASH_2.5" developerName="KRISH PADSHALA" />
    </div>
  );
}

export default App;