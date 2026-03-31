import React from 'react';
import useStore, { STEPS } from '../lib/store';

const FilterPaper = ({ position = [0, 0, 0] }) => {
  const { currentStep, tipOnSlide, stainAdded, heated, setStates, setHeldTool, heldTool } = useStore();
  const isHeld = heldTool === 'filterPaper';
  // Filter paper is active for blotting in PREPARATION step
  const isTarget = currentStep === STEPS.PREPARATION && heated && tipOnSlide && !useStore.getState().stainRemoved;

  const handleClick = () => {
    if (currentStep === STEPS.PREPARATION) {
      if (!isHeld) setHeldTool('filterPaper');
      else setHeldTool(null);
    }
  };

  return (
    <group 
      position={position}
      onClick={handleClick}
      onPointerOver={() => { if (currentStep === STEPS.PREPARATION) document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      {/* Step Highlight */}
      {isTarget && !isHeld && (
        <mesh position={[0, 0.005, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.09, 0.005, 16, 32]} />
          <meshBasicMaterial color="#00e5ff" transparent opacity={0.6} />
        </mesh>
      )}

      {/* Paper Stack */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.08, 32]} />
        <meshStandardMaterial color="#fffde7" roughness={1} />
      </mesh>
      
      {/* Slight thickness */}
      <mesh receiveShadow position={[0, -0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.002, 32]} />
        <meshStandardMaterial color="#f5f5f5" roughness={1} />
      </mesh>

      {/* Grid lines for paper look */}
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.075, 32]} />
        <meshBasicMaterial color="#e0e0e0" transparent opacity={0.4} wireframe />
      </mesh>
    </group>
  );
};

export default FilterPaper;
