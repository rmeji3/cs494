'use client';

import { useState } from 'react';
import { BodyType, BODY_DEFAULTS, type PendingBodyCfg } from '@/lib/types';

interface Props {
  onConfigChange: (cfg: PendingBodyCfg) => void;
  onClear: () => void;
  speed: number;
  onSpeed: (s: number) => void;
}

const TYPE_LABELS: { type: BodyType; label: string; color: string }[] = [
  { type: BodyType.Planet,    label: 'Planet',    color: 'bg-blue-500'   },
  { type: BodyType.Sun,       label: 'Sun',       color: 'bg-yellow-400' },
  { type: BodyType.Moon,      label: 'Moon',      color: 'bg-gray-400'   },
  { type: BodyType.Spaceship, label: 'Ship',      color: 'bg-green-500'  },
  { type: BodyType.Meteorite, label: 'Meteor',    color: 'bg-orange-500' },
];

export default function BodyPanel({ onConfigChange, onClear, speed, onSpeed }: Props) {
  const [selectedType, setSelectedType] = useState<BodyType>(BodyType.Planet);
  const [cfg, setCfg] = useState<PendingBodyCfg>(BODY_DEFAULTS[BodyType.Planet]);

  const selectType = (t: BodyType) => {
    setSelectedType(t);
    const next = { ...BODY_DEFAULTS[t] };
    setCfg(next);
    onConfigChange(next);
  };

  const update = (patch: Partial<PendingBodyCfg>) => {
    const next = { ...cfg, ...patch };
    setCfg(next);
    onConfigChange(next);
  };

  return (
    <div className="absolute top-4 right-4 w-56 bg-black/70 border border-white/10 rounded-xl p-3 text-xs text-white/80 space-y-3 backdrop-blur-sm">
      <h2 className="text-sm font-semibold text-white tracking-wide">Gravity Sim</h2>

      {/* Body type selector */}
      <div>
        <p className="text-white/50 mb-1.5 uppercase tracking-wider text-[10px]">Body Type</p>
        <div className="grid grid-cols-3 gap-1">
          {TYPE_LABELS.map(({ type, label, color }) => (
            <button
              key={type}
              onClick={() => selectType(type)}
              className={`rounded px-1 py-1 text-center transition-all font-medium
                ${selectedType === type
                  ? `${color} text-black shadow-lg scale-105`
                  : 'bg-white/10 hover:bg-white/20 text-white/70'}`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Sliders */}
      <div className="space-y-2">
        <label className="flex flex-col gap-1">
          <span className="text-white/50 uppercase tracking-wider text-[10px]">
            Mass <span className="text-white/70 normal-case">{cfg.mass}</span>
          </span>
          <input
            type="range" min={1} max={10000} step={1} value={cfg.mass}
            onChange={e => update({ mass: Number(e.target.value) })}
            className="accent-blue-400 w-full"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-white/50 uppercase tracking-wider text-[10px]">
            Radius <span className="text-white/70 normal-case">{cfg.radius}</span>
          </span>
          <input
            type="range" min={2} max={60} step={1} value={cfg.radius}
            onChange={e => update({ radius: Number(e.target.value) })}
            className="accent-blue-400 w-full"
          />
        </label>
      </div>

      {/* Velocity inputs */}
      <div className="space-y-1">
        <p className="text-white/50 uppercase tracking-wider text-[10px]">Initial Velocity</p>
        <div className="flex gap-2">
          <label className="flex-1 flex flex-col gap-0.5">
            <span className="text-white/40 text-[10px]">Vx</span>
            <input
              type="number" value={cfg.vx} step={5}
              onChange={e => update({ vx: Number(e.target.value) })}
              className="bg-white/10 rounded px-2 py-1 w-full text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </label>
          <label className="flex-1 flex flex-col gap-0.5">
            <span className="text-white/40 text-[10px]">Vy</span>
            <input
              type="number" value={cfg.vy} step={5}
              onChange={e => update({ vy: Number(e.target.value) })}
              className="bg-white/10 rounded px-2 py-1 w-full text-white focus:outline-none focus:ring-1 focus:ring-blue-400"
            />
          </label>
        </div>
      </div>

      <p className="text-white/40 italic text-[10px] text-center">Click canvas to place body</p>

      <hr className="border-white/10" />

      {/* Speed control */}
      <label className="flex flex-col gap-1">
        <span className="text-white/50 uppercase tracking-wider text-[10px]">
          Speed <span className="text-white/70 normal-case">{speed.toFixed(1)}x</span>
        </span>
        <input
          type="range" min={0.1} max={5} step={0.1} value={speed}
          onChange={e => onSpeed(Number(e.target.value))}
          className="accent-purple-400 w-full"
        />
      </label>

      {/* Control buttons */}
      <div className="flex flex-col gap-1.5">
        <button
          onClick={onClear}
          className="w-full rounded py-1.5 bg-red-800 hover:bg-red-700 font-medium transition-colors"
        >
          Clear All
        </button>
      </div>
    </div>
  );
}
