import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';

import useStore, { STEPS } from '../lib/store';

const OnionPeel = ({ rotation, phiStart, phiLength, scale = 1 }) => {
  const points = React.useMemo(() => {
    const pts = [];
    const s = 0.5 * scale;
    // Teardrop shape for onion bulb
    pts.push(new THREE.Vector2(0, -0.15 * s)); // Base
    pts.push(new THREE.Vector2(0.12 * s, -0.14 * s));
    pts.push(new THREE.Vector2(0.22 * s, -0.10 * s));
    pts.push(new THREE.Vector2(0.28 * s, 0.05 * s));
    pts.push(new THREE.Vector2(0.22 * s, 0.25 * s));
    pts.push(new THREE.Vector2(0.10 * s, 0.40 * s));
    pts.push(new THREE.Vector2(0.02 * s, 0.50 * s)); // Neck
    return pts;
  }, [scale]);

  const skinColor = "#cd853f"; // Peru / Golden Brown
  const skinRoughness = 0.85;

  return (
    <group rotation={[0, rotation, 0]} position={[0, 0, 0]}>
      <mesh castShadow receiveShadow>
        <latheGeometry args={[points, 24, phiStart, phiLength]} />
        <meshStandardMaterial 
          color={skinColor} 
          roughness={skinRoughness} 
          metalness={0.0} 
          emissive="#5d4037" 
          emissiveIntensity={0.05} 
        />
      </mesh>
      
      {/* Texture Lines (Dry Skin Veins) */}
      {[0.1, 0.2, 0.3].map((phiOffset, i) => (
        <mesh key={i} rotation={[0, phiOffset, 0]}>
          <latheGeometry args={[points, 24, 0, 0.005]} />
          <meshBasicMaterial color="#3e2723" opacity={0.3} transparent /> 
        </mesh>
      ))}

      {/* Base Root Disk (Anatomical) */}
      <mesh position={[0, -0.075 * scale, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.06 * scale, 24]} />
        <meshStandardMaterial color="#d7ccc8" roughness={1} />
      </mesh>
    </group>
  );
};

const RootTendril = ({ index }) => {
  const curve = React.useMemo(() => {
    const points = [];
    // Length varies for organic look
    const length = 0.18 + (Math.sin(index * 0.5) * 0.08); 
    
    // Positioned EXACTLY at the bulb base center
    const angle = (index / 160) * Math.PI * 2;
    const radius = Math.random() * 0.04; // Keep it tight to the base
    
    // Start point (Attached to bulb base)
    points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
    
    // Hanging down with slight vertical variations
    for (let j = 1; j <= 5; j++) {
      const p = j / 5;
      points.push(new THREE.Vector3(
        (Math.cos(angle) * radius) + (Math.sin(index + j) * 0.02 * p),
        -length * p,
        (Math.sin(angle) * radius) + (Math.cos(index + j) * 0.02 * p)
      ));
    }
    
    return new THREE.CatmullRomCurve3(points);
  }, [index]);

  return (
    <mesh castShadow>
      <tubeGeometry args={[curve, 8, 0.0012, 6, false]} />
      <meshStandardMaterial 
        color="#fdf5ed" 
        roughness={1.0} 
        transparent 
        opacity={0.85} 
      />
    </mesh>
  );
};

const SproutShoot = ({ index }) => {
  const curve = React.useMemo(() => {
    const points = [];
    const height = 0.3 + Math.random() * 0.2;
    const angle = (index / 6) * Math.PI * 2;
    const radius = 0.005 + Math.random() * 0.01;
    
    // Base at onion neck
    points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
    
    // Tapered and curved path
    for (let j = 1; j <= 4; j++) {
      const p = j / 4;
      const offset = (Math.cos(index * 2 + j) * 0.1 * p);
      points.push(new THREE.Vector3(
        (Math.cos(angle) * radius) + offset,
        height * p,
        (Math.sin(angle) * radius) + (Math.sin(index * 2 + j) * 0.1 * p)
      ));
    }
    return new THREE.CatmullRomCurve3(points);
  }, [index]);

  return (
    <mesh castShadow>
      <tubeGeometry args={[curve, 12, 0.008 * (1 - index/12), 8, false]} />
      <meshStandardMaterial color="#2e7d32" roughness={0.6} />
    </mesh>
  );
};

