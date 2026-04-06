import React, { useRef } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import useStore, { STEPS } from '../lib/store';

const WatchGlass = ({ position: initialPosition = [1.0, 0.93, -0.1] }) => {
  const { currentStep, heldTool, setHeldTool, setStates, rootTipsInWatchGlass, acidAdded, stainAdded, watchGlassRootCount, rootPicked } = useStore();

  const isHeld = heldTool === 'watchGlass';
  const groupRef = useRef();
  const { raycaster } = useThree();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.93);

  // Interaction Logic (Repositioning)
  useFrame(() => {
    if (isHeld && groupRef.current) {
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);
      if (intersection) {
        intersection.x = Math.max(-2.0, Math.min(2.0, intersection.x));
        intersection.z = Math.max(-0.8, Math.min(0.8, intersection.z));
        groupRef.current.position.set(intersection.x, 0.93, intersection.z);
      }
    } else if (!isHeld && groupRef.current && initialPosition) {
      groupRef.current.position.set(...initialPosition);
    }
  });

  const isTarget = currentStep === STEPS.TREATMENT && !(acidAdded && stainAdded);
  
  // Highlight when holding dropper, scalpel, or forceps (if ready to use)
  const isReadyToCut = useStore.getState().onionPlacedOn === 'watchGlass' && !useStore.getState().isCutting && useStore.getState().onionRootsState !== 'CUT_DRY' && useStore.getState().onionRootsState !== 'CUT_FRESH';
  const showHighlight = isTarget || (currentStep === STEPS.CUT_INITIAL && !rootTipsInWatchGlass) || isHeld || (heldTool === 'scalpel' && isReadyToCut) || (heldTool === 'forceps' && !rootPicked && watchGlassRootCount > 0);

  const handleInteraction = (e) => {
    e.stopPropagation();

    // Pick up / Drop logic
    if (isHeld) {
      const pos = groupRef.current.position;
      useStore.getState().setSetupPosition('watchGlass', [pos.x, 0.93, pos.z]);
      setHeldTool(null);
      return;
    }

    // Step-based logic requested in the exact code 
    if (!heldTool) {
        setHeldTool('watchGlass');
    } else if (heldTool === 'scalpel') {
        const { onionPlacedOn, rootGrowthCompleted, onionRootsState, setStates, isCutting } = useStore.getState();
        if (onionPlacedOn === 'watchGlass' && !isCutting && onionRootsState !== 'CUT_DRY' && onionRootsState !== 'CUT_FRESH') {
            setStates({ isCutting: true, cutStartTime: Date.now() });
        }
    } else if (currentStep === STEPS.TREATMENT && heldTool === 'dropper') {
      if (!acidAdded) {
        setStates({ acidAdded: true });
      } else if (!stainAdded) {
        setStates({ stainAdded: true });
        setHeldTool(null);
      }
    } else if (heldTool === 'forceps' && watchGlassRootCount > 0 && !rootPicked) {
      setStates({ 
        rootPicked: true, 
        watchGlassRootCount: watchGlassRootCount - 1,
        rootTipsInWatchGlass: (watchGlassRootCount - 1) > 0
      });
    }
  };

  const liquidColor = stainAdded ? '#c62828' : '#b3d9f5';

  return (
    <group
      ref={groupRef}
      onPointerDown={handleInteraction}
      onPointerOver={() => {
        if (!heldTool || isHeld) document.body.style.cursor = isHeld ? 'grabbing' : 'pointer';
        setStates({ hoveredComponent: 'watchGlass' });
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
        setStates({ hoveredComponent: null });
      }}
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

      <group position={[0, 0.5, 0]}>
        {/* === SHADOW / BASE CONTACT SHADOW === */}
        <mesh position={[0, -0.499, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <circleGeometry args={[0.08, 64]} />
          <meshBasicMaterial color="#000000" transparent opacity={0.15} />
        </mesh>

        {/* === MAIN GLASS DISH (Flatter Saucer Style - Large) === */}
        <mesh rotation={[Math.PI, 0, 0]} castShadow receiveShadow>
          <sphereGeometry args={[0.5, 128, 64, 0, Math.PI * 2, 0, Math.PI * 0.08]} />
          <meshPhysicalMaterial
            side={THREE.DoubleSide}
            transparent
            opacity={0.15}
            roughness={0.0}
            transmission={1.0}
            thickness={2.0}
            color="#e1f5fe"
            ior={1.5}
            clearcoat={1.0}
            clearcoatRoughness={0.0}
            specularIntensity={3.0}
          />
        </mesh>

        {/* === BLUE GLASS EDGE (Large) === */}
        {/* Rim is at radius * cos(0.08PI) = 0.5 * 0.968 = 0.484 from the sphere center. */}
        <mesh position={[0, -0.484, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.125, 0.002, 16, 128]} />
          <meshStandardMaterial 
            color="#00e5ff" 
            emissive="#00b0ff"
            emissiveIntensity={0.7}
            transparent 
            opacity={0.8} 
          />
        </mesh>

        {/* === LIQUID (Shallow - Large) === */}
        {(acidAdded || stainAdded) && (
          <group position={[0, -0.493, 0]}>
            <mesh receiveShadow>
              <cylinderGeometry args={[0.09, 0.09, 0.005, 64]} />
              <meshPhysicalMaterial
                color={liquidColor}
                transmission={0.5}
                transparent
                opacity={stainAdded ? 0.8 : 0.6}
                roughness={0.0}
              />
            </mesh>
          </group>
        )}

        {/* === ROOT TIPS (Large area) === */}
        {watchGlassRootCount > 0 && (
          <group position={[0, -0.49, 0]}>
            {[...Array(watchGlassRootCount)].map((_, i) => {
              const angle = (i / 8) * Math.PI * 2 + i * 0.3;
              const r = 0.04 + (i % 3) * 0.035;
              return (
                <mesh
                  key={i}
                  position={[Math.cos(angle) * r, 0, Math.sin(angle) * r]}
                  rotation={[Math.PI / 2 + (Math.random() - 0.5) * 0.4, i * 0.8, 0]}
                >
                  <cylinderGeometry args={[0.0022, 0.0012, 0.025, 8]} />
                  <meshStandardMaterial
                    color={stainAdded ? '#e57373' : '#f0e6c8'}
                    roughness={0.6}
                  />
                </mesh>
              );
            })}
          </group>
        )}
      </group>

      {/* Invisible hit area (Thin disk to allow interacting with placed Onion) */}
      <mesh position={[0, -0.01, 0]}>
        <cylinderGeometry args={[0.5, 0.5, 0.05, 16]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </group>
  );
};

export default WatchGlass;