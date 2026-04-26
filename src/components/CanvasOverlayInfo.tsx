import { EXPERIMENTS, type ExperimentType } from './ExperimentSelector';
import type { DoubleSlitParams } from '../simulations/DoubleSlit';
import type { TunnelingStats } from '../simulations/QuantumTunneling';
import type { HydrogenStats } from '../simulations/HydrogenOrbitals';
import { useLanguage } from '../i18n/LanguageContext';

interface CanvasOverlayInfoProps {
  currentExperiment: ExperimentType;
  params: DoubleSlitParams;
  tunnelingStats: TunnelingStats | null;
  hydrogenStats: HydrogenStats | null;
}

export function CanvasOverlayInfo({
  currentExperiment,
  params,
  tunnelingStats,
  hydrogenStats,
}: CanvasOverlayInfoProps) {
  const { t, language } = useLanguage();
  const currentExpInfo = EXPERIMENTS.find(e => e.id === currentExperiment)!;

  return (
    <div className="absolute bottom-4 left-4 flex items-center gap-4 text-sm">
      <div
        className="px-3 py-1.5 bg-slate-900/80 backdrop-blur rounded-lg flex items-center gap-2"
        style={{ borderLeft: `3px solid ${currentExpInfo.color}` }}
      >
        <span>{currentExpInfo.icon}</span>
        <span className="text-white font-medium">
          {language === 'ru' ? currentExpInfo.nameRu : currentExpInfo.name}
        </span>
      </div>

      {currentExperiment === 'doubleSlit' && (
        <>
          <div className="px-3 py-1.5 bg-slate-900/80 backdrop-blur rounded-lg flex items-center gap-2">
            <div
              className="w-3 h-3 rounded-full"
              style={{
                backgroundColor: `hsl(${(params.wavelength - 380) / (780 - 380) * 270}, 100%, 50%)`,
              }}
            />
            <span className="text-white font-mono">{params.wavelength} nm</span>
          </div>
          {params.observerOn && (
            <div className="px-3 py-1.5 bg-red-600/80 backdrop-blur rounded-lg text-white flex items-center gap-1">
              👁️ {t('controls.detectorOn')}
            </div>
          )}
        </>
      )}

      {currentExperiment === 'tunneling' && tunnelingStats && (
        <div className="px-3 py-1.5 bg-slate-900/80 backdrop-blur rounded-lg text-purple-300">
          T = {(tunnelingStats.experimentalProbability * 100).toFixed(1)}%
        </div>
      )}

      {currentExperiment === 'hydrogen' && hydrogenStats && (
        <div className="px-3 py-1.5 bg-slate-900/80 backdrop-blur rounded-lg text-orange-300">
          {hydrogenStats.orbitalName} | E = {hydrogenStats.energy.toFixed(2)} eV
        </div>
      )}
    </div>
  );
}
