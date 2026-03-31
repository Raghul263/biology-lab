import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import useStore from '../lib/store';
import * as THREE from 'three';

const Forceps = ({ position = [0, 0, 0] }) => {
  const { heldTool, setHeldTool, rootsInForceps } = useStore();
  const groupRef = useRef();
  const isHeld = heldTool === 'forceps';
  const { raycaster } = useThree();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.93);

  useFrame(() => {
    if (isHeld && groupRef.current) {
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);
      if (intersection) {
        groupRef.current.position.set(intersection.x, 0.96, intersection.z);
      }
    } else if (!isHeld && groupRef.current) {
      groupRef.current.position.set(...position);
    }
  });

  return (
    <group 
      ref={groupRef}
      onClick={(e) => {
        e.stopPropagation();
        setHeldTool(isHeld ? null : 'forceps');
      }}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      {/* Universal Step Highlight (Only if not held) */}
      {!isHeld && (
        <group position={[0, 0.02, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.08, 0.005, 16, 32]} />
            <meshBasicMaterial color="#00e5ff" transparent opacity={0.6} />
          </mesh>
        </group>
      )}

      {/* Forceps Body */}
      <group rotation={[0, Math.PI / 2, 0]} scale={[1.3, 1.3, 1.3]}>

        {/* Left Arm */}
        <mesh castShadow position={[0, 0, -0.01]} rotation={[0, 0, 0.05]}>
          <boxGeometry args={[0.15, 0.005, 0.01]} />
          <meshStandardMaterial color="#cfd8dc" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Right Arm */}
        <mesh castShadow position={[0, 0, 0.01]} rotation={[0, 0, -0.05]}>
          <boxGeometry args={[0.15, 0.005, 0.01]} />
          <meshStandardMaterial color="#cfd8dc" metalness={0.9} roughness={0.1} />
        </mesh>

        {/* Joint/Handle end */}
        <mesh castShadow position={[-0.075, 0, 0]}>
          <boxGeometry args={[0.01, 0.008, 0.02]} />
          <meshStandardMaterial color="#616161" metalness={0.8} roughness={0.3} />
        </mesh>
        {/* Held Root Tips visually */}
        {rootsInForceps && (
          <group position={[0.07, 0, 0]}>
            {[...Array(3)].map((_, i) => (
              <mesh 
                key={i}
                position={[(Math.random()-0.5)*0.005, 0, (Math.random()-0.5)*0.005]}
                rotation={[Math.PI / 2, Math.random() * Math.PI, 0]}
              >
                <cylinderGeometry args={[0.002, 0.002, 0.015, 8]} />
                <meshStandardMaterial color="#fdf5e6" />
              </mesh>
            ))}
          </group>
        )}
      </group>
    </group>
  );
};

export default Forceps;
