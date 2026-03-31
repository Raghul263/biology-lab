import React, { useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import useStore, { STEPS } from '../lib/store';
import * as THREE from 'three';

const Slide = ({ position: initialPosition = [0, 0.93, 0.2] }) => {
  const { 
    currentStep, tipOnSlide, waterAdded, stainAdded, 
    setStep, setStates, heldTool, setHeldTool, 
    coverSlipApplied, squashed, heated
  } = useStore();
  const [isDragging, setIsDragging] = useState(false);
  const [currentPos, setCurrentPos] = useState(initialPosition);
  const { raycaster } = useThree();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.93);

  // Only drag towards microscope in MICROSCOPE step
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
    if (currentStep === STEPS.MICROSCOPE && coverSlipApplied && !isDragging) {
      setIsDragging(true);
      try { e.target.setPointerCapture(e.pointerId); } catch (err) {}
    }
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    try { e.target.releasePointerCapture(e.pointerId); } catch (err) {}
    
    const [x, y, z] = currentPos;
    const microPos = useStore.getState().setupPositions['microscope'] || [0, 1.0, -0.45];
    // Dropped near dynamic microscope position
    if (Math.abs(x - microPos[0]) < 0.25 && Math.abs(z - microPos[2]) < 0.3) {
      setStates({ slideOnMicroscope: true });
      setCurrentPos([microPos[0], microPos[1] + 0.1, microPos[2] + 0.08]);
    }
  };

  const handleInteraction = (e) => {
    e.stopPropagation();
    if (currentStep === STEPS.PREPARATION) {
      const state = useStore.getState();
      if (heldTool === 'forceps' && state.rootsInForceps && !tipOnSlide) {
        // Step: Put root tip from forceps onto slide
        setStates({ tipOnSlide: true, rootsInForceps: false });
        setHeldTool(null);
      } else if (heldTool === 'filterPaper' && tipOnSlide && !state.stainRemoved) {
        // Step: Blot excess stain with filter paper
        setStates({ stainRemoved: true });
        setHeldTool(null);
      } else if (heldTool === 'dropper' && tipOnSlide && !waterAdded) {
        // Step: Add one drop of water on root tip
        setStates({ waterAdded: true });
        setHeldTool(null);
      } else if (heldTool === 'needle' && tipOnSlide && waterAdded && state.coverSlipApplied && !squashed) {
        // Step: Squash the meristematic tissue with needle
        setStates({ squashed: true });
        setTimeout(() => setStep(STEPS.MICROSCOPE), 500);
        setHeldTool(null);
      }
    }
  };

  const showHighlight = (currentStep === STEPS.PREPARATION && heldTool) || 
                         (currentStep === STEPS.MICROSCOPE && coverSlipApplied);

  return (
    <group 
      position={currentPos}
      onPointerDown={handlePointerDown}
      onPointerUp={handlePointerUp}
      onClick={handleInteraction}
      onPointerOver={() => {
        if (currentStep === STEPS.MICROSCOPE) document.body.style.cursor = 'grab';
        else if (currentStep === STEPS.PREPARATION) document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      {/* Step Highlight */}
      {showHighlight && (
        <group position={[0, 0.02, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.15, 0.005, 16, 32]} />
            <meshBasicMaterial color="#00e5ff" transparent opacity={0.5} />
          </mesh>
        </group>
      )}

      {/* Glass Slide */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.005, 0.15]} />
        <meshPhysicalMaterial 
          color="#e1f5fe" 
          transparent 
          transmission={0.85} 
          thickness={0.05}
          roughness={0.01} 
          ior={1.45}
          clearcoat={1}
        />
      </mesh>

      {/* Root Tip on Slide */}
      {tipOnSlide && (
        <group position={[0, 0.003, 0]}>
          {/* Stain area */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.03, 16]} />
            <meshStandardMaterial color="#e91e63" transparent opacity={stainAdded ? 0.6 : 0.15} />
          </mesh>
          {/* Water droplet */}
          {waterAdded && (
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
              <circleGeometry args={[0.04, 16]} />
              <meshPhysicalMaterial color="#4fc3f7" transparent opacity={0.3} transmission={0.9} />
            </mesh>
          )}
          {/* The sample */}
          <mesh position={[0, 0, 0]}>
            <cylinderGeometry args={[0.005, 0.005, 0.02, 8]} />
            <meshStandardMaterial color={stainAdded ? "#ffcdd2" : "#fdf5e6"} />
          </mesh>
        </group>
      )}

      {/* Cover Slip if applied */}
      {coverSlipApplied && (
        <mesh position={[0, 0.008, 0]}>
          <boxGeometry args={[0.12, 0.002, 0.12]} />
          <meshPhysicalMaterial transparent opacity={0.4} transmission={0.9} color="#ffffff" />
        </mesh>
      )}
    </group>
  );
};

export default Slide;
