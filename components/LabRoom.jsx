import React from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

const LabRoom = () => {
  // Texture for the chalkboard diagram provided by the user
  const chalkboardTexture = useTexture('/biology_chalkboard.jpg');
  
  const wallColor = "#fcd5b5"; // Peach
  const floorColor = "#a0522d"; // Terracotta
  const woodColor = "#3e2723"; // Dark Wood
  const blueChairColor = "#1565c0"; // Office Chair Blue

  return (
    <group>
      {/* --- Environment: Floor & Ceiling --- */}
      <group>
        {/* Floor Tiles - 14x14 Symmetrical Floor */}
        <mesh receiveShadow position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[14, 14]} />
          <meshStandardMaterial color={floorColor} roughness={0.8} />
        </mesh>
        <gridHelper args={[14, 14, '#555555', '#7f8c8d']} position={[0, -0.04, 0]} />
      </group>

      {/* Ceiling - Symmetrical Ceiling */}
      <mesh receiveShadow position={[0, 4, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#fffbe6" roughness={1} />
      </mesh>

      {/* Ceiling Lights (Round Recessed) - Symmetrical Layout */}
      {[[-3, 3.98, -3], [3, 3.98, -3], [-3, 3.98, 3], [3, 3.98, 3]].map((pos, i) => (
        <group key={`light-${i}`} position={pos}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.5, 32]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <pointLight position={[0, -0.2, 0]} intensity={1.5} distance={15} />
        </group>
      ))}

      {/* --- Walls: Absolute Symmetrical Boundaries --- */}
      {/* Back Wall - Moved to -7 for equal spacing */}
      <mesh position={[0, 2, -7]}>
        <planeGeometry args={[14, 10]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      {/* Left Wall - Moved to -7 for equal spacing */}
      <mesh position={[-7, 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[14, 10]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      {/* Right Wall - Moved to 7 for equal spacing */}
      <mesh position={[7, 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[14, 10]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* --- Back Wall Elements (Centered) --- */}
      {/* Large Chalkboard with Diagram Texture */}
      <group position={[0, 2.3, -6.95]}>
        {/* Board Frame */}
        <mesh castShadow>
          <boxGeometry args={[4.5, 2.5, 0.1]} />
          <meshStandardMaterial color={woodColor} />
        </mesh>
        {/* Surface with Diagram Texture */}
        <mesh position={[0, 0, 0.051]}>
          <planeGeometry args={[4.2, 2.2]} />
          <meshStandardMaterial map={chalkboardTexture} roughness={0.8} />
        </mesh>
        {/* Chalk Tray */}
        <mesh position={[0, -1.3, 0.1]} castShadow>
          <boxGeometry args={[4.5, 0.05, 0.15]} />
          <meshStandardMaterial color={woodColor} />
        </mesh>
      </group>

      {/* Decorative Strip above board */}
      <group position={[0, 3.7, -6.95]}>
        <mesh>
          <boxGeometry args={[4.2, 0.4, 0.02]} />
          <meshStandardMaterial color="#e3f2fd" />
        </mesh>
        {/* Grid pattern on strip */}
        {[...Array(12)].map((_, i) => (
          <mesh key={`strip-${i}`} position={[-1.9 + i * 0.35, 0, 0.015]}>
            <boxGeometry args={[0.02, 0.3, 0.01]} />
            <meshBasicMaterial color="#90caf9" />
          </mesh>
        ))}
      </group>

      {/* Framed Picture on right of board */}
      <group position={[3.2, 2.8, -6.95]}>
        <mesh castShadow>
          <boxGeometry args={[0.6, 0.8, 0.05]} />
          <meshStandardMaterial color="#a1887f" />
        </mesh>
        <mesh position={[0, 0, 0.026]}>
          <planeGeometry args={[0.5, 0.7]} />
          <meshStandardMaterial color="#fff" />
        </mesh>
      </group>

      {/* --- Furniture: Office Desk (Moved to Back-Left Corner) --- */}
      <group position={[-5, 0, -5]} rotation={[0, 0, 0]}>
        {/* Desk Body */}
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.8, 0.8, 1.0]} />
          <meshStandardMaterial color={woodColor} />
        </mesh>
        {/* Desktop */}
        <mesh position={[0, 0.85, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.0, 0.1, 1.2]} />
          <meshStandardMaterial color={woodColor} />
        </mesh>
        
        {/* Blue Chair */}
        <group position={[0.5, 0, 1.0]} rotation={[0, 0, 0]}>
          {/* Base */}
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.05, 5]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.5]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          {/* Seat */}
          <mesh position={[0, 0.55, 0]} castShadow>
            <boxGeometry args={[0.5, 0.1, 0.5]} />
            <meshStandardMaterial color={blueChairColor} />
          </mesh>
          {/* Back */}
          <mesh position={[0, 0.9, -0.22]} rotation={[-0.1, 0, 0]} castShadow>
            <boxGeometry args={[0.5, 0.6, 0.1]} />
            <meshStandardMaterial color={blueChairColor} />
          </mesh>
        </group>
      </group>

      {/* --- Furniture: Absolute Centered Lab Bench (Main) --- */}
      <group position={[0, 0, 0]}>
        {/* Cabinet Body */}
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.0, 0.8, 1.6]} />
          <meshStandardMaterial color={woodColor} />
        </mesh>
        {/* Lab Top */}
        <mesh position={[0, 0.85, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.4, 0.1, 1.8]} />
          <meshStandardMaterial color={woodColor} />
        </mesh>
      </group>

      {/* --- Furniture: Large Bookshelf (Moved to Back-Right Corner) --- */}
      <group position={[5.5, 0, -5]} rotation={[0, 0, 0]}>
        {/* Back Panel */}
        <mesh position={[0, 1.5, -0.6]} castShadow receiveShadow>
          <boxGeometry args={[2.5, 3, 0.1]} />
          <meshStandardMaterial color="#8d6e63" />
        </mesh>
        {/* Side Panels */}
        <mesh position={[-1.25, 1.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.1, 3, 1.2]} />
          <meshStandardMaterial color={woodColor} />
        </mesh>
        <mesh position={[1.25, 1.5, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.1, 3, 1.2]} />
          <meshStandardMaterial color={woodColor} />
        </mesh>
        {/* Shelves */}
        {[0, 0.8, 1.6, 2.4].map((y, i) => (
          <mesh key={`shelf-${i}`} position={[0, y, 0]} castShadow receiveShadow>
            <boxGeometry args={[2.5, 0.05, 1.2]} />
            <meshStandardMaterial color={woodColor} />
          </mesh>
        ))}
        {/* Bottom Cabinet Doors */}
        <mesh position={[0, 0.4, 0.55]} castShadow>
          <boxGeometry args={[2.4, 0.75, 0.1]} />
          <meshStandardMaterial color={woodColor} />
        </mesh>
      </group>

      {/* --- Window & Blinds (Left Wall - Centered Z) --- */}
      <group position={[-6.95, 2.5, 0]} rotation={[0, Math.PI / 2, 0]}>
        {/* Window Frame */}
        <mesh castShadow>
          <boxGeometry args={[6.5, 4.5, 0.1]} />
          <meshStandardMaterial color="#fff" />
        </mesh>
        {/* Glass / Bright sky outside */}
        <mesh position={[0, 0, -0.051]}>
          <planeGeometry args={[6.2, 4.2]} />
          <meshBasicMaterial color="#e0f7fa" />
        </mesh>
        {/* Blinds (Horizontal slats) */}
        {[...Array(12)].map((_, i) => (
          <mesh key={`blind-${i}`} position={[0, 2 - i * 0.35, 0.2]} castShadow>
            <boxGeometry args={[6.2, 0.05, 0.3]} />
            <meshStandardMaterial color="#eeeeee" />
          </mesh>
        ))}
      </group>

      {/* --- Potted Plant (Left Front-ish Corner for Balance) --- */}
      <group position={[-5, 0, 5]}>
        {/* Pot */}
        <mesh position={[0, 0.3, 0]} castShadow>
          <cylinderGeometry args={[0.3, 0.2, 0.6, 16]} />
          <meshStandardMaterial color="#a0522d" />
        </mesh>
        {/* Plant (Slightly stylized large leaves) */}
        <group position={[0, 0.6, 0]}>
          {[...Array(6)].map((_, i) => (
            <mesh 
              key={`leaf-${i}`} 
              rotation={[0.5, (i * Math.PI) / 3, 0]} 
              position={[Math.cos((i * Math.PI) / 3) * 0.4, 0.5, Math.sin((i * Math.PI) / 3) * 0.4]}
              castShadow
            >
              <boxGeometry args={[0.1, 1.2, 0.4]} />
              <meshStandardMaterial color="#388e3c" side={THREE.DoubleSide} />
            </mesh>
          ))}
        </group>
      </group>

      {/* --- Wooden Door (Right Wall - Centered Z) --- */}
      <group position={[6.95, 1.5, 0]} rotation={[0, -Math.PI / 2, 0]}>
        {/* Door Frame */}
        <mesh castShadow>
          <boxGeometry args={[2.2, 3.2, 0.2]} />
          <meshStandardMaterial color="#5d4037" />
        </mesh>
        {/* Door surface */}
        <mesh position={[0, 0, 0.11]} castShadow>
          <boxGeometry args={[1.8, 2.9, 0.1]} />
          <meshStandardMaterial color={woodColor} />
        </mesh>
        {/* Doorknob */}
        <mesh position={[-0.7, 0, 0.18]} castShadow>
          <sphereGeometry args={[0.06]} />
          <meshStandardMaterial color="#ffd700" metalness={1} roughness={0.1} />
        </mesh>
      </group>

    </group>
  );
};

export default LabRoom;
