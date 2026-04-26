import { useLanguage } from '../i18n/LanguageContext';
import type { TunnelingParams } from '../simulations/QuantumTunneling';

export function TunnelingControls({
  params,
  setParams,
  onReset,
}: {
  params: TunnelingParams;
  setParams: (p: TunnelingParams) => void;
  onReset: () => void;
}) {
  const { t: _t } = useLanguage();

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-purple-400 flex items-center gap-2">
          ⚡ Quantum Tunneling
        </h3>
        <button
          onClick={onReset}
          className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded"
        >
          Reset
        </button>
      </div>

      {/* Particle Energy */}
      <div>
        <label className="flex justify-between text-sm text-gray-300 mb-1">
          <span>Particle Energy (E)</span>
          <span className="text-green-400">{params.particleEnergy} eV</span>
        </label>
        <input
          type="range"
          min="0.5"
          max="20"
          step="0.5"
          value={params.particleEnergy}
          onChange={(e) => setParams({ ...params, particleEnergy: parseFloat(e.target.value) })}
          className="w-full accent-green-500"
        />
      </div>

      {/* Barrier Height */}
      <div>
        <label className="flex justify-between text-sm text-gray-300 mb-1">
          <span>Barrier Height (V₀)</span>
          <span className="text-purple-400">{params.barrierHeight} eV</span>
        </label>
        <input
          type="range"
          min="1"
          max="25"
          step="0.5"
          value={params.barrierHeight}
          onChange={(e) => setParams({ ...params, barrierHeight: parseFloat(e.target.value) })}
          className="w-full accent-purple-500"
        />
      </div>

      {/* Barrier Width */}
      <div>
        <label className="flex justify-between text-sm text-gray-300 mb-1">
          <span>Barrier Width (L)</span>
          <span className="text-purple-400">{params.barrierWidth.toFixed(1)} nm</span>
        </label>
        <input
          type="range"
          min="0.1"
          max="5"
          step="0.1"
          value={params.barrierWidth}
          onChange={(e) => setParams({ ...params, barrierWidth: parseFloat(e.target.value) })}
          className="w-full accent-purple-500"
        />
      </div>

      {/* Intensity */}
      <div>
        <label className="flex justify-between text-sm text-gray-300 mb-1">
          <span>Particle Rate</span>
          <span className="text-blue-400">{params.intensity}/s</span>
        </label>
        <input
          type="range"
          min="5"
          max="100"
          step="5"
          value={params.intensity}
          onChange={(e) => setParams({ ...params, intensity: parseInt(e.target.value) })}
          className="w-full accent-blue-500"
        />
      </div>

      {/* Toggles */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700">
        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={params.showWaves ?? true}
            onChange={(e) => setParams({ ...params, showWaves: e.target.checked })}
            className="accent-purple-500"
          />
          Show Waves
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={params.showTrails ?? true}
            onChange={(e) => setParams({ ...params, showTrails: e.target.checked })}
            className="accent-purple-500"
          />
          Show Trails
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={params.slowMotion ?? false}
            onChange={(e) => setParams({ ...params, slowMotion: e.target.checked })}
            className="accent-purple-500"
          />
          Slow Motion
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={params.showEnergyPlane ?? true}
            onChange={(e) => setParams({ ...params, showEnergyPlane: e.target.checked })}
            className="accent-purple-500"
          />
          Energy Plane
        </label>
      </div>

      {/* Status */}
      <div className={`p-2 rounded text-sm text-center ${
        params.particleEnergy >= params.barrierHeight
          ? 'bg-green-900/50 text-green-300'
          : 'bg-purple-900/50 text-purple-300'
      }`}>
        {params.particleEnergy >= params.barrierHeight
          ? '✓ Classical case: E ≥ V₀'
          : '⚡ Tunneling: E < V₀'
        }
      </div>
    </div>
  );
}
