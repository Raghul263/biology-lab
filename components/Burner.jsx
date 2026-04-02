import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import useStore from '../lib/store';

const Burner = ({ position: initialPosition = [0.7, 0.93, 0] }) => {
  const { heldTool, setStates, setHeldTool, slideHeatedTime } = useStore();
  const flameRef = useRef();
  const [flameOn, setFlameOn] = useState(false);

  const isHeld = heldTool === 'burner';
  const groupRef = useRef();
  const { raycaster } = useThree();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.93);

  useFrame((state) => {
    if (isHeld && groupRef.current) {
      const { raycaster: r } = state;
      const intersection = new THREE.Vector3();
      r.ray.intersectPlane(plane, intersection);
      if (intersection) {
        intersection.x = Math.max(-2.0, Math.min(2.0, intersection.x));
        intersection.z = Math.max(-0.8, Math.min(0.8, intersection.z));
        groupRef.current.position.set(intersection.x, 0.93, intersection.z);
      }
    } else if (!isHeld && groupRef.current && initialPosition) {
      groupRef.current.position.set(...initialPosition);
    }

    if (flameRef.current && flameOn) {
      const t = state.clock.elapsedTime;
      flameRef.current.rotation.z = Math.sin(t * 10) * 0.05 + Math.sin(t * 2.5) * 0.02;
      flameRef.current.rotation.x = Math.cos(t * 8) * 0.03;
      const s = 1 + Math.sin(t * 25) * 0.1;
      const pulse = 1 + Math.sin(t * 50) * 0.05;
      flameRef.current.scale.set(s, pulse, s);
      flameRef.current.rotation.y += 0.05;
      flameRef.current.children.forEach((child, i) => {
        if (child.type === 'Mesh') {
          child.position.x = Math.sin(t * (20 + i)) * 0.002;
          child.position.z = Math.cos(t * (22 + i)) * 0.002;
        }
      });
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (isHeld) {
      const pos = groupRef.current.position;
      useStore.getState().setSetupPosition('burner', [pos.x, 0.93, pos.z]);
      setHeldTool(null);
    } else if (!heldTool) {
      setHeldTool('burner');
    } else if (heldTool === 'slide' && flameOn) {
       setStates({ 
          slideHeatedTime: (slideHeatedTime || 0) + 1,
          heated: true 
       });
    }
  };

  const toggleFlame = (e) => {
    e.stopPropagation();
    setFlameOn(!flameOn);
  };

  const redMat = { color: "#d32f2f", roughness: 0.3, metalness: 0.7 };
  const chromeMat = { color: "#eceff1", roughness: 0.15, metalness: 0.9 };
  const showHighlight = isHeld || !heldTool || heldTool === 'slide';

  return (
    <group ref={groupRef} position={initialPosition} onClick={handleClick}
      onPointerOver={() => { if (showHighlight) document.body.style.cursor = isHeld ? 'grabbing' : 'pointer'; }}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      {heldTool === 'slide' && flameOn && (
        <group position={[0, 0.25, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.08, 0.005, 16, 32]} />
            <meshBasicMaterial color="#00e5ff" transparent opacity={0.6} />
          </mesh>
        </group>
      )}

      <mesh castShadow receiveShadow position={[0, 0.02, 0]}>
        <cylinderGeometry args={[0.02, 0.08, 0.04, 32]} />
        <meshStandardMaterial {...redMat} />
      </mesh>
      <mesh castShadow position={[0, 0.06, 0]}>
        <cylinderGeometry args={[0.022, 0.022, 0.04, 32]} />
        <meshStandardMaterial {...redMat} />
      </mesh>

      <group position={[0, 0.06, 0.022]} onClick={toggleFlame}
        onPointerOver={(e) => { e.stopPropagation(); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => (document.body.style.cursor = 'auto')}
      >
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.008, 0.008, 0.015, 16]} />
          <meshStandardMaterial color={flameOn ? "#4caf50" : "#212121"} emissive={flameOn ? "#4caf50" : "#000000"} emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0, 0, 0.01]}>
          <sphereGeometry args={[0.004, 8, 8]} />
          <meshBasicMaterial color={flameOn ? "#4caf50" : "#f44336"} />
        </mesh>
      </group>

      <group position={[0, 0.05, -0.02]} rotation={[-Math.PI / 2, 0, 0]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.008, 0.01, 0.07, 16]} />
          <meshStandardMaterial {...chromeMat} />
        </mesh>
        {[0.01, 0.02, 0.03].map((z, i) => (
          <mesh key={i} position={[0, z, 0]}>
            <torusGeometry args={[0.01, 0.002, 8, 16]} />
            <meshStandardMaterial {...chromeMat} />
          </mesh>
        ))}
      </group>

      <mesh castShadow>
        <tubeGeometry args={[
          new THREE.CatmullRomCurve3([
            new THREE.Vector3(0, 0.05, -0.055),
            new THREE.Vector3(0.05, 0.03, -0.1),
            new THREE.Vector3(0.2, -0.02, 0.1),
            new THREE.Vector3(0.3, -0.15, 0.0)
          ]),
          24, 0.006, 8, false
        ]} />
        <meshStandardMaterial color="#1a1a1a" roughness={1.0} metalness={0} />
      </mesh>

      <group position={[0, 0.08, 0]}>
        <mesh position={[0, 0.01, 0]}>
          <cylinderGeometry args={[0.018, 0.02, 0.02, 16]} />
          <meshStandardMaterial {...chromeMat} />
        </mesh>
        {[0, Math.PI/2, Math.PI, Math.PI*1.5].map((rot, i) => (
          <mesh key={i} position={[Math.cos(rot)*0.018, 0.01, Math.sin(rot)*0.018]}>
            <circleGeometry args={[0.004, 8]} />
            <meshBasicMaterial color="#000000" />
          </mesh>
        ))}
        <mesh castShadow position={[0, 0.1, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.18, 24]} />
          <meshStandardMaterial {...chromeMat} />
        </mesh>
        <mesh position={[0, 0.19, 0]}>
          <cylinderGeometry args={[0.018, 0.015, 0.01, 16, 1, true]} />
          <meshStandardMaterial {...chromeMat} side={THREE.DoubleSide} />
        </mesh>
        <mesh position={[0, 0.186, 0]}>
          <circleGeometry args={[0.014, 16]} rotation={[-Math.PI / 2, 0, 0]} />
          <meshBasicMaterial color="#000000" />
        </mesh>
      </group>

      {flameOn && (
        <group position={[0, 0.27, 0]}>
          <group ref={flameRef}>
            <mesh position={[0, 0.05, 0]}>
              <cylinderGeometry args={[0.002, 0.012, 0.10, 12, 8, true]} />
              <meshStandardMaterial color="#ff9800" transparent opacity={0.6} side={THREE.DoubleSide} 
                emissive="#ff5722" emissiveIntensity={2.5} />
            </mesh>
            <mesh position={[0, 0.04, 0]}>
              <cylinderGeometry args={[0.001, 0.008, 0.08, 12, 8, true]} />
              <meshStandardMaterial color="#ffeb3b" transparent opacity={0.8} side={THREE.DoubleSide}
                emissive="#ffeb3b" emissiveIntensity={4} />
            </mesh>
            <mesh position={[0, 0.015, 0]}>
              <cylinderGeometry args={[0.006, 0.012, 0.03, 12, 1, true]} />
              <meshStandardMaterial color="#00e5ff" transparent opacity={0.6} side={THREE.DoubleSide}
                emissive="#00e5ff" emissiveIntensity={1.5} />
            </mesh>
          </group>
          <pointLight color="#ff9800" intensity={4} distance={1.2} decay={2} castShadow />
          <pointLight color="#00e5ff" intensity={0.5} distance={0.3} position={[0, -0.01, 0]} />
        </group>
      )}
    </group>
  );
};

export default Burner;
