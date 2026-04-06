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
        
        // Default floating position (Elevated above roots and vial)
        meshRef.current.position.set(intersection.x, 1.1, intersection.z);
        
        // Slicing Animation Hijack (High-Fidelity Downward Chop)
        const { isCutting, cutStartTime } = useStore.getState();
        if (isCutting && cutStartTime) {
          const t = (Date.now() - cutStartTime) / 400; // 0.4s slice
          if (t >= 0 && t <= 1) {
             const dip = Math.sin(t * Math.PI) * 0.15; // Deeper downward dip
             const swipe = (t - 0.5) * 0.12; 
             meshRef.current.position.y -= dip;
             meshRef.current.position.x += swipe;
             // Tilt TIP sharply down during cut
             meshRef.current.rotation.set(0, -Math.PI / 2, -Math.PI / 3);
          }
        } else {
           // Default Held Angle (Steep surgical angle from above)
           meshRef.current.rotation.set(0, -Math.PI / 2, -Math.PI / 4);
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
    if (isHeld) {
      // LEFT CLICK WHILE HELD = CUT OR DROP
      const state = useStore.getState();
      const onionPosArray = state.setupPositions['onion'] || [-0.35, 0.93, -0.2];
      const onionPos = new THREE.Vector3(...onionPosArray);
      let cutTriggered = false;
      
      if (state.onionRootsState !== 'CUT_DRY' && state.onionRootsState !== 'CUT_FRESH' && !state.rootsRemovedFromOnion) {
        // Use 2D distance (X/Z only) to avoid altitude issues
        const distSq = Math.pow(meshRef.current.position.x - onionPos.x, 2) + 
                       Math.pow(meshRef.current.position.z - onionPos.z, 2);
        
        if (distSq < 0.25 || state.hoveredComponent === 'onion') { // ~0.5m radius
          state.setStates({ isCutting: true, cutStartTime: Date.now() });
          cutTriggered = true;
        }
      }

      if (!cutTriggered) {
          // Fix in place
          const pos = meshRef.current.position;
          useStore.getState().setSetupPosition('scalpel', [pos.x, 0.93, pos.z]);
          setHeldTool(null);
      }

    } else {
      // PICK UP TOOL
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
          <planeGeometry args={[2.0, 2.0]} />
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
