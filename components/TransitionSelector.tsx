import React, { useState } from 'react';
import { TransitionStyleId, TransitionStyle } from '../types';
import { Plane, UserCheck, Zap, Box, Pointer, Clock, Brain, Terminal, Info, Dice5, HelpCircle } from 'lucide-react';

const STYLES: TransitionStyle[] = [
  { id: 'FLY_FLOW', name: 'Camera Fly Flow', description: 'Drone-style spatial traversal', icon: 'Plane' },
  { id: 'SUBJECT_MIGRATE', name: 'Subject Migration', description: 'Seamless character evolution', icon: 'UserCheck' },
  { id: 'AI_AUTO', name: 'Calculated Lucky', description: 'Semantic AI pathfinding', icon: 'Brain' },
  { id: 'CUSTOM', name: 'Director Custom', description: 'Manual motion control', icon: 'Terminal' },
  { id: 'PORTAL_WARP', name: 'Portal Warp', description: 'Dimensional wormhole shift', icon: 'Zap' },
  { id: 'HYPERLAPSE', name: 'Temporal Flow', description: 'Rapid atmospheric evolution', icon: 'Clock' },
  { id: 'GEOMETRIC_RECON', name: 'World Reconstruct', description: 'Physical architecture rebuild', icon: 'Box' },
  { id: 'OBJECT_TRACE', name: 'Kinetic Trace', description: 'Follow object trajectory', icon: 'Pointer' },
];

const IconMap: Record<string, any> = {
  Plane, UserCheck, Zap, Box, Pointer, Clock, Brain, Terminal
};

interface Props {
  selected: TransitionStyleId;
  onSelect: (id: TransitionStyleId) => void;
  onLucky?: () => void;
  disabled?: boolean;
}

export const TransitionSelector: React.FC<Props> = ({ selected, onSelect, onLucky, disabled }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
          Cinematic Engine
        </span>
        
        <button 
          onClick={() => onLucky?.()}
          disabled={disabled}
          title="AI generates a unique transition prompt based on your photos"
          className="group flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-purple-400 transition-all disabled:opacity-30"
        >
          <Dice5 size={14} className="group-hover:rotate-180 transition-transform duration-500" />
          Feeling Lucky
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2.5 max-h-[440px] overflow-y-auto pr-2 custom-scrollbar">
        {STYLES.map((style) => {
          const Icon = IconMap[style.icon];
          const isActive = selected === style.id;
          
          return (
            <div key={style.id} className="relative group">
              <button
                onClick={() => onSelect(style.id)}
                disabled={disabled}
                className={`
                  w-full relative flex items-center p-3.5 rounded-2xl border transition-all duration-300
                  ${isActive 
                    ? 'bg-blue-600/10 border-blue-500/50 shadow-[0_0_20px_rgba(59,130,246,0.1)] ring-1 ring-blue-500/10' 
                    : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-600 hover:bg-slate-800/40'
                  }
                  ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className={`mr-4 p-2.5 rounded-xl transition-colors duration-300 ${isActive ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-500 group-hover:text-slate-300'}`}>
                  <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <p className={`text-sm font-black tracking-tight ${isActive ? 'text-white' : 'text-slate-400'}`}>{style.name}</p>
                    {style.id === 'AI_AUTO' && (
                      <div 
                        className="relative group/tooltip"
                        onMouseEnter={() => setShowTooltip(true)}
                        onMouseLeave={() => setShowTooltip(false)}
                      >
                        <HelpCircle size={14} className="text-slate-600 hover:text-blue-400 transition-colors" />
                        {showTooltip && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-56 p-3 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl z-50 animate-in fade-in zoom-in-95 pointer-events-none">
                            <p className="text-[11px] text-slate-300 leading-relaxed font-semibold">
                              <span className="text-blue-400 font-black block mb-1 uppercase tracking-tighter">AI Calculated Lucky:</span>
                              Gemini 3 Pro analyzes the geometry of both frames to find a logical path. 
                              <span className="block mt-1 text-slate-500 italic">Example: If frame 1 is an eye and frame 2 is a galaxy, it will zoom into the pupil to reveal the stars.</span>
                            </p>
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-slate-900 border-r border-b border-slate-700 rotate-45"></div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">{style.description}</p>
                </div>
                
                {isActive && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
                    <div className="w-1 h-3 bg-blue-500/40 rounded-full animate-pulse"></div>
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(15, 23, 42, 0.3); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(30, 41, 59, 0.8); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(59, 130, 246, 0.3); }
      `}</style>
    </div>
  );
};