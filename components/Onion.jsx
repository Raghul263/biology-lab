import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';

import useStore, { STEPS } from '../lib/store';

const OnionPeel = ({ rotation, phiStart, phiLength, scale = 1 }) => {
  const points = React.useMemo(() => {
    const pts = [];
    const s = 0.5 * scale;
    // BULBOUS SHAPE with slightly shorter, robust neck
    pts.push(new THREE.Vector2(0, -0.05 * s)); // Base
    pts.push(new THREE.Vector2(0.28 * s, 0.05 * s)); // Wide belly
    pts.push(new THREE.Vector2(0.38 * s, 0.25 * s)); // Widest part
    pts.push(new THREE.Vector2(0.32 * s, 0.45 * s)); // Tapering begins
    pts.push(new THREE.Vector2(0.15 * s, 0.60 * s)); // Robust neck
    pts.push(new THREE.Vector2(0.06 * s, 0.75 * s)); // Neck tip
    return pts;
  }, [scale]);

  const skinColor = "#ad1457"; // Vibrant Magenta/Purple
  const skinRoughness = 0.45;

  return (
    <group rotation={[0, rotation, 0]} position={[0, 0, 0]}>
      <mesh castShadow receiveShadow>
        <latheGeometry args={[points, 32, phiStart, phiLength]} />
        <meshStandardMaterial 
          color={skinColor} 
          roughness={skinRoughness} 
          metalness={0.1} 
          emissive="#6a0080" 
          emissiveIntensity={0.2} 
        />
      </mesh>
      
      {/* Texture Lines (Prominent lighter skin veins) */}
      {[0.08, 0.18, 0.28].map((phiOffset, i) => (
        <mesh key={i} rotation={[0, phiOffset, 0]}>
          <latheGeometry args={[points, 32, 0, 0.007]} />
          <meshBasicMaterial color="#ff4081" opacity={0.35} transparent /> 
        </mesh>
      ))}

      {/* Base Root Disk */}
      <mesh position={[0, -0.02 * scale, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.1 * scale, 32]} />
        <meshStandardMaterial color="#8d6e63" roughness={1} />
      </mesh>
    </group>
  );
};

const RootTendril = ({ index }) => {
  const curve = React.useMemo(() => {
    const points = [];
    const length = 0.04 + (Math.sin(index * 1.5) * 0.03); 
    const angle = (index / 100) * Math.PI * 2;
    const radius = 0.01 + Math.random() * 0.06;
    
    points.push(new THREE.Vector3(Math.cos(angle) * (radius * 0.1), 0, Math.sin(angle) * (radius * 0.1)));
    
    for (let j = 1; j <= 3; j++) {
      const p = j / 3;
      points.push(new THREE.Vector3(
        (Math.cos(angle) * radius * p) + (Math.random() - 0.5) * 0.02,
        -length * p,
        (Math.sin(angle) * radius * p) + (Math.random() - 0.5) * 0.02
      ));
    }
    return new THREE.CatmullRomCurve3(points);
  }, [index]);

  return (
    <mesh castShadow>
      <tubeGeometry args={[curve, 4, 0.001, 4, false]} />
      <meshStandardMaterial color="#a1887f" roughness={1} transparent opacity={0.8} />
    </mesh>
  );
};

const FreshShoot = ({ index }) => {
  const curve = React.useMemo(() => {
    const points = [];
    const height = 0.15 + Math.random() * 0.15; // VIBRANT FRESH shoots
    const angle = (index / 12) * Math.PI * 2;
    const radius = 0.003 + Math.random() * 0.008;
    
    points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
    
    // Vertical pointed growth
    for (let j = 1; j <= 3; j++) {
      const p = j / 3;
      points.push(new THREE.Vector3(
        (Math.cos(angle) * radius * (1 - p * 0.5)) + (Math.random() - 0.5) * 0.01,
        height * p,
        (Math.sin(angle) * radius * (1 - p * 0.5)) + (Math.random() - 0.5) * 0.01
      ));
    }
    return new THREE.CatmullRomCurve3(points);
  }, [index]);

  return (
    <mesh castShadow>
      <tubeGeometry args={[curve, 8, 0.006 * (1 - index/16), 8, false]} />
      <meshStandardMaterial color="#4caf50" roughness={0.5} /> 
    </mesh>
  );
};

