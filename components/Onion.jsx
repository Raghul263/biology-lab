import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';

import useStore, { STEPS } from '../lib/store';

const OnionPeel = ({ rotation, phiStart, phiLength, scale = 1 }) => {
  const points = React.useMemo(() => {
    const pts = [];
    const s = 0.5 * scale;
    // FLASK-SHAPED profile with long tapering neck
    pts.push(new THREE.Vector2(0, -0.05 * s)); // Base
    pts.push(new THREE.Vector2(0.25 * s, 0.05 * s)); // Wide belly
    pts.push(new THREE.Vector2(0.35 * s, 0.25 * s)); // Widest part
    pts.push(new THREE.Vector2(0.30 * s, 0.45 * s)); // Tapering begins
    pts.push(new THREE.Vector2(0.18 * s, 0.65 * s)); // Neck middle
    pts.push(new THREE.Vector2(0.08 * s, 0.85 * s)); // Thin neck
    pts.push(new THREE.Vector2(0.03 * s, 0.95 * s)); // Neck top
    return pts;
  }, [scale]);

  const skinColor = "#ad1457"; // Vibrant Magenta/Purple
  const skinRoughness = 0.5;

  return (
    <group rotation={[0, rotation, 0]} position={[0, 0, 0]}>
      <mesh castShadow receiveShadow>
        <latheGeometry args={[points, 32, phiStart, phiLength]} />
        <meshStandardMaterial 
          color={skinColor} 
          roughness={skinRoughness} 
          metalness={0.05} 
          emissive="#4a0072" 
          emissiveIntensity={0.15} 
        />
      </mesh>
      
      {/* Texture Lines (Prominent lighter veins per photo) */}
      {[0.06, 0.16, 0.26].map((phiOffset, i) => (
        <mesh key={i} rotation={[0, phiOffset, 0]}>
          <latheGeometry args={[points, 32, 0, 0.006]} />
          <meshBasicMaterial color="#ec407a" opacity={0.4} transparent /> 
        </mesh>
      ))}

      {/* Base Root Disk */}
      <mesh position={[0, -0.025 * scale, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.1 * scale, 32]} />
        <meshStandardMaterial color="#6d4c41" roughness={1} />
      </mesh>
    </group>
  );
};

const RootTendril = ({ index }) => {
  const curve = React.useMemo(() => {
    const points = [];
    const length = 0.04 + (Math.sin(index * 1.2) * 0.03); 
    const angle = (index / 100) * Math.PI * 2;
    const radius = 0.01 + Math.random() * 0.05;
    
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
      <tubeGeometry args={[curve, 4, 0.0008, 4, false]} />
      <meshStandardMaterial color="#8d6e63" roughness={1} transparent opacity={0.9} />
    </mesh>
  );
};

const WitheredStalk = ({ index }) => {
  const curve = React.useMemo(() => {
    const points = [];
    const height = 0.05 + Math.random() * 0.15; // VERY SHORT dried stalks
    const angle = (index / 12) * Math.PI * 2;
    const radius = 0.002 + Math.random() * 0.006;
    
    points.push(new THREE.Vector3(Math.cos(angle) * radius, 0, Math.sin(angle) * radius));
    
    for (let j = 1; j <= 3; j++) {
      const p = j / 3;
      points.push(new THREE.Vector3(
        (Math.cos(angle) * radius) + (Math.random() - 0.5) * 0.02,
        height * p,
        (Math.sin(angle) * radius) + (Math.random() - 0.5) * 0.02
      ));
    }
    return new THREE.CatmullRomCurve3(points);
  }, [index]);

  return (
    <mesh castShadow>
      <tubeGeometry args={[curve, 6, 0.005 * (1 - index/16), 6, false]} />
      <meshStandardMaterial color="#a1887f" roughness={1.0} /> 
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
      targetPos.current.set(beakerPos[0], beakerPos[1] + 0.18, beakerPos[2]); 
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
        {/* Flask-Neck Bulb Body */}
        {[...Array(12)].map((_, i) => (
          <OnionPeel 
            key={i} 
            rotation={(i * Math.PI) / 6} 
            phiStart={0} 
            phiLength={Math.PI / 6 + 0.02} 
            scale={1} 
          />
        ))}

        {/* Withered Brown Top Stalks */}
        <group position={[0, 0.48, 0]}>
          {[...Array(16)].map((_, i) => (
            <WitheredStalk key={`withered-${i}`} index={i} />
          ))}
        </group>
 
        {/* Roots */}
        <group position={[0, -0.025, 0]} scale={[1, rootScale, 1]}>
          {[...Array(100)].map((_, i) => (
            <RootTendril key={`root-${i}`} index={i} />
          ))}
        </group>
      </group>

      {/* Highlights */}
      {((currentStep === STEPS.GROWTH_TILE && !onionPlacedOnTile) || (currentStep === STEPS.GROWTH_BEAKER && !onionInBeaker)) && !isHeld && (
        <mesh position={[0, 0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.22, 0.004, 16, 32]} />
          <meshBasicMaterial color="#00e5ff" transparent opacity={0.6} />
        </mesh>
      )}

      {(currentStep === STEPS.CUT_INITIAL || currentStep === STEPS.CUT_FRESH) && (
        <group position={[0, 0, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.12, 0.004, 16, 32]} />
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
