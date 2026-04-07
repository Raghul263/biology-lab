import React from 'react';
import * as THREE from 'three';

const BurnerStand = ({ position = [0, 0.93, 0] }) => {
  const ringRadius = 0.12;
  const ringHeight = 0.42;
  const legBottomRadius = 0.22;
  const chromeMat = { color: "#455a64", roughness: 0.2, metalness: 0.8 };

  return (
    <group position={position}>
      {/* Top Ring */}
      <mesh position={[0, ringHeight, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[ringRadius, 0.008, 16, 32]} />
        <meshStandardMaterial {...chromeMat} />
      </mesh>

      {/* Wire Gauze (Grid) */}
      <group position={[0, ringHeight, 0]}>
        {/* Outer frame of gauze */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0, ringRadius + 0.01, 32]} />
          <meshStandardMaterial color="#263238" transparent opacity={0.3} side={THREE.DoubleSide} />
        </mesh>
        
        {/* Grid lines */}
        {[-4, -3, -2, -1, 0, 1, 2, 3, 4].map((i) => (
          <React.Fragment key={i}>
            {/* Horizontal lines */}
            <mesh position={[0, 0.002, (i * ringRadius) / 4.5]}>
              <boxGeometry args={[ringRadius * 2, 0.001, 0.001]} />
              <meshBasicMaterial color="#37474f" />
            </mesh>
            {/* Vertical lines */}
            <mesh position={[(i * ringRadius) / 4.5, 0.002, 0]} rotation={[0, Math.PI / 2, 0]}>
              <boxGeometry args={[ringRadius * 2, 0.001, 0.001]} />
              <meshBasicMaterial color="#37474f" />
            </mesh>
          </React.Fragment>
        ))}
      </group>

      {/* Legs (Tripod) */}
      {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((angle, index) => {
        const topX = Math.cos(angle) * ringRadius;
        const topZ = Math.sin(angle) * ringRadius;
        const bottomX = Math.cos(angle) * legBottomRadius;
        const bottomZ = Math.sin(angle) * legBottomRadius;

        // Calculate rotation to lean from top to bottom
        const dx = bottomX - topX;
        const dz = bottomZ - topZ;
        const length = Math.sqrt(dx * dx + ringHeight * ringHeight + dz * dz);
        
        // Tilt relative to vertical
        const tilt = Math.atan2(Math.sqrt(dx * dx + dz * dz), ringHeight);

        return (
          <group key={index} position={[topX, ringHeight, topZ]}>
            <group rotation={[0, -angle + Math.PI, 0]}>
              <group rotation={[tilt, 0, 0]}>
                <mesh position={[0, -length / 2, 0]}>
                  <cylinderGeometry args={[0.012, 0.012, length, 12]} />
                  <meshStandardMaterial color="#212121" roughness={0.6} metalness={0.4} />
                </mesh>
                {/* Foot */}
                <mesh position={[0, -length, 0]}>
                  <sphereGeometry args={[0.018, 16, 16]} />
                  <meshStandardMaterial color="#111111" roughness={1.0} />
                </mesh>
              </group>
            </group>
            {/* Visual connector to ring */}
            <mesh>
              <sphereGeometry args={[0.013, 12, 12]} />
              <meshStandardMaterial color="#212121" roughness={0.6} metalness={0.4} />
            </mesh>
          </group>
        );
      })}

      {/* Wire Gauze Center Reinforcement (White patch in photo) */}
      <mesh position={[0, ringHeight + 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[ringRadius * 0.7, 32]} />
        <meshStandardMaterial color="#eceff1" roughness={0.9} transparent opacity={0.4} />
      </mesh>
    </group>
  );
};

export default BurnerStand;
