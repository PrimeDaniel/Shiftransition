import React from 'react';
import { TransitionStyleId, TransitionStyle } from '../types';
import { Plane, UserCheck, Zap, Box, Pointer, Clock } from 'lucide-react';

const STYLES: TransitionStyle[] = [
  { id: 'FLY_FLOW', name: 'Camera Fly Flow', description: 'Drone-style spatial traversal', icon: 'Plane' },
  { id: 'SUBJECT_MIGRATE', name: 'Subject Migration', description: 'Seamless character evolution', icon: 'UserCheck' },
  { id: 'PORTAL_WARP', name: 'Portal Warp', description: 'Dimensional wormhole shift', icon: 'Zap' },
  { id: 'HYPERLAPSE', name: 'Temporal Flow', description: 'Rapid atmospheric evolution', icon: 'Clock' },
  { id: 'GEOMETRIC_RECON', name: 'World Reconstruct', description: 'Physical architecture rebuild', icon: 'Box' },
  { id: 'OBJECT_TRACE', name: 'Kinetic Trace', description: 'Follow object trajectory', icon: 'Pointer' },
];

const IconMap: Record<string, any> = {
  Plane, UserCheck, Zap, Box, Pointer, Clock
};

interface Props {
  selected: TransitionStyleId;
  onSelect: (id: TransitionStyleId) => void;
  disabled?: boolean;
}

export const TransitionSelector: React.FC<Props> = ({ selected, onSelect, disabled }) => {
  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full border border-blue-500/20">
          Cinematic Engine
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-1 gap-3">
        {STYLES.map((style) => {
          const Icon = IconMap[style.icon];
          const isActive = selected === style.id;
          
          return (
            <button
              key={style.id}
              onClick={() => onSelect(style.id)}
              disabled={disabled}
              className={`
                relative flex items-center p-4 rounded-2xl border transition-all duration-500 group
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
              <div className="flex-1">
                <p className={`text-sm font-black tracking-tight ${isActive ? 'text-white' : 'text-slate-400'}`}>{style.name}</p>
                <p className="text-[10px] text-slate-500 font-medium leading-tight mt-0.5">{style.description}</p>
              </div>
              
              {/* Animated accent for active state */}
              {isActive && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1">
                  <div className="w-1 h-3 bg-blue-400/40 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                  <div className="w-1 h-5 bg-blue-400/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                  <div className="w-1 h-3 bg-blue-400/40 rounded-full animate-bounce"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};