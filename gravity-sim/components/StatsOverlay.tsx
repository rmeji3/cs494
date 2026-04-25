'use client';

import type { SimStats } from '@/lib/types';

export default function StatsOverlay({ stats }: { stats: SimStats }) {
  return (
    <div className="absolute top-4 left-4 pointer-events-none select-none">
      <div className="bg-black/60 border border-white/10 rounded-lg px-3 py-2 font-mono text-xs space-y-0.5 text-white/70">
        <div className="flex gap-4">
          <span>FPS <span className="text-green-400">{stats.fps}</span></span>
          <span>Bodies <span className="text-blue-400">{stats.bodyCount}</span></span>
        </div>
        <div>
          Time <span className="text-yellow-400">{stats.simTime.toFixed(1)}s</span>
        </div>
      </div>
    </div>
  );
}
