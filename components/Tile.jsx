import React from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useStore from '../lib/store';

const Tile = ({ position: initialPosition = [0, 0.93, 0.3] }) => {
  const { heldTool, setHeldTool } = useStore();
  const isHeld = heldTool === 'tile';
  const groupRef = React.useRef();
  const { raycaster } = useThree();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.93);

  useFrame(() => {
    if (isHeld && groupRef.current) {
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);
      if (intersection) {
        const x = Math.max(-2.0, Math.min(2.0, intersection.x));
        const z = Math.max(-0.8, Math.min(0.8, intersection.z));
        groupRef.current.position.set(x, 0.93, z);
        // Sync position to the store every frame while dragging
        useStore.getState().setSetupPosition('tile', [x, 0.93, z]);
      }
    } else if (!isHeld && groupRef.current && initialPosition) {
      groupRef.current.position.set(...initialPosition);
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();

    if (isHeld) {
      // Fix in place wherever dropped
      const pos = groupRef.current.position;
      useStore.getState().setSetupPosition('tile', [pos.x, 0.93, pos.z]);
      useStore.getState().setPlaced('tile', true);
      setHeldTool(null);
    } else if (heldTool === 'onion') {
        const { setStates } = useStore.getState();
        setStates({ onionPlacedOn: 'tile' });
        setHeldTool(null);
    } else if (!heldTool) {
      // Pick up the tile freely
      setHeldTool('tile');
    }
  };

  const handleContextMenu = (e) => {
    e.nativeEvent.preventDefault();
    e.stopPropagation();
    // Removed old right-click unlock logic. Tile moves purely by clicking and dragging now.
  };

  const showHighlight = isHeld || !heldTool || heldTool === 'onion';

  return (
    <group ref={groupRef} position={initialPosition} 
      onPointerDown={handleClick}
      onContextMenu={handleContextMenu}
      onPointerOver={() => { 
        if (!isHeld) document.body.style.cursor = 'pointer'; 
        useStore.getState().setStates({ hoveredComponent: 'tile' });
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
        useStore.getState().setStates({ hoveredComponent: null });
      }}
    >
      {showHighlight && (
        <group position={[0, 0.03, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.2, 0.005, 16, 32]} />
            <meshBasicMaterial color="#00e5ff" transparent opacity={0.5} />
          </mesh>
        </group>
      )}
      <mesh receiveShadow>
        <boxGeometry args={[0.5, 0.02, 0.5]} />
        <meshStandardMaterial color="#34495e" roughness={0.4} metalness={0.1} />
      </mesh>
      {/* Flat interaction zone only at the base level to prevent "swallowing" items on top */}
      <mesh position={[0, 0.01, 0]}>
        <boxGeometry args={[0.55, 0.04, 0.55]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>
    </group>
  );
};

export default Tile;
