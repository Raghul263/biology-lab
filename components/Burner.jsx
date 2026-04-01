import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import useStore, { STEPS } from '../lib/store';

const Burner = ({ position = [0.7, 0.93, 0] }) => {
  const { currentStep, heated, setStates, setStep, stainAdded, narrate, showWrongAction } = useStore();
  const flameRef = useRef();
  const [flameOn, setFlameOn] = useState(false);

  const isTarget = currentStep === STEPS.SLIDE_PREP && !heated && stainAdded;

  const handleInteraction = (e) => {
    e.stopPropagation();
    if (!flameOn) {
      showWrongAction('Turn on the burner first!');
      return;
    }
    
    if (isTarget) {
      setStates({ heated: true });
      narrate('Slide heated gently. Warning: Do not dry the stain! Now blot with filter paper.');
    } else if (currentStep === STEPS.SLIDE_PREP && heated) {
      showWrongAction('Already heated. Proceed to blotting.');
    }
  };

  const toggleFlame = (e) => {
    e.stopPropagation();
    setFlameOn(!flameOn);
    narrate(flameOn ? 'Burner turned off.' : 'Burner ignited.');
  };

  useFrame((state) => {
    if (flameRef.current && flameOn) {
      const t = state.clock.elapsedTime;
      // Organic swaying
      flameRef.current.rotation.z = Math.sin(t * 10) * 0.05 + Math.sin(t * 2.5) * 0.02;
      flameRef.current.rotation.x = Math.cos(t * 8) * 0.03;
      
      // Flickering scale
      const s = 1 + Math.sin(t * 25) * 0.1;
      const pulse = 1 + Math.sin(t * 50) * 0.05;
      flameRef.current.scale.set(s, pulse, s);

      // Continuous rotation
      flameRef.current.rotation.y += 0.05;

      // Jitter children for extra realism
      flameRef.current.children.forEach((child, i) => {
        if (child.type === 'Mesh') {
          child.position.x = Math.sin(t * (20 + i)) * 0.002;
          child.position.z = Math.cos(t * (22 + i)) * 0.002;
        }
      });
    }
  });

  const redMat = { color: "#d32f2f", roughness: 0.3, metalness: 0.7 };
  const chromeMat = { color: "#eceff1", roughness: 0.15, metalness: 0.9 };
  const darkMat = { color: "#212121", roughness: 0.8, metalness: 0.2 };

  return (
    <group position={position} onClick={handleInteraction}
      onPointerOver={() => { if (isTarget && flameOn) document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      {isTarget && flameOn && (
        <group position={[0, 0.25, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.08, 0.005, 16, 32]} />
            <meshBasicMaterial color="#00e5ff" transparent opacity={0.6} />
          </mesh>
        </group>
      )}

      {/* ─── BASE: RED CONICAL ─── */}
      <mesh castShadow receiveShadow position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.02, 0.08, 0.04, 32]} />
        <meshStandardMaterial {...redMat} />
      </mesh>
      {/* Red Connection Housing */}
      <mesh castShadow position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 0.04, 32]} />
        <meshStandardMaterial {...redMat} />
      </mesh>

      {/* ─── TOGGLE SWITCH (Black knob on FRONT) ─── */}
      <group position={[0, 0.06, 0.022]} onClick={toggleFlame}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.015, 16]} />
          <meshStandardMaterial color={flameOn ? "#4caf50" : "#212121"} emissive={flameOn ? "#4caf50" : "#000000"} emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.01]}>
          <sphereGeometry args={[0.004, 8, 8]} />
          <meshBasicMaterial color={flameOn ? "#4caf50" : "#f44336"} />
        </mesh>
      </group>

      {/* ─── GAS INLET: CHROME RIBBED (BACK SIDE) ─── */}
      <group position={[0, 0.05, -0.02]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.008, 0.01, 0.07, 16]} />
          <meshStandardMaterial {...chromeMat} />
        </mesh>
        {/* Connection Ribs */}
        {[0.01, 0.02, 0.03].map((z, i) => (
          <mesh key={i} position={[0, z, 0]}>
            <torusGeometry args={[0.01, 0.002, 8, 16]} />
            <meshStandardMaterial {...chromeMat} />
          </mesh>
        ))}
      </group>

      {/* ─── GAS HOSE (Black Rubber Tube) ─── */}
      {/* Starting from the back inlet and curving around to the table hole */}
      <mesh castShadow>
        <tubeGeometry args={[
          new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0.05, -0.055),
            new THREE.Vector3(0.05, 0.03, -0.1),
            new THREE.Vector3(0.2, -0.02, 0.1),
            new THREE.Vector3(0.3, -0.15, 0.0) // Goes through the table grommet
          ]),
          24, 0.006, 8, false
        ]} />
        <meshStandardMaterial color="#1a1a1a" roughness={1.0} metalness={0} />
      </mesh>

      {/* ─── CHIMNEY: CHROME ─── */}
      <group position={[0, 0.08, 0]}>
        {/* Air Hole Collar */}
        <mesh position={[0, 0.01, 0]}>
          <cylinderGeometry args={[0.018, 0.02, 0.02, 16]} />
          <meshStandardMaterial {...chromeMat} />
        </mesh>
        {/* Dark Air Hole Detailing */}
        {[0, Math.PI/2, Math.PI, Math.PI*1.5].map((rot, i) => (
          <mesh key={i} position={[Math.cos(rot)*0.018, 0.01, Math.sin(rot)*0.018]}>
            <circleGeometry args={[0.004, 8]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
        ))}
        {/* Primary Tube */}
        <mesh castShadow position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.18, 24]} />
          <meshStandardMaterial {...chromeMat} />
        </mesh>
        {/* Flared Mouth - Hollowed out */}
        <mesh position={[0, 0.19, 0]}>
          <cylinderGeometry args={[0.018, 0.015, 0.01, 16, 1, true]} />
          <meshStandardMaterial {...chromeMat} side={THREE.DoubleSide} />
        </mesh>
        {/* Hollow interior (Dark hole) */}
        <mesh position={[0, 0.186, 0]}>
          <circleGeometry args={[0.014, 16]} rotation={[-Math.PI / 2, 0, 0]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
      </group>

      {/* ─── FLAME (Real Flame with Shader-like Animation) ─── */}
      {flameOn && (
        <group position={[0, 0.27, 0]}>
          <group ref={flameRef}>
            {/* Outer Flame - Vibrant Orange/Yellow (Reduced Height) */}
            <mesh position={[0, 0.05, 0]}>
              <cylinderGeometry args={[0.002, 0.012, 0.10, 12, 8, true]} />
              <meshStandardMaterial color="#ff9800" transparent opacity={0.6} side={THREE.DoubleSide} 
                emissive="#ff5722" emissiveIntensity={2.5} />
            </mesh>
            
            {/* Main Flame Core - Bright Yellow (Reduced Height) */}
            <mesh position={[0, 0.04, 0]}>
              <cylinderGeometry args={[0.001, 0.008, 0.08, 12, 8, true]} />
              <meshStandardMaterial color="#ffeb3b" transparent opacity={0.8} side={THREE.DoubleSide}
                emissive="#ffeb3b" emissiveIntensity={4} />
            </mesh>
            
            {/* Hottest Base - Enhanced Blue/White (Slightly larger) */}
            <mesh position={[0, 0.015, 0]}>
              <cylinderGeometry args={[0.006, 0.012, 0.03, 12, 1, true]} />
              <meshStandardMaterial color="#00e5ff" transparent opacity={0.6} side={THREE.DoubleSide}
                emissive="#00e5ff" emissiveIntensity={1.5} />
            </mesh>
          </group>

          {/* Dynamic Fire Light */}
          <pointLight color="#ff9800" intensity={4} distance={1.2} decay={2} castShadow />
          <pointLight color="#00e5ff" intensity={0.5} distance={0.3} position={[0, -0.01, 0]} />
        </group>
      )}
    </group>
  );
};

export default Burner;


