// simulations/DoubleSlit/Barrier.tsx

interface BarrierProps {
  position: [number, number, number];
  slitDistance: number;
  slitWidth: number;
  thickness?: number;  // Barrier thickness (visual & affects angular selection)
}

/**
 * Barrier with two slits - bronze/copper colored for contrast
 * Slits positioned at Y=1.2 to match particle trajectories
 * Thickness affects both visual appearance and angular cutoff in physics
 */
export function Barrier({ position, slitDistance, slitWidth, thickness = 0.1 }: BarrierProps) {
  const barrierHeight = 4;
  // Visual barrier width scales with thickness parameter (0.05-0.5 → 0.1-0.4 visual)
  const barrierWidth = Math.max(0.1, Math.min(0.4, thickness * 2));
  const barrierDepth = 6;
  
  // Slit parameters - matching particle height Y=1.2
  const slitCenterY = 1.2;  // Same as particle Y position
  const slitHeight = 0.4;   // Smaller slit height
  // slitWidth now comes from props - scale for visualization (input is 0.01-0.2, visual is 0.05-0.5)
  const visualSlitWidth = Math.max(0.05, slitWidth * 2.5);

  // Calculate slit positions on Z axis
  const slit1Z = -slitDistance;
  const slit2Z = slitDistance;

  // Bronze/copper color for contrast against blue background
  const barrierColor = 0x8b6914;      // Bronze
  const barrierEmissive = 0x3a2a0a;   // Dark bronze glow

  return (
    <group position={position}>
      {/* Main barrier - BELOW slits */}
      <mesh position={[0, (slitCenterY - slitHeight / 2) / 2, 0]}>
        <boxGeometry args={[barrierWidth, slitCenterY - slitHeight / 2, barrierDepth]} />
        <meshStandardMaterial color={barrierColor} emissive={barrierEmissive} emissiveIntensity={0.3} metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Main barrier - ABOVE slits */}
      <mesh position={[0, slitCenterY + slitHeight / 2 + (barrierHeight - slitCenterY - slitHeight / 2) / 2, 0]}>
        <boxGeometry args={[barrierWidth, barrierHeight - slitCenterY - slitHeight / 2, barrierDepth]} />
        <meshStandardMaterial color={barrierColor} emissive={barrierEmissive} emissiveIntensity={0.3} metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Middle section - LEFT of slit 1 (negative Z) */}
      <mesh position={[0, slitCenterY, -barrierDepth / 4 - slitDistance / 2 - visualSlitWidth / 4]}>
        <boxGeometry args={[barrierWidth, slitHeight, barrierDepth / 2 - slitDistance - visualSlitWidth / 2]} />
        <meshStandardMaterial color={barrierColor} emissive={barrierEmissive} emissiveIntensity={0.3} metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Middle section - BETWEEN slits */}
      {slitDistance > visualSlitWidth && (
        <mesh position={[0, slitCenterY, 0]}>
          <boxGeometry args={[barrierWidth, slitHeight, Math.max(0.01, slitDistance * 2 - visualSlitWidth * 2)]} />
          <meshStandardMaterial color={barrierColor} emissive={barrierEmissive} emissiveIntensity={0.3} metalness={0.6} roughness={0.4} />
        </mesh>
      )}

      {/* Middle section - RIGHT of slit 2 (positive Z) */}
      <mesh position={[0, slitCenterY, barrierDepth / 4 + slitDistance / 2 + visualSlitWidth / 4]}>
        <boxGeometry args={[barrierWidth, slitHeight, barrierDepth / 2 - slitDistance - visualSlitWidth / 2]} />
        <meshStandardMaterial color={barrierColor} emissive={barrierEmissive} emissiveIntensity={0.3} metalness={0.6} roughness={0.4} />
      </mesh>

      {/* ===== SLIT HIGHLIGHTING - Cyan glow ===== */}
      
      {/* Slit 1 frame */}
      <mesh position={[0.08, slitCenterY, slit1Z]}>
        <boxGeometry args={[0.02, slitHeight + 0.08, visualSlitWidth + 0.08]} />
        <meshBasicMaterial color={0x00ffff} transparent opacity={0.7} />
      </mesh>
      
      {/* Slit 1 inner glow */}
      <mesh position={[0, slitCenterY, slit1Z]}>
        <boxGeometry args={[barrierWidth + 0.02, slitHeight, visualSlitWidth]} />
        <meshBasicMaterial color={0x66ffff} transparent opacity={0.4} />
      </mesh>

      {/* Slit 2 frame */}
      <mesh position={[0.08, slitCenterY, slit2Z]}>
        <boxGeometry args={[0.02, slitHeight + 0.08, visualSlitWidth + 0.08]} />
        <meshBasicMaterial color={0x00ffff} transparent opacity={0.7} />
      </mesh>
      
      {/* Slit 2 inner glow */}
      <mesh position={[0, slitCenterY, slit2Z]}>
        <boxGeometry args={[barrierWidth + 0.02, slitHeight, visualSlitWidth]} />
        <meshBasicMaterial color={0x66ffff} transparent opacity={0.4} />
      </mesh>

      {/* Point lights at slits */}
      <pointLight position={[0.3, slitCenterY, slit1Z]} color={0x00ffff} intensity={0.6} distance={2} />
      <pointLight position={[0.3, slitCenterY, slit2Z]} color={0x00ffff} intensity={0.6} distance={2} />

      {/* Base edge highlight */}
      <mesh position={[0, 0.02, 0]}>
        <boxGeometry args={[barrierWidth + 0.04, 0.03, barrierDepth + 0.04]} />
        <meshBasicMaterial color={0xaa8822} />
      </mesh>

      {/* Top edge highlight */}
      <mesh position={[0, barrierHeight, 0]}>
        <boxGeometry args={[barrierWidth + 0.04, 0.03, barrierDepth + 0.04]} />
        <meshBasicMaterial color={0xaa8822} />
      </mesh>
    </group>
  );
}
