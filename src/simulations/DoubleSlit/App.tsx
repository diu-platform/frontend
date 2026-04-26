import { useState, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { RotateCcw, HelpCircle } from 'lucide-react';

import { DoubleSlit } from './simulations/DoubleSlit/index';
import type { DoubleSlitStats, DoubleSlitParams } from './simulations/DoubleSlit/index';

import { ControlsPanel } from './components/ControlsPanel';
import { StatsPanel } from './components/StatsPanel';
import { TasksPanel } from './components/TasksPanel';
import { TheoryPanel } from './components/TheoryPanel';

type ExperimentType = 'doubleSlit' | 'tunneling' | 'hydrogen';

const EXPERIMENTS = [
  { id: 'doubleSlit' as const, label: '🌊 Двухщелевой', color: 'from-blue-500 to-cyan-500' },
  { id: 'tunneling' as const, label: '⚡ Туннелирование', color: 'from-purple-500 to-pink-500', disabled: true },
  { id: 'hydrogen' as const, label: '⚛️ Орбитали H', color: 'from-orange-500 to-yellow-500', disabled: true },
];

const DEFAULT_PARAMS: DoubleSlitParams = {
  wavelength: 550,
  slitDistance: 0.5,
  intensity: 50,
  observerOn: false,
  slowMotion: false,
  showTrails: true,
  showHeatmap: true,
  soundEnabled: true,
};

const DEFAULT_STATS: DoubleSlitStats = {
  totalParticles: 0,
  fringeCount: 0,
  contrast: 0,
  histogram: new Array(50).fill(0),
};

function getWavelengthColor(wl: number): string {
  if (wl < 450) return '#8b5cf6';
  if (wl < 495) return '#3b82f6';
  if (wl < 520) return '#06b6d4';
  if (wl < 565) return '#22c55e';
  if (wl < 590) return '#eab308';
  if (wl < 625) return '#f97316';
  return '#ef4444';
}

export default function App() {
  const [activeExperiment, setActiveExperiment] = useState<ExperimentType>('doubleSlit');
  const [params, setParams] = useState<DoubleSlitParams>({ ...DEFAULT_PARAMS });
  const [stats, setStats] = useState<DoubleSlitStats>({ ...DEFAULT_STATS, histogram: [...DEFAULT_STATS.histogram] });
  const [showHelp, setShowHelp] = useState(false);

  const handleReset = useCallback(() => {
    setParams({ ...DEFAULT_PARAMS });
    setStats({ ...DEFAULT_STATS, histogram: [...DEFAULT_STATS.histogram] });
  }, []);

  const handleStatsUpdate = useCallback((newStats: DoubleSlitStats) => {
    setStats(newStats);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-800 via-slate-800 to-gray-800 text-white">
      {/* Header */}
      <header className="text-center py-4">
        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
          🔬 3D Квантовая Физика
        </h1>
        <p className="text-gray-400 mt-1 text-sm">DIU Platform</p>
      </header>

      {/* Experiment Tabs */}
      <div className="flex justify-center gap-2 mb-4 flex-wrap px-4">
        {EXPERIMENTS.map((exp) => (
          <button
            key={exp.id}
            onClick={() => !exp.disabled && setActiveExperiment(exp.id)}
            disabled={exp.disabled}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
              activeExperiment === exp.id
                ? `bg-gradient-to-r ${exp.color} shadow-lg scale-105`
                : exp.disabled
                ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                : 'bg-gray-700 hover:bg-gray-600'
            }`}
          >
            {exp.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-2 md:px-4 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* Left Panel */}
          <div className="lg:col-span-3 space-y-3 order-2 lg:order-1">
            <ControlsPanel params={params} setParams={setParams} onReset={handleReset} />
            <TheoryPanel observerOn={params.observerOn} />
          </div>

          {/* Center - 3D Canvas */}
          <div className="lg:col-span-6 order-1 lg:order-2">
            <div className="relative">
              <div className="w-full h-[350px] md:h-[450px] rounded-xl overflow-hidden bg-gray-700">
                <Canvas
                  camera={{ position: [0, 8, 14], fov: 55 }}
                  style={{ background: 'linear-gradient(180deg, #2a2a3a 0%, #1e1e2e 50%, #18182a 100%)' }}
                >
                  {activeExperiment === 'doubleSlit' && (
                    <DoubleSlit params={params} onStatsUpdate={handleStatsUpdate} />
                  )}
                  <OrbitControls
                    enableDamping
                    dampingFactor={0.05}
                    target={[0, 1, 0]}
                    minDistance={3}
                    maxDistance={35}
                  />
                </Canvas>
              </div>

              {/* Top-right buttons */}
              <div className="absolute top-2 right-2 flex gap-1">
                <button
                  onClick={() => setShowHelp(!showHelp)}
                  className="p-2 bg-gray-700/80 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <HelpCircle size={16} />
                </button>
                <button
                  onClick={handleReset}
                  className="p-2 bg-gray-700/80 hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <RotateCcw size={16} />
                </button>
              </div>

              {/* Help popup */}
              {showHelp && (
                <div className="absolute top-12 right-2 bg-gray-700/95 backdrop-blur rounded-lg p-3 text-sm w-52 shadow-xl z-10">
                  <h4 className="font-semibold text-white mb-2">🎮 Управление</h4>
                  <ul className="text-gray-300 space-y-1 text-xs">
                    <li>🖱️ ЛКМ — вращение</li>
                    <li>🖱️ ПКМ — панорама</li>
                    <li>🔄 Колесо — масштаб</li>
                  </ul>
                  <button onClick={() => setShowHelp(false)} className="mt-2 text-xs text-gray-400 hover:text-white">
                    Закрыть
                  </button>
                </div>
              )}

              {/* Bottom status bar */}
              <div className="absolute bottom-2 left-2 right-2 bg-gray-700/80 backdrop-blur rounded-lg px-3 py-1.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: getWavelengthColor(params.wavelength) }} />
                    {params.wavelength}нм
                  </span>
                  <span>d={params.slitDistance.toFixed(1)}</span>
                  <span>I={params.intensity}</span>
                  {params.slowMotion && <span>🐌</span>}
                </div>
                <div className={params.observerOn ? 'text-red-400' : 'text-cyan-400'}>
                  {params.observerOn ? '👁 Детектор' : '🌊 Волна'}
                </div>
              </div>
            </div>
          </div>

          {/* Right Panel */}
          <div className="lg:col-span-3 space-y-3 order-3">
            <StatsPanel stats={stats} observerOn={params.observerOn} />
            <TasksPanel stats={stats} params={params} />
          </div>
        </div>
      </div>
    </div>
  );
}
