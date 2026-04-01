import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import useStore, { STEPS } from '../lib/store';
import VialRack from './VialRack';

const FixativeVial = ({ position = [0.2, 0.93, -0.3] }) => {
  const { currentStep, heldTool, setHeldTool, setStates, setStep, narrate, showWrongAction,
    vialCapOpen, rootsInForceps, rootsInVial, fixationComplete } = useStore();
  const meshRef = useRef();
  const [showClock, setShowClock] = useState(false);
  const [clockHour, setClockHour] = useState(0);

  const targetPos = useRef(new THREE.Vector3(...position));

  useFrame(() => {
    if (meshRef.current) {
      meshRef.current.position.lerp(targetPos.current, 0.1);
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();

    // Step 4 (FIXATION): Open cap → drop roots → close cap → 24h
    if (currentStep === STEPS.FIXATION) {
      if (!vialCapOpen && !rootsInVial) {
        // Open the cap first
        if (rootsInForceps) {
          setStates({ vialCapOpen: true });
          narrate('Vial cap opened. Drop the root tips inside.');
        } else {
          showWrongAction('Pick root tips with forceps first.');
        }
      } else if (vialCapOpen && rootsInForceps && !rootsInVial) {
        // Drop roots using forceps
        setStates({ rootsInVial: true, rootsInForceps: false, vialCapOpen: false });
        setHeldTool(null);
        narrate('Root tips are in the fixative. Closing cap. Fixing for 24 hours.');

        // Show clock animation
        setShowClock(true);
        let hour = 0;
        const interval = setInterval(() => {
          hour += 4;
          setClockHour(hour);
          if (hour >= 24) {
            clearInterval(interval);
            setShowClock(false);
            setStates({ fixationComplete: true });
            setStep(STEPS.PLACE_ON_SLIDE);
            narrate('Fixation complete. Open the vial and place one root tip on the glass slide.');
          }
        }, 500);
      } else if (rootsInVial && !vialCapOpen) {
        showWrongAction('Wait for fixation to complete.');
      }
    }
    // Step 5 (PLACE_ON_SLIDE): Open cap to retrieve roots
    else if (currentStep === STEPS.PLACE_ON_SLIDE) {
      if (!vialCapOpen && fixationComplete && heldTool === 'forceps') {
        setStates({ vialCapOpen: true });
        narrate('Vial opened. Pick a root tip with forceps.');
      } else if (vialCapOpen && heldTool === 'forceps' && !rootsInForceps) {
        setStates({ rootsInForceps: true, vialCapOpen: false });
        narrate('Root tip picked up. Place it on the glass slide.');
      }
    }
  };

  const showHighlight = (currentStep === STEPS.FIXATION && (rootsInForceps || vialCapOpen)) ||
    (currentStep === STEPS.PLACE_ON_SLIDE && heldTool === 'forceps');

  return (
    <group ref={meshRef} onPointerDown={handleClick}
      onPointerOver={() => { if (showHighlight) document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      {/* Vial Rack */}
      <VialRack position={[0, 0, 0]} />

      {/* Body — Sunk slightly into the middle hole */}
      <mesh castShadow receiveShadow position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.02, 0.008, 0.12, 16]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.4}
          transmission={0.8} thickness={0.5} roughness={0.2} />
      </mesh>

      {/* Liquid */}
      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.015, 0.01, 0.08, 16]} />
        <meshStandardMaterial color="#e3f2fd" transparent opacity={0.6} />
      </mesh>

      {/* Roots inside */}
      {rootsInVial && (
        <group position={[0, 0.05, 0]}>
          {[...Array(3)].map((_, i) => (
            <mesh key={i} position={[(Math.random()-0.5)*0.006, i*0.008, (Math.random()-0.5)*0.006]}
              rotation={[Math.random(), Math.random(), 0]}>
              <cylinderGeometry args={[0.001, 0.001, 0.012, 6]} />
              <meshStandardMaterial color="#fdf5e6" />
            </mesh>
          ))}
        </group>
      )}

      {/* Lid — animated open/close */}
      <group position={[0, 0.132, 0]}
        rotation={vialCapOpen ? [0, 0, Math.PI / 2.5] : [0, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[0.022, 0.022, 0.005, 16]} />
          <meshStandardMaterial color={vialCapOpen ? '#4db6ac' : '#eeeeee'} />
        </mesh>
      </group>

      {/* Rim */}
      <mesh position={[0, 0.13, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.02, 0.003, 8, 24]} />
        <meshStandardMaterial color="#eeeeee" />
      </mesh>

      {/* Highlight ring at base of rack */}
      {showHighlight && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.12, 0.003, 16, 32]} />
          <meshBasicMaterial color="#00e5ff" transparent opacity={0.6} />
        </mesh>
      )}

      {/* Clock overlay above vial */}
      {showClock && (
        <group position={[0, 0.22, 0]}>
          <mesh>
            <boxGeometry args={[0.12, 0.04, 0.01]} />
            <meshBasicMaterial color="#000000" transparent opacity={0.85} />
          </mesh>
        </group>
      )}
    </group>
  );
};

export default FixativeVial;
