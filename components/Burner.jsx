import React, { useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import useStore, { STEPS } from '../lib/store';

const Burner = ({ position = [0.7, 0.93, 0] }) => {
  const { currentStep, heated, setStates, setStep, acidAdded, stainAdded } = useStore();
  const flameRef = useRef();
  
  const isTarget = currentStep === STEPS.TREATMENT && !heated && acidAdded && stainAdded;

  const handleInteraction = () => {
    if (isTarget) {
      setStates({ heated: true });
      setTimeout(() => {
        alert("Sample heated. Proceeding to slide preparation.");
        setStep(STEPS.PREPARATION);
      }, 1000);
    }
  };

  useFrame((state) => {
    if (flameRef.current) {

      const s = 1 + Math.sin(state.clock.elapsedTime * 15) * 0.1;
      flameRef.current.scale.set(s, s + Math.random() * 0.1, s);
      flameRef.current.opacity = 0.6 + Math.sin(state.clock.elapsedTime * 20) * 0.2;
    }
  });

  return (
    <group 
      position={position}
      onClick={handleInteraction}
      onPointerOver={() => {
         if (isTarget) document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      {/* Universal Step Highlight */}
      {isTarget && (
        <group position={[0, 0.22, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.08, 0.005, 16, 32]} />
            <meshBasicMaterial color="#00e5ff" transparent opacity={0.6} />
          </mesh>
        </group>
      )}

      {/* Burner Base */}
      <mesh castShadow position={[0, 0.01, 0]}>
        <cylinderGeometry args={[0.08, 0.1, 0.02, 32]} />
        <meshStandardMaterial color="#424242" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Main Pipe */}
      <mesh castShadow position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.015, 0.015, 0.18, 16]} />
        <meshStandardMaterial color="#9e9e9e" metalness={0.9} roughness={0.1} />
      </mesh>

      {/* Top Nozzle */}
      <mesh castShadow position={[0, 0.19, 0]}>
        <cylinderGeometry args={[0.02, 0.015, 0.02, 16]} />
        <meshStandardMaterial color="#616161" metalness={0.9} roughness={0.3} />
      </mesh>

      {/* Gas Intake Valve */}
      <mesh castShadow position={[0, 0.03, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.01, 0.01, 0.06, 16]} />
        <meshStandardMaterial color="#212121" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Flame Component */}
      {(currentStep === STEPS.TREATMENT) && (
        <group position={[0, 0.2, 0]}>
          <mesh ref={flameRef}>
            <cylinderGeometry args={[0.005, 0.02, 0.06, 12, 1, true]} />
            <meshBasicMaterial color="#4fc3f7" transparent opacity={0.8} side={THREE.DoubleSide} />
          </mesh>
          <pointLight color="#4fc3f7" intensity={0.5} distance={0.5} />
        </group>
      )}
    </group>
  );
};

export default Burner;
