import { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';

import { FullscreenToggle, FullscreenOverlay, MinimalFullscreenControls } from './FullscreenToggle';
import { CanvasOverlayInfo } from './CanvasOverlayInfo';

import DoubleSlit from '../simulations/DoubleSlit';
import type { DoubleSlitParams, DoubleSlitStats } from '../simulations/DoubleSlit';

import QuantumTunneling from '../simulations/QuantumTunneling';
import type { TunnelingParams, TunnelingStats } from '../simulations/QuantumTunneling';

import HydrogenOrbitals from '../simulations/HydrogenOrbitals';
import type { HydrogenParams, HydrogenStats } from '../simulations/HydrogenOrbitals';

import type { ExperimentType } from './ExperimentSelector';
import type { ScreenMode } from './ScreenDisplayMode';
import { MIN_CAMERA_DISTANCE, MAX_CAMERA_DISTANCE } from '../hooks/useSimulationState';

interface SimulationCanvasProps {
  currentExperiment: ExperimentType;
  params: DoubleSlitParams;
  screenMode: ScreenMode;
  resetKey: number;
  stats: DoubleSlitStats | null;
  setStats: (s: DoubleSlitStats | null) => void;
  tunnelingParams: TunnelingParams;
  tunnelingStats: TunnelingStats | null;
  setTunnelingStats: (s: TunnelingStats | null) => void;
  hydrogenParams: HydrogenParams;
  hydrogenStats: HydrogenStats | null;
  setHydrogenStats: (s: HydrogenStats | null) => void;
  isFullscreen: boolean;
  setIsFullscreen: (v: boolean) => void;
  cameraDistance: number;
  canvasContainerRef: React.RefObject<HTMLDivElement>;
}

export function SimulationCanvas({
  currentExperiment,
  params,
  screenMode,
  resetKey,
  stats,
  setStats,
  tunnelingParams,
  tunnelingStats,
  setTunnelingStats,
  hydrogenParams,
  hydrogenStats,
  setHydrogenStats,
  isFullscreen,
  setIsFullscreen,
  cameraDistance,
  canvasContainerRef,
}: SimulationCanvasProps) {
  return (
    <div className={`flex-1 relative ${isFullscreen ? 'w-full' : ''}`} ref={canvasContainerRef}>
      <div className="absolute top-4 right-4 z-10">
        <FullscreenToggle
          targetRef={canvasContainerRef}
          onFullscreenChange={setIsFullscreen}
        />
      </div>

      {currentExperiment === 'doubleSlit' && (
        <FullscreenOverlay
          isFullscreen={isFullscreen}
          onExit={() => {
            if (document.exitFullscreen) {
              document.exitFullscreen();
            }
          }}
        >
          <MinimalFullscreenControls
            wavelength={params.wavelength}
            slitDistance={params.slitDistance}
            intensity={params.intensity}
            observerOn={params.observerOn}
            totalParticles={stats?.totalParticles ?? 0}
            fringeCount={stats?.fringeCount ?? 0}
          />
        </FullscreenOverlay>
      )}

      <Canvas shadows>
        <PerspectiveCamera
          makeDefault
          position={[0, 8, cameraDistance]}
          fov={50}
        />
        <OrbitControls
          minDistance={MIN_CAMERA_DISTANCE}
          maxDistance={MAX_CAMERA_DISTANCE}
          maxPolarAngle={Math.PI / 2}
          enableDamping
          dampingFactor={0.05}
        />
        <Suspense fallback={null}>
          {currentExperiment === 'doubleSlit' && (
            <DoubleSlit
              key={`doubleSlit-${resetKey}`}
              params={{
                ...params,
                showDiscretePoints: screenMode === 'points' || screenMode === 'hybrid',
                showHeatmap: screenMode === 'fringes' || screenMode === 'hybrid' || params.showHeatmap,
              }}
              onStatsUpdate={setStats}
            />
          )}

          {currentExperiment === 'tunneling' && (
            <QuantumTunneling
              key={`tunneling-${resetKey}`}
              params={tunnelingParams}
              onStatsUpdate={setTunnelingStats}
            />
          )}

          {currentExperiment === 'hydrogen' && (
            <HydrogenOrbitals
              key={`hydrogen-${resetKey}`}
              params={hydrogenParams}
              onStatsUpdate={setHydrogenStats}
            />
          )}
        </Suspense>
      </Canvas>

      <CanvasOverlayInfo
        currentExperiment={currentExperiment}
        params={params}
        tunnelingStats={tunnelingStats}
        hydrogenStats={hydrogenStats}
      />
    </div>
  );
}
