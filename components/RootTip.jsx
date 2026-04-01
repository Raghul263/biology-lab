import React, { useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useStore, { STEPS } from '../lib/store';

const RootTip = ({ position: initialPosition = [0.85, 0.95, -0.1] }) => {
  const { currentStep, heldTool, setHeldTool, rootOnSlide, rootsInVial, stainAdded } = useStore();
  const isHeld = heldTool === 'root_tip';
  const [currentPos, setCurrentPos] = useState(initialPosition);
  const { raycaster } = useThree();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.93);

  React.useEffect(() => {
    const { setupPositions } = useStore.getState();
    const slidePos = setupPositions['slide'] || [0.2, 0.93, 0.5];
    const vialPos = setupPositions['vial'] || [-0.8, 0.93, 0.4];
    const wgPos = setupPositions['watchGlass'] || [1.0, 0.93, -0.1];

    if (rootOnSlide) {
      setCurrentPos([slidePos[0], slidePos[1] + 0.005, slidePos[2]]);
    } else if (rootsInVial) {
      setCurrentPos([vialPos[0], vialPos[1] + 0.02, vialPos[2]]);
    } else {
      setCurrentPos([wgPos[0], wgPos[1] + 0.02, wgPos[2]]);
    }
  }, [currentStep, rootOnSlide, rootsInVial]);

  const meshRef = React.useRef();
  useFrame(() => {
    if (isHeld && meshRef.current) {
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);
      if (intersection) {
        meshRef.current.position.set(intersection.x, 0.96, intersection.z);
      }
    }
  });

  return (
    <group position={currentPos}>
      <mesh ref={meshRef} castShadow>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshBasicMaterial transparent opacity={0} />
        <group scale={[1.5, 1.5, 1.5]}>
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
