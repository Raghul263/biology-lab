import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import useStore from '../lib/store';

const Burner = ({ position: initialPosition = [0.7, 0.93, 0] }) => {
  const { heldTool, setStates, setHeldTool, burnerOn } = useStore();
  const flameRef = useRef();

  const isHeld = heldTool === 'burner';
  const groupRef = useRef();
  const { raycaster } = useThree();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.93);

  useFrame((state) => {
    if (isHeld && groupRef.current) {
      const { raycaster: r } = state;
      const intersection = new THREE.Vector3();
      r.ray.intersectPlane(plane, intersection);
      if (intersection) {
        intersection.x = Math.max(-2.0, Math.min(2.0, intersection.x));
        intersection.z = Math.max(-0.8, Math.min(0.8, intersection.z));
        groupRef.current.position.set(intersection.x, 0.93, intersection.z);
      }
    } else if (!isHeld && groupRef.current && initialPosition) {
      const { setupPositions } = useStore.getState();
      const pos = setupPositions['burner'] || initialPosition;
      groupRef.current.position.set(...pos);
    }

    if (flameRef.current && burnerOn) {
      const t = state.clock.elapsedTime;
      // Precise flicker
      flameRef.current.scale.set(
        1 + Math.sin(t * 12) * 0.05,
        1 + Math.sin(t * 15) * 0.1,
        1 + Math.sin(t * 12) * 0.05
      );
      
      // 🔥 HEATING LOGIC (Watch Glass & Slide)
      const store = useStore.getState();
      if (groupRef.current) {
        // Heating Watch Glass
        const wgPos = store.setupPositions['watchGlass'] || [1.0, 0.93, -0.1];
        const burnerPos = groupRef.current.position;
        const distToWG = Math.hypot(wgPos[0] - burnerPos.x, wgPos[2] - burnerPos.z);
        if (distToWG < 0.25) {
          const newTime = (store.watchGlassHeatedTime || 0) + 1;
          const updates = { watchGlassHeatedTime: newTime };
          if (store.watchGlassFluid === 'HCL' && newTime > 150) {
            updates.rootProcessingState = 'MACERATED';
          } else if (store.watchGlassFluid === 'STAIN' && newTime > 300) {
            updates.rootProcessingState = 'STAINED';
          }
          setStates(updates);
        }

        // Heating Slide (while held over flame)
        if (heldTool === 'slide') {
          // Slide heating logic handled in handleClick or here? 
          // Let's do it in useFrame for continuous Heating
        }
      }
    }
  });

  const handleClick = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (isHeld) {
      const pos = groupRef.current.position;
      useStore.getState().setSetupPosition('burner', [pos.x, 0.93, pos.z]);
      setHeldTool(null);
    } else if (!heldTool) {
      setHeldTool('burner');
    }
  };

  const toggleFlame = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    setStates({ burnerOn: !burnerOn });
  };

  const redMat = { color: "#d32f2f", roughness: 0.3, metalness: 0.7 };
  const chromeMat = { color: "#eceff1", roughness: 0.15, metalness: 0.9 };
  const showHighlight = isHeld || !heldTool || heldTool === 'slide';

  return (
    <group ref={groupRef} position={initialPosition} onPointerDown={handleClick}
      onPointerOver={() => { if (showHighlight) document.body.style.cursor = isHeld ? 'grabbing' : 'pointer'; }}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      {/* 🛑 Base & Tank */}
      <mesh castShadow receiveShadow position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.02, 0.08, 0.04, 32]} />
        <meshStandardMaterial {...redMat} />
      </mesh>
      <mesh castShadow position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 0.04, 32]} />
        <meshStandardMaterial {...redMat} />
      </mesh>

      {/* 🔘 Control Knob - Fixed to prevent pick-up conflict */}
      <group position={[0, 0.06, 0.022]} onPointerDown={toggleFlame}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.015, 16]} />
          <meshStandardMaterial color={burnerOn ? "#4caf50" : "#212121"} emissive={burnerOn ? "#4caf50" : "#000000"} emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.01]}>
          <sphereGeometry args={[0.006, 16, 16]} />
          <meshBasicMaterial color={burnerOn ? "#4caf50" : "#f44336"} />
        </mesh>
      </group>

      {/* 🏷️ Air Intake */}
      <group position={[0, 0.05, -0.02]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.008, 0.01, 0.07, 16]} />
          <meshStandardMaterial {...chromeMat} />
        </mesh>
      </group>

      {/* 🌫️ Gas Tube */}
      <mesh castShadow>
        <tubeGeometry args={[
          new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0.05, -0.055),
            new THREE.Vector3(0.05, 0.03, -0.1),
            new THREE.Vector3(0.2, -0.02, 0.1),
            new THREE.Vector3(0.3, -0.15, 0.0)
          ]),
          24, 0.006, 8, false
        ]} />
        <meshStandardMaterial color="#1a1a1a" roughness={1.0} metalness={0} />
      </mesh>

      {/* 🚀 Burner Head */}
      <group position={[0, 0.08, 0]}>
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.18, 24]} />
          <meshStandardMaterial {...chromeMat} />
        </mesh>
        <mesh position={[0, 0.19, 0]}>
          <cylinderGeometry args={[0.018, 0.015, 0.01, 16, 1, true]} />
          <meshStandardMaterial {...chromeMat} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.186, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.014, 16]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
      </group>

      {/* 🔥 The Flame */}
      {burnerOn && (
        <group position={[0, 0.27, 0]}>
          <group ref={flameRef}>
            <mesh position={[0, 0.005, 0]}>
              <cylinderGeometry args={[0.002, 0.012, 0.02, 12, 2, true]} />
              <meshStandardMaterial color="#ff9800" transparent opacity={0.6} side={THREE.DoubleSide} 
                emissive="#ff5722" emissiveIntensity={2.5} />
            </mesh>
            <mesh position={[0, 0.002, 0]}>
              <cylinderGeometry args={[0.006, 0.012, 0.01, 12, 1, true]} />
              <meshStandardMaterial color="#00e5ff" transparent opacity={0.6} side={THREE.DoubleSide}
                emissive="#00e5ff" emissiveIntensity={1.5} />
            </mesh>
          </group>
          <pointLight color="#ff9800" intensity={4} distance={1.2} decay={2} castShadow />
          <pointLight color="#00e5ff" intensity={0.5} distance={0.3} position={[0, -0.01, 0]} />
        </group>
      )}
    </group>
  );
};

export default Burner;
