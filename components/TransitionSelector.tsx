import React, { useState } from 'react';
import { TransitionStyleId, TransitionStyle } from '../types';
import { Plane, UserCheck, Zap, Box, Pointer, Clock, Brain, Terminal, Info, Dice5 } from 'lucide-react';

const STYLES: TransitionStyle[] = [
  { id: 'FLY_FLOW', name: 'Camera Fly Flow', description: 'Drone-style spatial traversal', icon: 'Plane' },
  { id: 'SUBJECT_MIGRATE', name: 'Subject Migration', description: 'Seamless character evolution', icon: 'UserCheck' },
  { id: 'AI_AUTO', name: 'Calculated Lucky', description: 'Semantic AI pathfinding', icon: 'Brain' },
  { id: 'CUSTOM', name: 'Director Prompt', description: 'Manual motion control', icon: 'Terminal' },
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
  disabled?: boolean;
}

export const TransitionSelector: React.FC<Props> = ({ selected, onSelect, disabled }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  const handleFeelingLucky = () => {
    if (disabled) return;
    const randomStyles = STYLES.filter(s => s.id !== 'CUSTOM' && s.id !== 'AI_AUTO');
    const random = randomStyles[Math.floor(Math.random() * randomStyles.length)];
    onSelect(random.id);
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-4">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
          Cinematic Engine
        </span>
        
        <button 
          onClick={handleFeelingLucky}
          disabled={disabled}
          className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-white transition-colors disabled:opacity-30"
        >
          <Dice5 size={14} className="text-purple-400" />
          Feeling Lucky
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-1 gap-3 max-h-[420px] overflow-y-auto pr-2 custom-scrollbar">
        {STYLES.map((style) => {
          const Icon = IconMap[style.icon];
          const isActive = selected === style.id;
          
          return (
            <div key={style.id} className="relative group">
              <button
                onClick={() => onSelect(style.id)}
                disabled={disabled}
                className={`
                  w-full relative flex items-center p-4 rounded-2xl border transition-all duration-500
                  ${isActive 
                    ? 'bg-blue-600/10 border-blue-500/50 shadow-[0_0_25px_rgba(59,130,246,0.15)] ring-1 ring-blue-500/20' 
                    : 'bg-slate-900/40 border-slate-800/80 hover:border-slate-600 hover:bg-slate-800/40'
                  }
                  ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                `}
              >
                <div className={`mr-4 p-3 rounded-xl transition-colors duration-500 ${isActive ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-500 group-hover:text-slate-300'}`}>
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                <div className="flex-1 text-left">
                  <div className="flex items-center gap-1.5">
                    <p className={`text-sm font-black tracking-tight ${isActive ? 'text-white' : 'text-slate-400'}`}>{style.name}</p>
                    {style.id === 'AI_AUTO' && (
                      <div className="relative">
                        <Info 
                          size={14} 
                          className="text-slate-500 hover:text-blue-400 cursor-help" 
                          onMouseEnter={() => setShowTooltip(true)}
                          onMouseLeave={() => setShowTooltip(false)}
                        />
                        {showTooltip && (
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-3 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl z-50 animate-in fade-in zoom-in-95 pointer-events-none">
                            <p className="text-[10px] text-slate-300 leading-relaxed font-medium">
                              <span className="text-blue-400 font-bold block mb-1">Contextual Awareness:</span>
                              The AI will visually study both scenes and invent a logical physical path—like zooming through a window or tracking a shared visual anchor.
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">{style.description}</p>
                </div>
                
                {isActive && (
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
                    <div className="w-1 h-3 bg-blue-400/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="w-1 h-5 bg-blue-400/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="w-1 h-3 bg-blue-400/40 rounded-full animate-bounce"></div>
                  </div>
                )}
              </button>
            </div>
          );
        })}
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(30, 41, 59, 1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.5);
        }
      `}</style>
    </div>
  );
};