import React, { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import useStore from '../lib/store';

/**
 * Forceps (Tweezers Style) matching the serrated handle reference
 * Features: Dark handle, joined back, pointed tips, visible roots.
 */
const Forceps = ({ position = [0, 0, 0] }) => {
  const { heldTool, setHeldTool, rootsInForceps } = useStore();
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
        groupRef.current.position.set(intersection.x, 0.952, intersection.z);
        groupRef.current.rotation.set(0, -Math.PI / 4, 0);
      }
    } else if (!isHeld && groupRef.current && position) {
      groupRef.current.position.set(...position);
      groupRef.current.rotation.set(0, 0, 0);
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (isHeld) {
      const pos = groupRef.current.position;
      useStore.getState().setSetupPosition('forceps', [pos.x, 0.93, pos.z]);
      setHeldTool(null);
    } else {
      if (!heldTool) setHeldTool('forceps');
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
      onPointerOver={() => (document.body.style.cursor = 'pointer')}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      {/* Interaction Highlight */}
      {showHighlight && (
        <group position={[0.07, 0.02, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.08, 0.005, 16, 32]} />
            <meshBasicMaterial color="#00e5ff" transparent opacity={0.6} />
          </mesh>
        </group>
      )}

      {/* Forceps Body (Tweezers Style) */}
      <group rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 1]}>
        
        {/* Back Joint (where they are joined) */}
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
          {/* Grip Ridges (Serrated) */}
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
          {/* Grip Ridges (Serrated) */}
          {[...Array(12)].map((_, i) => (
            <mesh key={i} position={[0.04 + (i * 0.004), 0.004, 0.001]} castShadow>
              <boxGeometry args={[0.002, 0.002, 0.008]} />
              <meshStandardMaterial color="#1a237e" roughness={0.3} />
            </mesh>
          ))}
        </group>

        {/* Carried Roots (Clearly visible at the tip) */}
        {rootsInForceps && (
          <group position={[0.155, 0, 0.003]}>
            {[...Array(3)].map((_, i) => (
              <mesh key={i}
                position={[(Math.random()-0.5)*0.01, 0, (Math.random()-0.5)*0.005]}
                rotation={[Math.PI / 2, Math.random() * Math.PI, 0]}
              >
                {/* Brighter, clearly visible roots */}
                <cylinderGeometry args={[0.004, 0.004, 0.02, 8]} />
                <meshStandardMaterial color="#ffecb3" emissive="#fff176" emissiveIntensity={0.4} />
              </mesh>
            ))}
          </group>
        )}
      </group>
      {/* Expanded Grab Trigger (Invisible) - Centered on Handle Area */}
      {!isHeld && (
        <mesh visible={false} position={[0.07, 0, 0]}>
          <boxGeometry args={[0.2, 0.05, 0.2]} />
          <meshBasicMaterial transparent opacity={0} />
        </mesh>
      )}
    </group>
  );
};

export default Forceps;
