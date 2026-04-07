import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import useStore from '../lib/store';
import BurnerStand from './BurnerStand';

const Burner = ({ position: initialPosition = [0.7, 0.93, 0] }) => {
  const { heldTool, setStates, setHeldTool, burnerOn } = useStore();
  const flameRef = useRef();

  const isHeld = heldTool === 'burner';
  const groupRef = useRef();
  const { raycaster } = useThree();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.93);

  useFrame((state) => {
    if (isHeld && groupRef.current) {
      const intersection = new THREE.Vector3();
      state.raycaster.ray.intersectPlane(plane, intersection);

      const targetX = intersection ? intersection.x : state.mouse.x * (state.viewport.width / 2);
      const targetZ = intersection ? intersection.z : -state.mouse.y * (state.viewport.height / 2);

      groupRef.current.position.set(
        Math.max(-2.2, Math.min(2.2, targetX)),
        0.93,
        Math.max(-0.9, Math.min(0.9, targetZ))
      );
    } else if (!isHeld && groupRef.current && initialPosition) {
      const { setupPositions } = useStore.getState();
      const pos = setupPositions['burner'] || initialPosition;
      groupRef.current.position.set(...pos);
    }

    if (flameRef.current && burnerOn) {
      const t = state.clock.elapsedTime;
      // 🔥 ORGANIC FLAME ANIMATION (Multiple layers flickering at different speeds)
      flameRef.current.children.forEach((child, i) => {
        const offset = i * 0.5;
        child.scale.y = 1 + Math.sin(t * (10 + i * 2) + offset) * 0.15;
        child.scale.x = 1 + Math.cos(t * (8 + i) + offset) * 0.05;
        child.rotation.z = Math.sin(t * (5 + i)) * 0.05;
      });

      // Overall jitter
      flameRef.current.position.x = Math.sin(t * 20) * 0.001;
      flameRef.current.position.z = Math.cos(t * 18) * 0.001;

      // Pulsing lights
      if (state.get().scene.getObjectByName('flamePointLight')) {
        state.get().scene.getObjectByName('flamePointLight').intensity = 3 + Math.sin(t * 10) * 1.5;
      }
      if (state.get().scene.getObjectByName('flameInnerLight')) {
        state.get().scene.getObjectByName('flameInnerLight').intensity = 0.4 + Math.sin(t * 20) * 0.2;
      }

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
    } else if (!heldTool && !useStore.getState().isHeatingSlide) {
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
      {heldTool === 'slide' && flameOn && (
        <group position={[0, 0.25, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.08, 0.005, 16, 32]} />
            <meshBasicMaterial color="#00e5ff" transparent opacity={0.6} />
          </mesh>
        </group>
      )}

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

        {/* Brass Cap (Upper Burner Cylinder) */}
        <mesh position={[0, 0.185, 0]}>
          <cylinderGeometry args={[0.022, 0.018, 0.03, 16]} />
          <meshStandardMaterial color="#d4af37" roughness={0.3} metalness={0.7} />
        </mesh>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.02, 0.022, 0.01, 16]} />
          <meshStandardMaterial color="#c5a028" roughness={0.4} metalness={0.6} />
        </mesh>
        <mesh position={[0, 0.186, 0]}>
          <circleGeometry args={[0.014, 16]} rotation={[-Math.PI / 2, 0, 0]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
      </group>

      {/* 🔥 The Flame */}
      {burnerOn && (
        <group position={[0, 0.27, 0]}>
          <group ref={flameRef}>
            <mesh position={[0, 0.05, 0]}>
              <cylinderGeometry args={[0.002, 0.012, 0.10, 12, 8, true]} />
              <meshStandardMaterial color="#ff9800" transparent opacity={0.6} side={THREE.DoubleSide}
                emissive="#ff5722" emissiveIntensity={2.5} />
            </mesh>
            <mesh position={[0, 0.04, 0]}>
              <cylinderGeometry args={[0.001, 0.008, 0.08, 12, 8, true]} />
              <meshStandardMaterial color="#ffeb3b" transparent opacity={0.8} side={THREE.DoubleSide}
                emissive="#ffeb3b" emissiveIntensity={4} />
            </mesh>
            <mesh position={[0, 0.015, 0]}>
              <cylinderGeometry args={[0.006, 0.012, 0.03, 12, 1, true]} />
              <meshStandardMaterial color="#00e5ff" transparent opacity={0.6} side={THREE.DoubleSide}
                emissive="#00e5ff" emissiveIntensity={1.5} />
            </mesh>
          </group>

          <pointLight name="flamePointLight" color="#ff9800" intensity={4} distance={1.2} decay={2} castShadow />
          <pointLight name="flameInnerLight" color="#00e5ff" intensity={0.6} distance={0.3} position={[0, -0.01, 0]} />
        </group>
      )}

      <BurnerStand position={[0, 0, 0]} />
    </group>
  );
};

export default Burner;
