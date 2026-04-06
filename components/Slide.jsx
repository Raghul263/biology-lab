import React, { useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import useStore from '../lib/store';
import * as THREE from 'three';

const Slide = ({ position: initialPosition = [0, 0.93, 0.2] }) => {
  const {
    rootOnSlide, hclApplied, stainApplied, setStates, heldTool, setHeldTool,
    coverSlipPlaced, squashed
  } = useStore();
  
  const isHeld = heldTool === 'slide';
  const groupRef = useRef();
  const [unlockTime, setUnlockTime] = useState(0); // 🧠 Cooldown to prevent instant re-snap
  const { raycaster } = useThree();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.93);

  useFrame((state, delta) => {
    if (unlockTime > 0) setUnlockTime(prev => Math.max(0, prev - delta));

    if (isHeld && groupRef.current) {
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);
      if (intersection) {
        let cx = Math.max(-2.0, Math.min(2.0, intersection.x));
        let cz = Math.max(-0.8, Math.min(0.8, intersection.z));
        let cy = 0.93;

        // 🔥 AUTOMATIC SNAP TO BURNER TOP (Only if not recently unlocked)
        const burnerPos = useStore.getState().setupPositions['burner'] || [0.7, 0.93, 0];
        if (unlockTime <= 0 && Math.abs(cx - burnerPos[0]) < 0.15 && Math.abs(cz - burnerPos[2]) < 0.15) {
            cx = burnerPos[0];
            cz = burnerPos[2];
            cy = 1.22;
        }

        groupRef.current.position.set(cx, cy, cz);
      }
    } else if (!isHeld && groupRef.current && initialPosition) {
        const { setupPositions } = useStore.getState();
        const pos = setupPositions['slide'] || initialPosition;
        groupRef.current.position.set(...pos);
    }
  });

  const handleInteraction = (e) => {
    if (heldTool !== 'dropper') {
        if (e && e.stopPropagation) e.stopPropagation();
    }
    
    const store = useStore.getState(); // 🧠 Added store definition

    if (isHeld) {
      const pos = groupRef.current.position;
      const microPos = store.setupPositions['microscope'] || [0, 1.0, -0.7];
      const burnerPos = store.setupPositions['burner'] || [0.7, 0.93, 0];
      
      // 🔬 Snap logic to microscope
      if (Math.abs(pos.x - microPos[0]) < 0.25 && Math.abs(pos.z - microPos[2]) < 0.3) {
        setStates({ slideOnMicroscope: true });
        useStore.getState().setSetupPosition('slide', [microPos[0], 1.0 + 0.1, microPos[2] + 0.08]);
      } 
      // 🔥 Snap logic to Burner (Top)
      else if (Math.abs(pos.x - burnerPos[0]) < 0.15 && Math.abs(pos.z - burnerPos[2]) < 0.15) {
        useStore.getState().setSetupPosition('slide', [burnerPos[0], 1.22, burnerPos[2]]);
      }
      else {
        useStore.getState().setSetupPosition('slide', [pos.x, 0.93, pos.z]);
      }
      setHeldTool(null);
      return;
    }

    const state = useStore.getState();

    if (heldTool === 'forceps') {
      const { rootOnSlide, holdingRoot, setStates } = useStore.getState();
      if (holdingRoot && !rootOnSlide) {
        setStates({ rootOnSlide: true, holdingRoot: false });
      } else if (!holdingRoot && rootOnSlide) {
        setStates({ rootOnSlide: false, holdingRoot: true });
      }
    } else if (heldTool === 'dropper' && state.dropperState) {
      // Direct application logic moved to Dropper.jsx head click, 
      // but we can keep a fallback here if needed.
    } else if (heldTool === 'filterPaper') {
      // Filter paper absorbs fluid completely
      if (hclApplied || stainApplied) {
         setStates({ hclApplied: false, stainApplied: false });
      }
      setHeldTool(null);
    } else if (heldTool === 'needle' && coverSlipPlaced && !squashed) {
      setStates({ squashed: true });
      setHeldTool(null);
    } else if (!heldTool && !squashed) {
      // Pick up the slide if empty handed and not squashed yet
      setHeldTool('slide');
      setUnlockTime(1.5); // 🧠 Give user 1.5s to move away from burner/microscope
    }
  };

  // Determine fluid visual state based on new store variables
  return (
    <group ref={groupRef} position={initialPosition}
      onPointerDown={handleInteraction}
      onPointerOver={() => {
        if (isHeld) document.body.style.cursor = 'grabbing';
        else if (squashed) document.body.style.cursor = 'grab';
        else document.body.style.cursor = 'pointer';
        setStates({ hoveredComponent: 'slide' });
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
        setStates({ hoveredComponent: null });
      }}
    >
      {/* 🟦 THE SLIDE */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.005, 0.15]} />
        <meshPhysicalMaterial color="#ffffff" transparent transmission={1.0}
          thickness={0.05} roughness={0.02} ior={1.5} clearcoat={1} />
      </mesh>

      {/* 💧 HCl: TRANSPARENT SPREAD (Dynamic Growth) */}
      {hclApplied && (
        <mesh position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.055, 32]} />
          <meshPhysicalMaterial 
            color="#81d4fa"
            transparent 
            opacity={0.3} 
            transmission={0.9} 
            roughness={0.0} 
            ior={1.33}
          />
          {/* Simple entry animation for radial spread */}
          <ambientLight intensity={0.1} /> 
        </mesh>
      )}

      {/* 🔴 STAIN: RED DIFFUSION */}
      {stainApplied && (
        <mesh position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.045, 32]} />
          <meshPhysicalMaterial 
            color="#d32f2f"
            transparent 
            opacity={0.7} 
            transmission={0.5} 
            roughness={0.1}
          />
        </mesh>
      )}

      {/* 🧬 ROOT LAYER */}
      {rootOnSlide && (
        <group position={[0, 0.006, 0]}>
          <mesh 
            scale={squashed ? [2.5, 0.05, 2.5] : [1, 1, 1]}
            position={[0, squashed ? -0.002 : 0, 0]}
          >
            <cylinderGeometry args={[0.005, 0.006, 0.02, 16]} />
            <meshStandardMaterial 
              color={stainApplied ? "#ad1457" : "#f0e6c8"} 
              transparent={squashed}
              opacity={squashed ? 0.6 : 1.0}
            />
          </mesh>
        </group>
      )}
      
      {/* 🔲 COVER SLIP */}
      {coverSlipPlaced && (
        <mesh position={[0, squashed ? 0.005 : 0.008, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.12, 0.001, 0.12]} />
          <meshPhysicalMaterial color="#ffffff" transparent transmission={1.0} thickness={0.01} roughness={0.01} ior={1.5} />
        </mesh>
      )}
    </group>
  );
};

export default Slide;
