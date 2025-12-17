import React from 'react';
import { TransitionStyleId, TransitionStyle } from '../types';
import { Layers, MoveRight, Maximize2, Footprints, RotateCcw, Cloud } from 'lucide-react';

const STYLES: TransitionStyle[] = [
  { id: 'MORPH', name: 'Ethereal Morph', description: 'Fluid shape transformation', icon: 'Layers' },
  { id: 'WHIP_PAN', name: 'Kinetic Pan', description: 'Fast blur sweep', icon: 'MoveRight' },
  { id: 'VERTIGO', name: 'Vertigo Dolly', description: 'Cinematic depth shift', icon: 'Maximize2' },
  { id: 'SUBJECT_FLOW', name: 'Subject Flow', description: 'Continuous character motion', icon: 'Footprints' },
  { id: 'VORTEX', name: 'Vortex Spin', description: 'Dynamic spiral zoom', icon: 'RotateCcw' },
  { id: 'DISSOLVE', name: 'Soft Dissolve', description: 'Atmospheric light blend', icon: 'Cloud' },
];

const IconMap: Record<string, any> = {
  Layers, MoveRight, Maximize2, Footprints, RotateCcw, Cloud
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
        <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-500/10 px-2 py-1 rounded">Step 2: Choose Direction</span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {STYLES.map((style) => {
          const Icon = IconMap[style.icon];
          const isActive = selected === style.id;
          
          return (
            <button
              key={style.id}
              onClick={() => onSelect(style.id)}
              disabled={disabled}
              className={`
                relative flex flex-col items-center p-4 rounded-xl border transition-all duration-300 text-left
                ${isActive 
                  ? 'bg-blue-600/20 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.2)]' 
                  : 'bg-slate-800/40 border-slate-700 hover:border-slate-500 hover:bg-slate-800/60'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              <div className={`mb-3 p-2 rounded-lg ${isActive ? 'bg-blue-500 text-white' : 'bg-slate-700 text-slate-400'}`}>
                <Icon size={20} />
              </div>
              <div className="text-center">
                <p className={`text-sm font-bold ${isActive ? 'text-white' : 'text-slate-300'}`}>{style.name}</p>
                <p className="text-[10px] text-slate-500 mt-0.5 leading-tight">{style.description}</p>
              </div>
              {isActive && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};