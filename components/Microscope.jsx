import React from 'react';
import useStore, { STEPS } from '../lib/store';

const VibrantModernMicroscope = ({ position = [1.2, 0.93, 0] }) => {
  const { toggleMicroscope, currentStep, slideOnMicroscope } = useStore();

  const showHighlight = currentStep === STEPS.MICROSCOPE;

  const handleClick = () => {
    if (currentStep === STEPS.MICROSCOPE && slideOnMicroscope) {
      toggleMicroscope(true);
    }
  };

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
    <group position={position} rotation={[0, 0, 0]}
      onClick={handleClick}
      onPointerOver={() => { if (showHighlight && slideOnMicroscope) document.body.style.cursor = 'zoom-in'; }}
      onPointerOut={() => (document.body.style.cursor = 'auto')}
    >
      {/* Step Highlight Ring */}
      {showHighlight && (
        <group position={[0, 0.25, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.22, 0.008, 16, 32]} />
            <meshBasicMaterial color="#00e5ff" transparent opacity={0.6} />
          </mesh>
        </group>
      )}

      {/* ─── PROFESSIONAL BASE ─── */}
      <group position={[0, 0.03, 0]}>
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
      <group position={[0, 0.25, -0.16]}>
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
      <group position={[0, 0.22, 0.05]}>
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
        {/* Specimen Clips */}
        <mesh position={[-0.07, 0.012, 0.02]} rotation={[0, Math.PI/10, 0]}>
          <boxGeometry args={[0.03, 0.005, 0.1]} />
          <meshStandardMaterial {...polishedSilver} />
        </mesh>
        <mesh position={[0.07, 0.012, 0.02]} rotation={[0, -Math.PI/10, 0]}>
          <boxGeometry args={[0.03, 0.005, 0.1]} />
          <meshStandardMaterial {...polishedSilver} />
        </mesh>
        {/* Light aperture hole */}
        <mesh position={[0, 0.012, 0]}>
           <cylinderGeometry args={[0.02, 0.02, 0.001, 32]} />
           <meshBasicMaterial color="#000000" />
        </mesh>
      </group>

      {/* ─── HIGH-FIDELITY OPTICAL ASSEMBLY ─── */}
      <group position={[0, 0.44, 0.05]}>
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