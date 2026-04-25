'use client';

import { useState } from 'react';
import { BodyType, BODY_DEFAULTS, type PendingBodyCfg } from '@/lib/types';
import { Rocket, Globe, Moon, Orbit, Settings, Cpu, ChevronRight, Sun } from 'lucide-react';

interface Props {
  onConfigChange: (cfg: PendingBodyCfg) => void;
}

const NAV_ITEMS = [
  { id: 'planets', type: BodyType.Planet, label: 'Planets', icon: Globe },
  { id: 'suns', type: BodyType.Sun, label: 'Suns', icon: Sun },
  { id: 'moons', type: BodyType.Moon, label: 'Moons', icon: Moon },
  { id: 'Spaceship', type: BodyType.Spaceship, label: 'Spaceship', icon: Rocket },
  { id: 'Meteorite', type: BodyType.Meteorite, label: 'Meteorite', icon: Orbit },
];

export default function Sidebar({ onConfigChange }: Props) {
  const [activeId, setActiveId] = useState<string>('planets');
  const [cfg, setCfg] = useState<PendingBodyCfg>(BODY_DEFAULTS[BodyType.Planet]);

  const handleSelect = (item: typeof NAV_ITEMS[0]) => {
    setActiveId(item.id);
    if (item.type !== null) {
      const defaults = { ...BODY_DEFAULTS[item.type] };
      setCfg(defaults);
      onConfigChange(defaults);
    }
  };

  const update = (patch: Partial<PendingBodyCfg>) => {
    const next = { ...cfg, ...patch };
    setCfg(next);
    onConfigChange(next);
  };

  return (
    <div className="absolute top-0 left-0 h-screen w-64 bg-[#0a0a0c] border-r border-[#1f1f22] flex flex-col pt-8 pb-6 px-4 z-10 text-zinc-400 select-none">
      {/* Logo */}
      <div className="px-2 mb-10 flex items-center gap-2">
        <h1 className="text-white text-2xl font-black tracking-widest font-mono">Space Sim</h1>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeId === item.id;
          return (
            <div key={item.id} className="flex flex-col">
              <button
                onClick={() => handleSelect(item)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all duration-200
                  ${isActive ? 'bg-[#1e1f22] text-white shadow-sm' : 'hover:bg-[#151518] hover:text-white'}`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={isActive ? "text-white" : "text-zinc-500"} />
                  <span className="font-medium text-sm">{item.label}</span>
                </div>
              </button>

              {isActive && (
                <div className="mt-2 mb-2 px-3 py-3 bg-[#0d0d0f] rounded-xl border border-[#1f1f22] flex flex-col gap-4 animate-in slide-in-from-top-2 fade-in duration-200">
                  {/* Mass */}
                  <label className="flex flex-col gap-1.5 cursor-pointer">
                    <div className="flex justify-between items-center text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                      <span>Mass</span>
                      <span className="text-white">{cfg.mass}</span>
                    </div>
                    <input
                      type="range" min={1} max={10000} step={1} value={cfg.mass}
                      onChange={e => update({ mass: Number(e.target.value) })}
                      className="accent-[#3b82f6] h-1.5 cursor-pointer"
                    />
                  </label>

                  {/* Radius */}
                  <label className="flex flex-col gap-1.5 cursor-pointer">
                    <div className="flex justify-between items-center text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                      <span>Radius</span>
                      <span className="text-white">{cfg.radius}</span>
                    </div>
                    <input
                      type="range" min={2} max={60} step={1} value={cfg.radius}
                      onChange={e => update({ radius: Number(e.target.value) })}
                      className="accent-[#3b82f6] h-1.5 cursor-pointer"
                    />
                  </label>

                  {/* Velocity */}
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">Init Velocity</span>
                    <div className="flex flex-col gap-2">
                       <label className="flex flex-col gap-1">
                         <span className="text-[9px] text-zinc-600 font-bold uppercase">X axis</span>
                         <input type="number" step={5} value={cfg.vx} onChange={e => update({ vx: Number(e.target.value) })} className="bg-[#1e1f22] border border-[#2e2f32] rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors" />
                       </label>
                       <label className="flex flex-col gap-1">
                         <span className="text-[9px] text-zinc-600 font-bold uppercase">Y axis</span>
                         <input type="number" step={5} value={cfg.vy} onChange={e => update({ vy: Number(e.target.value) })} className="bg-[#1e1f22] border border-[#2e2f32] rounded-md px-2 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 transition-colors" />
                       </label>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </nav>
    </div>
  );
}
