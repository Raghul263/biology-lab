import React, { useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import useStore from '../lib/store';
import * as THREE from 'three';

const Slide = ({ position: initialPosition = [0, 0.93, 0.2] }) => {
  const {
    rootOnSlide, slideFluids, slideHeatedTime, setStates, heldTool, setHeldTool,
    coverSlipPlaced, squashed, dropperContents, slideOnMicroscope
  } = useStore();

  const isHeld = heldTool === 'slide';
  const groupRef = useRef();
  const meshRef = useRef();
  const [unlockTime, setUnlockTime] = useState(0); // 🧠 Cooldown to prevent instant re-snap
  const { raycaster, clock } = useThree();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.93);

  useFrame((state, delta) => {
    if (isAttached) return; // Skip all independent movement logic if parented

    if (isHeld && groupRef.current && !slideOnMicroscope) {
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);
      if (intersection) {
        const cx = Math.max(-2.0, Math.min(2.0, intersection.x));
        const cz = Math.max(-0.8, Math.min(0.8, intersection.z));

        const microPos = useStore.getState().setupPositions['microscope'] || [0, 1.0, -0.7];
        const targetX = microPos[0];
        const targetZ = microPos[2] + 0.05;
        const dist = Math.sqrt(Math.pow(cx - targetX, 2) + Math.pow(cz - targetZ, 2));

        const isNear = dist < 0.18;
        const currentNear = useStore.getState().nearMicroscopeStage;
        if (isNear !== currentNear) {
          setStates({ nearMicroscopeStage: isNear });
        }

        if (dist < 0.2) {
          // Magnetic pull - stronger as it gets closer
          const strength = Math.max(0, 1 - dist / 0.2) * 0.15;
          groupRef.current.position.set(
            THREE.MathUtils.lerp(cx, targetX, strength),
            0.93,
            THREE.MathUtils.lerp(cz, targetZ, strength)
          );
        } else {
          groupRef.current.position.set(cx, 0.93, cz);
        }
      }
    } else if (settling && groupRef.current && targetPosRef.current) {
      // Settle animation: Interpolate position and rotation for a natural "snap"
      groupRef.current.position.lerp(new THREE.Vector3(...targetPosRef.current), 10 * delta);

      // Flatten rotation smoothly
      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, 0, 10 * delta);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, 0, 10 * delta);

      if (groupRef.current.position.distanceTo(new THREE.Vector3(...targetPosRef.current)) < 0.001) {
        groupRef.current.position.set(...targetPosRef.current);
        groupRef.current.rotation.set(0, 0, 0);
        setSettling(false);
        setStates({ slideOnMicroscope: true });
        useStore.getState().setSetupPosition('slide', targetPosRef.current);

        // 🔍 AUTOMATIC VIEW: Open microscope UI once slide is secured
        useStore.getState().toggleMicroscope(true);
      }
    } else if (!isHeld && !settling && groupRef.current && initialPosition) {
      groupRef.current.position.set(...initialPosition);
      if (slideOnMicroscope) {
        groupRef.current.rotation.set(0, 0, 0);
      }
    }

    if (rootFalling) {
      rootY.current -= delta * 0.8;
      if (rootY.current <= 0) {
        rootY.current = 0;
        setRootFalling(false);
      }
    }
  });

  const handleInteraction = (e) => {
    if (heldTool !== 'dropper') {
      if (e && e.stopPropagation) e.stopPropagation();
    }

    const store = useStore.getState();

    // 🔬 DETACH LOGIC
    if (slideOnMicroscope || slideOnBurner) {
      setStates({ slideOnMicroscope: false, slideOnBurner: false });
      setHeldTool('slide');
      setUnlockTime(2.0); // Cooldown
      return;
    }

    if (isHeld) {
      // Just release - the useEffect above will handle the snapping if valid
      setHeldTool(null);
      return;
    }

    const state = useStore.getState();
    // ... pick up logic continues ...


    if (heldTool === 'forceps') {
      const { rootOnSlide, holdingRoot, setStates } = useStore.getState();
      if (holdingRoot && !rootOnSlide) {
        setStates({ rootOnSlide: true, holdingRoot: false });
      } else if (!holdingRoot && rootOnSlide) {
        setStates({ rootOnSlide: false, holdingRoot: true });
      }
    } else if (heldTool === 'filterPaper') {
      if (hclApplied || stainApplied) {
        setStates({ hclApplied: false, stainApplied: false });
      }
      setHeldTool(null);
    } else if (heldTool === 'needle' && coverSlipPlaced && !squashed) {
      setStates({ squashed: true });
      setHeldTool(null);
    } else if (isHeatingSlide) {
      // Pick up from burner
      setStates({ isHeatingSlide: false });
      setHeldTool('slide');
    } else if (!heldTool && !squashed) {
      setHeldTool('slide');
      setUnlockTime(2.0);
    }
  };

  const pos = groupRef.current?.position;
  const burnerPos = useStore.getState().setupPositions['burner'] || [0.7, 0.93, 0];
  const isNearFlame = pos && burnerOn && Math.abs(pos.x - burnerPos[0]) < 0.15 && Math.abs(pos.z - burnerPos[2]) < 0.15 && !slideHeated;
  const isActiveHeating = isHeld && isNearFlame;

  return (
    <group ref={groupRef} position={initialPosition}
      onPointerDown={handleInteraction}
      onPointerOver={() => {
        if (isHeld) document.body.style.cursor = 'grabbing';
        else if (squashed) document.body.style.cursor = 'grab';
        else document.body.style.cursor = 'pointer';
        setStates({ hoveredComponent: 'slide' });
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
        setStates({ hoveredComponent: null });
      }}
    >
      {/* 🟦 THE SLIDE */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.4, 0.005, 0.15]} />
        <meshPhysicalMaterial color="#ffffff" transparent transmission={1.0}
          thickness={0.05} roughness={0.02} ior={1.5} clearcoat={1} />
      </mesh>

      {/* 💧 Heat UI Label: Only during active drag heating */}
      {isActiveHeating && (
        <Html position={[0, 0.15, 0]} center pointerEvents="none">
          <div className="px-3 py-1 bg-black/60 backdrop-blur-sm text-white text-[12px] font-bold rounded-full border border-orange-400 select-none">
            5 – 10 seconds
          </div>
        </Html>
      )}

      {/* ✅ HEATED Status Badge: Appears upon completion, matching 'FIXED' style */}
      {slideHeated && (
        <Html position={[0, 0.18, 0]} center pointerEvents="none">
          <div className="flex items-center gap-2 px-3 py-1 bg-[#4caf50] text-[#ffffff] text-[14px] font-bold rounded-sm shadow-lg animate-in zoom-in duration-300 select-none border-b-2 border-green-700">
            <div className="w-4 h-4 bg-white/20 rounded flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" className="w-3 h-3">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            HEATED
          </div>
        </Html>
      )}

      {/* 💧 HCl Puddle */}
      {hclApplied && (
        <mesh position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.055, 32]} />
          <meshPhysicalMaterial color="#81d4fa" transparent opacity={0.3} transmission={0.9} roughness={0.0} ior={1.33}
            emissive={slideOnBurner && burnerOn ? "#ff3d00" : "#000000"}
            emissiveIntensity={slideOnBurner && burnerOn ? 0.5 : 0}
          />
        </mesh>
      )}

      {/* 🔴 Stain Puddle */}
      {stainApplied && (
        <mesh position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.045, 32]} />
          <meshPhysicalMaterial color="#d32f2f" transparent opacity={0.7} transmission={0.5} roughness={0.1}
            emissive={slideOnBurner && burnerOn ? "#ff3d00" : "#000000"}
            emissiveIntensity={slideOnBurner && burnerOn ? 0.8 : 0}
          />
        </mesh>
      )}

      {/* 🧬 ONION ROOT */}
      {rootOnSlide && (
        <group position={[0, 0.006, 0]}>
          <mesh
            scale={squashed ? [2.5, 0.05, 2.5] : [1, 1, 1]}
            position={[0, squashed ? -0.002 : 0, 0]}
          >
            <cylinderGeometry args={[0.005, 0.006, 0.02, 16]} />
            <meshStandardMaterial
              color={stainApplied ? "#ad1457" : "#f0e6c8"}
              transparent={squashed}
              opacity={squashed ? 0.6 : 1.0}
              emissive={slideOnBurner && burnerOn ? "#ff3d00" : "#000000"}
              emissiveIntensity={slideOnBurner && burnerOn ? 1.0 : 0}
            />
          </mesh>
        </group>
      )}

      {/* 🔲 COVER SLIP */}
      {coverSlipPlaced && (
        <mesh position={[0, squashed ? 0.005 : 0.008, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.12, 0.001, 0.12]} />
          <meshPhysicalMaterial color="#ffffff" transparent transmission={1.0} thickness={0.01} roughness={0.01} ior={1.5} />
        </mesh>
      )}

      {/* 🌫️ HEAT DISTORTION (Subtle Point Light) */}
      {slideOnBurner && burnerOn && (
        <pointLight position={[0, -0.05, 0]} color="#ffab91" intensity={1} distance={0.3} />
      )}

      {/* 🔥 TOP-SIDE HEAT ANIMATION (Only during active heating) */}
      {isActiveHeating && (
        <mesh position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.06, 16]} />
          <meshStandardMaterial
            color="#ff9800"
            transparent opacity={0.3}
            emissive="#ff3d00"
            emissiveIntensity={1.5 + Math.sin(clock.elapsedTime * 15) * 0.5}
          />
        </mesh>
      )}
    </group>
    </group >
  );
};

export default Slide;
