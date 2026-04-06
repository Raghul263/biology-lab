import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import useStore from '../lib/store';

/**
 * Forceps (Tweezers Style) matching the serrated handle reference
 * Features: Dark handle, joined back, pointed tips, visible roots.
 */
const Forceps = ({ position = [0, 0, 0] }) => {
  const { heldTool, setHeldTool, holdingRoot, setStates } = useStore();
  const groupRef = useRef();
  const isHeld = heldTool === 'forceps';
  const { raycaster } = useThree();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.93);

  useFrame(() => {
    if (isHeld && groupRef.current) {
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);
      if (intersection) {
        intersection.x = Math.max(-2.0, Math.min(2.0, intersection.x));
        intersection.z = Math.max(-0.8, Math.min(0.8, intersection.z));
        groupRef.current.position.set(intersection.x, 1.1, intersection.z); // Elevated for clearance
        groupRef.current.rotation.set(0, -Math.PI / 4, 0);
      }
    } else if (!isHeld && groupRef.current) {
      const { setupPositions } = useStore.getState();
      const pos = setupPositions['forceps'] || position;
      groupRef.current.position.set(pos[0], pos[1], pos[2]);
      groupRef.current.rotation.set(0, 0, 0);
    }
  });

  // SMART SWAPPING: Auto-drop if user picks up a different tool
  const prevHeld = useRef(heldTool);
  React.useEffect(() => {
    if (prevHeld.current === 'forceps' && heldTool !== 'forceps' && groupRef.current) {
      const pos = groupRef.current.position;
      useStore.getState().setSetupPosition('forceps', [pos.x, 0.93, pos.z]);
    }
    prevHeld.current = heldTool;
  }, [heldTool]);

  const handleClick = (e) => {
    if (e && e.stopPropagation) e.stopPropagation();
    const state = useStore.getState();
    const { 
        setHeldTool, setStates, holdingRoot, watchGlassRootCount, 
        vialCapOpen, rootInVial, rootOnSlide, setupPositions 
    } = state;

    if (isHeld) {
      const pos = groupRef.current.position;
      
      // 🧠 ULTRA-LENIENT DISTANCE DETECTION (Matches Scalpel Logic)
      const checkDist = (targetKey, defaultPos) => {
          const t = setupPositions[targetKey] || defaultPos;
          const distSq = Math.pow(pos.x - t[0], 2) + Math.pow(pos.z - t[2], 2);
          return distSq < 0.4; // Large 0.63m radius for guaranteed "Proper" drop
      };

      // 1. WATCH GLASS (Pick up)
      if (checkDist('watchGlass', [1.0, 0.93, -0.1]) && !holdingRoot && watchGlassRootCount > 0) {
        setStates({ holdingRoot: true, watchGlassRootCount: watchGlassRootCount - 1 });
        return;
      }

      // 2. FIXATIVE VIAL (Pick/Drop)
      if (checkDist('vial', [0.5, 0.93, -0.6]) && vialCapOpen) {
        if (holdingRoot && !rootInVial) {
            setStates({ rootInVial: true, holdingRoot: false });
        } else if (!holdingRoot && rootInVial) {
            setStates({ rootInVial: false, holdingRoot: true });
        }
        return;
      }

      // 3. GLASS SLIDE (Drop)
      if (checkDist('slide', [0, 0.93, -0.5]) && holdingRoot && !rootOnSlide) {
        setStates({ rootOnSlide: true, holdingRoot: false });
        return;
      }

      // DEFAULT: Fix in place (Drop tool)
      useStore.getState().setSetupPosition('forceps', [pos.x, 0.93, pos.z]);
      setHeldTool(null);
    } else {
      if (!heldTool) setHeldTool('forceps');
    }
  };

  const handleContextMenu = (e) => {
    e.nativeEvent.preventDefault();
    e.stopPropagation();
    if (isHeld) {
      const pos = groupRef.current.position;
      useStore.getState().setSetupPosition('forceps', [pos.x, 0.93, pos.z]);
      setHeldTool(null);
      setStates({ forcepsReady: true });
    }
  };

  // ── REFINED GEOMETRY (Tweezers Style) ──────────────────────
  const { armShape, extrudeSettings } = useMemo(() => {
    // Tapered arm from back to very fine tip
    const s = new THREE.Shape();
    s.moveTo(0, -0.008);
    s.lineTo(0.14, -0.001); // Narrowing to tip
    s.lineTo(0.15, -0.001); // Tip
    s.lineTo(0.15, 0.001);
    s.lineTo(0.14, 0.001);
    s.lineTo(0, 0.008);
    s.lineTo(0, -0.008);

    return { 
      armShape: s, 
      extrudeSettings: { depth: 0.004, bevelEnabled: true, bevelThickness: 0.001, bevelSize: 0.001 } 
    };
  }, []);

  const showHighlight = !heldTool;

  return (
    <group 
      ref={groupRef} 
      onPointerDown={handleClick}
      onContextMenu={handleContextMenu}
      onPointerOver={() => { 
        if (!isHeld) {
            document.body.style.cursor = 'pointer'; 
            setStates({ hoveredComponent: 'forceps' });
        }
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
        setStates({ hoveredComponent: null });
      }}
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

      {/* Forceps Body (Tweezers Style) - POINTER EVENTS NONE when held so we can click targets UNDERNEATH */}
      <group 
        rotation={[Math.PI / 2, 0, 0]} 
        scale={[1, 1, 1]}
        pointerEvents={isHeld ? "none" : "auto"}
        position={[-0.1, 0, 0]} 
      >
        
        {/* Back Joint */}
        <mesh position={[0, 0, 0]} castShadow>
          <boxGeometry args={[0.005, 0.016, 0.006]} />
          <meshStandardMaterial color="#37474f" roughness={0.4} metalness={0.7} />
        </mesh>

        {/* Top Arm */}
        <group rotation={[0, 0, 0.06]} position={[0, 0.002, 0]}>
          <mesh castShadow>
            <extrudeGeometry args={[armShape, extrudeSettings]} />
            <meshStandardMaterial color="#263238" roughness={0.6} metalness={0.5} />
          </mesh>
          {/* Grip Ridges */}
          {[...Array(12)].map((_, i) => (
            <mesh key={i} position={[0.04 + (i * 0.004), 0.004, 0.001]} castShadow>
              <boxGeometry args={[0.002, 0.002, 0.008]} />
              <meshStandardMaterial color="#1a237e" roughness={0.3} />
            </mesh>
          ))}
        </group>

        {/* Bottom Arm (Mirrored) */}
        <group rotation={[0, 0, -0.06]} position={[0, -0.002, 0]} scale={[1, -1, 1]}>
          <mesh castShadow>
            <extrudeGeometry args={[armShape, extrudeSettings]} />
            <meshStandardMaterial color="#263238" roughness={0.6} metalness={0.5} />
          </mesh>
          {/* Grip Ridges */}
          {[...Array(12)].map((_, i) => (
            <mesh key={i} position={[0.04 + (i * 0.004), 0.004, 0.001]} castShadow>
              <boxGeometry args={[0.002, 0.002, 0.008]} />
              <meshStandardMaterial color="#1a237e" roughness={0.3} />
            </mesh>
          ))}
        </group>

        {/* Carried Root (One at a time) */}
        {holdingRoot && (
          <group position={[0.155, 0, 0.003]}>
            <mesh 
              position={[0, 0, 0]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <cylinderGeometry args={[0.004, 0.004, 0.02, 8]} />
              <meshStandardMaterial color="#ffecb3" emissive="#fff176" emissiveIntensity={0.4} />
            </mesh>
          </group>
        )}
      </group>

      {/* 🟢 MASSIVE Grab Trigger (Transparent) - Ensures mouse can always 'catch' the tool */}
      {!isHeld && (
        <mesh 
          position={[0.07, 0, 0]}
          onPointerDown={handleClick}
          onContextMenu={handleContextMenu}
        >
          <boxGeometry args={[0.4, 0.15, 0.25]} />
          <meshBasicMaterial transparent opacity={0} depthWrite={false} />
        </mesh>
      )}
    </group>
  );
};

export default Forceps;
