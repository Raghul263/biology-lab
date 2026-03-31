import React from 'react';
import { useFrame } from '@react-three/fiber';
import useStore, { STEPS } from '../lib/store';

const RootSection = ({ position = [0, 1, 0] }) => {
  const { currentStep, setStep, setStates, heldTool } = useStore();

  const handleCut = (e) => {
    e.stopPropagation();
    if ((currentStep === STEPS.CUT_INITIAL || currentStep === STEPS.CUT_FRESH) && heldTool === 'scalpel') {
      setStates({ isCutting: true });
      setTimeout(() => {
        setStates({ isCutting: false });
        // Logic for advancing handled in Onion handles usually, 
        // but here we can add visual feedback
      }, 600);
    }
  };


  return (
    <group position={position}>
      <mesh 
        castShadow 
        onClick={handleCut}
        onPointerOver={() => (document.body.style.cursor = heldTool === 'scalpel' ? 'copy' : 'auto')}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        {/* The 2-3cm root section */}
        <cylinderGeometry args={[0.012, 0.012, 0.2, 8]} />
        <meshStandardMaterial color="#fdfd96" roughness={0.5} />
      </mesh>
      
      {/* Visual cue for the tip to be cut - HIGHLIGHT */}
      <mesh position={[0, -0.09, 0]} castShadow>
        <cylinderGeometry args={[0.013, 0.008, 0.02, 8]} />
        <meshStandardMaterial 
          color="#ffff00" 
          emissive="#ffff00" 
          emissiveIntensity={(currentStep === STEPS.CUT_INITIAL || currentStep === STEPS.CUT_FRESH) ? 1 : 0.2} 
        />
      </mesh>

    </group>
  );
};

export default RootSection;
