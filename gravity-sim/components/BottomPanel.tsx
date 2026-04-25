'use client';
import { Pause, Play, RotateCcw, Calendar, Clock } from 'lucide-react';
import type { SimStats } from '@/lib/types';

interface Props {
  stats: SimStats;
  speed: number;
  onSpeed: (s: number) => void;
  paused: boolean;
  onPause: () => void;
  onClear: () => void;
}

const SPEED_OPTS = [
  { label: '1x', val: 1.0 },
  { label: '10x', val: 10.0 }, 
  { label: '25x', val: 25.0 },
  { label: '50x', val: 50.0 }, 
];

export default function BottomPanel({ stats, speed, onSpeed, paused, onPause, onClear }: Props) {
  const pad = (n: number) => n.toString().padStart(2, '0');
  const d = new Date(Date.now() + stats.simTime * 100000);
  const yyyy = d.getUTCFullYear();
  const MM = pad(d.getUTCMonth() + 1);
  const dd = pad(d.getUTCDate());
  const hh = pad(d.getUTCHours());
  const mm = pad(d.getUTCMinutes());
  const ss = pad(d.getUTCSeconds());
  const ampm = d.getUTCHours() >= 12 ? 'PM' : 'AM';

  return (
    <div className="absolute bottom-6 left-1/2 w-[550px] bg-[#1e1f22]/90 backdrop-blur-md rounded-2xl border border-[#2e2f32] p-4 text-zinc-300 shadow-2xl z-10 flex flex-col gap-4" style={{ marginLeft: '128px', transform: 'translateX(-50%)' }}>
      {/* Top Row */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-3">
          <Clock size={16} className="text-zinc-500" />
          <div className="flex flex-col">
            <span className="text-[9px] uppercase font-bold text-zinc-500 tracking-wider mb-0.5">UTC Time</span>
            <span className="text-sm font-semibold text-white tracking-wider font-mono">
              {yyyy}-{MM}-{dd} {hh}:{mm}:{ss}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Stats Display */}
          <div className="bg-[#1e1f22] px-3 py-1.5 rounded-lg flex items-center gap-3 h-9 border border-[#2e2f32]">
             <div className="flex items-center gap-1.5">
               <span className="text-[9px] font-bold text-zinc-500 tracking-widest">FPS</span>
               <span className={`text-xs font-mono ${stats.fps >= 50 ? 'text-green-400' : stats.fps >= 30 ? 'text-yellow-400' : 'text-red-400'}`}>{stats.fps}</span>
             </div>
             <div className="w-px h-3 bg-[#2e2f32]" />
             <div className="flex items-center gap-1.5">
               <span className="text-[9px] font-bold text-zinc-500 tracking-widest">OBJ</span>
               <span className="text-xs font-mono text-zinc-300">{stats.bodyCount}</span>
             </div>
          </div>

          <div className="bg-[#2c3d5a] px-3 py-1.5 rounded-lg flex items-center gap-2 h-9">
             <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
             <span className="text-xs font-bold text-blue-100 tracking-wider">SIM</span>
          </div>
          <button onClick={onClear} className="w-9 h-9 rounded-lg bg-[#2e2f32] hover:bg-zinc-700 flex items-center justify-center transition border border-[#3e3f42]">
            <RotateCcw size={16} className="text-zinc-400" />
          </button>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="flex items-center gap-3">
        {/* Play/Pause */}
        <button 
          onClick={onPause} 
          className={`w-12 h-10 rounded-xl flex items-center justify-center shadow-lg transition-all cursor-pointer ${paused ? 'bg-[#2e2f32] text-white hover:bg-zinc-700' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/20'}`}
        >
          {paused ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}
        </button>

        {/* Speed Controls */}
        <div className="flex flex-1 items-center gap-2 bg-[#2e2f32] rounded-xl px-3 h-10 border border-[#3e3f42]">
          <span className="text-xs text-zinc-500 font-medium mr-1">Speed:</span>
          {SPEED_OPTS.map((opt) => {
             const isActive = speed === opt.val; 
             return (
               <button 
                 key={opt.label}
                 onClick={() => onSpeed(opt.val)}
                 className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${isActive ? 'bg-[#3b82f6] text-white shadow-sm' : 'text-zinc-400 hover:text-white'}`}
               >
                 {opt.label}
               </button>
             );
          })}
        </div>
        
        {/* Date Picker Button */}
        <div className="bg-[#2e2f32] h-10 rounded-xl flex items-center px-3 gap-3 border border-[#3e3f42] hover:border-zinc-500 cursor-pointer transition-all">
          <Calendar size={16} className="text-zinc-500" />
          <span className="text-xs font-semibold text-zinc-300 tracking-wider">
             {MM}/{dd}/{yyyy} {pad(d.getUTCHours() % 12 || 12)}:{mm} {ampm}
          </span>
          <Calendar size={14} className="text-zinc-600 opacity-0" />
        </div>
      </div>
    </div>
  );
}
