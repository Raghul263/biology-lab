import React, { useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useStore from '../lib/store';

const Dropper = ({ position: initialPosition = [-1.3, 0.93, 0.5] }) => {
  const { heldTool, setHeldTool, dropperState, dropCount, setStates, hclApplied, stainApplied, slideWaterApplied, watchGlassWaterApplied } = useStore();
  const isHeld = heldTool === 'dropper';
  const meshRef = useRef();
  const [snappedTo, setSnappedTo] = useState(null); // null, 'hclBeaker', 'stainBeaker', 'slide'
  const [isDipped, setIsDipped] = useState(false); // DIPPED = Inside liquid | !DIPPED = At rim
  const [suctionTime, setSuctionTime] = useState(0); // 0 to 1 for animation
  const [unlockTime, setUnlockTime] = useState(0); // Cooldown to prevent instant re-snap
  const { raycaster, mouse, camera } = useThree();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.93);

  useFrame((state, delta) => {
    if (suctionTime > 0) {
        setSuctionTime(prev => Math.max(0, prev - delta * 2.5));
    }
    if (unlockTime > 0) {
        setUnlockTime(prev => Math.max(0, prev - delta));
    }

    if (isHeld && meshRef.current) {
      const { setupPositions, hoveredComponent } = useStore.getState();
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);

      // --- 🧠 AUTOMATIC RIM SNAP (ONLY TO RIM) ---
      if (!snappedTo && hoveredComponent && ['hclBeaker', 'stainBeaker', 'waterBeaker', 'slide', 'watchGlass'].includes(hoveredComponent)) {
         if (unlockTime <= 0) {
            setSnappedTo(hoveredComponent);
            setIsDipped(false);
         }
      }

      if (snappedTo) {
        let targetPos = [0, 0, 0];
        if (snappedTo === 'hclBeaker') targetPos = setupPositions['hclBeaker'] || [-1.5, 0.93, -0.3];
        if (snappedTo === 'stainBeaker') targetPos = setupPositions['stainBeaker'] || [-1.1, 0.93, -0.3];
        if (snappedTo === 'waterBeaker') targetPos = setupPositions['waterBeaker'] || [-1.2, 0.93, -0.3];
        if (snappedTo === 'slide') targetPos = setupPositions['slide'] || [0, 0.93, 0.2];
        if (snappedTo === 'watchGlass') targetPos = setupPositions['watchGlass'] || [1.0, 0.93, -0.1];
        
        // --- 🧪 TWO-STAGE HEIGHT LOGIC ---
        let baseHeight = (snappedTo === 'slide' ? 0.16 : 0.28); 
        if (snappedTo === 'watchGlass') baseHeight = 0.22; // Slightly lower for watch glass
        
        let dipOffset = 0;
        if (suctionTime > 0 && (snappedTo === 'hclBeaker' || snappedTo === 'stainBeaker' || snappedTo === 'waterBeaker')) {
            const curve = Math.sin(suctionTime * Math.PI); 
            dipOffset = curve * -0.20; 
        }
        
        const yOffset = baseHeight + dipOffset;
        meshRef.current.position.set(targetPos[0], 0.93 + yOffset, targetPos[2]);
      } else {
        if (intersection) {
          intersection.x = Math.max(-2.0, Math.min(2.0, intersection.x));
          intersection.z = Math.max(-0.8, Math.min(0.8, intersection.z));
          meshRef.current.position.set(intersection.x, 1.12, intersection.z);
        }
      }
    } else if (!isHeld && meshRef.current) {
      const { setupPositions } = useStore.getState();
      const pos = setupPositions['dropper'] || initialPosition;
      meshRef.current.position.set(...pos);
    }
  });

  const handleClick = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    
    if (isHeld) {
      if (snappedTo) {
          setSnappedTo(null);
          setIsDipped(false);
          setUnlockTime(2.0); 
          return;
      }

      const { setupPositions, hoveredComponent } = useStore.getState();
      const pos = meshRef.current.position;
      
      const checkDist = (targetKey, defaultPos) => {
          const t = setupPositions[targetKey] || defaultPos;
          return Math.pow(pos.x - t[0], 2) + Math.pow(pos.z - t[2], 2) < 0.18;
      };

      if (hoveredComponent === 'hclBeaker' || checkDist('hclBeaker', [-1.5, 0.93, -0.3])) {
        setSnappedTo('hclBeaker');
      } else if (hoveredComponent === 'stainBeaker' || checkDist('stainBeaker', [-1.1, 0.93, -0.3])) {
        setSnappedTo('stainBeaker');
      } else if (hoveredComponent === 'waterBeaker' || checkDist('waterBeaker', [-1.2, 0.93, -0.3])) {
        setSnappedTo('waterBeaker');
      } else if (hoveredComponent === 'slide' || checkDist('slide', [0, 0.93, 0.2])) {
        setSnappedTo('slide');
      } else if (hoveredComponent === 'watchGlass' || checkDist('watchGlass', [1.0, 0.93, -0.1])) {
        setSnappedTo('watchGlass');
      } else if (Math.pow(pos.x - initialPosition[0], 2) + Math.pow(pos.z - initialPosition[2], 2) < 0.1) {
        useStore.getState().setSetupPosition('dropper', initialPosition);
        setStates({ dropperState: null, dropCount: 0 });
        setHeldTool(null);
      } else {
        useStore.getState().setSetupPosition('dropper', [pos.x, 0.93, pos.z]);
        setHeldTool(null);
      }
    } else {
      if (!heldTool) setHeldTool('dropper');
    }
  };

  const handleHeadClick = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    if (!isHeld) return;

    if (isDipped || (snappedTo === 'hclBeaker' || snappedTo === 'stainBeaker' || snappedTo === 'waterBeaker')) {
        if (snappedTo === 'hclBeaker') setStates({ dropperState: 'HCL_LOADED', dropCount: 3 });
        if (snappedTo === 'stainBeaker') setStates({ dropperState: 'STAIN_LOADED', dropCount: 3 });
        if (snappedTo === 'waterBeaker') setStates({ dropperState: 'WATER_LOADED', dropCount: 3 });
        setSuctionTime(1.0);
        setIsDipped(true); 
        return;
    }

    if (dropperState) {
        const nextCount = dropCount - 1;
        setSuctionTime(1.0); 

        if (snappedTo === 'slide') {
            if (dropperState === 'HCL_LOADED') setStates({ slideHclApplied: true, dropCount: nextCount });
            if (dropperState === 'STAIN_LOADED') setStates({ slideStainApplied: true, dropCount: nextCount });
            if (dropperState === 'WATER_LOADED') setStates({ slideWaterApplied: true, dropCount: nextCount });
        } else if (snappedTo === 'watchGlass') {
            if (dropperState === 'HCL_LOADED') setStates({ watchGlassHclApplied: true, dropCount: nextCount });
            if (dropperState === 'STAIN_LOADED') setStates({ watchGlassStainApplied: true, dropCount: nextCount });
            if (dropperState === 'WATER_LOADED') setStates({ watchGlassWaterApplied: true, dropCount: nextCount });
        } else {
            setStates({ dropCount: nextCount });
        }

        if (nextCount <= 0) {
            setStates({ dropperState: null, dropCount: 0 });
            setIsDipped(false);
        }
    }
  };

    const liquidColor = dropperState === 'HCL_LOADED' ? '#4fc3f7' :
                      dropperState === 'STAIN_LOADED' ? '#e91e63' : 
                      dropperState === 'WATER_LOADED' ? '#81d4fa' : null;

  // Visual mapping: dropCount (3/3 is max height)
  const liquidLevel = (dropCount / 3) * 0.08;

  const showHighlight = !isHeld && !heldTool;
  const homePos = initialPosition;

  return (
    <group>
      <group position={homePos} onPointerDown={handleClick} />

      <group ref={meshRef} onPointerDown={handleClick}
        onPointerOver={() => { 
            if (!heldTool) document.body.style.cursor = 'pointer'; 
            setStates({ hoveredComponent: 'dropper' });
        }}
        onPointerOut={() => {
            document.body.style.cursor = 'auto';
            setStates({ hoveredComponent: null });
        }}
      >
        {showHighlight && (
          <mesh position={[0, 0.01, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.06, 0.005, 16, 32]} />
            <meshBasicMaterial color="#00e5ff" transparent opacity={0.6} />
          </mesh>
        )}

        <group 
          rotation={isHeld ? [0, 0, 0] : [Math.PI / 2, 0, Math.PI]} 
          position={[0, isHeld ? -0.08 : 0.02, 0]}
        >
          {/* Bulb */}
          <mesh castShadow position={[0, 0.2, 0]} scale={suctionTime > 0 ? [0.95, 0.9, 0.95] : [1, 1, 1]}>
            <sphereGeometry args={[0.026, 32, 32]} />
            <meshPhysicalMaterial 
                color={(isHeld && snappedTo) ? (suctionTime > 0 ? "#880e4f" : "#ff1744") : "#b71c1c"} 
                roughness={0.8} 
            />
          </mesh>
          {/* Collar */}
          <mesh position={[0, 0.17, 0]} onPointerDown={(e) => { e.stopPropagation(); handleClick(); }}>
            <cylinderGeometry args={[0.012, 0.012, 0.015, 16]} />
            <meshPhysicalMaterial color="#333" metalness={0.9} />
          </mesh>
          {/* Glass Tube */}
          <mesh castShadow receiveShadow position={[0, 0.045, 0]} onPointerDown={(e) => { e.stopPropagation(); handleClick(); }}>
            <cylinderGeometry args={[0.007, 0.002, 0.24, 16]} />
            <meshPhysicalMaterial transparent opacity={0.4} transmission={1.0} thickness={0.05} color="#ffffff" ior={1.52} />
          </mesh>
          {/* 💧 REALISTIC LIQUID (MAPPED TO dropCount) */}
          {liquidColor && dropCount > 0 && (
            <mesh 
                position={[0, -0.085 + (liquidLevel / 2), 0]}
                scale={[1, dropCount / 3, 1]}
            >
              <cylinderGeometry args={[0.005, 0.002, 0.08, 16]} />
              <meshStandardMaterial color={liquidColor} transparent opacity={0.8} emissive={liquidColor} emissiveIntensity={0.2} />
            </mesh>
          )}
        </group>

        {/* 🔴 TOP INTERACTION ZONE */}
        <mesh 
          position={[0, 0.185, 0]} 
          onPointerDown={handleHeadClick}
          onPointerOver={(e) => { if (isHeld) { e.stopPropagation(); document.body.style.cursor = 'crosshair'; } }}
        >
          <cylinderGeometry args={[0.08, 0.08, 0.15, 16]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>

        {!isHeld && (
          <mesh onPointerDown={handleClick}>
            <boxGeometry args={[0.2, 0.05, 0.4]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        )}
      </group>
    </group>
  );
};

export default Dropper;
