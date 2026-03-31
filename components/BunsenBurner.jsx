import React from 'react';
import { useFrame } from '@react-three/fiber';
import { Sparkles } from '@react-three/drei';

const BunsenBurner = () => {
  return (
    <group position={[0, 0.8, -0.5]}>
      {/* Base */}
      <mesh castShadow position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.1, 32]} />
        <meshStandardMaterial color="#444" metalness={0.8} roughness={0.2} />
      </mesh>
      {/* Tube */}
      <mesh castShadow position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.3, 16]} />
        <meshStandardMaterial color="#666" metalness={0.9} roughness={0.1} />
      </mesh>
      {/* Flame */}
      <group position={[0, 0.35, 0]}>
        <Sparkles 
          count={50} 
          scale={[0.1, 0.3, 0.1]} 
          size={2} 
          speed={0.5} 
          color="#4cc9f0" 
        />
        <pointLight intensity={0.5} color="#4cc9f0" distance={1} />
      </group>
    </group>
  );
};

export default BunsenBurner;
