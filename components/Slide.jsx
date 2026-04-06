import React, { useRef, useState, useEffect } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import useStore from '../lib/store';
import * as THREE from 'three';

const Slide = ({ position: initialPosition = [0, 0.93, 0.2], isAttached = false }) => {
  const {
    rootOnSlide, slideFluids, slideHeatedTime, setStates, heldTool, setHeldTool,
    coverSlipPlaced, squashed, dropperContents, slideOnMicroscope
  } = useStore();
  
  const isHeld = heldTool === 'slide';
  const groupRef = useRef();
  const { raycaster } = useThree();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.93);

  const [rootFalling, setRootFalling] = useState(false);
  const rootY = useRef(0.2);

  const [settling, setSettling] = useState(false);
  const targetPosRef = useRef(null);
  const { microscopeZoomed } = useStore();

  useEffect(() => {
    if (isAttached && groupRef.current) {
        // When attached to microscope stage
        groupRef.current.position.set(0, 0.0125, 0);
        groupRef.current.rotation.set(0, 0, 0);
    }
  }, [isAttached]);

  useFrame((state, delta) => {
    if (isAttached) return; // Skip all independent movement logic if parented
    
    if (isHeld && groupRef.current && !slideOnMicroscope) {
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);
      if (intersection) {
        const cx = Math.max(-2.0, Math.min(2.0, intersection.x));
        const cz = Math.max(-0.8, Math.min(0.8, intersection.z));
        
        const microPos = useStore.getState().setupPositions['microscope'] || [0, 1.0, -0.7];
        const targetX = microPos[0];
        const targetZ = microPos[2] + 0.05; 
        const dist = Math.sqrt(Math.pow(cx - targetX, 2) + Math.pow(cz - targetZ, 2));
        
        const isNear = dist < 0.18;
        const currentNear = useStore.getState().nearMicroscopeStage;
        if (isNear !== currentNear) {
           setStates({ nearMicroscopeStage: isNear });
        }
        
        if (dist < 0.2) {
            // Magnetic pull - stronger as it gets closer
            const strength = Math.max(0, 1 - dist / 0.2) * 0.15;
            groupRef.current.position.set(
               THREE.MathUtils.lerp(cx, targetX, strength),
               0.93,
               THREE.MathUtils.lerp(cz, targetZ, strength)
            );
        } else {
            groupRef.current.position.set(cx, 0.93, cz);
        }
      }
    } else if (settling && groupRef.current && targetPosRef.current) {
        // Settle animation: Interpolate position and rotation for a natural "snap"
        groupRef.current.position.lerp(new THREE.Vector3(...targetPosRef.current), 10 * delta);
        
        // Flatten rotation smoothly
        groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 10 * delta);
        groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, 10 * delta);
        
        if (groupRef.current.position.distanceTo(new THREE.Vector3(...targetPosRef.current)) < 0.001) {
            groupRef.current.position.set(...targetPosRef.current);
            groupRef.current.rotation.set(0, 0, 0);
            setSettling(false);
            setStates({ slideOnMicroscope: true });
            useStore.getState().setSetupPosition('slide', targetPosRef.current);
            
            // 🔍 AUTOMATIC VIEW: Open microscope UI once slide is secured
            useStore.getState().toggleMicroscope(true);
        }
    } else if (!isHeld && !settling && groupRef.current && initialPosition) {
        groupRef.current.position.set(...initialPosition);
        if (slideOnMicroscope) {
          groupRef.current.rotation.set(0, 0, 0);
        }
    }

    if (rootFalling) {
      rootY.current -= delta * 0.8;
      if (rootY.current <= 0) {
        rootY.current = 0;
        setRootFalling(false);
      }
    }
  });

  // Trigger settle/snap whenever the slide is dropped near the microscope
  const prevHeldRef = useRef(isHeld);
  useEffect(() => {
    if (prevHeldRef.current && !isHeld && !slideOnMicroscope) {
      const pos = groupRef.current.position;
      const microPos = useStore.getState().setupPositions['microscope'] || [0, 1.0, -0.7];
      
      const targetX = microPos[0];
      const targetZ = microPos[2] + 0.05;
      
      // Increased tolerance (0.18) for easier placement
      if (Math.abs(pos.x - targetX) < 0.18 && Math.abs(pos.z - targetZ) < 0.18) {
        targetPosRef.current = [targetX, microPos[1] + 0.2325, targetZ];
        setSettling(true);
      }
    }
    prevHeldRef.current = isHeld;
  }, [isHeld, slideOnMicroscope]);

  const handleInteraction = (e) => {
    e.stopPropagation();
    
    // DETACH LOGIC: If already on microscope and clicked, take it off
    if (slideOnMicroscope) {
        const microPos = useStore.getState().setupPositions['microscope'] || [0, 1.0, -0.7];
        // Place it slightly to the side on the table
        setStates({ slideOnMicroscope: false });
        useStore.getState().setSetupPosition('slide', [microPos[0] + 0.3, 0.93, microPos[2]]);
        return; 
    }
    
    if (isHeld) {
      // Just release - the useEffect above will handle the snapping if valid
      setHeldTool(null);
      return;
    }

    const state = useStore.getState();
    // ... pick up logic continues ...


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
        if (slideOnMicroscope) {
           document.body.style.cursor = 'not-allowed';
           return;
        }
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
