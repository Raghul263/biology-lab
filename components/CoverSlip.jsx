import React, { useState } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import useStore, { STEPS } from '../lib/store';

const CoverSlip = ({ position: initialPosition = [1.2, 0.93, 0.45] }) => {
  const { currentStep, setStep, setStates, squashed, waterAdded, tipOnSlide } = useStore();
  const [isDragging, setIsDragging] = useState(false);
  const [currentPos, setCurrentPos] = useState(initialPosition);
  const { raycaster } = useThree();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.93);

  // CoverSlip is draggable in PREPARATION after water has been added
  const canDrag = currentStep === STEPS.PREPARATION && tipOnSlide && waterAdded && !useStore.getState().coverSlipApplied;

  useFrame(() => {
    if (isDragging) {
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);
      if (intersection) {
        setCurrentPos([intersection.x, 0.93, intersection.z]);
      }
    }
  });

  const handlePointerDown = (e) => {
    e.stopPropagation();
    if (canDrag) {
      setIsDragging(true);
      try { e.target.setPointerCapture(e.pointerId); } catch (err) {}
    }
  };

  const handlePointerMove = (e) => {
    if (!isDragging) return;
    e.stopPropagation();
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    try { e.target.releasePointerCapture(e.pointerId); } catch (err) {}
    
    const [x, y, z] = currentPos;
    const slidePos = useStore.getState().setupPositions['slide'] || [0.9, 0.93, 0.3];
    // Check if dropped near the dynamic custom Slide position
    if (Math.abs(x - slidePos[0]) < 0.3 && Math.abs(z - slidePos[2]) < 0.2) {
      setStates({ coverSlipApplied: true });
      setCurrentPos([slidePos[0], slidePos[1] + 0.005, slidePos[2]]); // Lock to slide position
    }
  };

  return (
    <group 
      position={currentPos}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerOver={() => {
        if (canDrag) document.body.style.cursor = 'grab';
      }}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      {/* Step highlight */}
      {canDrag && (
        <mesh position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.08, 0.005, 16, 32]} />
          <meshBasicMaterial color="#00e5ff" transparent opacity={0.6} />
        </mesh>
      )}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.1, 0.003, 0.1]} />
        <meshPhysicalMaterial 
          color="#e1f5fe" 
          transmission={0.9} 
          thickness={0.01} 
          roughness={0.005} 
          ior={1.45}
          clearcoat={1}
          transparent 
          opacity={1} 
        />
      </mesh>
    </group>
  );
};

export default CoverSlip;
