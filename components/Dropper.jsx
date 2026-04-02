import React, { useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useStore from '../lib/store';

const Dropper = ({ position: initialPosition = [-1.3, 0.93, 0.5] }) => {
  const { heldTool, setHeldTool, dropperContents } = useStore();
  const isHeld = heldTool === 'dropper';
  const meshRef = useRef();
  const { raycaster } = useThree();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.93);

  useFrame(() => {
    if (isHeld && meshRef.current) {
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);
      if (intersection) {
        intersection.x = Math.max(-2.0, Math.min(2.0, intersection.x));
        intersection.z = Math.max(-0.8, Math.min(0.8, intersection.z));
        meshRef.current.position.set(intersection.x, 0.93, intersection.z);
      }
    } else if (!isHeld && meshRef.current && initialPosition) {
      meshRef.current.position.set(...initialPosition);
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (isHeld) {
      const pos = meshRef.current.position;
      useStore.getState().setSetupPosition('dropper', [pos.x, 0.93, pos.z]);
      setHeldTool(null);
    } else {
      if (!heldTool) setHeldTool('dropper');
    }
  };

  const liquidColor = dropperContents === 'HCL' ? '#4fc3f7' :
                      dropperContents === 'STAIN' ? '#e91e63' :
                      dropperContents === 'WATER' ? '#81d4fa' : null;

  const showHighlight = !isHeld && !heldTool;

  return (
    <group>
      {/* 1. THE STAND (Stays on the table) */}
      <group position={initialPosition}>
        {/* Stand Base */}
        <mesh receiveShadow castShadow position={[0, -0.01, 0]}>
          <cylinderGeometry args={[0.04, 0.05, 0.06, 16]} />
          <meshStandardMaterial color="#455a64" metalness={0.6} roughness={0.2} />
        </mesh>
        {/* Inner Hole (Visual Only) */}
        <mesh position={[0, 0.021, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.015, 16]} />
          <meshBasicMaterial color="#111" />
        </mesh>
        {/* Support Neck */}
        <mesh position={[0, 0.01, 0]}>
          <cylinderGeometry args={[0.042, 0.042, 0.02, 16]} />
          <meshStandardMaterial color="#cfd8dc" metalness={0.8} />
        </mesh>
      </group>

      {/* 2. THE DROPPER (Moves and Rotates) */}
      <group ref={meshRef} onClick={handleClick}
        onPointerOver={() => (document.body.style.cursor = 'pointer')}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        {showHighlight && (
          <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.08, 0.005, 16, 32]} />
            <meshBasicMaterial color="#00e5ff" transparent opacity={0.6} />
          </mesh>
        )}

        {/* Straight Dropper (Always Upright as requested) */}
        <group rotation={[0, 0, 0]} position={isHeld ? [0, 0, 0] : [0, 0, 0]}>
          {/* Bulb */}
          <mesh castShadow position={[0, 0.26, 0]}>
            <sphereGeometry args={[0.038, 32, 32]} />
            <meshPhysicalMaterial color="#660000" roughness={0.9} emissive="#220000" emissiveIntensity={0.1} />
          </mesh>
          {/* Collar */}
          <mesh position={[0, 0.22, 0]}>
            <cylinderGeometry args={[0.015, 0.015, 0.02, 16]} />
            <meshPhysicalMaterial color="#333" metalness={0.8} roughness={0.2} />
          </mesh>
          {/* Tube */}
          <mesh castShadow receiveShadow position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.012, 0.004, 0.35, 16]} />
            <meshPhysicalMaterial transparent opacity={1} transmission={0.98}
              thickness={0.005} ior={1.5} roughness={0.01} color="#ffffff" clearcoat={1} />
          </mesh>
          {/* Liquid inside dropper */}
          {liquidColor && (
            <mesh position={[0, -0.05, 0]}>
              <cylinderGeometry args={[0.008, 0.004, 0.1, 16]} />
              <meshStandardMaterial color={liquidColor} transparent opacity={0.8} />
            </mesh>
          )}
        </group>
      </group>
    </group>
  );
};

export default Dropper;
