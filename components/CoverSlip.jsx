import React, { useState } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import useStore from '../lib/store';

const CoverSlip = ({ position: initialPosition = [1.2, 0.93, 0.45] }) => {
  const { setStates, setHeldTool } = useStore();
  const coverSlipPlaced = useStore((state) => state.coverSlipPlaced);
  const heldTool = useStore((state) => state.heldTool);
  const isHeld = heldTool === 'coverSlip';
  const groupRef = React.useRef();
  const { raycaster } = useThree();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.93);

  const canDrag = !coverSlipPlaced;

  useFrame(() => {
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

  const handleClick = (e) => {
    e.stopPropagation();
    if (!canDrag) return;

    if (isHeld) {
      const pos = groupRef.current.position;
      const slidePos = useStore.getState().setupPositions['slide'] || [0.2, 0.93, 0.5];
      
      // Snap logic to slide
      if (Math.abs(pos.x - slidePos[0]) < 0.3 && Math.abs(pos.z - slidePos[2]) < 0.2) {
        setStates({ coverSlipPlaced: true });
        // Cover slip doesn't need setupPosition update once placed, but we set its final state
      } else {
        useStore.getState().setSetupPosition('coverSlip', [pos.x, 0.93, pos.z]);
      }
      setHeldTool(null);
    } else if (!heldTool) {
      setHeldTool('coverSlip');
    }
  };

  if (coverSlipPlaced) return null;

  return (
    <group ref={groupRef} position={initialPosition}
      onClick={handleClick}
      onPointerOver={() => { 
        if (canDrag) document.body.style.cursor = isHeld ? 'grabbing' : 'pointer'; 
      }}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      {canDrag && (
        <mesh position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.08, 0.005, 16, 32]} />
          <meshBasicMaterial color="#00e5ff" transparent opacity={0.6} />
        </mesh>
      )}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.1, 0.003, 0.1]} />
        <meshPhysicalMaterial color="#e1f5fe" transmission={0.9} thickness={0.01}
          roughness={0.005} ior={1.45} clearcoat={1} transparent opacity={1} />
      </mesh>
    </group>
  );
};

export default CoverSlip;
