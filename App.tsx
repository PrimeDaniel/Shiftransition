import React, { useState, useEffect } from 'react';
import { DropZone } from './components/DropZone';
import { LoadingScreen } from './components/LoadingScreen';
import { TransitionSelector } from './components/TransitionSelector';
import { ImageFile, AppStatus, AspectRatio, TransitionStyleId } from './types';
import { generateTransitionPrompt, generateVeoVideo } from './services/gemini';
import { Wand2, AlertCircle, Download, RefreshCw, Film, ArrowRight, Settings2, Sparkles } from 'lucide-react';

const App: React.FC = () => {
  const [startImage, setStartImage] = useState<ImageFile | null>(null);
  const [endImage, setEndImage] = useState<ImageFile | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<TransitionStyleId>('MORPH');
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
    setError(null);

    if (!hasKey) {
      await handleApiKeySelection();
      return;
    }

    try {
      setStatus('ANALYZING');
      const generatedPrompt = await generateTransitionPrompt(startImage, endImage, selectedStyle);
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
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform">
              <Film size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400 tracking-tight leading-none">
                VIBESHIFT
              </h1>
              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Director's Cut</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {!hasKey && (
               <button 
                 onClick={handleApiKeySelection}
                 className="text-xs font-bold text-blue-400 bg-blue-400/10 px-4 py-2 rounded-full border border-blue-400/20 hover:bg-blue-400/20 transition-all"
               >
                 LINK API
               </button>
            )}
            <div className="hidden md:flex items-center gap-2 text-slate-500 text-xs">
              <Sparkles size={14} className="text-amber-400" />
              <span>Powered by Veo 3.1 & Gemini 3 Pro</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 pb-24">
        {!hasKey && (
          <div className="mb-12 p-8 rounded-3xl bg-slate-800/50 border border-slate-700 flex flex-col items-center text-center backdrop-blur-sm">
            <h2 className="text-2xl font-bold mb-3">Professional Grade Video Engine</h2>
            <p className="text-slate-400 max-w-lg mb-8">
              Unlock cinematic transitions by connecting your Google Cloud project.
            </p>
            <button
              onClick={handleApiKeySelection}
              className="px-8 py-3 rounded-full bg-blue-600 text-white font-bold hover:bg-blue-500 transition-all shadow-xl shadow-blue-900/40"
            >
              Select AI Studio Key
            </button>
          </div>
        )}

        {status === 'IDLE' || status === 'ERROR' ? (
          <div className="grid lg:grid-cols-12 gap-12 animate-in slide-in-from-bottom-8 duration-700">
            {/* Left Column: Visual Assets */}
            <div className="lg:col-span-7 space-y-8">
              <div className="mb-8">
                <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2 py-1 rounded">Step 1: Upload Scenes</span>
                <h2 className="text-4xl font-black mt-4 mb-2 tracking-tight">The <span className="text-blue-500">A-B</span> Sequence.</h2>
                <p className="text-slate-400">Choose the starting moment and the final destination.</p>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-6 relative">
                 <div className="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-slate-900 p-3 rounded-full border border-slate-700 text-slate-400 shadow-2xl">
                    <ArrowRight size={24} />
                 </div>
                 <DropZone label="First Frame" image={startImage} onImageSelect={setStartImage} disabled={!hasKey} />
                 <DropZone label="Last Frame" image={endImage} onImageSelect={setEndImage} disabled={!hasKey} />
              </div>
            </div>

            {/* Right Column: Style & Generate */}
            <div className="lg:col-span-5 space-y-8 p-6 bg-slate-800/30 rounded-3xl border border-slate-800/60 backdrop-blur-md">
              <TransitionSelector 
                selected={selectedStyle} 
                onSelect={setSelectedStyle} 
                disabled={status !== 'IDLE' && status !== 'ERROR'} 
              />

              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2 py-1 rounded">Step 3: Output Settings</span>
                </div>
                <div className="flex items-center gap-4 bg-slate-900/50 p-2 rounded-2xl border border-slate-800">
                    <div className="flex items-center gap-2 px-4 border-r border-slate-800 text-slate-400">
                        <Settings2 size={16} />
                        <span className="text-xs font-bold">RATIO</span>
                    </div>
                    <div className="flex gap-2 p-1 w-full">
                        <button onClick={() => setAspectRatio('16:9')} className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${aspectRatio === '16:9' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}>16:9</button>
                        <button onClick={() => setAspectRatio('9:16')} className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${aspectRatio === '9:16' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-white'}`}>9:16</button>
                    </div>
                </div>

                <button
                  onClick={handleGenerate}
                  disabled={!startImage || !endImage || !hasKey}
                  className={`
                    w-full py-5 rounded-2xl font-black text-lg transition-all duration-500 flex items-center justify-center gap-3
                    ${(!startImage || !endImage || !hasKey)
                      ? 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-2xl shadow-blue-500/20 hover:-translate-y-1 active:scale-[0.98]'
                    }
                  `}
                >
                  <Wand2 size={22} className={(!startImage || !endImage) ? '' : 'animate-pulse'} />
                  ACTION!
                </button>
                
                {error && (
                  <div className="flex items-center gap-3 text-red-400 bg-red-950/20 px-4 py-3 rounded-xl border border-red-900/30 animate-in fade-in zoom-in-95">
                    <AlertCircle size={18} className="shrink-0" />
                    <span className="text-xs font-medium">{error}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : status === 'COMPLETE' && videoUrl ? (
          <div className="animate-in fade-in zoom-in-95 duration-700 max-w-5xl mx-auto">
            <div className="bg-slate-800/50 rounded-3xl overflow-hidden shadow-3xl border border-slate-700 backdrop-blur-xl">
               <div className="p-8 border-b border-slate-700 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h3 className="font-black text-2xl text-white tracking-tight">VIBESHIFT RENDER COMPLETE</h3>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-[10px] font-black bg-blue-500 text-white px-2 py-0.5 rounded uppercase">{selectedStyle}</span>
                      <p className="text-xs text-slate-400 italic">"{prompt}"</p>
                    </div>
                  </div>
                  <button onClick={resetApp} className="flex items-center gap-2 px-4 py-2 hover:bg-slate-700 rounded-xl transition-colors text-slate-400 hover:text-white text-sm font-bold">
                    <RefreshCw size={18} />
                    NEW EDIT
                  </button>
               </div>
               
               <div className={`relative bg-black flex justify-center items-center shadow-inner ${aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[9/16] h-[70vh]'}`}>
                 <video src={videoUrl} controls autoPlay loop className="w-full h-full object-contain" />
               </div>

               <div className="p-8 bg-slate-900/50 flex flex-col sm:flex-row justify-end gap-4">
                 <button onClick={resetApp} className="px-6 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 font-bold transition-all border border-transparent hover:border-slate-700">
                   DISCARD & RETRY
                 </button>
                 <a 
                   href={videoUrl} 
                   download={`vibeshift-${selectedStyle.toLowerCase()}.mp4`}
                   className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black flex items-center justify-center gap-3 transition-all shadow-xl shadow-blue-500/20"
                 >
                   <Download size={20} />
                   EXPORT VIDEO
                 </a>
               </div>
            </div>
          </div>
        ) : (
          <LoadingScreen status={status} prompt={prompt} />
        )}
      </main>
    </div>
  );
};

export default App;