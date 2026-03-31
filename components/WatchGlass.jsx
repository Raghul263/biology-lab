import React from 'react';

import useStore, { STEPS } from '../lib/store';

const WatchGlass = ({ position = [0.35, 0.93, -0.2] }) => {
  const { currentStep, heldTool, setHeldTool, setStates, rootTipsInWatchGlass, acidAdded, stainAdded } = useStore();
  
  const isTarget = currentStep === STEPS.TREATMENT && !(acidAdded && stainAdded);
  const showHighlight = isTarget || (currentStep === STEPS.CUT_INITIAL && !rootTipsInWatchGlass);

  const handleInteraction = (e) => {
    e.stopPropagation();
    if (currentStep === STEPS.TREATMENT && heldTool === 'dropper') {
      if (!acidAdded) {
        setStates({ acidAdded: true });
      } else if (!stainAdded) {
        setStates({ stainAdded: true });
        setHeldTool(null);
      }
    } else if (currentStep === STEPS.TRANSFER_Vial && heldTool === 'forceps' && rootTipsInWatchGlass) {
      setStates({ rootsInForceps: true, rootTipsInWatchGlass: false });
    }
  };

  return (
    <group 
      position={position}
      onClick={handleInteraction}
      onPointerOver={() => {
        if (heldTool === 'dropper' && isTarget) document.body.style.cursor = 'copy';
      }}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      {/* Universal Step Highlight */}
      {showHighlight && (
        <group position={[0, 0.05, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.16, 0.005, 16, 32]} />
            <meshBasicMaterial color="#00e5ff" transparent opacity={0.5} />
          </mesh>
        </group>
      )}

      {/* Main Glass Body - Ultra Clear Physical Material */}
      <mesh receiveShadow castShadow position={[0, 0.155, 0]} rotation={[Math.PI, 0, 0]}>
        <sphereGeometry args={[0.15, 64, 32, 0, Math.PI * 2, 0, Math.PI / 4]} />
        <meshPhysicalMaterial 
          transparent
          opacity={1}
          roughness={0.01}
          transmission={0.99}
          thickness={0.05}
          color="#ffffff"
          ior={1.52}
          clearcoat={1.0}
          clearcoatRoughness={0.02}
          specularIntensity={1.5}
          reflectivity={1.0}
          envMapIntensity={2.0}
          attenuationDistance={0.5}
          attenuationColor="#e0f2f1"
        />
      </mesh>

      {/* Realistic Glass Rim - Gives it the '3D Shape' and edge reflection */}
      <mesh position={[0, 0.048, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.1065, 0.0035, 16, 128]} />
        <meshStandardMaterial 
          color="#ffffff" 
          transparent 
          opacity={0.7} 
          emissive="#e0f2f1" 
          emissiveIntensity={0.5} 
        />
      </mesh>


      {/* Liquid inside - Color changes based on treatment */}
      {(acidAdded || stainAdded) && (
        <mesh position={[0, -0.01, 0]} receiveShadow>
          <cylinderGeometry args={[0.12, 0.12, 0.01, 32]} />
          <meshPhysicalMaterial 
            color={stainAdded ? "#c62828" : "#e3f2fd"} 
            transmission={0.7}
            transparent 
            opacity={0.8} 
          />
        </mesh>
      )}

      {/* Harvested Root Tips inside */}
      {rootTipsInWatchGlass && (
        <group position={[0, -0.01, 0]}>
          {[...Array(5)].map((_, i) => (
            <mesh 
              key={i}
              position={[(Math.random()-0.5)*0.08, 0, (Math.random()-0.5)*0.08]}
              rotation={[Math.PI/2, Math.random()*Math.PI, 0]}
            >
              <cylinderGeometry args={[0.002, 0.002, 0.02, 8]} />
              <meshStandardMaterial color={stainAdded ? "#ffcdd2" : "#fdf5e6"} />
            </mesh>
          ))}
        </group>
      )}

      {/* Invisible larger hit-area */}
      <mesh position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.1, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
};


export default WatchGlass;
