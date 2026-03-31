import React, { useRef } from 'react';
import useStore, { STEPS } from '../lib/store';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const Microscope = ({ position = [1.2, 0.93, 0] }) => {
  const { toggleMicroscope, currentStep } = useStore();

  const showHighlight = currentStep === STEPS.MICROSCOPE || currentStep === STEPS.MITOSIS_STAGES;

  return (
    <group 
      position={position} 
      rotation={[0, -Math.PI / 4, 0]}
      onClick={() => {
        if (currentStep === STEPS.MITOSIS_STAGES) {
          toggleMicroscope(true);
        }
      }}
      onPointerOver={() => {
        if (showHighlight) document.body.style.cursor = 'zoom-in';
      }}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      {/* Universal Step Highlight */}
      {showHighlight && (
        <group position={[0, 0.25, 0.05]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.2, 0.008, 16, 32]} />
            <meshBasicMaterial color="#00e5ff" transparent opacity={0.5} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.18, 0.22, 32]} />
            <meshBasicMaterial color="#00e5ff" transparent opacity={0.15} />
          </mesh>
        </group>
      )}
      {/* Heavy Base */}
      <mesh castShadow position={[0, 0.02, 0]}>
        <boxGeometry args={[0.35, 0.04, 0.45]} />
        <meshPhysicalMaterial 
          color="#1a1a1a" 
          roughness={0.7} 
          metalness={0.2}
          clearcoat={0.1}
        />
      </mesh>

      {/* Main Arm */}
      <mesh castShadow position={[0, 0.25, -0.15]} rotation={[-Math.PI / 12, 0, 0]}>
        <cylinderGeometry args={[0.045, 0.06, 0.5, 16]} />
        <meshPhysicalMaterial 
          color="#2c3e50" 
          roughness={0.4} 
          metalness={0.8}
        />
      </mesh>

      {/* Stage */}
      <group position={[0, 0.22, 0.05]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.25, 0.015, 0.25]} />
          <meshPhysicalMaterial color="#0a0a0a" roughness={0.2} />
        </mesh>
        {/* Stage Clips */}
        <mesh position={[-0.08, 0.01, 0]}>
          <boxGeometry args={[0.04, 0.005, 0.1]} />
          <meshStandardMaterial color="#95a5a6" metalness={1} roughness={0.1} />
        </mesh>
        <mesh position={[0.08, 0.01, 0]}>
          <boxGeometry args={[0.04, 0.005, 0.1]} />
          <meshStandardMaterial color="#95a5a6" metalness={1} roughness={0.1} />
        </mesh>
      </group>

      {/* Objective Turret */}
      <group position={[0, 0.35, 0.05]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.06, 0.08, 0.04, 16]} />
          <meshPhysicalMaterial color="#34495e" metalness={0.9} roughness={0.2} />
        </mesh>
        {/* Lenses */}
        {[0, (Math.PI * 2) / 3, (Math.PI * 4) / 3].map((angle, i) => (
          <group key={i} rotation={[0, angle, 0]}>
            <mesh position={[0.05, -0.04, 0]} rotation={[0, 0, -Math.PI / 6]}>
              <cylinderGeometry args={[0.015, 0.01, 0.06, 12]} />
              <meshPhysicalMaterial color="#bdc3c7" metalness={1} roughness={0.1} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Eyepiece Tube */}
      <group position={[0, 0.5, -0.05]} rotation={[Math.PI / 4, 0, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.035, 0.035, 0.15, 16]} />
          <meshPhysicalMaterial color="#2c3e50" metalness={0.8} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.038, 0.038, 0.02, 16]} />
          <meshPhysicalMaterial color="#000000" roughness={0.1} />
        </mesh>
      </group>

      {/* Focus Knobs */}
      <group position={[0.07, 0.2, -0.12]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
          <meshPhysicalMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.02, 0.04, 16]} />
          <meshPhysicalMaterial color="#333" roughness={0.8} />
        </mesh>
      </group>
      <group position={[-0.07, 0.2, -0.12]}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.04, 0.04, 0.02, 16]} />
          <meshPhysicalMaterial color="#1a1a1a" roughness={0.8} />
        </mesh>
        <mesh position={[0, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.02, 0.02, 0.04, 16]} />
          <meshPhysicalMaterial color="#333" roughness={0.8} />
        </mesh>
      </group>
    </group>
  );
};

export default Microscope;
