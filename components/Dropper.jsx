import React, { useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useStore, { STEPS } from '../lib/store';

const Dropper = ({ position: initialPosition = [0, 0.93, -0.4] }) => {
  const { currentStep, setStates, heldTool, setHeldTool } = useStore();
  const isHeld = heldTool === 'dropper';
  const meshRef = useRef();
  const { raycaster } = useThree();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.93);

  useFrame(() => {
    if (isHeld && meshRef.current) {
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);
      if (intersection) {
        meshRef.current.position.set(intersection.x, 0.93, intersection.z);
      }
    } else if (!isHeld && meshRef.current) {
      meshRef.current.position.set(...initialPosition);
    }
  });

  return (
    <group 
      ref={meshRef}
      onClick={() => {
        // Pick up / put down dropper
        if (currentStep === STEPS.TREATMENT || currentStep === STEPS.PREPARATION) {
          if (!isHeld) setHeldTool('dropper');
          else setHeldTool(null);
        }
      }}
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      <group>
        {/* Bulb - Dark Red rubber */}
        <mesh castShadow position={[0, 0.26, 0]}>
          <sphereGeometry args={[0.038, 32, 32]} />
          <meshPhysicalMaterial 
            color="#660000" 
            roughness={0.9} 
            metalness={0.0} 
            emissive="#220000"
            emissiveIntensity={0.1}
          />
        </mesh>
        {/* Metal Neck/Collar */}
        <mesh position={[0, 0.22, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.02, 16]} />
          <meshPhysicalMaterial color="#333" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Glass Tube */}
        <mesh castShadow receiveShadow position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.012, 0.004, 0.35, 16]} />
          <meshPhysicalMaterial 
            transparent 
            opacity={1} 
            transmission={0.98} 
            thickness={0.005}
            ior={1.5}
            roughness={0.01}
            color="#ffffff" 
            clearcoat={1}
          />
        </mesh>
        {/* Stain Liquid inside dropper during TREATMENT step */}
        {currentStep === STEPS.TREATMENT && (
          <mesh position={[0, -0.05, 0]}>
            <cylinderGeometry args={[0.008, 0.004, 0.1, 16]} />
            <meshStandardMaterial color="#e91e63" transparent opacity={0.8} />
          </mesh>
        )}
        {/* HCl highlight */}
        {isHeld && currentStep === STEPS.TREATMENT && (
          <mesh position={[0, 0.02, 0]}>
            <cylinderGeometry args={[0.009, 0.009, 0.002, 16]} />
            <meshStandardMaterial color="#4fc3f7" transparent opacity={0.9} />
          </mesh>
        )}
      </group>
    </group>
  );
};

export default Dropper;
