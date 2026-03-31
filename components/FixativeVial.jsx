import React from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import useStore, { STEPS } from '../lib/store';

const FixativeVial = ({ position = [0, 0, 0] }) => {
  const { currentStep, rootsInForceps, setStates, setStep, rootTipsInVial, heldTool } = useStore();
  
  const isTarget = currentStep === STEPS.TRANSFER_Vial && !rootTipsInVial;

  const handleInteraction = (e) => {
    e.stopPropagation();
    if (heldTool === 'forceps' && rootsInForceps && isTarget) {
      setStates({ rootTipsInVial: true, rootsInForceps: false });
      
      // Step 7: Fixation delay
      setTimeout(() => {
        alert("Keep root tips in fixative for 24 hours.");
        setStep(STEPS.FIXATION);
        setStates({ fixationComplete: true });
        // After fixation, we proceed to treatment
        setTimeout(() => setStep(STEPS.TREATMENT), 1500);
      }, 500);
    }
  };

  return (
    <group 
      position={position}
      onClick={handleInteraction}
    >
      {/* Universal Step Highlight */}
      {isTarget && (
        <mesh position={[0, 0.12, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.06, 0.005, 16, 32]} />
          <meshBasicMaterial color="#00e5ff" transparent opacity={0.6} />
        </mesh>
      )}

      {/* Glass Bottle Body */}
      <mesh castShadow position={[0, 0.04, 0]}>
        <cylinderGeometry args={[0.04, 0.04, 0.08, 16]} />
        <meshPhysicalMaterial 
          transparent 
          opacity={0.3} 
          roughness={0.1} 
          transmission={0.9} 
          thickness={0.01} 
          color="#ffffff" 
        />
      </mesh>

      {/* Vial Cap */}
      <mesh castShadow position={[0, 0.08, 0]}>
        <cylinderGeometry args={[0.041, 0.041, 0.02, 16]} />
        <meshStandardMaterial color="#212121" metalness={0.5} roughness={0.5} />
      </mesh>

      {/* Label */}
      <group position={[0, 0.04, 0.041]}>
        <mesh>
          <planeGeometry args={[0.06, 0.04]} />
          <meshBasicMaterial color="#ffffff" />
        </mesh>
        <Text
          position={[0, 0, 0.001]}
          fontSize={0.005}
          color="#000000"
          anchorX="center"
          anchorY="middle"
          maxWidth={0.05}
        >
          Aceto-alcohol (1:3 Acetic Acid : Ethanol)
        </Text>
      </group>

      {/* Liquid inside */}
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.035, 0.035, 0.06, 16]} />
        <meshPhysicalMaterial 
          transparent 
          opacity={0.5} 
          roughness={0} 
          transmission={0.8} 
          color="#ffffff" 
        />
      </mesh>
    </group>
  );
};

export default FixativeVial;
