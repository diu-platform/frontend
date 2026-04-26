import { useState, useCallback, useEffect, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Grid } from '@react-three/drei';
import { Source } from './Source';
import { Barrier } from './Barrier';
import { HeatmapScreen } from './HeatmapScreen';
import { Detector } from './Detector';
import { Particles } from './Particles';
import { LightBeam } from './LightBeam';
import { calculateFringeCount, calculateContrast } from './hooks/useInterference';

export { useWavelengthColor, wavelengthToColor, wavelengthToHex } from './hooks/useWavelengthColor';
export { useInterference, calculateFringeCount, calculateContrast } from './hooks/useInterference';

const SOURCE_X = -8;
const BARRIER_X = 0;
const SCREEN_X = 8;
const HISTOGRAM_BINS = 50;
const SCREEN_WIDTH = 5;

export interface DoubleSlitParams {
  wavelength: number;
  slitDistance: number;
  intensity: number;
  observerOn: boolean;
  slowMotion?: boolean;
  showTrails?: boolean;
  showHeatmap?: boolean;
  soundEnabled?: boolean;
}

export interface DoubleSlitStats {
  totalParticles: number;
  fringeCount: number;
  contrast: number;
  histogram: number[];
}

interface DoubleSlitProps {
  params: DoubleSlitParams;
  onStatsUpdate?: (stats: DoubleSlitStats) => void;
}

const INITIAL_STATS: DoubleSlitStats = {
  totalParticles: 0,
  fringeCount: 0,
  contrast: 0,
  histogram: new Array(HISTOGRAM_BINS).fill(0),
};

export function DoubleSlit({ params, onStatsUpdate }: DoubleSlitProps) {
  const { 
    wavelength, 
    slitDistance, 
    intensity, 
    observerOn,
    slowMotion = false,
    showTrails = true,
    showHeatmap = true,
    soundEnabled = true,
  } = params;
  
  const [stats, setStats] = useState<DoubleSlitStats>({ ...INITIAL_STATS, histogram: [...INITIAL_STATS.histogram] });
  
  // Track previous values to detect changes
  const prevParamsRef = useRef({ wavelength, slitDistance, observerOn });

  // Reset stats when key parameters change
  useEffect(() => {
    const prev = prevParamsRef.current;
    const needsReset = 
      prev.wavelength !== wavelength || 
      prev.slitDistance !== slitDistance || 
      prev.observerOn !== observerOn;
    
    if (needsReset) {
      setStats({
        totalParticles: 0,
        fringeCount: 0,
        contrast: 0,
        histogram: new Array(HISTOGRAM_BINS).fill(0),
      });
      prevParamsRef.current = { wavelength, slitDistance, observerOn };
    }
  }, [wavelength, slitDistance, observerOn]);

  const handleParticleHit = useCallback((z: number) => {
    setStats(prev => {
      const normalizedZ = (z + SCREEN_WIDTH / 2) / SCREEN_WIDTH;
      const bin = Math.floor(normalizedZ * HISTOGRAM_BINS);
      const clampedBin = Math.max(0, Math.min(HISTOGRAM_BINS - 1, bin));
      
      const newHistogram = [...prev.histogram];
      newHistogram[clampedBin]++;
      
      const newTotal = prev.totalParticles + 1;
      
      return {
        totalParticles: newTotal,
        fringeCount: calculateFringeCount(newHistogram),
        contrast: calculateContrast(newHistogram),
        histogram: newHistogram,
      };
    });
  }, []);

  // Report stats to parent
  useEffect(() => {
    if (onStatsUpdate) onStatsUpdate(stats);
  }, [stats, onStatsUpdate]);

  return (
    <group>
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 12, 8]} intensity={0.6} />
      <pointLight position={[-5, 8, -5]} intensity={0.2} color="#4060ff" />

      {/* Grid */}
      <Grid
        position={[0, 0, 0]}
        args={[24, 24]}
        cellSize={1}
        cellThickness={0.5}
        cellColor="#252540"
        sectionSize={4}
        sectionThickness={1}
        sectionColor="#353555"
        fadeDistance={30}
        fadeStrength={1}
      />

      {/* Source */}
      <Source 
        position={[SOURCE_X, 1.2, 0]} 
        wavelength={wavelength}
        intensity={intensity}
      />

      {/* Light beam */}
      <LightBeam
        startX={SOURCE_X + 0.5}
        endX={BARRIER_X - 0.15}
        y={1.2}
        wavelength={wavelength}
        slitDistance={slitDistance}
        intensity={intensity}
      />

      {/* Barrier */}
      <Barrier
        position={[BARRIER_X, 0, 0]}
        slitDistance={slitDistance}
      />

      {/* Screen with heatmap */}
      <HeatmapScreen
        position={[SCREEN_X, 2, 0]}
        histogram={stats.histogram}
        wavelength={wavelength}
        observerOn={observerOn}
        showHeatmap={showHeatmap}
      />

      {/* Detector */}
      <Detector
        position={[BARRIER_X - 0.5, 1.8, -slitDistance]}
        visible={observerOn}
      />

      {/* Particles */}
      <Particles
        wavelength={wavelength}
        slitDistance={slitDistance}
        intensity={intensity}
        observerOn={observerOn}
        slowMotion={slowMotion}
        showTrails={showTrails}
        soundEnabled={soundEnabled}
        onParticleHit={handleParticleHit}
        sourceX={SOURCE_X}
        barrierX={BARRIER_X}
        screenX={SCREEN_X}
      />
    </group>
  );
}

export function DoubleSlitCanvas({ 
  params, 
  onStatsUpdate,
  className = '',
}: DoubleSlitProps & { className?: string }) {
  return (
    <div className={`w-full h-[450px] rounded-xl overflow-hidden ${className}`}>
      <Canvas
        camera={{ position: [0, 8, 14], fov: 55 }}
        style={{ background: 'linear-gradient(135deg, #0a0a12 0%, #12121e 50%, #080810 100%)' }}
      >
        <DoubleSlit params={params} onStatsUpdate={onStatsUpdate} />
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          target={[0, 1, 0]}
          minDistance={3}
          maxDistance={35}
        />
      </Canvas>
    </div>
  );
}

export default DoubleSlit;
