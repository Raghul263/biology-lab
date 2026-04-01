import React from 'react';
import * as THREE from 'three';

const VialRack = ({ position = [0, 0, 0] }) => {
  const rackColor = "#388e3c"; // Forest Green
  const topColor = "#4caf50"; // Main Green
  const holeColor = "#1b5e20"; // Very Dark Green for holes

  return (
    <group position={position}>
      {/* Main Base Body */}
      <mesh castShadow receiveShadow position={[0, 0.02, 0]}>
        <boxGeometry args={[0.2, 0.04, 0.08]} />
        <meshStandardMaterial color={rackColor} roughness={0.6} />
      </mesh>

      {/* Top Surface with Rim */}
      <mesh castShadow receiveShadow position={[0, 0.042, 0]}>
        <boxGeometry args={[0.21, 0.01, 0.09]} />
        <meshStandardMaterial color={topColor} roughness={0.4} metalness={0.1} />
      </mesh>

      {/* Three Holes */}
      {[-0.06, 0, 0.06].map((x, i) => (
        <mesh key={i} position={[x, 0.046, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.022, 0.022, 0.002, 16]} />
          <meshStandardMaterial color={holeColor} />
        </mesh>
      ))}

      {/* Internal Shadow for Holes (to give depth) */}
      {[-0.06, 0, 0.06].map((x, i) => (
        <mesh key={`shadow-${i}`} position={[x, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.021, 0.021, 0.03, 16]} />
          <meshStandardMaterial color={holeColor} transparent opacity={0.6} />
        </mesh>
      ))}
    </group>
  );
};

export default VialRack;
