import React from 'react';
import * as THREE from 'three';
import useStore, { STEPS } from '../lib/store';

const WatchGlass = ({ position = [0.35, 0.93, -0.2] }) => {
  const { currentStep, heldTool, setStates, rootsInWatchGlass, showWrongAction } = useStore();

  const showHighlight = (currentStep === STEPS.FIXATION && !useStore.getState().rootsInForceps && rootsInWatchGlass && heldTool === 'forceps') ||
    (currentStep === STEPS.CUT_FRESH_ROOTS && heldTool === 'onion');

  const handleInteraction = (e) => {
    e.stopPropagation();
    if (currentStep === STEPS.FIXATION && heldTool === 'forceps' && rootsInWatchGlass) {
      setStates({ rootsInForceps: true, rootsInWatchGlass: false });
    } else if (heldTool === 'forceps' && currentStep !== STEPS.FIXATION) {
      showWrongAction('Follow the procedure.');
    }
  };

  const liquidColor = '#b3d9f5';

  return (
    <group position={position} onClick={handleInteraction}
      onPointerOver={() => { if (showHighlight) document.body.style.cursor = 'copy'; }}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      {showHighlight && (
        <group position={[0, 0.01, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.19, 0.006, 16, 64]} />
            <meshBasicMaterial color="#00e5ff" transparent opacity={0.55} />
          </mesh>
        </group>
      )}

      <mesh position={[0, -0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.155, 64]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.12} />
      </mesh>

      <mesh position={[0, 0, 0]} rotation={[Math.PI, 0, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.155, 128, 64, 0, Math.PI * 2, 0, Math.PI * 0.38]} />
        <meshPhysicalMaterial 
          side={THREE.DoubleSide} transparent opacity={0.25} roughness={0.0}
          transmission={0.99} thickness={2.0} color="#ffffff" ior={1.52}
          clearcoat={1.0} clearcoatRoughness={0.01} specularIntensity={4.8} 
          envMapIntensity={5.0} emissive="#ffffff" emissiveIntensity={0.02}
        />
      </mesh>

      <mesh position={[0, -0.003, 0]} rotation={[Math.PI, 0, 0]}>
        <sphereGeometry args={[0.148, 128, 64, 0, Math.PI * 2, 0, Math.PI * 0.36]} />
        <meshPhysicalMaterial 
          side={THREE.BackSide} transparent opacity={0.15}
          roughness={0.0} transmission={1.0} thickness={1.0} color="#ffffff"
          ior={1.52} clearcoat={1.0} envMapIntensity={4.0} 
        />
      </mesh>

      <mesh position={[0, -0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.1385, 0.0155, 32, 128]} />
        <meshPhysicalMaterial transparent opacity={0.55} roughness={0.0}
          transmission={0.85} thickness={0.06} color="#ffffff" ior={1.52}
          clearcoat={1.0} specularIntensity={2.5} envMapIntensity={3.5} />
      </mesh>

      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.1385, 0.003, 16, 128]} />
        <meshStandardMaterial color="#ffffff" emissive="#e8f4fb" emissiveIntensity={0.9}
          transparent opacity={0.85} />
      </mesh>

      <mesh position={[0, -0.009, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.125, 64]} />
        <meshPhysicalMaterial transparent opacity={0.08} roughness={0.0}
          transmission={0.98} thickness={0.02} color="#e8f4fb" ior={1.52}
          clearcoat={1.0} envMapIntensity={1.5} />
      </mesh>

      {rootsInWatchGlass && (
        <group position={[0, -0.002, 0]}>
          {[...Array(6)].map((_, i) => {
            const angle = (i / 6) * Math.PI * 2 + i * 0.3;
            const r = 0.04 + (i % 3) * 0.025;
            return (
              <mesh key={i}
                position={[Math.cos(angle) * r, 0, Math.sin(angle) * r]}
                rotation={[Math.PI / 2 + (Math.random() - 0.5) * 0.4, i * 0.8, 0]}
              >
                <cylinderGeometry args={[0.0018, 0.001, 0.022, 8]} />
                <meshStandardMaterial color="#f0e6c8" roughness={0.6} />
              </mesh>
            );
          })}
        </group>
      )}

      <mesh position={[0, 0.0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
};

export default WatchGlass;
