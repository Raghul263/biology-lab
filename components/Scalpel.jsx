import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import useStore from '../lib/store';

const Scalpel = ({ position: initialPosition = [0, 0.93, 0.4] }) => {
  const { heldTool, setHeldTool } = useStore();
  const isHeld = heldTool === 'scalpel';
  const meshRef = useRef();
  const { raycaster } = useThree();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.93);

  useFrame(() => {
    if (isHeld && meshRef.current) {
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);
      if (intersection) {
        intersection.x = Math.max(-2.0, Math.min(2.0, intersection.x));
        intersection.z = Math.max(-0.8, Math.min(0.8, intersection.z));
        
        meshRef.current.position.set(intersection.x, 1.1, intersection.z);
        
        const { isCutting, cutStartTime } = useStore.getState();
        if (isCutting && cutStartTime) {
          const t = (Date.now() - cutStartTime) / 400;
          if (t >= 0 && t <= 1) {
             const dip = Math.sin(t * Math.PI) * 0.15;
             const swipe = (t - 0.5) * 0.12; 
             meshRef.current.position.y -= dip;
             meshRef.current.position.x += swipe;
             meshRef.current.rotation.set(0, -Math.PI / 2, -Math.PI / 3);
          }
        } else {
            meshRef.current.rotation.set(0, -Math.PI / 2, -Math.PI / 4);
            
            // 🧠 REAL-TIME DISTANCE TRACKING for visual feedback
            const { onionPlacedOn, setupPositions, setStates } = useStore.getState();
            const pTable = setupPositions['onion'] || [-0.35, 0.93, -0.2];
            const pTile = setupPositions['tile'] || [0, 0.93, 0.3];
            const pWG = setupPositions['watchGlass'] || [1.0, 0.93, -0.1];
            
            let tx = pTable[0], tz = pTable[2];
            if (onionPlacedOn === 'tile') { 
                tx = pTile[0] + 0.08; tz = pTile[2]; 
            } else if (onionPlacedOn === 'watchGlass') { 
                tx = pWG[0] + 0.08; tz = pWG[2]; 
            }

            const dx = intersection.x - tx;
            const dz = intersection.z - tz;
            const isNear = (dx*dx + dz*dz) < 0.25; // Accurate 0.5m radius
        }
      }
    } else if (!isHeld && meshRef.current) {
      const { setupPositions } = useStore.getState();
      const pos = setupPositions['scalpel'] || initialPosition;
      meshRef.current.position.set(pos[0], pos[1] + 0.005, pos[2]);
      meshRef.current.rotation.set(0, Math.PI / 4, 0);
    }
  });

  // SMART SWAPPING: Auto-drop if user picks up a different tool
  const prevHeld = useRef(heldTool);
  React.useEffect(() => {
    if (prevHeld.current === 'scalpel' && heldTool !== 'scalpel' && meshRef.current) {
      const pos = meshRef.current.position;
      useStore.getState().setSetupPosition('scalpel', [pos.x, 0.93, pos.z]);
    }
    prevHeld.current = heldTool;
  }, [heldTool]);

  const handleClick = (e) => {
    e.stopPropagation();
    const state = useStore.getState();
    if (isHeld) {
      // LEFT CLICK WHILE HELD = CUT OR DROP
      // 🧠 ULTRA-LENIENT ONION TRACKING (FREE FLOW)
      const { 
          onionPlacedOn, setupPositions, onionRootsState, 
          rootsRemovedFromOnion, hoveredComponent, setStates 
      } = state;

      // Check multiple possible locations for the onion
      const pTable = setupPositions['onion'] || [-0.35, 0.93, -0.2];
      const pTile = setupPositions['tile'] || [0, 0.93, 0.3];
      const pWG = setupPositions['watchGlass'] || [1.0, 0.93, -0.1];

      const checkCut = (targetRef, offset = 0) => {
          const distSq = Math.pow(meshRef.current.position.x - (targetRef[0] + offset), 2) + 
                         Math.pow(meshRef.current.position.z - targetRef[2], 2);
          return distSq < 0.3; // Precise 0.54m radius for the specific root tip area
      };

      let nearOnion = false;
      if (onionPlacedOn === 'tile') nearOnion = checkCut(pTile, 0.08);
      else if (onionPlacedOn === 'watchGlass') nearOnion = checkCut(pWG, 0.08);
      else nearOnion = checkCut(pTable, 0);

      let cutTriggered = false;
      if (onionRootsState !== 'CUT_DRY' && onionRootsState !== 'CUT_FRESH' && !rootsRemovedFromOnion) {
        if (nearOnion || hoveredComponent === 'onion') { 
          setStates({ isCutting: true, cutStartTime: Date.now() });
          cutTriggered = true;
        }
      }

      if (!cutTriggered) {
          const pos = meshRef.current.position;
          // Drop where it is (LERP will have brought it to mouse)
          useStore.getState().setSetupPosition('scalpel', [pos.x, 0.93, pos.z]);
          setHeldTool(null);
      }
    } else {
      setHeldTool('scalpel');
    }
  };

  const handleContextMenu = (e) => {
    e.nativeEvent.preventDefault();
    e.stopPropagation();
    // Removed old right-click logic
  };

  const showHighlight = !heldTool;

  const { handleShape, bladeShape, extrudeSettings } = useMemo(() => {
    const h = new THREE.Shape();
    const width = 0.015, length = 0.14, radius = 0.007;
    h.moveTo(-length / 2 + radius, -width / 2);
    h.lineTo(length / 2 - radius, -width / 2);
    h.absarc(length / 2 - radius, 0, radius, -Math.PI / 2, Math.PI / 2, false);
    h.lineTo(-length / 2 + radius, width / 2);
    h.absarc(-length / 2 + radius, 0, radius, Math.PI / 2, -Math.PI / 2, false);

    const b = new THREE.Shape();
    b.moveTo(0, -0.004);
    b.lineTo(0.045, -0.002);
    b.bezierCurveTo(0.05, -0.001, 0.05, 0.001, 0.045, 0.002);
    b.bezierCurveTo(0.035, 0.008, 0.01, 0.01, 0, 0.006);
    b.lineTo(0, -0.004);

    return {
      handleShape: h,
      bladeShape: b,
      extrudeSettings: { depth: 0.002, bevelEnabled: true, bevelThickness: 0.001, bevelSize: 0.001 }
    };
  }, []);

  return (
    <group
      ref={meshRef}
      onPointerDown={handleClick}
      onContextMenu={handleContextMenu}
      onPointerOver={() => { if (!isHeld) document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      {/* 🔴 INTERACTION ZONE: While held, this captures the user's "Fix" click anywhere on the table */}
      {isHeld && (
        <mesh 
          position={[0, 0, 0]} 
          onPointerDown={handleClick}
          onPointerOver={() => { document.body.style.cursor = 'cell'; }}
        >
          <planeGeometry args={[6.0, 6.0]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}

      <group 
        rotation={[Math.PI / 2, 0, 0]} 
        scale={[1.4, 1.4, 1.4]} 
        position={[-0.08, 0, 0]}
        pointerEvents={isHeld ? "none" : "auto"}
      >
        {/* Handle */}
        <mesh castShadow>
          <extrudeGeometry args={[handleShape, extrudeSettings]} />
          <meshStandardMaterial color="#00bcd4" roughness={0.7} metalness={0.1} />
        </mesh>
        
        {/* Serrations */}
        {[...Array(8)].map((_, i) => (
          <mesh key={i} position={[0.03 + (i * 0.006), 0.001, 0]} castShadow>
            <boxGeometry args={[0.002, 0.003, 0.012]} />
            <meshStandardMaterial color="#0097a7" roughness={0.7} />
          </mesh>
        ))}
        
        {/* Blade Holder */}
        <mesh position={[0.07, 0.001, 0]} castShadow>
          <boxGeometry args={[0.02, 0.0015, 0.008]} />
          <meshStandardMaterial color="#ecf0f1" roughness={0.1} metalness={0.9} />
        </mesh>
        
        {/* Actual Blade */}
        <group position={[0.085, 0.001, 0]}>
          <mesh castShadow rotation={[0, 0, 0.1]}>
            <extrudeGeometry args={[bladeShape, { depth: 0.0005, bevelEnabled: false }]} />
            <meshPhysicalMaterial color="#ffffff" metalness={0.9} roughness={0.1}
              clearcoat={1} clearcoatRoughness={0.02} emissive="#ffffff" emissiveIntensity={0.15} />
          </mesh>
        </group>
      </group>

      {/* 🟢 MASSIVE Grab Trigger (Transparent) - Ensures mouse can always 'catch' the tool */}
      {!isHeld && (
        <mesh 
          position={[0.04, 0.05, 0]}
          onPointerDown={handleClick}
          onContextMenu={handleContextMenu}
        >
          <boxGeometry args={[0.6, 0.25, 0.4]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
};

export default Scalpel;
