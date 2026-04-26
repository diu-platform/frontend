import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface SceneLabelProps {
  position: [number, number, number];
  children: React.ReactNode;
  minDistance?: number;
  maxDistance?: number;
  alwaysVisible?: boolean;
}

/**
 * Distance-adaptive label that hides/shows based on camera distance
 * and stays properly oriented
 */
export function SceneLabel({ 
  position, 
  children, 
  minDistance = 5,
  maxDistance = 25,
  alwaysVisible = false,
}: SceneLabelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  useFrame(() => {
    if (!groupRef.current) return;
    
    const worldPos = new THREE.Vector3(...position);
    const distance = camera.position.distanceTo(worldPos);
    
    // Calculate visibility
    if (alwaysVisible) {
      groupRef.current.visible = true;
    } else {
      groupRef.current.visible = distance >= minDistance && distance <= maxDistance;
    }
    
    // Scale based on distance to maintain readable size
    if (groupRef.current.visible) {
      const scale = Math.max(0.5, Math.min(1.5, distance / 15));
      groupRef.current.scale.setScalar(scale);
    }
  });

  return (
    <group ref={groupRef} position={position}>
      <Html center distanceFactor={10} style={{ pointerEvents: 'none' }}>
        {children}
      </Html>
    </group>
  );
}

interface SceneLabelsProps {
  sourceX: number;
  barrierX: number;
  screenX: number;
  wavelength: number;
  observerOn: boolean;
}

/**
 * All scene labels with proper distance-based visibility
 */
export function SceneLabels({ 
  sourceX, 
  barrierX, 
  screenX, 
  wavelength,
  observerOn,
}: SceneLabelsProps) {
  return (
    <>
      {/* Source label - visible at medium distance */}
      <SceneLabel position={[sourceX - 0.3, 2.8, 0]} minDistance={8} maxDistance={30}>
        <div className="text-white text-xs bg-black/70 px-2 py-1 rounded whitespace-nowrap backdrop-blur-sm border border-white/10">
          🔦 Лазер ({wavelength} нм)
        </div>
      </SceneLabel>

      {/* Barrier label */}
      <SceneLabel position={[barrierX, 4.2, 0]} minDistance={8} maxDistance={30}>
        <div className="text-white text-xs bg-black/70 px-2 py-1 rounded whitespace-nowrap backdrop-blur-sm border border-white/10">
          Барьер с щелями
        </div>
      </SceneLabel>

      {/* Screen label */}
      <SceneLabel position={[screenX, 4.8, 0]} minDistance={8} maxDistance={30}>
        <div className="text-white text-xs bg-black/70 px-2 py-1 rounded whitespace-nowrap backdrop-blur-sm border border-white/10">
          Экран детектора
        </div>
      </SceneLabel>

      {/* Mode indicator - always visible but smaller when close */}
      <SceneLabel position={[0, 5.5, 0]} minDistance={0} maxDistance={35} alwaysVisible>
        <div className={`text-sm font-medium px-3 py-1.5 rounded-full backdrop-blur-sm border ${
          observerOn 
            ? 'bg-red-500/40 text-red-200 border-red-400/50' 
            : 'bg-blue-500/40 text-blue-200 border-blue-400/50'
        }`}>
          {observerOn ? '👁 Классический режим' : '🌊 Квантовый режим'}
        </div>
      </SceneLabel>

      {/* Close-up labels - only visible when very close */}
      <SceneLabel position={[sourceX + 0.2, 0.5, 0]} minDistance={0} maxDistance={8}>
        <div className="text-[10px] text-gray-400 bg-black/50 px-1 rounded">
          источник
        </div>
      </SceneLabel>

      <SceneLabel position={[barrierX, 0.5, 0]} minDistance={0} maxDistance={8}>
        <div className="text-[10px] text-gray-400 bg-black/50 px-1 rounded">
          d = расстояние между щелями
        </div>
      </SceneLabel>
    </>
  );
}
