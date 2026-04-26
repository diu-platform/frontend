import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useWavelengthColor } from './hooks/useWavelengthColor';

interface SourceProps {
  position: [number, number, number];
  wavelength: number;
  intensity?: number;
}

/**
 * Clean laser source
 */
export function Source({ position, wavelength, intensity = 50 }: SourceProps) {
  const glowRef = useRef<THREE.Mesh>(null);
  const color = useWavelengthColor(wavelength);

  useFrame((state) => {
    const time = state.clock.elapsedTime;
    
    if (glowRef.current) {
      const pulse = 1 + Math.sin(time * 4) * 0.12;
      glowRef.current.scale.setScalar(pulse);
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.2 + Math.sin(time * 4) * 0.08;
    }
  });

  return (
    <group position={position}>
      {/* Housing */}
      <mesh position={[-0.35, 0, 0]}>
        <boxGeometry args={[0.6, 0.5, 0.5]} />
        <meshPhongMaterial color={0x2a2a3a} />
      </mesh>

      {/* Aperture ring */}
      <mesh position={[-0.03, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <ringGeometry args={[0.12, 0.22, 32]} />
        <meshPhongMaterial color={0x3a3a4a} side={THREE.DoubleSide} />
      </mesh>

      {/* Core */}
      <mesh>
        <sphereGeometry args={[0.12, 32, 32]} />
        <meshBasicMaterial color={color} />
      </mesh>
      
      {/* Glow */}
      <mesh ref={glowRef}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshBasicMaterial color={color} transparent opacity={0.22} />
      </mesh>

      {/* Light */}
      <pointLight color={color} intensity={0.6 * (intensity / 50)} distance={5} />
    </group>
  );
}
