import React from 'react';
import * as THREE from 'three';
import { Text } from '@react-three/drei';
import { useThree, useFrame } from '@react-three/fiber';
import useStore from '../lib/store';

const Beaker = ({ position: initialPosition = [-1.2, 0.93, -0.3] }) => {
  const { setStates, heldTool, setHeldTool } = useStore();
  const isHeld = heldTool === 'waterBeaker';
  const groupRef = React.useRef();
  const { raycaster } = useThree();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.93);

  useFrame(() => {
    if (isHeld && groupRef.current) {
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);
      if (intersection) {
        intersection.x = Math.max(-2.0, Math.min(2.0, intersection.x));
        intersection.z = Math.max(-0.8, Math.min(0.8, intersection.z));
        groupRef.current.position.set(intersection.x, 0.93, intersection.z);
      }
    } else if (!isHeld && groupRef.current && initialPosition) {
      groupRef.current.position.set(...initialPosition);
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (isHeld) {
      const pos = groupRef.current.position;
      useStore.getState().setSetupPosition('waterBeaker', [pos.x, 0.93, pos.z]);
      setHeldTool(null);
    } else if (heldTool === 'dropper') {
      setStates({ dropperContents: 'WATER' });
    } else if (heldTool === 'onion') {
      setStates({ onionPlacedOn: 'beakerTop' });
      setHeldTool(null);
    } else if (!heldTool) {
      setHeldTool('waterBeaker');
    }
  };

  const showHighlight = heldTool === 'dropper' || isHeld;

  return (
    <group ref={groupRef} position={initialPosition} 
      onPointerDown={handleClick}
      onPointerOver={() => { 
        if (showHighlight || !heldTool) document.body.style.cursor = isHeld ? 'grabbing' : 'pointer'; 
        useStore.getState().setStates({ hoveredComponent: 'waterBeaker' });
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
        useStore.getState().setStates({ hoveredComponent: null });
      }}
    >
      {showHighlight && (
        <group position={[0, 0.28, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.13, 0.005, 16, 32]} />
            <meshBasicMaterial color="#00e5ff" transparent opacity={0.5} />
          </mesh>
        </group>
      )}

      <mesh castShadow receiveShadow position={[0, 0.125, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.25, 64, 1, true]} />
        <meshPhysicalMaterial color="#ffffff" transmission={0.95} ior={1.5} thickness={0.02}
          roughness={0.02} clearcoat={1} clearcoatRoughness={0.05}
          transparent opacity={0.8} side={THREE.DoubleSide} />
      </mesh>

      {[0.06, 0.12, 0.18].map((height, i) => (
        <group key={i} position={[0, height, 0]}>
          <mesh position={[0.118, 0, 0]}>
            <boxGeometry args={[0.002, 0.004, 0.025]} />
            <meshStandardMaterial color="#ffffff" opacity={0.6} transparent />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 0.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.12, 0.003, 16, 64]} />
        <meshPhysicalMaterial color="#ffffff" transmission={0.9} roughness={0.1} clearcoat={1} />
      </mesh>

      <group position={[0, 0, 0]}>
        <mesh receiveShadow position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.115, 0.115, 0.2, 32]} />
          <meshPhysicalMaterial color="#4fc3f7" transmission={0.4} ior={1.33}
            roughness={0.05} transparent opacity={0.65} metalness={0.1} />
        </mesh>
        <mesh position={[0, 0.2, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.115, 32]} />
          <meshPhysicalMaterial color="#4fc3f7" transmission={0.2} roughness={0.0} transparent opacity={0.8} />
        </mesh>
      </group>

      <mesh castShadow receiveShadow position={[0, 0.005, 0]}>
        <cylinderGeometry args={[0.12, 0.12, 0.01, 64]} />
        <meshPhysicalMaterial color="#ffffff" transmission={0.95} ior={1.5} roughness={0.05} clearcoat={1} />
      </mesh>

      <mesh position={[0, 0.125, 0]}>
        <cylinderGeometry args={[0.18, 0.18, 0.3, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
};

export default Beaker;
