import React, { useState, useEffect } from 'react';
import { DropZone } from './components/DropZone';
import { LoadingScreen } from './components/LoadingScreen';
import { TransitionSelector } from './components/TransitionSelector';
import { ImageFile, AppStatus, AspectRatio, TransitionStyleId } from './types';
import { generateTransitionPrompt, generateVeoVideo } from './services/gemini';
import { Wand2, AlertCircle, Download, RefreshCw, Film, ArrowRight, Settings2, Sparkles, Terminal } from 'lucide-react';

const App: React.FC = () => {
  const [startImage, setStartImage] = useState<ImageFile | null>(null);
  const [endImage, setEndImage] = useState<ImageFile | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<TransitionStyleId>('FLY_FLOW');
  const [customPrompt, setCustomPrompt] = useState<string>('');
  const [status, setStatus] = useState<AppStatus>('IDLE');
  const [prompt, setPrompt] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [hasKey, setHasKey] = useState<boolean>(false);

  useEffect(() => {
    const checkKey = async () => {
      if (process.env.API_KEY && process.env.API_KEY !== '') {
        setHasKey(true);
        return;
      }
      if (window.aistudio) {
        try {
          const selected = await window.aistudio.hasSelectedApiKey();
          if (selected) setHasKey(true);
        } catch (e) {
          console.error(e);
        }
      }
    };
    checkKey();
  }, []);

  const handleApiKeySelection = async () => {
    if (window.aistudio) {
      window.aistudio.openSelectKey();
      setHasKey(true);
      setError(null);
    } else {
      setError("Please ensure process.env.API_KEY is configured.");
    }
  };

  const handleGenerate = async () => {
    if (!startImage || !endImage) return;
    if (selectedStyle === 'CUSTOM' && !customPrompt.trim()) {
      setError("Please enter a custom transition description.");
      return;
    }
    setError(null);

    if (!hasKey) {
      await handleApiKeySelection();
      return;
    }

    try {
      setStatus('ANALYZING');
      const generatedPrompt = await generateTransitionPrompt(
        startImage, 
        endImage, 
        selectedStyle, 
        selectedStyle === 'CUSTOM' ? customPrompt : undefined
      );
      setPrompt(generatedPrompt);
      
      setStatus('GENERATING');
      const url = await generateVeoVideo(generatedPrompt, startImage, endImage, aspectRatio);
      setVideoUrl(url);
      
      setStatus('COMPLETE');
    } catch (err: any) {
      console.error(err);
      setStatus('ERROR');
      setError(err.message || "Something went wrong. Try again.");
    }
  };

  const resetApp = () => {
    setStatus('IDLE');
    setVideoUrl(null);
    setPrompt(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-blue-500/30 overflow-x-hidden">
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 group cursor-default">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:rotate-[15deg] transition-transform duration-500">
              <Film size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 tracking-tight leading-none">
                VIBESHIFT
              </h1>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.25em]">AI Cinema Lab</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {!hasKey && (
               <button 
                 onClick={handleApiKeySelection}
                 className="text-[10px] font-black tracking-widest text-blue-400 bg-blue-400/10 px-4 py-2 rounded-full border border-blue-400/20 hover:bg-blue-400/20 transition-all"
               >
                 CONNECT PROJECT
               </button>
            )}
            <div className="hidden md:flex items-center gap-2 text-slate-500 text-xs">
              <Sparkles size={14} className="text-amber-400 animate-pulse" />
              <span className="font-medium">Veo 3.1 & Gemini 3 Pro</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 pb-24">
        {!hasKey && (
          <div className="mb-12 p-8 rounded-[2rem] bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50 flex flex-col items-center text-center backdrop-blur-sm shadow-2xl">
            <h2 className="text-2xl font-black mb-3">AI Cinematic Pipeline</h2>
            <p className="text-slate-400 max-w-lg mb-8 text-sm">
              VibeShift utilizes high-end spatial reasoning to reconstruct worlds between your images. Connect a paid Google Cloud project to begin rendering.
            </p>
            <button
              onClick={handleApiKeySelection}
              className="px-10 py-4 rounded-full bg-blue-600 text-white font-black text-sm uppercase tracking-widest hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/40 active:scale-95"
            >
              Link AI Studio API
            </button>
          </div>
        )}

        {status === 'IDLE' || status === 'ERROR' ? (
          <div className="grid lg:grid-cols-12 gap-12 animate-in slide-in-from-bottom-12 duration-1000">
            {/* Left Column: Visual Assets */}
            <div className="lg:col-span-7 space-y-10">
              <div>
                <h2 className="text-5xl font-black mb-4 tracking-tighter leading-tight">
                  The <span className="text-blue-500">Spatial</span> <br/>Sequence.
                </h2>
                <p className="text-slate-400 text-lg max-w-md">Upload two frames to define the start and end of your cinematic voyage.</p>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-6 relative">
                 <div className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-slate-900 p-4 rounded-full border border-slate-700 text-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.2)]">
                    <ArrowRight size={24} strokeWidth={3} />
                 </div>
                 <DropZone label="Alpha Source" image={startImage} onImageSelect={setStartImage} disabled={!hasKey} />
                 <DropZone label="Omega Target" image={endImage} onImageSelect={setEndImage} disabled={!hasKey} />
              </div>

              {selectedStyle === 'CUSTOM' && (
                <div className="animate-in slide-in-from-top-4 duration-500 p-6 bg-slate-800/40 rounded-3xl border border-slate-700/50 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-4 text-blue-400">
                    <Terminal size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">Custom Direction</span>
                  </div>
                  <textarea
                    value={customPrompt}
                    onChange={(e) => setCustomPrompt(e.target.value)}
                    placeholder="Describe your camera movement... (e.g., 'A slow tracking shot through the window and into the library')"
                    className="w-full h-24 bg-slate-900/50 border border-slate-700 rounded-xl p-4 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all resize-none"
                  />
                  <p className="text-[10px] text-slate-500 mt-2 italic">Tip: Be descriptive about camera paths and environmental interaction.</p>
                </div>
              )}

              <div className="hidden lg:block pt-4">
                <div className="flex items-center gap-4 text-slate-500">
                   <div className="h-[1px] flex-1 bg-slate-800"></div>
                   <span className="text-[10px] font-black uppercase tracking-[0.3em]">Advanced Neural Rendering</span>
                   <div className="h-[1px] flex-1 bg-slate-800"></div>
                </div>
              </div>
            </div>

            {/* Right Column: Style & Generate */}
            <div className="lg:col-span-5 space-y-8 p-8 bg-slate-800/20 rounded-[2.5rem] border border-slate-800/80 backdrop-blur-xl shadow-2xl">
              <TransitionSelector 
                selected={selectedStyle} 
                onSelect={setSelectedStyle} 
                disabled={status !== 'IDLE' && status !== 'ERROR'} 
              />

              <div className="space-y-6 pt-4">
                <div className="flex items-center gap-4 bg-slate-900/60 p-2 rounded-2xl border border-slate-800 shadow-inner">
                    <div className="flex items-center gap-2 px-4 border-r border-slate-800 text-slate-500">
                        <Settings2 size={16} />
                        <span className="text-[10px] font-black uppercase tracking-wider">FRAME</span>
                    </div>
                    <div className="flex gap-2 p-1 w-full">
                        <button onClick={() => setAspectRatio('16:9')} className={`flex-1 py-2 text-[10px] font-black rounded-xl transition-all duration-300 ${aspectRatio === '16:9' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-white'}`}>16:9</button>
                        <button onClick={() => setAspectRatio('9:16')} className={`flex-1 py-2 text-[10px] font-black rounded-xl transition-all duration-300 ${aspectRatio === '9:16' ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'text-slate-500 hover:text-white'}`}>9:16</button>
                    </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={!startImage || !endImage || !hasKey}
                  className={`
                    w-full py-6 rounded-2xl font-black text-xl transition-all duration-700 flex items-center justify-center gap-4 group overflow-hidden relative
                    ${(!startImage || !endImage || !hasKey)
                      ? 'bg-slate-800 text-slate-700 cursor-not-allowed'
                      : 'bg-white text-slate-950 hover:bg-blue-500 hover:text-white shadow-2xl shadow-blue-500/10 hover:-translate-y-1 active:scale-95'
                    }
                  `}
                >
                  <Wand2 size={24} className={(!startImage || !endImage) ? '' : 'group-hover:rotate-[30deg] transition-transform duration-500'} />
                  <span className="uppercase tracking-[0.2em]">{(!hasKey) ? 'Locked' : 'RENDER NOW'}</span>
                  
                  {hasKey && startImage && endImage && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite] pointer-events-none"></div>
                  )}
                </button>
                
                {error && (
                  <div className="flex items-center gap-3 text-red-400 bg-red-950/20 px-5 py-4 rounded-2xl border border-red-900/30 animate-in fade-in zoom-in-95">
                    <AlertCircle size={20} className="shrink-0" />
                    <span className="text-xs font-bold tracking-tight">{error}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : status === 'COMPLETE' && videoUrl ? (
          <div className="animate-in fade-in zoom-in-95 duration-1000 max-w-5xl mx-auto">
            <div className="bg-slate-800/40 rounded-[2.5rem] overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.5)] border border-slate-700/50 backdrop-blur-3xl">
               <div className="p-8 border-b border-slate-700/50 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div>
                    <h3 className="font-black text-3xl text-white tracking-tighter uppercase italic">Render Master</h3>
                    <div className="flex flex-wrap items-center gap-3 mt-3">
                      <span className="text-[10px] font-black bg-blue-600 text-white px-3 py-1 rounded-full uppercase tracking-widest">{selectedStyle.replace('_', ' ')}</span>
                      <p className="text-xs text-slate-500 font-medium max-w-lg italic line-clamp-1">"{prompt}"</p>
                    </div>
                  </div>
                  <button onClick={resetApp} className="flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 rounded-full transition-all text-slate-300 hover:text-white text-[10px] font-black uppercase tracking-widest border border-slate-700">
                    <RefreshCw size={16} />
                    New Project
                  </button>
               </div>
               
               <div className={`relative bg-black/80 flex justify-center items-center shadow-inner ${aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[9/16] h-[75vh]'}`}>
                 <video src={videoUrl} controls autoPlay loop className="w-full h-full object-contain" />
               </div>

               <div className="p-10 bg-slate-900/60 flex flex-col sm:flex-row justify-end gap-6">
                 <button onClick={resetApp} className="px-8 py-4 rounded-full text-slate-500 hover:text-white font-black text-[10px] tracking-[0.2em] uppercase transition-all">
                   Discard Draft
                 </button>
                 <a 
                   href={videoUrl} 
                   download={`vibeshift-${selectedStyle.toLowerCase()}.mp4`}
                   className="px-10 py-4 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-2xl shadow-blue-500/30"
                 >
                   <Download size={20} />
                   Export Final
                 </a>
               </div>
            </div>
          </div>
        ) : (
          <LoadingScreen status={status} prompt={prompt} />
        )}
      </main>

      <style>{`
        @keyframes shimmer {
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default App;