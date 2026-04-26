import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DetectorProps {
  position: [number, number, number];
  visible: boolean;
}

/**
 * Larger red detector - clearly visible observer device
 */
export function Detector({ position, visible }: DetectorProps) {
  const glowRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const pulseRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!visible) return;
    const time = state.clock.elapsedTime;
    
    if (glowRef.current) {
      const mat = glowRef.current.material as THREE.MeshBasicMaterial;
      mat.opacity = 0.25 + Math.sin(time * 3) * 0.1;
    }
    
    if (ringRef.current) {
      ringRef.current.rotation.z = time * 0.8;
    }

    if (pulseRef.current) {
      const scale = 1 + Math.sin(time * 4) * 0.15;
      pulseRef.current.scale.setScalar(scale);
    }
  });

  if (!visible) return null;

  // Red color scheme
  const bodyColor = 0x8b0000;      // Dark red
  const accentColor = 0xff0000;    // Bright red
  const glowColor = 0xff3333;      // Red glow

  return (
    <group position={position}>
      {/* Main camera body - larger */}
      <mesh>
        <boxGeometry args={[0.25, 0.25, 0.25]} />
        <meshStandardMaterial color={bodyColor} metalness={0.5} roughness={0.5} />
      </mesh>
      
      {/* Lens housing */}
      <mesh position={[0.14, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.1, 0.12, 0.08, 20]} />
        <meshStandardMaterial color={0x333333} metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Lens glass - red */}
      <mesh position={[0.18, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <circleGeometry args={[0.08, 20]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.8} />
      </mesh>

      {/* Spinning detection ring */}
      <mesh ref={ringRef} position={[0.2, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <ringGeometry args={[0.1, 0.14, 20]} />
        <meshBasicMaterial color={accentColor} transparent opacity={0.6} side={THREE.DoubleSide} />
      </mesh>

      {/* Pulsing outer ring */}
      <mesh ref={pulseRef} position={[0.21, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        <ringGeometry args={[0.14, 0.16, 20]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>

      {/* Glow sphere */}
      <mesh ref={glowRef} position={[0.12, 0, 0]}>
        <sphereGeometry args={[0.2, 20, 20]} />
        <meshBasicMaterial color={glowColor} transparent opacity={0.2} />
      </mesh>

      {/* Status LED - blinking */}
      <mesh position={[-0.1, 0.15, 0]}>
        <sphereGeometry args={[0.04, 10, 10]} />
        <meshBasicMaterial color={0xff0000} />
      </mesh>

      {/* Second LED */}
      <mesh position={[-0.1, 0.15, 0.08]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshBasicMaterial color={0x00ff00} />
      </mesh>

      {/* Antenna */}
      <mesh position={[-0.1, 0.22, -0.05]} rotation={[0.3, 0, 0]}>
        <cylinderGeometry args={[0.01, 0.01, 0.15, 8]} />
        <meshStandardMaterial color={0x666666} metalness={0.8} />
      </mesh>

      {/* Label "DETECTOR" area */}
      <mesh position={[0, 0, 0.13]}>
        <boxGeometry args={[0.2, 0.08, 0.01]} />
        <meshBasicMaterial color={0x220000} />
      </mesh>
      
      {/* Strong point light */}
      <pointLight color={accentColor} intensity={1.0} distance={3} />
    </group>
  );
}