const Onion = ({ position = [0, 0.93, 0] }) => {
  const { currentStep, setStep, setStates, initialRootsGrown, beakerRootsGrown, heldTool, setHeldTool, onionInBeaker, onionPlacedOnTile } = useStore();
  const isHeld = heldTool === 'onion';
  const [rootScale, setRootScale] = useState(0.4);
  
  const targetPos = useRef(new THREE.Vector3(...position));
  const targetRot = useRef(new THREE.Euler(0, 0, 0));
  
  const { raycaster } = useThree();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.93);
  const meshRef = useRef();

  useFrame(() => {
    if (isHeld && meshRef.current) {
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);
      if (intersection) {
        targetPos.current.set(intersection.x, 0.96, intersection.z);
        targetRot.current.set(0, 0, 0);
      }
    }

    if (meshRef.current) {
      meshRef.current.position.lerp(targetPos.current, 0.1);
      const targetQuat = new THREE.Quaternion().setFromEuler(targetRot.current);
      meshRef.current.quaternion.slerp(targetQuat, 0.15);
    }
  });

  useEffect(() => {
    if (!meshRef.current) return;
    const { setupPositions } = useStore.getState();
    const tilePos = setupPositions['tile'] || [0, 0.93, 0];
    const beakerPos = setupPositions['beaker'] || [-1.0, 0.93, -0.3];

    if (currentStep === STEPS.ARRANGE) {
      targetPos.current.set(...position);
      targetRot.current.set(0, 0, 0);
    } else if ((currentStep === STEPS.GROWTH_TILE && onionPlacedOnTile) || currentStep === STEPS.CUT_INITIAL) {
      targetPos.current.set(tilePos[0], tilePos[1] + 0.1, tilePos[2]);
      targetRot.current.set(0, 0, Math.PI / 2); // Lay horizontal
    } else if (currentStep === STEPS.GROWTH_BEAKER && onionInBeaker) {
      targetPos.current.set(beakerPos[0], beakerPos[1] + 0.12, beakerPos[2]);
      targetRot.current.set(0, 0, 0); // Vertical in beaker
    } else if (currentStep === STEPS.CUT_FRESH) {
      targetPos.current.set(tilePos[0], tilePos[1] + 0.1, tilePos[2]);
      targetRot.current.set(0, 0, Math.PI / 2);
    }
  }, [currentStep, onionPlacedOnTile, onionInBeaker, position]);

  useEffect(() => {
    if (currentStep === STEPS.GROWTH_TILE && onionPlacedOnTile && !initialRootsGrown) {
      const timeout = setTimeout(() => {
        setStates({ initialRootsGrown: true });
        setStep(STEPS.CUT_INITIAL);
      }, 1000);
      return () => clearTimeout(timeout);
    }
  }, [currentStep, onionPlacedOnTile, initialRootsGrown]);

  useEffect(() => {
    if (currentStep === STEPS.GROWTH_BEAKER && onionInBeaker && !beakerRootsGrown) {
      let progress = 0.5;
      const interval = setInterval(() => {
        progress += 0.01;
        setRootScale(progress);
        if (progress >= 1.5) {
          clearInterval(interval);
          setStates({ beakerRootsGrown: true });
          setStep(STEPS.CUT_FRESH);
        }
      }, 100);
      return () => clearInterval(interval);
    }
  }, [currentStep, onionInBeaker, beakerRootsGrown]);

  const handlePointerDown = (e) => {
    e.stopPropagation();
    const canPick = currentStep === STEPS.GROWTH_TILE || currentStep === STEPS.GROWTH_BEAKER;
    if (canPick) setHeldTool(isHeld ? null : 'onion');
  };

  const handleCut = (e) => {
    e.stopPropagation();
    if (heldTool === 'scalpel') {
      setStates({ isCutting: true });
      setTimeout(() => {
        setStates({ isCutting: false });
        if (currentStep === STEPS.CUT_INITIAL) {
          setStates({ rootTipsInWatchGlass: true });
          setStep(STEPS.GROWTH_BEAKER);
          setRootScale(0.1);
        } else if (currentStep === STEPS.CUT_FRESH) {
          setStep(STEPS.TRANSFER_Vial);
          setRootScale(0.1);
        }
        setHeldTool(null);
      }, 600);
    }
  };

  return (
    <group ref={meshRef} onPointerDown={handlePointerDown}>
      <group position={[0, 0.1, 0]}>
        {/* Onion Bulb Body */}
        {[...Array(8)].map((_, i) => (
          <OnionPeel 
            key={i} 
            rotation={(i * Math.PI) / 4} 
            phiStart={0} 
            phiLength={Math.PI / 4 + 0.02} 
            scale={1 - (i % 2) * 0.002} 
          />
        ))}

        {/* Improved Shoot Sprouting */}
        <group position={[0, 0.25, 0]}>
          {[...Array(6)].map((_, i) => (
            <SproutShoot key={`sprout-${i}`} index={i} />
          ))}
        </group>
 
        {/* Roots - Zero Gap Mass */}
        <group position={[0, -0.075, 0]} scale={[1, rootScale, 1]}>
          {[...Array(160)].map((_, i) => (
            <RootTendril key={`root-${i}`} index={i} />
          ))}
        </group>
      </group>

      {/* Interactivity Highlights */}
      {((currentStep === STEPS.GROWTH_TILE && !onionPlacedOnTile) || (currentStep === STEPS.GROWTH_BEAKER && !onionInBeaker)) && !isHeld && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.18, 0.005, 16, 32]} />
          <meshBasicMaterial color="#00e5ff" transparent opacity={0.6} />
        </mesh>
      )}

      {(currentStep === STEPS.CUT_INITIAL || currentStep === STEPS.CUT_FRESH) && (
        <group position={[0, 0, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.08, 0.004, 16, 32]} />
            <meshBasicMaterial color="#00e5ff" transparent opacity={0.6} />
          </mesh>
          <mesh onClick={handleCut} onPointerOver={() => (document.body.style.cursor = heldTool === 'scalpel' ? 'copy' : 'auto')} onPointerOut={() => (document.body.style.cursor = 'auto')}>
            <cylinderGeometry args={[0.1, 0.1, 0.1, 8]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        </group>
      )}
    </group>
  );
};

export default Onion;
