import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import useStore from '../lib/store';

const Scalpel = ({ position: initialPosition = [0, 0.93, 0.4] }) => {
  const { heldTool, setHeldTool } = useStore();
  const isHeld = heldTool === 'scalpel';
  const meshRef = useRef();
  const { raycaster, mouse, camera } = useThree();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.93);

  const isCutting = useStore(state => state.isCutting);
  const cutAnimOffset = useRef(0);

  useFrame((state) => {
    if (isCutting) {
      // Rapid chop motion
      const t = state.clock.getElapsedTime() * 20;
      cutAnimOffset.current = Math.abs(Math.sin(t)) * 0.06;
    } else {
      cutAnimOffset.current = THREE.MathUtils.lerp(cutAnimOffset.current, 0, 0.15);
    }

    if (isHeld && meshRef.current) {
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);
      if (intersection) {
        meshRef.current.position.set(intersection.x, 0.93 + 0.02 + cutAnimOffset.current, intersection.z);
      }
    } else if (!isHeld && meshRef.current) {
      meshRef.current.position.set(initialPosition[0], initialPosition[1] + 0.02, initialPosition[2]);
    }
  });

  return (
    <group 
      ref={meshRef}
      onClick={() => setHeldTool(isHeld ? null : 'scalpel')}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
      position={[0, 0.02, 0]} // Further anti-clipping elevation
    >
      {/* Professional Scalpel Body */}
      <group rotation={[0, 0, 0]} scale={[1.4, 1.4, 1.4]}>

        {/* Slender Surgical Handle */}
        <mesh castShadow position={[0, 0, -0.05]}>
          <boxGeometry args={[0.012, 0.006, 0.17]} />
          <meshPhysicalMaterial color="#34495e" roughness={0.6} metalness={0.4} />
        </mesh>
        {/* Ergonomic Textured Grip */}
        <mesh castShadow position={[0, 0, 0.04]}>
          <boxGeometry args={[0.014, 0.008, 0.06]} />
          <meshPhysicalMaterial color="#111111" roughness={1.0} />
        </mesh>
        {/* Slender Neck */}
        <mesh castShadow position={[0, 0, 0.1]}>
          <boxGeometry args={[0.004, 0.003, 0.08]} />
          <meshPhysicalMaterial color="#ecf0f1" metalness={1} roughness={0.05} />
        </mesh>
        
        {/* High-Contrast Surgical Blade */}
        <group position={[0, 0, 0.14]}>
          <mesh castShadow rotation={[0, 0, 0]}>
            <cylinderGeometry args={[0.0003, 0.0015, 0.05, 3]} rotation={[Math.PI / 2, 0, 0]} />
            <meshPhysicalMaterial 
              color="#ffffff" 
              metalness={1} 
              roughness={0.01} 
              clearcoat={1}
            />
          </mesh>
          {/* Razor Sharpness Reflection */}
          <mesh position={[0, -0.0008, 0.005]} rotation={[0.2, 0, 0]}>
            <boxGeometry args={[0.0001, 0.01, 0.04]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.6} />
          </mesh>
        </group>
      </group>
    </group>
  );
};

export default Scalpel;
