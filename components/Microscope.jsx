import React from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import useStore from '../lib/store';
import { useComponentInteraction } from '../lib/useComponentInteraction';
import Slide from './Slide';

const VibrantModernMicroscope = ({ position: initialPosition = [0, 1.0, -0.7] }) => {
  const { toggleMicroscope, slideOnMicroscope, heldTool, setHeldTool } = useStore();
  const nearMicroscopeStage = useStore(state => state.nearMicroscopeStage);
  const isHeld = heldTool === 'microscope';
  const groupRef = React.useRef();
  const leftClipRef = React.useRef();
  const rightClipRef = React.useRef();
  const { raycaster } = useThree();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.93);

  const lastHeldRef = React.useRef(isHeld);
  
  React.useEffect(() => {
    // If it was held and is now released (e.g. via HUD button)
    if (lastHeldRef.current && !isHeld && groupRef.current) {
        const pos = groupRef.current.position;
        useStore.getState().setSetupPosition('microscope', [pos.x, 1.0, pos.z]);
    }
    lastHeldRef.current = isHeld;
  }, [isHeld]);

  useFrame((state, delta) => {
    if (isHeld && groupRef.current) {
        const intersection = new THREE.Vector3();
        raycaster.ray.intersectPlane(plane, intersection);
        if (intersection) {
            intersection.x = Math.max(-2.0, Math.min(2.0, intersection.x));
            intersection.z = Math.max(-0.8, Math.min(0.8, intersection.z));
            groupRef.current.position.set(intersection.x, 1.0, intersection.z);
        }
    } else if (!isHeld && groupRef.current) {
        groupRef.current.position.set(...initialPosition);
    }

    // Clip Animation Logic
    // Clips stay open (lifted) if no slide is on microscope OR if the student is currently holding a slide
    const clipsShouldBeOpen = !slideOnMicroscope || heldTool === 'slide';
    const targetRotationX = clipsShouldBeOpen ? -0.3 : 0.02; // -0.3 is lifted, 0.02 is slightly pressing the slide
    
    // Smooth mechanical closing (approx 0.5s duration)
    const lerpSpeed = 3.5; 
    if (leftClipRef.current) {
        leftClipRef.current.rotation.x = THREE.MathUtils.lerp(leftClipRef.current.rotation.x, targetRotationX, lerpSpeed * delta);
    }
    if (rightClipRef.current) {
        rightClipRef.current.rotation.x = THREE.MathUtils.lerp(rightClipRef.current.rotation.x, targetRotationX, lerpSpeed * delta);
    }
  });

  const { onPointerDown, onContextMenu, isLocked } = useComponentInteraction('microscope', isHeld, {
    onDrop: () => {
      if (groupRef.current) {
        const pos = groupRef.current.position;
        useStore.getState().setSetupPosition('microscope', [pos.x, 1.0, pos.z]);
      }
      setHeldTool(null);
    }
  });

  const handleZoom = (e) => {
    e.stopPropagation();
    if (!heldTool || heldTool === 'microscope') {
      toggleMicroscope(true);
    }
  };

  const showHighlight = isHeld || isLocked;

  // Materials (Polished Silver & Black for a premium look)
  const polishedSilver = { color: "#bdc3c7", roughness: 0.25, metalness: 0.9 };
  const chromeSilver = { color: "#ffffff", roughness: 0.1, metalness: 1.0 };
  const deepBlack = { color: "#121212", roughness: 0.4, metalness: 0.1 };
  const glassMaterial = {
    color: "#e1f5fe",
    transparent: true,
    opacity: 0.4,
    roughness: 0,
    metalness: 0.1,
  };

  return (
    <group ref={groupRef} position={initialPosition} rotation={[0, 0, 0]}
      onPointerOver={() => { if (showHighlight) document.body.style.cursor = isHeld ? 'grabbing' : 'grab'; }}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      {/* Step Highlight Ring (Cyan for held, Gold for locked) */}
      {showHighlight && (
        <group position={[0, 0.25, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.22, 0.008, 16, 32]} />
            <meshBasicMaterial color={isLocked ? "#ffc107" : "#00e5ff"} transparent opacity={0.6} />
          </mesh>
        </group>
      )}

      {/* ─── PROFESSIONAL BASE ─── */}
      <group position={[0, 0.03, 0]} onPointerDown={onPointerDown} onContextMenu={onContextMenu}>
        {/* Main Base Plate (Indigo/Blue Body) */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.34, 0.08, 0.44]} />
          <meshStandardMaterial color="#283593" roughness={0.6} metalness={0.2} />
        </mesh>
        {/* Top Surface (Green Rubberized Inlay) */}
        <mesh position={[0, 0.041, 0]}>
          <boxGeometry args={[0.3, 0.002, 0.4]} />
          <meshStandardMaterial color="#66bb6a" roughness={1.0} />
        </mesh>
        {/* Chrome Bottom Trim */}
        <mesh position={[0, -0.04, 0]}>
          <boxGeometry args={[0.36, 0.02, 0.46]} />
          <meshStandardMaterial {...chromeSilver} />
        </mesh>

        {/* LED LIGHT SOURCE Assembly */}
        <group position={[0, 0.045, 0.05]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.04, 0.045, 0.02, 32]} />
            <meshStandardMaterial {...polishedSilver} />
          </mesh>
          <mesh position={[0, 0.011, 0]}>
            <cylinderGeometry args={[0.032, 0.032, 0.002, 32]} />
            <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={3} />
          </mesh>
          <pointLight color="#ffffff" intensity={0.5} distance={0.4} position={[0, 0.05, 0]} />
        </group>
        
        {/* Power / Light Control Knobs at Base Front */}
        <group position={[0, 0, 0.18]}>
           <mesh rotation={[Math.PI/2, 0, 0]} position={[0.1, 0, 0]}>
              <cylinderGeometry args={[0.015, 0.015, 0.01, 12]} />
              <meshStandardMaterial color="#333" />
           </mesh>
        </group>
      </group>

      {/* ─── PROFESSIONAL CHROME SILVER CURVED ARM ─── */}
      <group position={[0, 0.25, -0.16]} onPointerDown={onPointerDown} onContextMenu={onContextMenu}>
        {/* Main Vertical Support (Silver) */}
        <mesh castShadow position={[0, 0.05, 0]}>
          <boxGeometry args={[0.1, 0.5, 0.1]} />
          <meshStandardMaterial {...chromeSilver} />
        </mesh>
        {/* Curved Arm Segment (Upper C-shape - Silver) */}
        <mesh castShadow position={[0, 0.3, 0.1]} rotation={[-Math.PI / 4, 0, 0]}>
          <boxGeometry args={[0.1, 0.15, 0.15]} />
          <meshStandardMaterial {...chromeSilver} />
        </mesh>

        {/* LARGE DUAL-LAYER ADJUSTMENT KNOBS */}
        {[-0.06, 0.06].map((x, i) => (
          <group key={i} position={[x, -0.05, 0.05]} rotation={[0, 0, Math.PI / 2]}>
            {/* Coarse Adjustment (Large) */}
            <mesh castShadow>
              <cylinderGeometry args={[0.07, 0.07, 0.025, 32]} />
              <meshStandardMaterial {...polishedSilver} roughness={0.1} />
            </mesh>
            {/* Fine Adjustment (Small, Dark) */}
            <mesh position={[0, 0.015, 0]} castShadow>
              <cylinderGeometry args={[0.045, 0.045, 0.03, 32]} />
              <meshStandardMaterial {...deepBlack} roughness={0.5} />
            </mesh>
          </group>
        ))}
      </group>

      {/* ─── MECHANICAL STAGE ─── */}
      <group position={[0, 0.22, 0.05]} onPointerDown={onPointerDown} onContextMenu={onContextMenu}>
        {/* Main Black Stage Body */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.26, 0.02, 0.26]} />
          <meshStandardMaterial {...deepBlack} />
        </mesh>
        {/* Silver Edge Trim */}
        <mesh position={[0, 0, 0]}>
           <boxGeometry args={[0.27, 0.01, 0.27]} />
           <meshStandardMaterial {...polishedSilver} />
        </mesh>
        {/* Specimen Clips - Hinge placed further back for realistic motion */}
        <group ref={leftClipRef} position={[-0.07, 0.012, -0.03]} rotation={[-0.25, Math.PI/10, 0]}>
          <mesh position={[0, 0, 0.05]}>
            <boxGeometry args={[0.03, 0.005, 0.1]} />
            <meshStandardMaterial {...polishedSilver} />
          </mesh>
        </group>
        <group ref={rightClipRef} position={[0.07, 0.012, -0.03]} rotation={[-0.25, -Math.PI/10, 0]}>
          <mesh position={[0, 0, 0.05]}>
            <boxGeometry args={[0.03, 0.005, 0.1]} />
            <meshStandardMaterial {...polishedSilver} />
          </mesh>
        </group>
        {/* Light aperture hole */}
        <mesh position={[0, 0.012, 0]}>
           <cylinderGeometry args={[0.02, 0.02, 0.001, 32]} />
           <meshBasicMaterial color="#000000" />
        </mesh>

        {/* 🔬 ATTACHED SLIDE (Reparented for combined movement) */}
        {slideOnMicroscope && <Slide isAttached={true} />}

        {/* 🌟 PLACEMENT GLOW (Visual Guidance) */}
        {nearMicroscopeStage && !slideOnMicroscope && (
          <group position={[0, 0.013, 0]}>
            {/* Pulsing Outer Glow */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.07, 0.08, 32]} />
              <meshBasicMaterial color="#00e5ff" transparent opacity={0.4} />
            </mesh>
            {/* Inner "Landing Pad" Highlight */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <planeGeometry args={[0.15, 0.1]} />
              <meshBasicMaterial color="#00e5ff" transparent opacity={0.1} />
            </mesh>
          </group>
        )}
      </group>

      {/* ─── HIGH-FIDELITY OPTICAL ASSEMBLY ─── */}
      <group position={[0, 0.44, 0.05]} onClick={handleZoom}>
        {/* Main Optic Body (Polished Black) */}
        <mesh castShadow position={[0, 0, 0]}>
          <cylinderGeometry args={[0.048, 0.055, 0.18, 32]} />
          <meshStandardMaterial color="#0a0a0a" roughness={0.2} metalness={0.5} />
        </mesh>

        {/* Revolving Nosepiece (Chrome Tapered) */}
        <mesh castShadow position={[0, -0.07, 0]}>
          <cylinderGeometry args={[0.065, 0.09, 0.05, 32]} />
          <meshStandardMaterial {...polishedSilver} />
        </mesh>
        
        {/* COLOR-CODED OBJECTIVE LENSES */}
        {[
          { angle: 0, color: "#d32f2f", tag: "4x" },      // RED - low power
          { angle: Math.PI * 0.7, color: "#fbc02d", tag: "10x" },  // YELLOW - med
          { angle: Math.PI * 1.3, color: "#1976d2", tag: "40x" }   // BLUE - high
        ].map((obj, i) => (
          <group key={i} rotation={[0, obj.angle, 0]}>
            <mesh position={[0.055, -0.11, 0]} rotation={[0, 0, -Math.PI / 10]}>
              <cylinderGeometry args={[0.02, 0.016, 0.09, 16]} />
              <meshStandardMaterial {...polishedSilver} />
              {/* Color Identifier Ring */}
              <mesh position={[0, 0.01, 0]}>
                 <cylinderGeometry args={[0.021, 0.021, 0.01, 16]} />
                 <meshStandardMaterial color={obj.color} emissive={obj.color} emissiveIntensity={1} />
              </mesh>
            </mesh>
            {/* Optic Glass Tip */}
            <mesh position={[0.059, -0.155, 0]} rotation={[0, 0, -Math.PI / 10]}>
              <cylinderGeometry args={[0.012, 0.012, 0.002, 16]} />
              <meshStandardMaterial {...glassMaterial} color="#ffffff" />
            </mesh>
          </group>
        ))}

        {/* Monocular Body (Polished Black) */}
        <group position={[0, 0.13, 0]}>
          <mesh castShadow>
            <cylinderGeometry args={[0.035, 0.045, 0.12, 32]} />
            <meshStandardMaterial color="#0a0a0a" roughness={0.2} metalness={0.5} />
          </mesh>
          {/* Silver necking */}
          <mesh position={[0, -0.06, 0]}>
             <cylinderGeometry args={[0.046, 0.046, 0.01, 32]} />
             <meshStandardMaterial {...polishedSilver} />
          </mesh>

          {/* Eyepiece Assembly (Angled Professional Tube) */}
          <group position={[0, 0.1, 0]} rotation={[0.4, 0, 0]}>
            <mesh castShadow>
               <cylinderGeometry args={[0.038, 0.038, 0.14, 32]} />
               <meshStandardMaterial color="#0a0a0a" roughness={0.2} metalness={0.5} />
            </mesh>
            {/* Eyepiece Flare */}
            <mesh position={[0, 0.07, 0]}>
               <cylinderGeometry args={[0.042, 0.038, 0.01, 32]} />
               <meshStandardMaterial color="#0a0a0a" />
            </mesh>
            {/* Clear Optic Lens */}
            <mesh position={[0, 0.076, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.002, 24]} />
              <meshStandardMaterial {...glassMaterial} color="#ffffff" opacity={0.6} />
            </mesh>
          </group>
        </group>
      </group>
    </group>
  );
};

export default VibrantModernMicroscope;