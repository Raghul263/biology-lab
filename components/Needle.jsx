import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import useStore from '../lib/store';

const Needle = ({ position: initialPosition = [0.8, 0.93, 0.4] }) => {
  const { heldTool, setHeldTool, setStates, isSquashing, squashProgress, squashed, coverSlipPlaced } = useStore();
  const meshRef = useRef();
  const [snappedTo, setSnappedTo] = React.useState(null); // null or 'slide'
  const isHeld = heldTool === 'needle';
  const { raycaster, mouse, camera } = useThree();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.93);

  useFrame((state, delta) => {
    if (isSquashing) {
        const nextProgress = Math.min(1, squashProgress + delta * 1.5);
        setStates({ squashProgress: nextProgress });
        if (nextProgress >= 1) {
            setStates({ isSquashing: false, squashed: true });
        }
    }

    if (isHeld && meshRef.current) {
      const { hoveredComponent, setupPositions } = useStore.getState();
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);

      // --- 🧠 AUTOMATIC SNAP TO SLIDE ---
      if (!snappedTo && hoveredComponent === 'slide' && coverSlipPlaced && !squashed) {
          setSnappedTo('slide');
      }

      if (snappedTo === 'slide') {
          const slidePos = setupPositions['slide'] || [0, 0.93, 0.2];
          // Needle height: starts at 0.12 above slide, moves down to 0.04 during squash
          const squashOffset = isSquashing ? (squashProgress * -0.06) : 0;
          meshRef.current.position.set(slidePos[0], 0.93 + 0.12 + squashOffset, slidePos[2]);
      } else if (intersection) {
          intersection.x = Math.max(-2.0, Math.min(2.0, intersection.x));
          intersection.z = Math.max(-0.8, Math.min(0.8, intersection.z));
          meshRef.current.position.set(intersection.x, 1.05, intersection.z);
      }
    } else if (!isHeld && meshRef.current) {
      const { setupPositions } = useStore.getState();
      const pos = setupPositions['needle'] || initialPosition;
      meshRef.current.position.set(...pos);
    }
  });

  const handleClick = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    
    if (isHeld) {
      if (isSquashing) return;

      if (snappedTo === 'slide') {
          if (!squashed) {
              setStates({ isSquashing: true, squashProgress: 0 });
          } else {
              setSnappedTo(null);
          }
          return;
      }

      const { hoveredComponent } = useStore.getState();
      if (hoveredComponent === 'slide' && coverSlipPlaced && !squashed) {
          setSnappedTo('slide');
          return;
      }

      const pos = meshRef.current.position;
      useStore.getState().setSetupPosition('needle', [pos.x, 0.93, pos.z]);
      setHeldTool(null);
      setSnappedTo(null);
    } else {
      if (!heldTool) setHeldTool('needle');
    }
  };

  const showHighlight = !heldTool;

  return (
    <group 
      ref={meshRef} 
      position={initialPosition}
      rotation={isHeld ? (snappedTo === 'slide' ? [0, 0, 0] : [-Math.PI / 4, 0, 0]) : [Math.PI / 2, 0.2, 0]}
      onPointerDown={handleClick}
      onPointerOver={() => { if (!isHeld) document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      {/* 🔴 INTERACTION ZONE: While held, this captures the user's click anywhere on the table */}
      {isHeld && (
        <mesh 
          position={[0, 0, 0]} 
          onPointerDown={handleClick}
          onPointerOver={() => { document.body.style.cursor = 'cell'; }}
        >
          <planeGeometry args={[1.5, 1.5]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}

      {showHighlight && !isHeld && (
        <mesh position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.06, 0.004, 16, 32]} />
          <meshBasicMaterial color="#00e5ff" transparent opacity={0.6} />
        </mesh>
      )}

      {/* 🟦 THE HANDLE (CAP) - NOW AT THE TOP */}
      <mesh castShadow position={[0, 0.12, 0]}>
        <cylinderGeometry args={[0.008, 0.008, 0.12, 12]} />
        <meshStandardMaterial color="#263238" roughness={0.8} />
      </mesh>

      {/* 🦯 THE METAL NEEDLE - NOW POINTING DOWN */}
      <mesh castShadow position={[0, 0.0, 0]}>
        <cylinderGeometry args={[0.003, 0.001, 0.12, 8]} />
        <meshStandardMaterial color="#cfd8dc" metalness={1} roughness={0.1} />
      </mesh>

      {/* 🔺 THE TIP - AT THE BOTTOM */}
      <mesh position={[0, -0.065, 0]}>
        <coneGeometry args={[0.001, 0.015, 8]} />
        <meshStandardMaterial color="#cfd8dc" metalness={1} roughness={0.1} />
      </mesh>

      {/* Invisible hit area */}
      <mesh position={[0, 0.05, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.25, 12]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
};

export default Needle;
