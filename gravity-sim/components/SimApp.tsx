'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { Renderer } from '@/lib/gpu/Renderer';
import { BodyType, BODY_DEFAULTS, type SimStats, type PendingBodyCfg } from '@/lib/types';
import Sidebar from './Sidebar';
import BottomPanel from './BottomPanel';
import Legend from './Legend';



export default function SimApp() {
  const canvasRef  = useRef<HTMLCanvasElement>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const pendingCfgRef = useRef<PendingBodyCfg>(BODY_DEFAULTS[BodyType.Planet]);

  const [stats,  setStats]  = useState<SimStats>({ fps: 0, bodyCount: 0, simTime: 0 });
  const [speed,  setSpeed]  = useState(1.0);
  const [paused, setPaused]  = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const setSize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
      rendererRef.current?.resize(canvas.width, canvas.height);
    };
    setSize();
    window.addEventListener('resize', setSize);

    const renderer = new Renderer();
    rendererRef.current = renderer;

    renderer.init(canvas, setStats)
      .catch(err => setError(String(err)));

    return () => {
      window.removeEventListener('resize', setSize);
      renderer.destroy();
      rendererRef.current = null;
    };
  }, []);

  const pointerStateRef = useRef({ isDown: false, lastSpawnTime: 0, lastX: 0, lastY: 0 });

  const spawnBody = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    const renderer = rendererRef.current;
    if (!canvas || !renderer) return;

    const rect = canvas.getBoundingClientRect();
    const wx = (clientX - rect.left) - rect.width / 2;
    const wy = (clientY - rect.top) - rect.height / 2;

    const cfg = pendingCfgRef.current;
    renderer.addBody({ x: wx, y: wy, ...cfg });
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    pointerStateRef.current.isDown = true;
    pointerStateRef.current.lastSpawnTime = Date.now();
    pointerStateRef.current.lastX = e.clientX;
    pointerStateRef.current.lastY = e.clientY;
    spawnBody(e.clientX, e.clientY);
  }, [spawnBody]);

  const handlePointerMove = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!pointerStateRef.current.isDown) return;
    
    const now = Date.now();
    const state = pointerStateRef.current;
    const distSq = (e.clientX - state.lastX) ** 2 + (e.clientY - state.lastY) ** 2;
    
    // Throttle spawning by time (50ms) or distance (20px) to prevent instantly hitting max bodies
    if (now - state.lastSpawnTime > 50 || distSq > 400) {
      state.lastSpawnTime = now;
      state.lastX = e.clientX;
      state.lastY = e.clientY;
      spawnBody(e.clientX, e.clientY);
    }
  }, [spawnBody]);

  const handlePointerUp = useCallback((e: React.PointerEvent<HTMLCanvasElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    pointerStateRef.current.isDown = false;
  }, []);

  const handlePause = useCallback(() => {
    setPaused(p => {
      const next = !p;
      rendererRef.current?.setPaused(next);
      return next;
    });
  }, []);

  const handleConfigChange = useCallback((cfg: PendingBodyCfg) => {
    pendingCfgRef.current = cfg;
  }, []);

  const handleSpeed = useCallback((s: number) => {
    setSpeed(s);
    rendererRef.current?.setSpeed(s);
  }, []);

  const handleClear = useCallback(() => {
    rendererRef.current?.clearAll();
  }, []);



  if (error) {
    return (
      <div className="w-screen h-screen flex flex-col items-center justify-center bg-black text-white gap-4 p-8">
        <h1 className="text-2xl font-bold text-red-400">WebGPU Error</h1>
        <p className="text-white/70 text-center max-w-md">{error}</p>
        <p className="text-white/40 text-sm">Requires Chrome 113+ or Edge 113+ with WebGPU enabled.</p>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black">
      <Sidebar onConfigChange={handleConfigChange} />
      <div className="absolute inset-0">
        <canvas
          ref={canvasRef}
          className="absolute inset-0 cursor-crosshair touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
        <BottomPanel
          stats={stats}
          speed={speed}
          onSpeed={handleSpeed}
          paused={paused}
          onPause={handlePause}
          onClear={handleClear}
        />
        <Legend />
      </div>
    </div>
  );
}
