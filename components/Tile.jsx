import React from 'react';
import useStore, { STEPS } from '../lib/store';

const Tile = ({ position = [0, 0, 0] }) => {
  const { heldTool, setHeldTool, setStates, currentStep, showWrongAction } = useStore();

  const handleInteraction = (e) => {
    e.stopPropagation();
    if (heldTool === 'onion' && currentStep === STEPS.CUT_DRY_ROOTS) {
      setStates({ onionOnTile: true, onionOnBeaker: false, onionAtWatchGlass: false });
      setHeldTool(null);
    } else if (heldTool === 'onion') {
      showWrongAction('Follow the procedure.');
      setHeldTool(null);
    }
  };

  const showHighlight = heldTool === 'onion' && currentStep === STEPS.CUT_DRY_ROOTS;

  return (
    <group position={position} onClick={handleInteraction}
      onPointerOver={() => { if (showHighlight) document.body.style.cursor = 'copy'; }}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      {showHighlight && (
        <group position={[0, 0.03, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.2, 0.005, 16, 32]} />
            <meshBasicMaterial color="#00e5ff" transparent opacity={0.5} />
          </mesh>
        </group>
      )}
      <mesh receiveShadow>
        <boxGeometry args={[0.5, 0.02, 0.5]} />
        <meshStandardMaterial color="#34495e" roughness={0.4} metalness={0.1} />
      </mesh>
      <mesh position={[0, 0.05, 0]}>
        <boxGeometry args={[0.6, 0.1, 0.6]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
};

export default Tile;
