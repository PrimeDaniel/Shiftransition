import React, { useState, useEffect } from 'react';
import { DropZone } from './components/DropZone';
import { LoadingScreen } from './components/LoadingScreen';
import { ImageFile, AppStatus, AspectRatio } from './types';
import { generateTransitionPrompt, generateVeoVideo } from './services/gemini';
import { Wand2, AlertCircle, Download, RefreshCw, Film, ArrowRight, Settings2 } from 'lucide-react';

const App: React.FC = () => {
  const [startImage, setStartImage] = useState<ImageFile | null>(null);
  const [endImage, setEndImage] = useState<ImageFile | null>(null);
  const [status, setStatus] = useState<AppStatus>('IDLE');
  const [prompt, setPrompt] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [hasKey, setHasKey] = useState<boolean>(false);

  useEffect(() => {
    const checkKey = async () => {
      if (window.aistudio && await window.aistudio.hasSelectedApiKey()) {
        setHasKey(true);
      }
    };
    checkKey();
  }, []);

  const handleApiKeySelection = async () => {
    try {
      if (window.aistudio) {
        window.aistudio.openSelectKey();
        // Assume success to avoid race conditions as per instructions
        setHasKey(true);
        setError(null);
      } else {
        setError("AI Studio API key selection is not available in this environment.");
      }
    } catch (e) {
      console.error(e);
      setError("Failed to open key selection.");
    }
  };

  const handleGenerate = async () => {
    if (!startImage || !endImage) return;

    // Reset previous errors
    setError(null);

    // Step 1: Check Key
    if (!hasKey) {
        await handleApiKeySelection();
        // Since we assume success, we proceed. 
        // In a real app we might want to return here and let the user click again, 
        // but to "mitigate race condition", we assume valid state or user re-clicks.
        // Let's return to be safe and let the user click "Generate" again once the modal closes? 
        // Actually, the prompt says "Assume the key selection was successful ... and proceed to the app".
        // But for the *action* itself, it's safer to check key before starting heavy async work.
    }

    try {
      setStatus('ANALYZING');
      
      // Step 2: Analyze Images with Gemini 3 Pro
      const generatedPrompt = await generateTransitionPrompt(startImage, endImage);
      setPrompt(generatedPrompt);
      
      setStatus('GENERATING');

      // Step 3: Generate Video with Veo
      const url = await generateVeoVideo(generatedPrompt, startImage, endImage, aspectRatio);
      setVideoUrl(url);
      
      setStatus('COMPLETE');
    } catch (err: any) {
      console.error(err);
      setStatus('ERROR');
      if (err.message && err.message.includes('Requested entity was not found')) {
        setHasKey(false);
        setError("API Key invalid or expired. Please select a project again.");
      } else {
        setError(err.message || "An unexpected error occurred during generation.");
      }
    }
  };

  const resetApp = () => {
    setStatus('IDLE');
    setVideoUrl(null);
    setPrompt(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-blue-500/30">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Film size={18} className="text-white" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              VibeShift
            </h1>
          </div>
          
          <div className="flex items-center gap-4">
            {!hasKey && (
               <button 
                 onClick={handleApiKeySelection}
                 className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
               >
                 Connect API Key
               </button>
            )}
            <a 
              href="https://ai.google.dev/gemini-api/docs/billing" 
              target="_blank" 
              rel="noreferrer"
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Billing Info
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* API Key Modal / Warning */}
        {!hasKey && (
          <div className="mb-12 p-8 rounded-2xl bg-gradient-to-r from-blue-900/20 to-purple-900/20 border border-blue-500/30 flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold mb-3">Connect to Google AI Studio</h2>
            <p className="text-slate-400 max-w-lg mb-6">
              To generate high-quality videos with Veo and analyze images with Gemini 3 Pro, you need to select a paid Google Cloud project.
            </p>
            <button
              onClick={handleApiKeySelection}
              className="px-6 py-3 rounded-full bg-white text-slate-900 font-semibold hover:bg-slate-100 transition-colors shadow-lg shadow-blue-900/20"
            >
              Select API Key
            </button>
          </div>
        )}

        {/* Main Interface */}
        {status === 'IDLE' || status === 'ERROR' ? (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
             <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">
                Morph Moments into <span className="text-blue-400">Movies</span>
              </h2>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">
                Upload a start and end frame. AI will analyze the vibe and generate a seamless, cinematic transition video.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12 relative">
               {/* Arrow in the middle for desktop */}
               <div className="hidden md:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 bg-slate-900 p-2 rounded-full border border-slate-700 text-slate-500">
                  <ArrowRight size={24} />
               </div>

               <DropZone 
                 label="Start Frame" 
                 image={startImage} 
                 onImageSelect={setStartImage} 
                 disabled={!hasKey}
               />
               <DropZone 
                 label="End Frame" 
                 image={endImage} 
                 onImageSelect={setEndImage}
                 disabled={!hasKey} 
               />
            </div>

            <div className="flex flex-col items-center gap-6">
              <div className="flex items-center gap-4 bg-slate-800/50 p-2 rounded-full border border-slate-700">
                  <div className="flex items-center gap-2 px-4 border-r border-slate-700">
                      <Settings2 size={16} className="text-slate-400" />
                      <span className="text-sm font-medium text-slate-300">Aspect Ratio</span>
                  </div>
                  <div className="flex gap-1 pr-1">
                      <button 
                        onClick={() => setAspectRatio('16:9')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all ${aspectRatio === '16:9' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                      >
                        16:9
                      </button>
                      <button 
                        onClick={() => setAspectRatio('9:16')}
                        className={`px-3 py-1.5 text-xs font-bold rounded-full transition-all ${aspectRatio === '9:16' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-700'}`}
                      >
                        9:16
                      </button>
                  </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={!startImage || !endImage || !hasKey}
                className={`
                  group relative px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 flex items-center gap-3
                  ${(!startImage || !endImage || !hasKey)
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-blue-900/40 hover:scale-105'
                  }
                `}
              >
                <Wand2 size={20} className={(!startImage || !endImage) ? '' : 'group-hover:rotate-12 transition-transform'} />
                Generate Transition
              </button>
              
              {error && (
                <div className="flex items-center gap-2 text-red-400 bg-red-950/30 px-4 py-2 rounded-lg border border-red-900/50 animate-in fade-in slide-in-from-top-2">
                  <AlertCircle size={16} />
                  <span className="text-sm">{error}</span>
                </div>
              )}
            </div>
          </div>
        ) : status === 'COMPLETE' && videoUrl ? (
          <div className="animate-in zoom-in-50 duration-500 max-w-4xl mx-auto">
            <div className="bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
               <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-800/80 backdrop-blur-sm">
                  <div>
                    <h3 className="font-bold text-xl text-white">Transition Result</h3>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1 max-w-md">Prompt: {prompt}</p>
                  </div>
                  <button onClick={resetApp} className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white">
                    <RefreshCw size={20} />
                  </button>
               </div>
               
               <div className={`relative bg-black flex justify-center items-center ${aspectRatio === '16:9' ? 'aspect-video' : 'aspect-[9/16] h-[600px] w-full'}`}>
                 <video 
                   src={videoUrl} 
                   controls 
                   autoPlay 
                   loop 
                   className="w-full h-full object-contain"
                 />
               </div>

               <div className="p-6 bg-slate-800 border-t border-slate-700 flex justify-end gap-3">
                 <button onClick={resetApp} className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 font-medium transition-colors">
                   Create New
                 </button>
                 <a 
                   href={videoUrl} 
                   download="vibeshift-transition.mp4"
                   className="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-2 transition-colors shadow-lg shadow-blue-900/20"
                 >
                   <Download size={18} />
                   Download Video
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