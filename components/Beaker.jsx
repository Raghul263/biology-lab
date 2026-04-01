import React from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import useStore, { STEPS } from '../lib/store';

const Beaker = ({ position = [0, 0, 0] }) => {
  const { currentStep, setStates, heldTool, setHeldTool, showWrongAction, setStep, narrate } = useStore();

  const handleClick = (e) => {
    e.stopPropagation();
    // Step 2: Accept onion placement for root growth
    if (currentStep === STEPS.ROOT_GROWTH && heldTool === 'onion') {
      setStates({ onionOnBeaker: true });
      setHeldTool(null);
      narrate('The onion is placed in water. Observe the root growth over 3 to 6 days.');
    }
    // Step 7: Dropper fills with water
    else if (currentStep === STEPS.SLIDE_PREP && heldTool === 'dropper') {
      const { stainRemoved, waterDropAdded } = useStore.getState();
      if (stainRemoved && !waterDropAdded) {
        setStates({ dropperContents: 'water' });
        narrate('Dropper filled with water. Apply to the slide.');
      }
    }
  };

  const showHighlight = (currentStep === STEPS.ROOT_GROWTH && heldTool === 'onion') ||
    (currentStep === STEPS.SLIDE_PREP && heldTool === 'dropper');

  return (
    <group position={position} onPointerDown={handleClick}
      onPointerOver={() => { if (showHighlight) document.body.style.cursor = 'copy'; }}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      {showHighlight && (
        <group position={[0, 0.28, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.13, 0.005, 16, 32]} />
            <meshBasicMaterial color="#00e5ff" transparent opacity={0.5} />
          </mesh>
        </group>
      )}

      <mesh castShadow receiveShadow position={[0, 0.125, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.25, 64, 1, true]} />
        <meshPhysicalMaterial color="#ffffff" transmission={0.95} ior={1.5} thickness={0.02}
          roughness={0.02} clearcoat={1} clearcoatRoughness={0.05}
          transparent opacity={0.8} side={THREE.DoubleSide} />
      </mesh>

      {[0.06, 0.12, 0.18].map((height, i) => (
        <group key={i} position={[0, height, 0]}>
          <mesh position={[0.118, 0, 0]}>
            <boxGeometry args={[0.002, 0.004, 0.025]} />
            <meshStandardMaterial color="#ffffff" opacity={0.6} transparent />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 0.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.12, 0.003, 16, 64]} />
        <meshPhysicalMaterial color="#ffffff" transmission={0.9} roughness={0.1} clearcoat={1} />
      </mesh>

      {/* Liquid (Water) */}
      <group position={[0, 0, 0]}>
        <mesh receiveShadow position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.115, 0.115, 0.2, 32]} />
          <meshPhysicalMaterial color="#4fc3f7" transmission={0.4} ior={1.33}
            roughness={0.05} transparent opacity={0.65} metalness={0.1} />
        </mesh>
        {/* Top Surface of Water */}
        <mesh position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.115, 32]} />
          <meshPhysicalMaterial color="#4fc3f7" transmission={0.2} roughness={0.0} transparent opacity={0.8} />
        </mesh>
      </group>

      <mesh castShadow receiveShadow position={[0, 0.005, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.01, 64]} />
        <meshPhysicalMaterial color="#ffffff" transmission={0.95} ior={1.5} roughness={0.05} clearcoat={1} />
      </mesh>



      <mesh position={[0, 0.125, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.3, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
};

export default Beaker;
