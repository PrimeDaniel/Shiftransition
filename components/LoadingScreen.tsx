import React from 'react';
import { Loader2, Sparkles, Video, BrainCircuit } from 'lucide-react';
import { AppStatus } from '../types';

interface LoadingScreenProps {
  status: AppStatus;
  prompt: string | null;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ status, prompt }) => {
  return (
    <div className="w-full flex flex-col items-center justify-center py-12 text-center animate-in fade-in duration-500">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-20 rounded-full animate-pulse"></div>
        {status === 'ANALYZING' ? (
          <BrainCircuit size={64} className="text-blue-400 relative z-10 animate-pulse" />
        ) : (
          <Video size={64} className="text-purple-400 relative z-10 animate-bounce" />
        )}
      </div>
      
      <h2 className="text-2xl font-bold text-white mb-3">
        {status === 'ANALYZING' ? 'Analyzing Visual Vibes...' : 'Generating Transition...'}
      </h2>
      
      <p className="text-slate-400 max-w-md mx-auto mb-8">
        {status === 'ANALYZING' 
          ? "Gemini 3 Pro is identifying the style, lighting, and composition to design the perfect camera movement." 
          : "Veo is rendering frames to morph your images seamlessly. This may take 1-2 minutes."}
      </p>

      {prompt && (
        <div className="max-w-xl mx-auto bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center gap-2 mb-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
            <Sparkles size={12} />
            <span>Generated Concept</span>
          </div>
          <p className="text-slate-200 italic">"{prompt}"</p>
        </div>
      )}
      
      <div className="mt-8 flex items-center gap-2 text-slate-500 text-sm">
        <Loader2 className="animate-spin" size={16} />
        <span>Processing request...</span>
      </div>
    </div>
  );
};