import React, { useRef } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useStore, { STEPS } from '../lib/store';

const FilterPaper = ({ position: initialPosition = [1.2, 0.93, -0.1] }) => {
  const { currentStep, heated, rootOnSlide, setHeldTool, heldTool, showWrongAction } = useStore();
  const isHeld = heldTool === 'filterPaper';
  const isTarget = currentStep === STEPS.SLIDE_PREP && heated && rootOnSlide && !useStore.getState().stainRemoved;

  const heldRef = useRef();
  const { raycaster } = useThree();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.93);

  useFrame(() => {
    if (isHeld && heldRef.current) {
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);
      if (intersection) {
        heldRef.current.position.set(intersection.x, 0.935, intersection.z);
      }
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (currentStep === STEPS.SLIDE_PREP) {
      if (!isHeld) setHeldTool('filterPaper');
      else setHeldTool(null);
    } else if (currentStep !== STEPS.ARRANGE) {
      showWrongAction('Filter paper is not needed at this step.');
    }
  };

  const trayColor = "#01579b"; // Deeper Blue for the tray

  return (
    <group>
      {/* ─── THE STATIC TRAY ─── */}
      <group position={initialPosition} onClick={handleClick}
        onPointerOver={() => { if (currentStep === STEPS.SLIDE_PREP) document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        {isTarget && !isHeld && (
          <mesh position={[0, 0.04, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.11, 0.005, 16, 32]} />
            <meshBasicMaterial color="#00e5ff" transparent opacity={0.6} />
          </mesh>
        )}

        {/* Square Blue Base */}
        <mesh castShadow receiveShadow position={[0, 0.005, 0]}>
          <boxGeometry args={[0.2, 0.01, 0.2]} />
          <meshStandardMaterial color={trayColor} roughness={0.4} />
        </mesh>

        {/* Circular Wall */}
        <mesh castShadow position={[0, 0.02, 0]}>
          <cylinderGeometry args={[0.095, 0.095, 0.03, 32, 1, true]} />
          <meshStandardMaterial color={trayColor} roughness={0.3} transparent opacity={0.7} side={THREE.DoubleSide} />
        </mesh>

        {/* Tray Floor */}
        <mesh position={[0, 0.01, 0]}>
           <cylinderGeometry args={[0.09, 0.09, 0.002, 32]} />
           <meshStandardMaterial color={trayColor} roughness={0.3} />
        </mesh>

        {/* Paper Stack inside the tray */}
        <group position={[0, 0.012, 0]}>
          {[...Array(6)].map((_, i) => (
            <mesh key={i} position={[0, i * 0.001, 0]} receiveShadow rotation={[0, Math.random() * Math.PI, 0]}>
              <cylinderGeometry args={[0.088, 0.088, 0.001, 32]} />
              <meshStandardMaterial color="#ffffff" roughness={1.0} />
            </mesh>
          ))}
        </group>
      </group>

      {/* ─── THE HELD SINGLE SHEET ─── */}
      {isHeld && (
        <group ref={heldRef}>
          <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
             <cylinderGeometry args={[0.088, 0.088, 0.001, 32]} />
             <meshStandardMaterial color="#ffffff" roughness={1} />
          </mesh>
          {/* Subtle effect shadow */}
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


