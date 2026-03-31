import React from 'react';
import * as THREE from 'three';
import useStore, { STEPS } from '../lib/store';

const Beaker = ({ position = [0, 0, 0] }) => {
  const { currentStep, setStates, heldTool, setHeldTool } = useStore();

  const handleClick = (e) => {
    e.stopPropagation();
    if (currentStep === STEPS.GROWTH_BEAKER && heldTool === 'onion') {
      setStates({ onionInBeaker: true });
      setHeldTool(null);
    } else if (currentStep === STEPS.PREPARATION && heldTool === 'dropper') {
      // Future logic for adding water to slide in Step 9
      setStates({ waterAdded: true });
      setHeldTool(null);
    }
  };

  const showHighlight = currentStep === STEPS.GROWTH_BEAKER || (currentStep === STEPS.PREPARATION && heldTool === 'dropper');


  return (
    <group 
      position={position}
      onPointerDown={handleClick}
      onPointerOver={() => {
        if (showHighlight) document.body.style.cursor = 'copy';
      }}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      {/* Universal Step Highlight */}
      {showHighlight && (
        <group position={[0, 0.28, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.13, 0.005, 16, 32]} />
            <meshBasicMaterial color="#00e5ff" transparent opacity={0.5} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.12, 0.14, 32]} />
            <meshBasicMaterial color="#00e5ff" transparent opacity={0.2} />
          </mesh>
        </group>
      )}
      {/* Realistic Glass Cylinder - Scaled down */}
      <mesh castShadow receiveShadow position={[0, 0.125, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.25, 64, 1, true]} />
        <meshPhysicalMaterial 
          color="#ffffff" 
          transmission={0.95}
          ior={1.5}
          thickness={0.02}
          roughness={0.02}
          clearcoat={1}
          clearcoatRoughness={0.05}
          transparent 
          opacity={0.8}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Graduation Marks - Adjusted for new size */}
      {[0.06, 0.12, 0.18].map((height, i) => (
        <group key={i} position={[0, height, 0]}>
          <mesh position={[0.118, 0, 0]} rotation={[0, 0, 0]}>
            <boxGeometry args={[0.002, 0.004, 0.025]} />
            <meshStandardMaterial color="#ffffff" opacity={0.6} transparent />
          </mesh>
        </group>
      ))}
      
      {/* Thin Glass Edge Rim */}
      <mesh position={[0, 0.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.12, 0.003, 16, 64]} />
        <meshPhysicalMaterial color="#ffffff" transmission={0.9} roughness={0.1} clearcoat={1} />
      </mesh>
      
      {/* Water Level inside */}
      <mesh receiveShadow position={[0, 0.1, 0]}>
        <cylinderGeometry args={[0.115, 0.115, 0.2, 32]} />
        <meshPhysicalMaterial 
          color="#4fc3f7" 
          transmission={0.7}
          ior={1.33}
          roughness={0.0}
          transparent 
          opacity={0.5} 
          metalness={0.1}
        />
      </mesh>
      
      {/* Beaker Glass Base */}
      <mesh castShadow receiveShadow position={[0, 0.005, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.01, 64]} />
        <meshPhysicalMaterial color="#ffffff" transmission={0.95} ior={1.5} roughness={0.05} clearcoat={1} />
      </mesh>
      
      {/* Invisible larger hit-area for easier clicks */}
      <mesh position={[0, 0.125, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.3, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
};

export default Beaker;
