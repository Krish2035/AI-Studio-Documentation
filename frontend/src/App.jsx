import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import mermaid from 'mermaid';
import { toPng } from 'html-to-image';
import { Check, Copy, Image as ImageIcon } from 'lucide-react';

// Component Imports
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import HistorySidebar from './components/History/HistorySidebar';
import PromptInput from './components/Editor/PromptInput';
import CodeEditor from './components/Editor/CodeEditor';
import DiagramPreview from './components/Viewer/DiagramPreview';

// --- API CONFIGURATION ---
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [prompt, setPrompt] = useState('');
  const [diagram, setDiagram] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [viewMode, setViewMode] = useState('preview');
  const [theme, setTheme] = useState('neutral');
  const [copied, setCopied] = useState(false);
  
  const mermaidRef = useRef(null);
  const exportRef = useRef(null);

  // 1. Initialize Mermaid once
  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: theme === 'neutral' ? 'dark' : theme, // Match your UI theme
      securityLevel: 'loose',
      fontFamily: 'Inter, system-ui, sans-serif',
      flowchart: { useMaxWidth: false, htmlLabels: true }
    });
  }, [theme]);

  // 2. Fetch history on mount
  useEffect(() => { 
    fetchHistory(); 
  }, []);

  // 3. Trigger render whenever diagram OR viewMode changes
  // We include viewMode because if you switch tabs, the Ref might need a refresh
  useEffect(() => { 
    if (viewMode === 'preview') {
      renderDiagram(); 
    }
  }, [diagram, viewMode]);

  const fetchHistory = async () => {
    try {
      const res = await axios.get(`${API_BASE}/history`);
      setHistory(res.data);
    } catch (err) { 
      console.error("Backend unreachable at:", API_BASE); 
    }
  };

  const renderDiagram = async () => {
    // Crucial: Wait for the next tick to ensure mermaidRef.current exists in DOM
    setTimeout(async () => {
      if (diagram && mermaidRef.current) {
        try {
          mermaidRef.current.innerHTML = ''; // Clear previous content
          const id = `mermaid-svg-${Math.random().toString(36).substr(2, 9)}`;
          
          // Generate SVG using mermaid.render
          const { svg } = await mermaid.render(id, diagram);
          
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = svg;
          }
        } catch (e) { 
          console.error("Mermaid Syntax Error:", e);
          if (mermaidRef.current) {
            mermaidRef.current.innerHTML = `<div class="text-red-500 p-4 text-xs font-mono">Invalid Mermaid Syntax. Check 'Code' tab.</div>`;
          }
        }
      }
    }, 100);
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setDiagram(''); // Clear old diagram while loading
    try {
      const { data } = await axios.post(`${API_BASE}/generate`, { prompt });
      
      // Update state
      setDiagram(data.diagram);
      setViewMode('preview'); // Force switch to preview
      fetchHistory(); 
    } catch (e) { 
      console.error("Generation Error:", e);
      alert("Failed to connect to backend. Ensure server is running on port 5000."); 
    } finally { setLoading(false); }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(diagram);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportAsPng = () => {
    if (!exportRef.current) return;
    toPng(exportRef.current, { 
        backgroundColor: '#0f172a', // Matches slate-900
        cacheBust: true,
        style: { padding: '20px' } 
    })
      .then((url) => {
        const link = document.createElement('a');
        link.download = `logic-export-${Date.now()}.png`;
        link.href = url;
        link.click();
      })
      .catch(err => console.error("Export failed:", err));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 p-4 md:p-6 font-sans">
      <Header theme={theme} setTheme={setTheme} handleGenerate={handleGenerate} loading={loading} />

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-200px)]">
        {/* Sidebar and Input */}
        <div className="lg:col-span-4 flex flex-col gap-4 overflow-hidden">
          <HistorySidebar 
            history={history} 
            onSelect={(item) => { 
                setPrompt(item.prompt); 
                setDiagram(item.diagramCode); 
                setViewMode('preview');
            }} 
          />
          <PromptInput prompt={prompt} setPrompt={setPrompt} disabled={loading} />
        </div>

        {/* Main Viewer Area */}
        <div className="lg:col-span-8 bg-slate-900 rounded-2xl border border-slate-800 shadow-2xl flex flex-col overflow-hidden">
          <div className="px-4 py-1 bg-slate-800 border-b border-slate-700 flex justify-between items-center">
            <div className="flex gap-1">
              <button 
                onClick={() => setViewMode('preview')} 
                className={`px-4 py-2 text-[10px] font-bold uppercase transition-all ${viewMode === 'preview' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500'}`}
              >
                Preview
              </button>
              <button 
                onClick={() => setViewMode('code')} 
                className={`px-4 py-2 text-[10px] font-bold uppercase transition-all ${viewMode === 'code' ? 'text-blue-400 border-b-2 border-blue-400' : 'text-slate-500'}`}
              >
                Code
              </button>
            </div>
            
            {diagram && (
              <div className="flex gap-2">
                <button onClick={copyToClipboard} className="p-2 transition-colors hover:bg-slate-700 rounded">
                  {copied ? <Check size={16} className="text-emerald-500"/> : <Copy size={16} className="text-slate-400"/>}
                </button>
                <button onClick={exportAsPng} className="p-2 text-slate-400 transition-colors hover:bg-slate-700 rounded">
                  <ImageIcon size={16}/>
                </button>
              </div>
            )}
          </div>

          <div className="flex-1 flex overflow-hidden relative bg-dot-pattern">
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

      {/* Updated modelName to reflect your switch to Groq/Llama */}
      <Footer modelName="GROQ // LLAMA 3.3" developerName="KRISH PADSHALA" />
    </div>
  );
}

export default App;