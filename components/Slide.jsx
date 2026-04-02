import React, { useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import useStore, { STEPS } from '../lib/store';
import * as THREE from 'three';

const Slide = ({ position: initialPosition = [0, 0.93, 0.2] }) => {
  const {
    currentStep, rootOnSlide, waterDropAdded, stainAdded, hclAdded,
    setStep, setStates, heldTool, setHeldTool,
    coverSlipPlaced, squashed, showWrongAction, dropperContents
  } = useStore();
  const [isDragging, setIsDragging] = useState(false);
  const [currentPos, setCurrentPos] = useState(initialPosition);
  const { raycaster } = useThree();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.93);

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
    if (currentStep === STEPS.MICROSCOPE && squashed && !isDragging) {
      setIsDragging(true);
      try { e.target.setPointerCapture(e.pointerId); } catch (err) {}
    }
  };

  const handlePointerUp = (e) => {
    if (!isDragging) return;
    setIsDragging(false);
    try { e.target.releasePointerCapture(e.pointerId); } catch (err) {}

    const [x, , z] = currentPos;
    const microPos = useStore.getState().setupPositions['microscope'] || [0, 1.0, -0.7];
    if (Math.abs(x - microPos[0]) < 0.25 && Math.abs(z - microPos[2]) < 0.3) {
      setStates({ slideOnMicroscope: true });
      setCurrentPos([microPos[0], microPos[1] + 0.1, microPos[2] + 0.08]);
    }
  };

  const handleInteraction = (e) => {
    e.stopPropagation();

    // STEP 5: Forceps places root on slide
    if (currentStep === STEPS.PLACE_ON_SLIDE && heldTool === 'forceps') {
      const state = useStore.getState();
      if (state.rootsInForceps && !rootOnSlide) {
        setStates({ rootOnSlide: true, rootsInForceps: false });
        setHeldTool(null);
        setStep(STEPS.CHEMICAL_TREAT);
      } else if (!state.rootsInForceps) {
        showWrongAction('Pick up a root tip from the vial first.');
      }
    }
    // STEP 6: Dropper applies chemicals
    else if (currentStep === STEPS.CHEMICAL_TREAT && heldTool === 'dropper') {
      if (dropperContents === 'hcl' && !hclAdded) {
        setStates({ hclAdded: true, dropperContents: null });
        setHeldTool(null);
      } else if (dropperContents === 'stain' && !stainAdded) {
        setStates({ stainAdded: true, dropperContents: null });
        setHeldTool(null);
        // Both chemicals done — advance to Slide Prep
        if (useStore.getState().hclAdded) {
          setStep(STEPS.SLIDE_PREP);
        }
      } else if (!dropperContents) {
        showWrongAction('Dip the dropper into a beaker first.');
      }
    }
    // STEP 7: Slide preparation sub-steps
    else if (currentStep === STEPS.SLIDE_PREP) {
      // Blotting
      if (heldTool === 'filterPaper' && !useStore.getState().stainRemoved) {
        setStates({ stainRemoved: true });
        setHeldTool(null);
      }
      // Water drop
      else if (heldTool === 'dropper' && dropperContents === 'water' && !waterDropAdded) {
        setStates({ waterDropAdded: true, dropperContents: null });
        setHeldTool(null);
      }
      // Squashing
      else if (heldTool === 'needle' && coverSlipPlaced && !squashed) {
        setStates({ squashed: true });
        setHeldTool(null);
        setStep(STEPS.MICROSCOPE);
      }
    }
  };

  const showHighlight = 
    (currentStep === STEPS.PLACE_ON_SLIDE && heldTool === 'forceps' && useStore.getState().rootsInForceps && !rootOnSlide) ||
    (currentStep === STEPS.CHEMICAL_TREAT && heldTool === 'dropper' && dropperContents) ||
    (currentStep === STEPS.SLIDE_PREP && heldTool === 'filterPaper' && stainAdded && !useStore.getState().stainRemoved) ||
    (currentStep === STEPS.SLIDE_PREP && heldTool === 'dropper' && dropperContents === 'water') ||
    (currentStep === STEPS.SLIDE_PREP && heldTool === 'needle' && coverSlipPlaced && !squashed) ||
    (currentStep === STEPS.MICROSCOPE && squashed && !isDragging);

  return (
    <group position={currentPos}
      onPointerDown={handlePointerDown} onPointerUp={handlePointerUp}
      onClick={handleInteraction}
      onPointerOver={() => {
        if (currentStep === STEPS.MICROSCOPE) document.body.style.cursor = 'grab';
        else if (showHighlight) document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      {showHighlight && (
        <group position={[0, 0.02, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.15, 0.005, 16, 32]} />
            <meshBasicMaterial color="#00e5ff" transparent opacity={0.5} />
          </mesh>
        </group>
      )}

      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.005, 0.15]} />
        <meshPhysicalMaterial color="#e1f5fe" transparent transmission={0.85}
          thickness={0.05} roughness={0.01} ior={1.45} clearcoat={1} />
      </mesh>

      {rootOnSlide && (
        <group position={[0, 0.003, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.03, 16]} />
            <meshStandardMaterial color={stainAdded ? "#c62828" : "#fdf5e6"} transparent
              opacity={stainAdded ? 0.7 : 0.3} />
          </mesh>
          {waterDropAdded && (
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
              <circleGeometry args={[0.04, 16]} />
              <meshPhysicalMaterial color="#4fc3f7" transparent opacity={0.3} transmission={0.9} />
            </mesh>
          )}
          <mesh>
            <cylinderGeometry args={[0.005, 0.005, 0.02, 8]} />
            <meshStandardMaterial color={stainAdded ? "#e57373" : "#fdf5e6"} />
          </mesh>
        </group>
      )}

      {coverSlipPlaced && (
        <mesh position={[0, 0.008, 0]}>
          <boxGeometry args={[0.12, 0.002, 0.12]} />
          <meshPhysicalMaterial transparent opacity={0.4} transmission={0.9} color="#ffffff" />
        </mesh>
      )}
    </group>
  );
};

export default Slide;
