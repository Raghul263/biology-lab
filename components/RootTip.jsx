import React, { useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useStore, { STEPS } from '../lib/store';

const RootTip = ({ position: initialPosition = [0.85, 0.95, -0.1] }) => {
  const { currentStep, setStep, setStates, stainAdded, heldTool, setHeldTool, rootTipsInVial, tipOnSlide } = useStore();
  const isHeld = heldTool === 'root_tip';
  const [currentPos, setCurrentPos] = useState(initialPosition);
  const { raycaster } = useThree();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.93);

  // Position restoration when picking up/placing based on active state/step
  React.useEffect(() => {
    const { setupPositions } = useStore.getState();
    const slidePos = setupPositions['slide'] || [0.9, 0.93, 0.3];
    const vialPos = setupPositions['vial'] || [1.5, 0.93, -0.3];
    const watchGlassPos = setupPositions['watchGlass'] || [0.85, 0.93, -0.1];

    if (isHeld) {
      // Follow mouse while held (handled in useFrame)
    } else if (tipOnSlide) {
      setCurrentPos([slidePos[0], slidePos[1] + 0.005, slidePos[2]]);
    } else if (rootTipsInVial) {
      setCurrentPos([vialPos[0], vialPos[1] + 0.02, vialPos[2]]);
    } else {
      setCurrentPos([watchGlassPos[0], watchGlassPos[1] + 0.02, watchGlassPos[2]]);
    }
  }, [isHeld, currentStep, tipOnSlide, rootTipsInVial]);


  // Movement while held
  const meshRef = React.useRef();
  const { camera, mouse } = useThree();
  useFrame(() => {
    if (isHeld && meshRef.current) {
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);
      if (intersection) {
        meshRef.current.position.set(intersection.x, 0.96, intersection.z); // Slightly higher while held
        // Sync the state position for handlePointerUp logic if needed, 
        // though handlePointerUp now uses heldTool logic
      }
    }
  });

  return (
    <group 
      position={currentPos}
    >
      <mesh 
        ref={meshRef}
        castShadow 
        onClick={(e) => {
          e.stopPropagation();
          if (currentStep === STEPS.TREATMENT || currentStep === STEPS.PREPARATION) {
            setHeldTool(isHeld ? null : 'root_tip');
          }
        }}
        onPointerOver={() => {
          if (currentStep === STEPS.TREATMENT || currentStep === STEPS.PREPARATION) {
            document.body.style.cursor = 'pointer';
          }
        }}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        {/* Invisible Hitbox for easier interaction */}
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} />
        
        {/* The tiny 1-2mm root tip - Color changes when stained */}
        <group scale={[1.5, 1.5, 1.5]}> {/* Slightly larger for visibility */}
          <mesh castShadow>
            <cylinderGeometry args={[0.008, 0.004, 0.04, 8]} />
            <meshStandardMaterial 
              color={stainAdded ? "#e91e63" : "#fdfd96"} 
              roughness={0.5} 
              emissive={stainAdded ? "#c2185b" : "#000000"}
              emissiveIntensity={stainAdded ? 0.3 : 0}
            />
          </mesh>
        </group>

      </mesh>
    </group>
  );
};

export default RootTip;
