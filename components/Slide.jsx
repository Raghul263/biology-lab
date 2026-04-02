import React, { useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import useStore from '../lib/store';
import * as THREE from 'three';

const Slide = ({ position: initialPosition = [0, 0.93, 0.2] }) => {
  const {
    rootOnSlide, slideFluids, slideHeatedTime, setStates, heldTool, setHeldTool,
    coverSlipPlaced, squashed, dropperContents
  } = useStore();
  
  const isHeld = heldTool === 'slide';
  const groupRef = useRef();
  const { raycaster } = useThree();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.93);

  useFrame((state, delta) => {
    if (isHeld && groupRef.current) {
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);
      if (intersection) {
        const cx = Math.max(-2.0, Math.min(2.0, intersection.x));
        const cz = Math.max(-0.8, Math.min(0.8, intersection.z));
        groupRef.current.position.set(cx, 0.93, cz);
      }
    } else if (!isHeld && groupRef.current && initialPosition) {
        groupRef.current.position.set(...initialPosition);
    }
  });

  const handleInteraction = (e) => {
    e.stopPropagation();
    
    if (isHeld) {
      const pos = groupRef.current.position;
      const microPos = useStore.getState().setupPositions['microscope'] || [0, 1.0, -0.7];
      
      // Snap logic to microscope
      if (Math.abs(pos.x - microPos[0]) < 0.25 && Math.abs(pos.z - microPos[2]) < 0.3) {
        setStates({ slideOnMicroscope: true });
        useStore.getState().setSetupPosition('slide', [microPos[0], 1.0 + 0.1, microPos[2] + 0.08]);
      } else {
        useStore.getState().setSetupPosition('slide', [pos.x, 0.93, pos.z]);
      }
      setHeldTool(null);
      return;
    }

    const state = useStore.getState();

    if (heldTool === 'forceps' && state.rootsInForceps) {
      setStates({ rootOnSlide: true, rootsInForceps: false });
      setHeldTool(null);
    } else if (heldTool === 'dropper' && dropperContents) {
      const newFluids = [...slideFluids, dropperContents];
      setStates({ slideFluids: newFluids, dropperContents: null });
      setHeldTool(null);
    } else if (heldTool === 'filterPaper') {
      // Filter paper absorbs fluid completely
      if (slideFluids.length > 0) {
         setStates({ slideFluids: [] });
      }
      setHeldTool(null);
    } else if (heldTool === 'needle' && coverSlipPlaced && !squashed) {
      setStates({ squashed: true });
      setHeldTool(null);
    } else if (!heldTool && !squashed) {
      // Pick up the slide if empty handed and not squashed yet
      setHeldTool('slide');
    }
  };

  // Determine fluid visual state based on drops and evaporation
  const hasHcl = slideFluids.includes('HCL');
  const hasStain = slideFluids.includes('STAIN');
  const hasWater = slideFluids.includes('WATER');
  
  // Calculate evaporation based on slideHeatedTime
  const heatDecay = Math.max(0, 1 - (slideHeatedTime / 20)); // Fades out over 20 seconds of heat

  return (
    <group ref={groupRef} position={initialPosition}
      onClick={handleInteraction}
      onPointerOver={() => {
        if (isHeld) document.body.style.cursor = 'grabbing';
        else if (squashed) document.body.style.cursor = 'grab';
        else document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.005, 0.15]} />
        <meshPhysicalMaterial color="#e1f5fe" transparent transmission={1.0}
          thickness={0.05} roughness={0.02} ior={1.5} clearcoat={1} />
      </mesh>

      {/* Fluids layer */}
      {slideFluids.length > 0 && heatDecay > 0 && (
         <group position={[0, 0.003, 0]}>
           <mesh rotation={[-Math.PI / 2, 0, 0]}>
             <circleGeometry args={[0.04 * (1 + slideFluids.length * 0.2), 32]} />
             <meshPhysicalMaterial 
               color={hasStain ? "#d32f2f" : hasWater ? "#4fc3f7" : "#e0f7fa"}
               transparent 
               opacity={(hasStain ? 0.8 : 0.4) * heatDecay} 
               transmission={0.9} 
               roughness={0.0} 
               ior={1.33}
             />
           </mesh>
         </group>
      )}

      {/* Root Layer */}
      {rootOnSlide && (
        <group position={[0, 0.004, 0]}>
          <mesh scale={squashed ? [2, 0.2, 2] : [1, 1, 1]}>
            <cylinderGeometry args={[0.005, 0.005, 0.02, 16]} />
            <meshStandardMaterial color={hasStain ? "#b71c1c" : "#fdf5e6"} />
          </mesh>
        </group>
      )}
      
      {/* Cover Slip */}
      {coverSlipPlaced && (
        <mesh position={[0, squashed ? 0.005 : 0.008, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.1, 0.001, 0.1]} />
          <meshPhysicalMaterial color="#ffffff" transparent transmission={1.0} thickness={0.01} roughness={0.01} ior={1.5} />
        </mesh>
      )}
    </group>
  );
};

export default Slide;
