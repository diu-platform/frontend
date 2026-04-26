import { useState, useCallback, useEffect, useRef } from 'react';

import { type AppMode } from '../components/ModeSelector';
import { type ExperimentType } from '../components/ExperimentSelector';
import { DEFAULT_RESEARCH_PARAMS, type ResearchParams } from '../components/ResearchPanel';
import { type ScreenMode } from '../components/ScreenDisplayMode';
import { type DoubleSlitParams, type DoubleSlitStats } from '../simulations/DoubleSlit';
import { type TunnelingParams, type TunnelingStats, DEFAULT_TUNNELING_PARAMS } from '../simulations/QuantumTunneling';
import { type HydrogenParams, type HydrogenStats, DEFAULT_HYDROGEN_PARAMS } from '../simulations/HydrogenOrbitals';

export const DEFAULT_DEMO_PARAMS: DoubleSlitParams = {
  wavelength: 550,
  slitDistance: 0.3,
  slitWidth: 0.05,
  barrierThickness: 0.1,
  coherence: 100,
  intensity: 50,
  observerOn: false,
  slowMotion: false,
  showTrails: true,
  showHeatmap: true,
  soundEnabled: false,
  showDiscretePoints: false,
  showTheoryOverlay: false,
};

export const DEFAULT_LAB_PARAMS: DoubleSlitParams = {
  ...DEFAULT_DEMO_PARAMS,
  barrierThickness: 0.1,
  showDiscretePoints: true,
  showTheoryOverlay: false,
};

export const MIN_CAMERA_DISTANCE = 2;
export const MAX_CAMERA_DISTANCE = 60;

export interface SimulationState {
  // Navigation
  currentMode: AppMode;
  setCurrentMode: React.Dispatch<React.SetStateAction<AppMode>>;
  currentExperiment: ExperimentType;
  setCurrentExperiment: React.Dispatch<React.SetStateAction<ExperimentType>>;
  showComingSoon: AppMode | null;
  setShowComingSoon: React.Dispatch<React.SetStateAction<AppMode | null>>;

  // Double-Slit
  params: DoubleSlitParams;
  setParams: React.Dispatch<React.SetStateAction<DoubleSlitParams>>;
  researchParams: ResearchParams;
  setResearchParams: React.Dispatch<React.SetStateAction<ResearchParams>>;
  stats: DoubleSlitStats | null;
  setStats: React.Dispatch<React.SetStateAction<DoubleSlitStats | null>>;

  // Tunneling
  tunnelingParams: TunnelingParams;
  setTunnelingParams: React.Dispatch<React.SetStateAction<TunnelingParams>>;
  tunnelingStats: TunnelingStats | null;
  setTunnelingStats: React.Dispatch<React.SetStateAction<TunnelingStats | null>>;

  // Hydrogen
  hydrogenParams: HydrogenParams;
  setHydrogenParams: React.Dispatch<React.SetStateAction<HydrogenParams>>;
  hydrogenStats: HydrogenStats | null;
  setHydrogenStats: React.Dispatch<React.SetStateAction<HydrogenStats | null>>;

  // Display
  screenMode: ScreenMode;
  setScreenMode: React.Dispatch<React.SetStateAction<ScreenMode>>;
  heatmapOpacity: number;
  setHeatmapOpacity: React.Dispatch<React.SetStateAction<number>>;
  showModeInfo: boolean;
  setShowModeInfo: React.Dispatch<React.SetStateAction<boolean>>;
  showCredits: boolean;
  setShowCredits: React.Dispatch<React.SetStateAction<boolean>>;
  isFullscreen: boolean;
  setIsFullscreen: React.Dispatch<React.SetStateAction<boolean>>;

  // Camera
  cameraDistance: number;

  // Reset counter
  resetKey: number;

  // Refs
  canvasContainerRef: React.RefObject<HTMLDivElement>;

  // Handlers
  handleModeChange: (mode: AppMode) => void;
  handleReset: () => void;
  handleExport: () => void;
}

