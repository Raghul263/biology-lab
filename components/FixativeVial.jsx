import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import useStore from '../lib/store';
import VialRack from './VialRack';

const FixativeVial = ({ position: initialPosition = [0.2, 0.93, -0.3] }) => {
  const { 
    heldTool, setHeldTool, setStates,
    vialCapOpen, rootInVial,
    fixationStarted, fixationCompleted
  } = useStore();
  const meshRef = useRef();
  const rootGroupRef = useRef();
  const [clockHour, setClockHour] = useState(0);

  const isHeld = heldTool === 'vial';
  const { raycaster } = useThree();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.93);

  useFrame((state, delta) => {
    if (isHeld && meshRef.current) {
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);
      if (intersection) {
        intersection.x = Math.max(-2.0, Math.min(2.0, intersection.x));
        intersection.z = Math.max(-0.8, Math.min(0.8, intersection.z));
        meshRef.current.position.set(intersection.x, 0.93, intersection.z);
      }
    } else if (!isHeld && meshRef.current) {
      const { setupPositions } = useStore.getState();
      const pos = setupPositions['vial'] || initialPosition;
      meshRef.current.position.set(...pos);
    }

    // Fixation Animation Logic
    if (fixationStarted && !fixationCompleted) {
        if (clockHour < 24) {
            setClockHour(prev => Math.min(prev + delta * 8, 24)); // Fast forward 24h in ~3s
        } else {
            setStates({ fixationCompleted: true, rootProcessingState: 'FIXED' });
        }
    }

    // 🌊 Root Floating Animation
    if (rootInVial && rootGroupRef.current) {
        const t = state.clock.getElapsedTime();
        rootGroupRef.current.position.y = Math.sin(t * 2) * 0.003;
        rootGroupRef.current.rotation.y += delta * 0.5;
    }
  });

  const handleCapClick = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    
    // 🧠 TOOL PRIORITY: 
    if (heldTool === 'forceps') {
       if (!vialCapOpen) {
          // If closed, open it first so we can drop
          setStates({ vialCapOpen: true });
       } else {
          // If already open, perform the drop/pick
          handleClick(e);
       }
       return;
    }

    const newCapState = !vialCapOpen;
    setStates({ vialCapOpen: newCapState });
    
    // Start fixation if closing with root inside
    if (!newCapState && rootInVial && !fixationStarted) {
        setStates({ fixationStarted: true });
    }
  };

  const handleClick = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();

    if (isHeld) {
      const pos = meshRef.current.position;
      useStore.getState().setSetupPosition('vial', [pos.x, 0.93, pos.z]);
      setHeldTool(null);
      return;
    }

    if (!heldTool) {
        setHeldTool('vial');
    } else if (heldTool === 'forceps' && vialCapOpen) {
        const { rootInVial, holdingRoot, setStates } = useStore.getState();
        if (holdingRoot && !rootInVial) {
            setStates({ rootInVial: true, holdingRoot: false });
        } else if (!holdingRoot && rootInVial) {
            setStates({ rootInVial: false, holdingRoot: true });
        }
    }
  };

  const showHighlight = heldTool === 'forceps' || isHeld;

  return (
    <group ref={meshRef} onPointerDown={handleClick}
      onPointerOver={() => { 
        if (showHighlight || !heldTool) document.body.style.cursor = isHeld ? 'grabbing' : 'pointer'; 
        setStates({ hoveredComponent: 'vial' });
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
        setStates({ hoveredComponent: null });
      }}
    >
      <VialRack position={[0, 0, 0]} />

      {/* Vial Body - Clicking here picks it up */}
      <mesh castShadow receiveShadow position={[0, 0.07, 0]}>
        <cylinderGeometry args={[0.02, 0.008, 0.12, 16]} />
        <meshPhysicalMaterial color="#ffffff" transparent opacity={0.4}
          transmission={0.8} thickness={0.5} roughness={0.2} />
      </mesh>

      {/* Alcohol Liquid (Dark yellow as requested) */}
      <mesh position={[0, 0.065, 0]}>
        <cylinderGeometry args={[0.018, 0.012, 0.10, 16]} />
        <meshStandardMaterial color="#f9a825" transparent opacity={0.75} roughness={0.1} />
      </mesh>

      {/* 🧬 Root Tip Inside (Confirmed Visibility) */}
      {rootInVial && (
        <group ref={rootGroupRef} position={[0, 0.04, 0]}>
          <mesh rotation={[0.4, 0.5, 0]}>
            <cylinderGeometry args={[0.004, 0.003, 0.025, 8]} />
            <meshStandardMaterial color="#fff9c4" emissive="#fbc02d" emissiveIntensity={0.2} />
          </mesh>
          {/* Subtle bubble effect for "floating" */}
          <mesh position={[0.005, 0.01, 0]}>
            <sphereGeometry args={[0.001, 8, 8]} />
            <meshBasicMaterial color="white" transparent opacity={0.4} />
          </mesh>
        </group>
      )}

      {/* Vial Cap - SURGICAL TOGGLE ONLY */}
      <group position={[0, 0.132, 0]}
        onPointerDown={handleCapClick}
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

      {/* Selection Highlight */}
      {showHighlight && (
        <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.12, 0.003, 16, 32]} />
          <meshBasicMaterial color="#00e5ff" transparent opacity={0.6} />
        </mesh>
      )}

      {/* Fixation Clock Animation */}
      {fixationStarted && !fixationCompleted && (
        <group position={[0, 0.22, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.3, 0.1, 0.01]} />
            <meshBasicMaterial color="#ff9800" opacity={0.9} transparent />
          </mesh>
          <Text 
            color="white" 
            fontSize={0.04} 
            position={[0, 0.01, 0.01]}
            textAlign="center"
          >
            ⏱️ {Math.floor(clockHour)} Hours
          </Text>
          <Text 
            color="white" 
            fontSize={0.025} 
            position={[0, -0.025, 0.01]}
            textAlign="center"
          >
            FIXATION IN PROGRESS
          </Text>
        </group>
      )}

      {/* Completion Label (Only show when cap is open) */}
      {fixationCompleted && vialCapOpen && (
        <group position={[0, 0.22, 0]}>
          <mesh>
            <boxGeometry args={[0.3, 0.06, 0.01]} />
            <meshBasicMaterial color="#4caf50" opacity={0.9} transparent />
          </mesh>
          <Text color="white" fontSize={0.035} position={[0, 0, 0.01]}>
            ✅ FIXED (24H)
          </Text>
        </group>
      )}
    </group>
  );
};

export default FixativeVial;
