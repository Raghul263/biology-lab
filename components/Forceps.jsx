import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import useStore from '../lib/store';

/**
 * Forceps (Tweezers Style) matching the serrated handle reference
 * Features: Dark handle, joined back, pointed tips, visible roots.
 */
const Forceps = ({ position = [0, 0, 0] }) => {
  const { heldTool, setHeldTool, rootsInForceps, rootPicked, setStates } = useStore();
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
      setStates({ forcepsReady: true });
    }
    prevHeld.current = heldTool;
  }, [heldTool]);

  const handleClick = (e) => {
    e.stopPropagation();
    const { hoveredComponent, watchGlassRootCount, vialCapOpen, setStates } = useStore.getState();

    if (isHeld) {
      // 🧠 SMART TOOL ACTION PRIORITIZATION
      if (hoveredComponent === 'watchGlass' && !rootPicked && watchGlassRootCount > 0) {
        // ACTION: Pick up root (DO NOT DROP TOOL)
        setStates({ 
          rootPicked: true, 
          watchGlassRootCount: watchGlassRootCount - 1,
          rootTipsInWatchGlass: (watchGlassRootCount - 1) > 0
        });
        return;
      }

      if (hoveredComponent === 'vial' && rootPicked && vialCapOpen) {
        // ACTION: Drop root AND drop tool (Fix position)
        setStates({ rootInVial: true, rootPicked: false });
        const pos = groupRef.current.position;
        useStore.getState().setSetupPosition('forceps', [pos.x, 0.93, pos.z]);
        setHeldTool(null);
        setStates({ forcepsReady: true });
        return;
      }

      // DEFAULT: Fix position (Drop tool)
      const pos = groupRef.current.position;
      useStore.getState().setSetupPosition('forceps', [pos.x, 0.93, pos.z]);
      setHeldTool(null);
      setStates({ forcepsReady: true });
    } else {
      setHeldTool('forceps');
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
        {rootPicked && (
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