export function useSimulationState(): SimulationState {
  // Navigation
  const [currentMode, setCurrentMode] = useState<AppMode>('demo');
  const [currentExperiment, setCurrentExperiment] = useState<ExperimentType>('doubleSlit');
  const [showComingSoon, setShowComingSoon] = useState<AppMode | null>(null);

  // Double-Slit
  const [params, setParams] = useState<DoubleSlitParams>(DEFAULT_DEMO_PARAMS);
  const [researchParams, setResearchParams] = useState<ResearchParams>(DEFAULT_RESEARCH_PARAMS);
  const [stats, setStats] = useState<DoubleSlitStats | null>(null);

  // Tunneling
  const [tunnelingParams, setTunnelingParams] = useState<TunnelingParams>(DEFAULT_TUNNELING_PARAMS);
  const [tunnelingStats, setTunnelingStats] = useState<TunnelingStats | null>(null);

  // Hydrogen
  const [hydrogenParams, setHydrogenParams] = useState<HydrogenParams>(DEFAULT_HYDROGEN_PARAMS);
  const [hydrogenStats, setHydrogenStats] = useState<HydrogenStats | null>(null);

  // Display
  const [screenMode, setScreenMode] = useState<ScreenMode>('points');
  const [heatmapOpacity, setHeatmapOpacity] = useState(0.6);
  const [showModeInfo, setShowModeInfo] = useState(false);
  const [showCredits, setShowCredits] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Camera (constant)
  const cameraDistance = 20;

  // Reset counter
  const [resetKey, setResetKey] = useState(0);

  // Refs
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // Sync research params → double-slit params when in research mode
  useEffect(() => {
    if (currentMode === 'research' && currentExperiment === 'doubleSlit') {
      setParams(prev => ({
        ...prev,
        wavelength: researchParams.source.wavelength,
        slitDistance: researchParams.geometry.slitDistance,
        slitWidth: researchParams.geometry.slitWidth,
        coherence: researchParams.source.coherence,
        intensity: researchParams.source.intensity,
      }));
    }
  }, [currentMode, currentExperiment, researchParams]);

  const handleModeChange = useCallback((mode: AppMode) => {
    if (['simulation', 'collaboration', 'sandbox'].includes(mode)) {
      setShowComingSoon(mode);
      return;
    }

    setCurrentMode(mode);

    switch (mode) {
      case 'demo':
        setParams(DEFAULT_DEMO_PARAMS);
        break;
      case 'lab':
        setParams(DEFAULT_LAB_PARAMS);
        break;
      case 'research':
        setParams({
          ...DEFAULT_LAB_PARAMS,
          wavelength: researchParams.source.wavelength,
          slitDistance: researchParams.geometry.slitDistance,
          slitWidth: researchParams.geometry.slitWidth,
          coherence: researchParams.source.coherence,
          intensity: researchParams.source.intensity,
          showDiscretePoints: researchParams.display.screenMode === 'points' || researchParams.display.screenMode === 'hybrid',
          showHeatmap: researchParams.display.showHeatmap,
          showTheoryOverlay: researchParams.display.showTheoryCurve,
        });
        break;
    }
  }, [researchParams]);

  const handleReset = useCallback(() => {
    switch (currentExperiment) {
      case 'doubleSlit':
        switch (currentMode) {
          case 'demo':
            setParams(DEFAULT_DEMO_PARAMS);
            break;
          case 'lab':
            setParams(DEFAULT_LAB_PARAMS);
            break;
          case 'research':
            setResearchParams(DEFAULT_RESEARCH_PARAMS);
            break;
        }
        break;
      case 'tunneling':
        setTunnelingParams(DEFAULT_TUNNELING_PARAMS);
        break;
      case 'hydrogen':
        setHydrogenParams(DEFAULT_HYDROGEN_PARAMS);
        break;
    }
    setResetKey(prev => prev + 1);
  }, [currentMode, currentExperiment]);

  const handleExport = useCallback(() => {
    let exportData;
    switch (currentExperiment) {
      case 'doubleSlit':
        exportData = {
          experiment: 'doubleSlit',
          mode: currentMode,
          params: currentMode === 'research' ? researchParams : params,
          stats,
        };
        break;
      case 'tunneling':
        exportData = {
          experiment: 'tunneling',
          params: tunnelingParams,
          stats: tunnelingStats,
        };
        break;
      case 'hydrogen':
        exportData = {
          experiment: 'hydrogen',
          params: hydrogenParams,
          stats: hydrogenStats,
        };
        break;
    }

    const data = {
      ...exportData,
      timestamp: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `diu-${currentExperiment}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [currentExperiment, currentMode, params, researchParams, stats, tunnelingParams, tunnelingStats, hydrogenParams, hydrogenStats]);

  return {
    currentMode,
    setCurrentMode,
    currentExperiment,
    setCurrentExperiment,
    showComingSoon,
    setShowComingSoon,
    params,
    setParams,
    researchParams,
    setResearchParams,
    stats,
    setStats,
    tunnelingParams,
    setTunnelingParams,
    tunnelingStats,
    setTunnelingStats,
    hydrogenParams,
    setHydrogenParams,
    hydrogenStats,
    setHydrogenStats,
    screenMode,
    setScreenMode,
    heatmapOpacity,
    setHeatmapOpacity,
    showModeInfo,
    setShowModeInfo,
    showCredits,
    setShowCredits,
    isFullscreen,
    setIsFullscreen,
    cameraDistance,
    resetKey,
    canvasContainerRef,
    handleModeChange,
    handleReset,
    handleExport,
  };
}
