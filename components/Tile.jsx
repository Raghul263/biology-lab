import React from 'react';
import useStore, { STEPS } from '../lib/store';

const Tile = ({ position = [0, 0, 0] }) => {
  const { heldTool, setHeldTool, setStep, setStates, currentStep } = useStore();

  const handleInteraction = (e) => {
    e.stopPropagation();
    if (heldTool === 'onion' && currentStep === STEPS.GROWTH_TILE) {
      setStates({ onionPlacedOnTile: true });
      setHeldTool(null);
    } else if (heldTool === 'slide' && currentStep === STEPS.PREPARATION) {
       // logic for slide prep
    }
  };

  const showHighlight = currentStep === STEPS.GROWTH_TILE || currentStep === STEPS.CUT_INITIAL || currentStep === STEPS.CUT_FRESH;

  return (
    <group 
      position={position}
      onClick={handleInteraction}
      onPointerOver={() => {
        if (heldTool === 'onion' || heldTool === 'scalpel') document.body.style.cursor = 'copy';
      }}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      {/* Universal Step Highlight */}
      {showHighlight && (
        <group position={[0, 0.03, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.2, 0.005, 16, 32]} />
            <meshBasicMaterial color="#00e5ff" transparent opacity={0.5} />
          </mesh>
        </group>
      )}
      {/* Ceramic Tile Base */}
      <mesh receiveShadow position={[0, 0, 0]}>
        <boxGeometry args={[0.5, 0.02, 0.5]} />
        <meshStandardMaterial color="#34495e" roughness={0.4} metalness={0.1} />
      </mesh>
      {/* Invisible larger click area */}
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[0.6, 0.1, 0.6]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
};


export default Tile;
