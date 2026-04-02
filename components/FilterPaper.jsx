import React, { useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useStore from '../lib/store';

const FilterPaper = ({ position: initialPosition = [1.2, 0.93, -0.1] }) => {
  const { setHeldTool, heldTool } = useStore();
  const isHeld = heldTool === 'filterPaper';
  const isTarget = false;

  const heldRef = useRef();
  const { raycaster } = useThree();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.93);

  useFrame(() => {
    if (isHeld && heldRef.current) {
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);
      if (intersection) {
        intersection.x = Math.max(-2.0, Math.min(2.0, intersection.x));
        intersection.z = Math.max(-0.8, Math.min(0.8, intersection.z));
        heldRef.current.position.set(intersection.x, 0.935, intersection.z);
      }
    } else if (!isHeld && heldRef.current && initialPosition) {
      heldRef.current.position.set(...initialPosition);
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (isHeld) {
      const pos = heldRef.current ? heldRef.current.position : new THREE.Vector3(...initialPosition);
      useStore.getState().setSetupPosition('filterPaper', [pos.x, 0.93, pos.z]);
      setHeldTool(null);
    } else {
      if (!heldTool) setHeldTool('filterPaper');
    }
  };

  const trayColor = "#01579b";

  return (
    <group>
      <group position={initialPosition} onClick={handleClick}
        onPointerOver={() => { document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        {isTarget && !isHeld && (
          <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.11, 0.005, 16, 32]} />
            <meshBasicMaterial color="#00e5ff" transparent opacity={0.6} />
          </mesh>
        )}

        <mesh castShadow receiveShadow position={[0, 0.005, 0]}>
          <boxGeometry args={[0.2, 0.01, 0.2]} />
          <meshStandardMaterial color={trayColor} roughness={0.4} />
        </mesh>

        <mesh castShadow position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.095, 0.095, 0.03, 32, 1, true]} />
          <meshStandardMaterial color={trayColor} roughness={0.3} transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>

        <mesh position={[0, 0.01, 0]}>
           <cylinderGeometry args={[0.09, 0.09, 0.002, 32]} />
           <meshStandardMaterial color={trayColor} roughness={0.3} />
        </mesh>

        <group position={[0, 0.012, 0]}>
          {[...Array(6)].map((_, i) => (
            <mesh key={i} position={[0, i * 0.001, 0]} receiveShadow rotation={[0, Math.random() * Math.PI, 0]}>
              <cylinderGeometry args={[0.088, 0.088, 0.001, 32]} />
              <meshStandardMaterial color="#ffffff" roughness={1.0} />
            </mesh>
          ))}
        </group>
      </group>

      {isHeld && (
        <group ref={heldRef}>
          <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
             <cylinderGeometry args={[0.088, 0.088, 0.001, 32]} />
             <meshStandardMaterial color="#ffffff" roughness={1} />
          </mesh>
          <mesh position={[0, -0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
             <circleGeometry args={[0.09, 32]} />
             <meshBasicMaterial color="#01579b" transparent opacity={0.15} />
          </mesh>
        </group>
      )}
    </group>
  );
};

export default FilterPaper;
