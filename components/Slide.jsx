import React, { useRef, useState, useEffect } from 'react';
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

  const [rootFalling, setRootFalling] = useState(false);
  const rootY = useRef(0.2);

  useEffect(() => {
    if (rootOnSlide && !squashed) {
      rootY.current = 0.2;
      setRootFalling(true);
    }
  }, [rootOnSlide]);

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

    if (rootFalling) {
      rootY.current -= delta * 0.8;
      if (rootY.current <= 0) {
        rootY.current = 0;
        setRootFalling(false);
      }
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

    if (heldTool === 'forceps' && (state.rootsInForceps || state.rootPicked)) {
      setStates({ rootOnSlide: true, rootsInForceps: false, rootPicked: false });
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
  const hasStain = slideFluids.includes('STAIN');
  const hasWater = slideFluids.includes('WATER');
  const { rootProcessingState } = useStore.getState();
  
  // Calculate evaporation based on slideHeatedTime
  const heatDecay = Math.max(0, 1 - (slideHeatedTime / 300)); 

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

      {/* 💧 FLUIDS LAYER */}
      {slideFluids.length > 0 && (
         <group position={[0, 0.003, 0]}>
           <mesh rotation={[-Math.PI / 2, 0, 0]}>
             <circleGeometry args={[0.045, 32]} />
             <meshPhysicalMaterial 
               color={hasStain ? "#c62828" : "#81d4fa"}
               transparent 
               opacity={squashed ? 0.2 : (hasStain ? 0.8 : 0.5) * heatDecay} 
               transmission={0.9} 
               roughness={0.0} 
               ior={1.33}
             />
           </mesh>
         </group>
      )}

      {/* 🧬 ROOT LAYER */}
      {rootOnSlide && (
        <group position={[0, rootFalling ? rootY.current : 0.004, 0]}>
          <mesh 
            scale={squashed ? [2.5, 0.05, 2.5] : [1, 1, 1]}
            position={[0, squashed ? -0.001 : 0, 0]}
          >
            <cylinderGeometry args={[0.005, 0.006, 0.02, 16]} />
            <meshStandardMaterial 
              color={rootProcessingState === 'STAINED' || hasStain ? "#880e4f" : (rootProcessingState === 'MACERATED' ? "#f0f4c3" : "#f0e6c8")} 
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
