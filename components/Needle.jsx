import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import useStore from '../lib/store';

const Needle = ({ position = [0, 0, 0] }) => {
  const { heldTool, setHeldTool } = useStore();
  const meshRef = useRef();
  const isHeld = heldTool === 'needle';
  const { raycaster } = useThree();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.93);

  useFrame(() => {
    if (isHeld && meshRef.current) {
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);
      if (intersection) {
        intersection.x = Math.max(-2.0, Math.min(2.0, intersection.x));
        intersection.z = Math.max(-0.8, Math.min(0.8, intersection.z));
        meshRef.current.position.set(intersection.x, 0.96, intersection.z);
      }
    } else if (!isHeld && meshRef.current && position) {
      meshRef.current.position.set(...position);
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (isHeld) {
      const pos = meshRef.current.position;
      useStore.getState().setSetupPosition('needle', [pos.x, 0.93, pos.z]);
      setHeldTool(null);
    } else {
      if (!heldTool) setHeldTool('needle');
    }
  };

  const showHighlight = !heldTool;

  return (
    <group ref={meshRef} position={position}
      onClick={handleClick}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      {showHighlight && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.06, 0.004, 16, 32]} />
          <meshBasicMaterial color="#00e5ff" transparent opacity={0.6} />
        </mesh>
      )}

      <mesh castShadow>
        <cylinderGeometry args={[0.008, 0.008, 0.1, 12]} />
        <meshStandardMaterial color="#263238" roughness={0.8} />
      </mesh>
      <mesh castShadow position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.001, 0.003, 0.12, 8]} />
        <meshStandardMaterial color="#cfd8dc" metalness={1} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.16, 0]}>
        <coneGeometry args={[0.001, 0.01, 8]} />
        <meshStandardMaterial color="#cfd8dc" metalness={1} roughness={0.1} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.15, 12]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
};

export default Needle;
