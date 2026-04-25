'use client';

const LEGEND_ITEMS = [
  { label: 'Planet', color: '#4c8cff' },
  { label: 'Sun', color: '#ffcc1a' },
  { label: 'Moon', color: '#a6a6ad' },
  { label: 'Spaceship', color: '#33e666' },
  { label: 'Meteorite', color: '#d9731a' },
];

export default function Legend() {
  return (
    <div className="absolute top-6 right-6 bg-[#0a0a0c]/80 backdrop-blur-md border border-[#1f1f22] rounded-xl p-4 flex flex-col gap-3 shadow-2xl z-10 select-none">
      <h3 className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1">Color Legend</h3>
      <div className="flex flex-col gap-2.5">
        {LEGEND_ITEMS.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ 
                backgroundColor: item.color, 
                boxShadow: `0 0 10px ${item.color}40, inset 0 0 4px rgba(255,255,255,0.3)` 
              }}
            />
            <span className="text-xs font-medium text-zinc-300">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
