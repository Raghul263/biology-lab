import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import useStore, { STEPS } from '../lib/store';
import VialRack from './VialRack';

const FixativeVial = ({ position = [0.2, 0.93, -0.3] }) => {
  const { currentStep, heldTool, setHeldTool, setStates, setStep, showWrongAction,
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

    // STEP 4: FIXATION — open vial, drop roots, close, start fixation timer
    if (currentStep === STEPS.FIXATION) {
      if (!vialCapOpen) {
        if (heldTool === 'forceps' && rootsInForceps && !rootsInVial) {
          setStates({ vialCapOpen: true });
        } else if (heldTool === 'forceps' && !rootsInForceps) {
          setStates({ vialCapOpen: true });
        } else {
          showWrongAction('Use forceps to interact with the vial.');
        }
      } else {
        if (heldTool === 'forceps' && rootsInForceps && !rootsInVial) {
          setStates({ rootsInVial: true, rootsInForceps: false, vialCapOpen: false });
          setHeldTool(null);

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
            }
          }, 500);
        }
      }
    }
    // STEP 5: PLACE_ON_SLIDE — retrieve fixed root
    else if (currentStep === STEPS.PLACE_ON_SLIDE) {
      if (!vialCapOpen) {
        if (heldTool === 'forceps') {
          setStates({ vialCapOpen: true });
        }
      } else {
        if (heldTool === 'forceps' && !rootsInForceps && rootsInVial && fixationComplete) {
          setStates({ rootsInForceps: true, vialCapOpen: false });
        }
      }
    }
    else {
      showWrongAction('Follow the procedure.');
    }
  };

  const showHighlight = (currentStep === STEPS.FIXATION || currentStep === STEPS.PLACE_ON_SLIDE) && heldTool === 'forceps';

  return (
    <group ref={meshRef} onPointerDown={handleClick}
      onPointerOver={() => { if (showHighlight) document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      <VialRack position={[0, 0, 0]} />

      <mesh castShadow receiveShadow position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.02, 0.008, 0.12, 16]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.4}
          transmission={0.8} thickness={0.5} roughness={0.2} />
      </mesh>

      <mesh position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.015, 0.01, 0.08, 16]} />
        <meshStandardMaterial color="#e3f2fd" transparent opacity={0.6} />
      </mesh>

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

      <group position={[0, 0.132, 0]}
        rotation={vialCapOpen ? [0, 0, Math.PI / 2.5] : [0, 0, 0]}>
        <mesh>
          <cylinderGeometry args={[0.022, 0.022, 0.005, 16]} />
          <meshStandardMaterial color={vialCapOpen ? '#4db6ac' : '#eeeeee'} />
        </mesh>
      </group>

      <mesh position={[0, 0.13, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.02, 0.003, 8, 24]} />
        <meshStandardMaterial color="#eeeeee" />
      </mesh>

      {showHighlight && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.12, 0.003, 16, 32]} />
          <meshBasicMaterial color="#00e5ff" transparent opacity={0.6} />
        </mesh>
      )}

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
