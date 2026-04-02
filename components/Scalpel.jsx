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
        meshRef.current.position.set(intersection.x, 0.952, intersection.z);
        meshRef.current.rotation.set(0, -Math.PI / 2, 0);
      }
    } else if (!isHeld && meshRef.current && initialPosition) {
      meshRef.current.position.set(initialPosition[0], initialPosition[1] + 0.005, initialPosition[2]);
      meshRef.current.rotation.set(0, Math.PI / 4, 0);
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (isHeld) {
      const pos = meshRef.current.position;
      useStore.getState().setSetupPosition('scalpel', [pos.x, 0.93, pos.z]);
      setHeldTool(null);
    } else {
      if (!heldTool) setHeldTool('scalpel');
    }
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
      onPointerDown={isHeld ? null : handleClick}
      onPointerOver={() => { if (!isHeld) document.body.style.cursor = 'pointer'; }}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      {showHighlight && (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <torusGeometry args={[0.08, 0.004, 16, 32]} />
          <meshBasicMaterial color="#00e5ff" transparent opacity={0.5} />
        </mesh>
      )}

      <group rotation={[Math.PI / 2, 0, 0]} scale={[1, 1, 1]}>
        <mesh castShadow>
          <extrudeGeometry args={[handleShape, extrudeSettings]} />
          <meshStandardMaterial color="#00bcd4" roughness={0.7} metalness={0.1} />
        </mesh>
        {[...Array(8)].map((_, i) => (
          <mesh key={i} position={[0.03 + (i * 0.006), 0.001, 0]} castShadow>
            <boxGeometry args={[0.002, 0.003, 0.012]} />
            <meshStandardMaterial color="#0097a7" roughness={0.7} />
          </mesh>
        ))}
        <mesh position={[0.07, 0.001, 0]} castShadow>
          <boxGeometry args={[0.02, 0.0015, 0.008]} />
          <meshStandardMaterial color="#ecf0f1" roughness={0.1} metalness={0.9} />
        </mesh>
        <group position={[0.085, 0.001, 0]}>
          <mesh castShadow rotation={[0, 0, 0.1]}>
            <extrudeGeometry args={[bladeShape, { depth: 0.0005, bevelEnabled: false }]} />
            <meshPhysicalMaterial color="#ffffff" metalness={0.9} roughness={0.1}
              clearcoat={1} clearcoatRoughness={0.02} emissive="#ffffff" emissiveIntensity={0.15} />
          </mesh>
        </group>
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

export default Scalpel;
