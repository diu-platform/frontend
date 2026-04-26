import type { HydrogenParams } from '../simulations/HydrogenOrbitals';

export function HydrogenControls({
  params,
  setParams,
  onReset,
}: {
  params: HydrogenParams;
  setParams: (p: HydrogenParams) => void;
  onReset: () => void;
}) {
  const ORBITAL_NAMES = ['s', 'p', 'd', 'f', 'g', 'h', 'i'];
  const maxL = Math.min(params.n - 1, 6);
  const maxM = params.l;

  // Quick presets
  const presets = [
    { n: 1, l: 0, m: 0, name: '1s' },
    { n: 2, l: 0, m: 0, name: '2s' },
    { n: 2, l: 1, m: 0, name: '2p' },
    { n: 3, l: 0, m: 0, name: '3s' },
    { n: 3, l: 1, m: 0, name: '3p' },
    { n: 3, l: 2, m: 0, name: '3d' },
    { n: 4, l: 3, m: 0, name: '4f' },
  ];

  return (
    <div className="bg-slate-800/50 backdrop-blur rounded-xl p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-orange-400 flex items-center gap-2">
          ⚛️ Hydrogen Orbitals
        </h3>
        <button
          onClick={onReset}
          className="px-2 py-1 text-xs bg-slate-700 hover:bg-slate-600 rounded"
        >
          Reset
        </button>
      </div>

      {/* Quick Presets */}
      <div>
        <label className="text-sm text-gray-400 mb-2 block">Quick Select:</label>
        <div className="flex flex-wrap gap-1">
          {presets.map((p) => (
            <button
              key={p.name}
              onClick={() => setParams({ ...params, n: p.n, l: p.l, m: p.m })}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                params.n === p.n && params.l === p.l
                  ? 'bg-orange-500 text-white'
                  : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Principal quantum number n */}
      <div>
        <label className="flex justify-between text-sm text-gray-300 mb-1">
          <span>Principal (n)</span>
          <span className="text-orange-400">{params.n}</span>
        </label>
        <input
          type="range"
          min="1"
          max="7"
          step="1"
          value={params.n}
          onChange={(e) => {
            const newN = parseInt(e.target.value);
            const newL = Math.min(params.l, newN - 1);
            const newM = Math.min(Math.abs(params.m), newL) * Math.sign(params.m || 1);
            setParams({ ...params, n: newN, l: newL, m: newM });
          }}
          className="w-full accent-orange-500"
        />
      </div>

      {/* Angular quantum number l */}
      <div>
        <label className="flex justify-between text-sm text-gray-300 mb-1">
          <span>Angular (l)</span>
          <span className="text-orange-400">{params.l} ({ORBITAL_NAMES[params.l] || '?'})</span>
        </label>
        <input
          type="range"
          min="0"
          max={maxL}
          step="1"
          value={params.l}
          onChange={(e) => {
            const newL = parseInt(e.target.value);
            const newM = Math.min(Math.abs(params.m), newL) * Math.sign(params.m || 1);
            setParams({ ...params, l: newL, m: newM });
          }}
          className="w-full accent-orange-500"
        />
      </div>

      {/* Magnetic quantum number m */}
      <div>
        <label className="flex justify-between text-sm text-gray-300 mb-1">
          <span>Magnetic (m)</span>
          <span className="text-orange-400">{params.m}</span>
        </label>
        <input
          type="range"
          min={-maxM}
          max={maxM}
          step="1"
          value={params.m}
          onChange={(e) => setParams({ ...params, m: parseInt(e.target.value) })}
          className="w-full accent-orange-500"
          disabled={maxM === 0}
        />
      </div>

      {/* Cloud Density */}
      <div>
        <label className="flex justify-between text-sm text-gray-300 mb-1">
          <span>Cloud Density</span>
          <span className="text-blue-400">{params.cloudDensity}</span>
        </label>
        <input
          type="range"
          min="500"
          max="5000"
          step="250"
          value={params.cloudDensity ?? 1500}
          onChange={(e) => setParams({ ...params, cloudDensity: parseInt(e.target.value) })}
          className="w-full accent-blue-500"
        />
      </div>

      {/* Toggles */}
      <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700">
        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={params.showNucleus ?? true}
            onChange={(e) => setParams({ ...params, showNucleus: e.target.checked })}
            className="accent-orange-500"
          />
          Nucleus
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={params.showAxes ?? true}
            onChange={(e) => setParams({ ...params, showAxes: e.target.checked })}
            className="accent-orange-500"
          />
          Axes
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={params.showProbabilityCloud ?? true}
            onChange={(e) => setParams({ ...params, showProbabilityCloud: e.target.checked })}
            className="accent-orange-500"
          />
          Cloud
        </label>
        <label className="flex items-center gap-2 text-sm text-gray-300 cursor-pointer">
          <input
            type="checkbox"
            checked={params.showOrbitalSurface ?? true}
            onChange={(e) => setParams({ ...params, showOrbitalSurface: e.target.checked })}
            className="accent-orange-500"
          />
          Surface
        </label>
      </div>

      {/* Orbital Info */}
      <div className="bg-slate-900/50 p-2 rounded text-sm">
        <div className="text-orange-400 font-semibold">
          {params.n}{ORBITAL_NAMES[params.l] || '?'} orbital
        </div>
        <div className="text-gray-400 text-xs">
          E = {(-13.6 / (params.n * params.n)).toFixed(2)} eV
        </div>
      </div>
    </div>
  );
}