const Onion = ({ position = [0, 0.93, 0] }) => {
  const { currentStep, setStep, setStates, initialRootsGrown, beakerRootsGrown, heldTool, setHeldTool, onionInBeaker, onionPlacedOnTile } = useStore();
  const isHeld = heldTool === 'onion';
  const [rootScale, setRootScale] = useState(0.4);
  
  const targetPos = useRef(new THREE.Vector3(...position));
  const targetRot = useRef(new THREE.Euler(0, 0, 0));
  const meshRef = useRef();
  const { raycaster } = useThree();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.93);

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
      targetRot.current.set(0, 0, Math.PI / 2);
    } else if (currentStep === STEPS.GROWTH_BEAKER && onionInBeaker) {
      targetPos.current.set(beakerPos[0], beakerPos[1] + 0.15, beakerPos[2]); 
      targetRot.current.set(0, 0, 0);
    } else if (currentStep === STEPS.CUT_FRESH) {
      targetPos.current.set(tilePos[0], tilePos[1] + 0.1, tilePos[2]);
      targetRot.current.set(0, 0, Math.PI / 2);
    }
  }, [currentStep, onionPlacedOnTile, onionInBeaker, position]);

  useEffect(() => {
    if (currentStep === STEPS.GROWTH_TILE && onionPlacedOnTile && !initialRootsGrown) {
      setTimeout(() => {
        setStates({ initialRootsGrown: true });
        setStep(STEPS.CUT_INITIAL);
      }, 1000);
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
      <group position={[0, 0.05, 0]}>
        {/* Bulbous Body with Shorter Neck */}
        {[...Array(12)].map((_, i) => (
          <OnionPeel 
            key={i} 
            rotation={(i * Math.PI) / 6} 
            phiStart={0} 
            phiLength={Math.PI / 6 + 0.02} 
            scale={1} 
          />
        ))}

        {/* Vibrant Fresh Top Shoots */}
        <group position={[0, 0.38, 0]}>
          {[...Array(16)].map((_, i) => (
            <FreshShoot key={`shoot-${i}`} index={i} />
          ))}
        </group>
 
        {/* Roots */}
        <group position={[0, -0.02, 0]} scale={[1, rootScale, 1]}>
          {[...Array(100)].map((_, i) => (
            <RootTendril key={`root-${i}`} index={i} />
          ))}
        </group>
      </group>

      {/* Highlights */}
      {((currentStep === STEPS.GROWTH_TILE && !onionPlacedOnTile) || (currentStep === STEPS.GROWTH_BEAKER && !onionInBeaker)) && !isHeld && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.22, 0.005, 16, 32]} />
          <meshBasicMaterial color="#00e5ff" transparent opacity={0.6} />
        </mesh>
      )}

      {(currentStep === STEPS.CUT_INITIAL || currentStep === STEPS.CUT_FRESH) && (
        <group position={[0, 0, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.12, 0.005, 16, 32]} />
            <meshBasicMaterial color="#00e5ff" transparent opacity={0.6} />
          </mesh>
          <mesh onClick={handleCut} onPointerOver={() => (document.body.style.cursor = heldTool === 'scalpel' ? 'copy' : 'auto')} onPointerOut={() => (document.body.style.cursor = 'auto')}>
            <cylinderGeometry args={[0.15, 0.15, 0.1, 8]} />
            <meshBasicMaterial transparent opacity={0} />
          </mesh>
        </group>
      )}
    </group>
  );
};

export default Onion;
