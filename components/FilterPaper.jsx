import React, { useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import useStore from '../lib/store';

const FilterPaper = ({ position: initialPosition = [1.2, 0.93, -0.1] }) => {
  const { 
    setHeldTool, heldTool, paperOnSlide, cleaningProgress, stainRemoved, isCleaning, setStates 
  } = useStore();
  
  const isHeld = heldTool === 'filterPaper';
  const groupRef = useRef();
  const heldRef = useRef();
  
  const { raycaster, mouse, viewport } = useThree();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.93);

  useFrame((state, delta) => {
    const store = useStore.getState();
    const slidePos = store.setupPositions['slide'] || [0, 0.93, 0.2];

    if (store.isCleaning && !store.stainRemoved) {
        // 🧼 AUTOMATIC CLEANING ANIMATION (Left to Right -> Center)
        const currentProgress = store.cleaningProgress || 0;
        const newProgress = Math.min(1, currentProgress + delta * 0.7); // Faster animation
        setStates({ cleaningProgress: newProgress });

        if (heldRef.current) {
            const startX = slidePos[0] - 0.18;
            const endX = slidePos[0] + 0.18;
            const center = slidePos[0];
            
            let currentX;
            if (newProgress < 0.75) {
                // Phase 1: Pure Wipe (Left to Right)
                const p = newProgress / 0.75;
                currentX = startX + (endX - startX) * p;
            } else {
                // Phase 2: Settle (Back to Center)
                const p = (newProgress - 0.75) / 0.25;
                currentX = endX + (center - endX) * p;
            }
            heldRef.current.position.set(currentX, 0.945, slidePos[2]);
        }

        if (newProgress >= 1) {
            setStates({ stainRemoved: true, isCleaning: false });
        }
        return;
    }

    if (isHeld && heldRef.current) {
      if (store.paperOnSlide) {
        // Snapped but not cleaning yet - Snap to CENTER (Over the root)
        heldRef.current.position.set(slidePos[0], 0.945, slidePos[2]);
      } else {
        // Normal Dragging
        const intersection = new THREE.Vector3();
        state.raycaster.ray.intersectPlane(plane, intersection);
        if (intersection) {
          heldRef.current.position.set(intersection.x, 0.935, intersection.z);
        }
      }
    } else if (!isHeld && heldRef.current) {
        if (store.paperOnSlide) {
            heldRef.current.position.set(slidePos[0], 0.945, slidePos[2]);
        } else {
            const { setupPositions } = useStore.getState();
            const pos = setupPositions['filterPaper'] || initialPosition;
            heldRef.current.position.set(...pos);
        }
    }
  });

  const handleClick = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const store = useStore.getState();

    if (isHeld) {
      const pos = heldRef.current.position;
      const slidePos = store.setupPositions['slide'] || [0, 0.93, 0.2];
      const dist = Math.hypot(pos.x - slidePos[0], pos.z - slidePos[2]);

      // 1️⃣ SNAP TO SLIDE & AUTO-START CLEANING
      if (dist < 0.25 && store.rootOnSlide && !store.paperOnSlide && !store.stainRemoved) {
        setStates({ paperOnSlide: true, isCleaning: true, cleaningProgress: 0 });
        setHeldTool(null);
        return;
      }

      // 2️⃣ TRIGGER PICK UP AFTER CLEANING
      if (store.paperOnSlide && store.stainRemoved) {
        setStates({ paperOnSlide: false, isCleaning: false });
        setHeldTool('filterPaper');
        return;
      }

      // 3️⃣ PICK UP / RELEASE FROM SLIDE
      if (store.paperOnSlide || store.stainRemoved) {
        setStates({ paperOnSlide: false });
        store.setSetupPosition('filterPaper', [pos.x, 0.93, pos.z]);
        setHeldTool(null);
        return;
      }

      // Normal Squash logic (if cleaned and covered)
      if (dist < 0.25 && store.rootOnSlide && store.coverSlipPlaced && store.stainRemoved) {
        setStates({ squashed: true });
      }

      store.setSetupPosition('filterPaper', [pos.x, 0.93, pos.z]);
      setHeldTool(null);
    } else {
      if (!heldTool) setHeldTool('filterPaper');
    }
  };

  const trayColor = "#01579b";

  return (
    <group>
      {/* 📥 Stationary Pile */}
      <group position={initialPosition} onPointerDown={handleClick}
        onPointerOver={() => { if(!heldTool) document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        <mesh castShadow receiveShadow position={[0, 0.005, 0]}>
          <boxGeometry args={[0.2, 0.01, 0.2]} />
          <meshStandardMaterial color={trayColor} roughness={0.4} />
        </mesh>
        <mesh castShadow position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.095, 0.095, 0.03, 32, 1, true]} />
          <meshStandardMaterial color={trayColor} roughness={0.3} transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>
        <group position={[0, 0.012, 0]}>
          {[...Array(6)].map((_, i) => (
            <mesh key={i} position={[0, i * 0.001, 0]} rotation={[0, Math.random() * Math.PI, 0]}>
              <cylinderGeometry args={[0.088, 0.088, 0.001, 32]} />
              <meshStandardMaterial color="#ffffff" roughness={1.0} />
            </mesh>
          ))}
        </group>
      </group>

      {/* 🚀 Active Paper */}
      {(isHeld || paperOnSlide) && (
        <group ref={heldRef} onPointerDown={handleClick}>
          <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} castShadow>
             <cylinderGeometry args={[0.088, 0.088, 0.001, 32]} />
             <meshStandardMaterial color="#ffffff" roughness={1} />
          </mesh>
        </group>
      )}
    </group>
  );
};

export default FilterPaper;
