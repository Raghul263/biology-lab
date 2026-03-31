import React from 'react';
import * as THREE from 'three';
import useStore, { STEPS } from '../lib/store';

const WatchGlass = ({ position = [0.35, 0.93, -0.2] }) => {
  const { currentStep, heldTool, setHeldTool, setStates, rootTipsInWatchGlass, acidAdded, stainAdded } = useStore();

  const isTarget = currentStep === STEPS.TREATMENT && !(acidAdded && stainAdded);
  const showHighlight = isTarget || (currentStep === STEPS.CUT_INITIAL && !rootTipsInWatchGlass);

  const handleInteraction = (e) => {
    e.stopPropagation();
    if (currentStep === STEPS.TREATMENT && heldTool === 'dropper') {
      if (!acidAdded) {
        setStates({ acidAdded: true });
      } else if (!stainAdded) {
        setStates({ stainAdded: true });
        setHeldTool(null);
      }
    } else if (currentStep === STEPS.TRANSFER_Vial && heldTool === 'forceps' && rootTipsInWatchGlass) {
      setStates({ rootsInForceps: true, rootTipsInWatchGlass: false });
    }
  };

  const liquidColor = stainAdded ? '#c62828' : '#b3d9f5';

  return (
    <group
      position={position}
      onClick={handleInteraction}
      onPointerOver={() => {
        if (heldTool === 'dropper' && isTarget) document.body.style.cursor = 'copy';
      }}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      {/* Pulsing highlight ring */}
      {showHighlight && (
        <group position={[0, 0.01, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.19, 0.006, 16, 64]} />
            <meshBasicMaterial color="#00e5ff" transparent opacity={0.55} />
          </mesh>
          {/* Outer soft glow ring */}
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.22, 0.012, 16, 64]} />
            <meshBasicMaterial color="#00e5ff" transparent opacity={0.15} />
          </mesh>
        </group>
      )}

      {/* === SHADOW / BASE CONTACT SHADOW === */}
      <mesh position={[0, -0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[0.155, 64]} />
        <meshBasicMaterial color="#000000" transparent opacity={0.12} />
      </mesh>

      {/* === MAIN BOWL - lower concave hemisphere === */}
      {/* Outer shell of the bowl */}
      <mesh position={[0, 0, 0]} rotation={[Math.PI, 0, 0]} castShadow receiveShadow>
        <sphereGeometry args={[0.155, 128, 64, 0, Math.PI * 2, 0, Math.PI * 0.38]} />
        <meshPhysicalMaterial
          side={THREE.DoubleSide}
          transparent
          opacity={0.18}
          roughness={0.0}
          metalness={0.0}
          transmission={0.96}
          thickness={0.45}
          color="#d0eaf8"
          ior={1.52}
          clearcoat={1.0}
          clearcoatRoughness={0.0}
          specularIntensity={1.8}
          reflectivity={1.0}
          envMapIntensity={3.0}
          attenuationDistance={0.8}
          attenuationColor="#cfe8f5"
        />
      </mesh>

      {/* Inner shell (back face for depth/refraction) */}
      <mesh position={[0, -0.003, 0]} rotation={[Math.PI, 0, 0]}>
        <sphereGeometry args={[0.148, 128, 64, 0, Math.PI * 2, 0, Math.PI * 0.36]} />
        <meshPhysicalMaterial
          side={THREE.BackSide}
          transparent
          opacity={0.12}
          roughness={0.0}
          transmission={0.98}
          thickness={0.25}
          color="#e8f4fb"
          ior={1.52}
          clearcoat={1.0}
          clearcoatRoughness={0.0}
          specularIntensity={1.2}
          reflectivity={0.9}
          envMapIntensity={2.5}
        />
      </mesh>

      {/* === RIM - thick rounded glass rim === */}
      {/* Main rim torus */}
      <mesh position={[0, -0.001, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.1385, 0.0155, 32, 128]} />
        <meshPhysicalMaterial
          transparent
          opacity={0.55}
          roughness={0.0}
          metalness={0.0}
          transmission={0.85}
          thickness={0.06}
          color="#ffffff"
          ior={1.52}
          clearcoat={1.0}
          clearcoatRoughness={0.0}
          specularIntensity={2.5}
          reflectivity={1.0}
          envMapIntensity={3.5}
          attenuationColor="#e0f2f1"
        />
      </mesh>

      {/* Rim highlight (bright specular ring) */}
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.1385, 0.003, 16, 128]} />
        <meshStandardMaterial
          color="#ffffff"
          emissive="#e8f4fb"
          emissiveIntensity={0.9}
          transparent
          opacity={0.85}
        />
      </mesh>

      {/* Inner rim bevel (creates the thick-glass edge look) */}
      <mesh position={[0, -0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.128, 0.006, 16, 128]} />
        <meshPhysicalMaterial
          transparent
          opacity={0.35}
          roughness={0.0}
          transmission={0.9}
          thickness={0.03}
          color="#cce8f6"
          ior={1.52}
          clearcoat={1.0}
          clearcoatRoughness={0.0}
          specularIntensity={1.5}
          envMapIntensity={2.0}
        />
      </mesh>

      {/* === CAUSTIC LIGHT RING (refracted light on surface below) === */}
      <mesh position={[0, -0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.11, 0.025, 8, 64]} />
        <meshBasicMaterial
          color="#d0efff"
          transparent
          opacity={0.12}
        />
      </mesh>

      {/* === BASE DISC (flat glass bottom of bowl) === */}
      <mesh position={[0, -0.009, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.125, 64]} />
        <meshPhysicalMaterial
          transparent
          opacity={0.08}
          roughness={0.0}
          transmission={0.98}
          thickness={0.02}
          color="#e8f4fb"
          ior={1.52}
          clearcoat={1.0}
          clearcoatRoughness={0.0}
          envMapIntensity={1.5}
        />
      </mesh>

      {/* === LIQUID === */}
      {(acidAdded || stainAdded) && (
        <group position={[0, -0.003, 0]}>
          {/* Main liquid body */}
          <mesh receiveShadow>
            <cylinderGeometry args={[0.118, 0.118, 0.014, 64]} />
            <meshPhysicalMaterial
              color={liquidColor}
              transmission={stainAdded ? 0.45 : 0.72}
              transparent
              opacity={stainAdded ? 0.88 : 0.78}
              roughness={0.0}
              metalness={0.0}
              ior={1.34}
              thickness={0.1}
              clearcoat={1.0}
              clearcoatRoughness={0.0}
              envMapIntensity={1.5}
              attenuationColor={liquidColor}
              attenuationDistance={0.3}
            />
          </mesh>
          {/* Liquid surface meniscus ring */}
          <mesh position={[0, 0.007, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.113, 0.006, 16, 64]} />
            <meshPhysicalMaterial
              color={liquidColor}
              transparent
              opacity={0.45}
              roughness={0.0}
              transmission={0.6}
              ior={1.34}
              clearcoat={1.0}
              clearcoatRoughness={0.0}
            />
          </mesh>
          {/* Surface highlight */}
          <mesh position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.07, 64]} />
            <meshBasicMaterial
              color="#ffffff"
              transparent
              opacity={0.08}
            />
          </mesh>
        </group>
      )}

      {/* === ROOT TIPS === */}
      {rootTipsInWatchGlass && (
        <group position={[0, -0.002, 0]}>
          {[...Array(6)].map((_, i) => {
            const angle = (i / 6) * Math.PI * 2 + i * 0.3;
            const r = 0.04 + (i % 3) * 0.025;
            return (
              <mesh
                key={i}
                position={[
                  Math.cos(angle) * r,
                  0,
                  Math.sin(angle) * r,
                ]}
                rotation={[Math.PI / 2 + (Math.random() - 0.5) * 0.4, i * 0.8, 0]}
              >
                <cylinderGeometry args={[0.0018, 0.001, 0.022, 8]} />
                <meshStandardMaterial
                  color={stainAdded ? '#e57373' : '#f0e6c8'}
                  roughness={0.6}
                  metalness={0.0}
                />
              </mesh>
            );
          })}
        </group>
      )}

      {/* === Invisible hit area === */}
      <mesh position={[0, 0.0, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.1, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
};

export default WatchGlass;
