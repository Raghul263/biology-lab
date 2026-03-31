import React, { useState, useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

import useStore, { STEPS } from '../lib/store';

const Scissors = () => {
  const { currentStep, setStep, addRootTip } = useStore();
  const [dragged, setDragged] = useState(false);
  const rigidBodyRef = useRef();
  const { viewport, mouse } = useThree();
  
  // Scissor position
  const pos = useRef(new THREE.Vector3(0.8, 0.85, 0.1));
  
  useFrame(() => {
    if (dragged && currentStep === STEPS.CUT_ROOTS) {
      const x = (mouse.x * viewport.width) / 2;
      const z = -(mouse.y * viewport.height) / 2;
      pos.current.set(x, 0.95, z);
      
      if (rigidBodyRef.current) {
        rigidBodyRef.current.setTranslation({ x, y: 0.95, z }, true);
      }
    }
  });

  const handleSnip = (e) => {
    if (e.other && e.other.rigidBodyObject.name === 'onion_root') {
      console.log('SNIPI');
      // Play sound here if assets available
      addRootTip();
      setStep(STEPS.ACID_DROP);
    }
  };

  return (
    <group position={pos.current.toArray()}>
        {/* Adjusted rotation to lay flat and scaled up slightly more */}
        <group rotation={[Math.PI / 2, 0, Math.PI / 4]} scale={[4.5, 4.5, 4.5]}>
          {/* Scissors Handles */}
          <mesh castShadow position={[0, -0.1, 0]}>
            <torusGeometry args={[0.04, 0.008, 12, 24]} />
            <meshStandardMaterial color="#007bff" roughness={0.3} />
          </mesh>
          <mesh castShadow position={[0, 0.1, 0]}>
            <torusGeometry args={[0.04, 0.008, 12, 24]} />
            <meshStandardMaterial color="#007bff" roughness={0.3} />
          </mesh>
          {/* Scissors Blades */}
          <mesh castShadow position={[-0.15, 0, 0]}>
            <boxGeometry args={[0.2, 0.05, 0.01]} />
            <meshStandardMaterial color="#ffffff" metalness={1} roughness={0.1} />
          </mesh>
        </group>
    </group>

  );
};

export default Scissors;
