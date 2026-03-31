import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import useStore, { STEPS } from '../lib/store';

const Needle = ({ position = [0, 0, 0] }) => {
  const { heldTool, setHeldTool, currentStep } = useStore();

  const meshRef = useRef();

  const isHeld = heldTool === 'needle';

  useFrame((state) => {
    if (isHeld && meshRef.current) {
      meshRef.current.position.set(
        state.mouse.x * 5,
        Math.max(0.5, -state.mouse.y * 5 + 1),
        state.mouse.y * 2
      );
      meshRef.current.rotation.set(0, 0, -Math.PI / 4);
    }
  });

  return (
    <group
      ref={meshRef}
      position={position}
      onClick={() => setHeldTool(isHeld ? null : 'needle')}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      {/* Handle */}
      <mesh castShadow>
        <cylinderGeometry args={[0.008, 0.008, 0.1, 12]} />
        <meshStandardMaterial color="#263238" roughness={0.8} />
      </mesh>
      
      {/* Needle Shaft */}
      <mesh castShadow position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.001, 0.003, 0.12, 8]} />
        <meshStandardMaterial color="#cfd8dc" metalness={1} roughness={0.1} />
      </mesh>
      
      {/* Precision Tip */}
      <mesh position={[0, 0.16, 0]}>
        <coneGeometry args={[0.001, 0.01, 8]} />
        <meshStandardMaterial color="#cfd8dc" metalness={1} roughness={0.1} />
      </mesh>

      {/* Invisible Hitbox */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.15, 8]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
};

export default Needle;
