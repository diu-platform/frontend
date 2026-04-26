import { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface SceneLabelProps {
  position: [number, number, number];
  children: React.ReactNode;
  minDistance?: number;
  maxDistance?: number;
}

/**
 * Distance-adaptive label
 */
function SceneLabel({ 
  position, 
  children, 
  minDistance = 5,
  maxDistance = 25,
}: SceneLabelProps) {
  const groupRef = useRef<THREE.Group>(null);
  const { camera } = useThree();

  useFrame(() => {
    if (!groupRef.current) return;
    
    const worldPos = new THREE.Vector3(...position);
    const distance = camera.position.distanceTo(worldPos);
    
    groupRef.current.visible = distance >= minDistance && distance <= maxDistance;
    
    if (groupRef.current.visible) {
      const scale = Math.max(0.6, Math.min(1.3, distance / 15));
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
}

/**
 * Scene labels - only for objects, no mode indicator in center
 */
export function SceneLabels({ 
  sourceX, 
  barrierX, 
  screenX, 
  wavelength,
}: SceneLabelsProps) {
  return (
    <>
      {/* Source label */}
      <SceneLabel position={[sourceX - 0.3, 2.8, 0]} minDistance={10} maxDistance={35}>
        <div className="text-white text-xs bg-black/70 px-2 py-1 rounded whitespace-nowrap backdrop-blur-sm border border-white/10">
          🔦 Лазер ({wavelength} нм)
        </div>
      </SceneLabel>

      {/* Barrier label */}
      <SceneLabel position={[barrierX, 4.2, 0]} minDistance={10} maxDistance={35}>
        <div className="text-white text-xs bg-black/70 px-2 py-1 rounded whitespace-nowrap backdrop-blur-sm border border-white/10">
          Барьер с щелями
        </div>
      </SceneLabel>

      {/* Screen label */}
      <SceneLabel position={[screenX, 4.8, 0]} minDistance={10} maxDistance={35}>
        <div className="text-white text-xs bg-black/70 px-2 py-1 rounded whitespace-nowrap backdrop-blur-sm border border-white/10">
          Экран детектора
        </div>
      </SceneLabel>
    </>
  );
}
