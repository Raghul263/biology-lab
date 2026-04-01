import React from 'react';
import useStore, { STEPS } from '../lib/store';

const Tile = ({ position = [0, 0, 0] }) => {
  const { heldTool, setHeldTool, setStates, currentStep, showWrongAction, narrate } = useStore();

  const handleInteraction = (e) => {
    e.stopPropagation();
    if (heldTool === 'onion' && currentStep === STEPS.CUT_DRY_ROOTS) {
      setStates({ onionOnTile: true });
      setHeldTool(null);
      narrate('Onion placed on the cutting tile. Select the blade to cut the dry roots.');
    } else if (currentStep !== STEPS.ARRANGE && heldTool) {
      showWrongAction('Follow the procedure.');
    }
  };

  const showHighlight = currentStep === STEPS.CUT_DRY_ROOTS && heldTool === 'onion';

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
