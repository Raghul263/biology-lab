import React, { useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';

import SpecimenJar from './SpecimenJar';

// Helper for Framed Bio Posters
const BioPoster = ({ position, rotation, texture, scale = [1.2, 1.6] }) => (
  <group position={position} rotation={rotation}>
    {/* Frame */}
    <mesh castShadow>
      <boxGeometry args={[scale[0] + 0.1, scale[1] + 0.1, 0.05]} />
      <meshStandardMaterial color="#222" roughness={0.4} />
    </mesh>
    {/* Texture Surface */}
    <mesh position={[0, 0, 0.026]}>
      <planeGeometry args={scale} />
      <meshStandardMaterial map={texture} roughness={0.5} transparent={true} />
    </mesh>
  </group>
);

const LabRoom = () => {
  // Textures for the lab decor
  const textures = useTexture({
    chalkboard: '/biology_chalkboard.jpg',
    cell: '/cell_poster.png',
    dna: '/dna_poster.png',
    mitosis: '/mitosis_poster.png'
  });
  
  const wallColor = "#fff3e0"; // Light Cream
  const floorColor = "#eceff1"; // Clean Light Laboratory Grey
  const woodColor = "#5d4037"; // Rich Walnut Wood Brown
  const blueChairColor = "#1565c0"; // Office Chair Blue

  // STABILIZE SHELF DATA (Single Straight Line Alignment)
  const shelfJarsData = useMemo(() => {
    const data = {};
    const shelfYPositions = [0, 0.8, 1.6, 2.4];
    
    shelfYPositions.forEach(yPos => {
      const row = [];
      const xStart = -1.0;
      const xEnd = 1.1;
      const xStep = 0.35; // Wider neat spacing for single line
      
      // Single straight line at the center of the shelf depth (z=0)
      for (let x = xStart; x <= xEnd; x += xStep) {
        // 90% occupancy for a full, professional look
        if (Math.random() > 0.1) {
           const heightType = Math.random() > 0.5 ? { radius: 0.08, height: 0.22 } : { radius: 0.1, height: 0.16 };
           row.push({
             id: `jar-${yPos}-${x}`,
             x: x, 
             z: 0, // Perfectly centered on shelf depth
             size: heightType,
             lidColor: Math.random() > 0.3 ? "#212121" : "#0d47a1",
             specimenColor: ['#8d6e63', '#dcdcdc', '#5d4037', '#795548'][Math.floor(Math.random() * 4)],
             specimenType: ['box', 'sphere', 'cone'][Math.floor(Math.random() * 3)]
           });
        }
      }
      data[yPos] = row;
    });
    return data;
  }, []);

  // Helper to render stabilized jars
  const renderShelfJars = (yPos) => {
    return shelfJarsData[yPos]?.map((jar) => (
      <SpecimenJar 
        key={jar.id}
        position={[jar.x, 0.025, jar.z]}
        size={jar.size}
        lidColor={jar.lidColor}
        specimenColor={jar.specimenColor}
        specimenType={jar.specimenType}
      />
    ));
  };

  return (
    <group>
      {/* ─── Previous environment code remains same ─── */}
      {/* ... keeping the floor, walls, board, etc. ... */}
      
      {/* (Code continues below with the actual cupboard integration) */}
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

      {/* --- ADDED BIOLOGY POSTERS --- */}
      {/* Right Wall (Scientific Visualization & Anatomy) */}
      <BioPoster 
        position={[6.9, 2.5, -2]} 
        rotation={[0, -Math.PI / 2, 0]} 
        texture={textures.cell} 
        scale={[1.8, 2.2]} 
      />
      <BioPoster 
        position={[6.9, 2.5, 1.8]} 
        rotation={[0, -Math.PI / 2, 0]} 
        texture={textures.dna} 
        scale={[1.6, 2.0]} 
      />

      {/* Left Wall (Experiment Reference Chart near desk) */}
      <BioPoster 
        position={[-6.9, 2.6, -5.5]} 
        rotation={[0, Math.PI / 2, 0]} 
        texture={textures.mitosis} 
        scale={[1.4, 1.8]} 
      />

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
          <meshStandardMaterial map={textures.chalkboard} roughness={0.8} />
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

        {/* MODERN MONITOR (The 'Proper' Screen) */}
        <group position={[0, 0.9, -0.4]}>
          {/* Stand */}
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.08, 0.1, 0.1, 16]} />
            <meshStandardMaterial color="#333" metalness={0.8} />
          </mesh>
          {/* Neck */}
          <mesh position={[0, 0.15, 0]}>
            <boxGeometry args={[0.04, 0.2, 0.02]} />
            <meshStandardMaterial color="#333" metalness={0.8} />
          </mesh>
          {/* Screen Body */}
          <mesh position={[0, 0.35, 0]} castShadow>
            <boxGeometry args={[0.8, 0.5, 0.05]} />
            <meshStandardMaterial color="#222" metalness={0.5} roughness={0.2} />
          </mesh>
          {/* Actual Screen surface */}
          <mesh position={[0, 0.35, 0.026]}>
            <planeGeometry args={[0.76, 0.46]} />
            <meshStandardMaterial color="#000" emissive="#1a237e" emissiveIntensity={0.2} roughness={0.1} />
          </mesh>
        </group>
        
        {/* Blue Chair (Corrected Direction) */}
        <group position={[0.4, 0, 0.8]} rotation={[0, Math.PI, 0]}>
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

        {/* --- Gas Cylinder (Under Table) --- */}
        <group position={[1.7, 0, -0.4]} rotation={[0, 0, 0]}>
          {/* Main Tank Body */}
          <mesh position={[0, 0.35, 0]} castShadow>
            <cylinderGeometry args={[0.15, 0.15, 0.7, 16]} />
            <meshStandardMaterial color="#d32f2f" metalness={0.6} roughness={0.4} />
          </mesh>
          {/* Top Dome */}
          <mesh position={[0, 0.7, 0]}>
            <sphereGeometry args={[0.15, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <meshStandardMaterial color="#d32f2f" metalness={0.6} roughness={0.4} />
          </mesh>
          {/* Regulator / Valve */}
          <group position={[0, 0.78, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.02, 0.02, 0.06, 8]} />
              <meshStandardMaterial color="#bdc3c7" metalness={0.9} roughness={0.1} />
            </mesh>
            <mesh position={[0, 0.03, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
              <cylinderGeometry args={[0.04, 0.04, 0.015, 12]} />
              <meshStandardMaterial color="#333" />
            </mesh>
          </group>
        </group>

        {/* --- Table Gas Hole (Port) --- */}
        <group position={[1.7, 0.895, 0.3]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
             <ringGeometry args={[0.015, 0.025, 16]} />
             <meshStandardMaterial color="#333333" metalness={0.8} />
          </mesh>
          <mesh position={[0, -0.01, 0]}>
             <cylinderGeometry args={[0.014, 0.014, 0.02, 16]} />
             <meshStandardMaterial color="#111" />
          </mesh>
        </group>
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
        {/* Shelves with Specimen Jars (All 4 levels filled) */}
        {[0, 0.8, 1.6, 2.4].map((y, i) => (
          <group key={`shelf-content-${i}`}>
            <mesh position={[0, y, 0]} castShadow receiveShadow>
              <boxGeometry args={[2.5, 0.05, 1.2]} />
              <meshStandardMaterial color={woodColor} />
            </mesh>
            {/* Populating every shelf with stabilized jars */}
            <group position={[0, y, 0]}>
              {renderShelfJars(y)}
            </group>
          </group>
        ))}
        
        {/* Top capping of the bookshelf */}
        <mesh position={[0, 3, 0]} castShadow receiveShadow>
           <boxGeometry args={[2.5, 0.05, 1.2]} />
           <meshStandardMaterial color={woodColor} />
        </mesh>
        
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
        {/* MODERN BLINDS (The 'Brown' Screen) */}
        <group position={[0, 0, 0.06]}>
          {/* Headrail (Top casing) */}
          <mesh position={[0, 2.2, 0]} castShadow>
            <boxGeometry args={[6.3, 0.15, 0.15]} />
            <meshStandardMaterial color="#5d4037" />
          </mesh>
          
          {/* Vertical Support Cords (Strings) */}
          {[-2.5, -1, 1, 2.5].map((x, i) => (
            <mesh key={`string-${i}`} position={[x, 0, 0.05]}>
              <cylinderGeometry args={[0.005, 0.005, 4.2, 8]} />
              <meshStandardMaterial color="#333333" />
            </mesh>
          ))}

          {/* Angled Slats (Slanted for realism - Brown) */}
          {[...Array(15)].map((_, i) => (
            <mesh 
              key={`blind-${i}`} 
              position={[0, 2.1 - i * 0.28, 0.05]} 
              rotation={[0.35, 0, 0]} 
              castShadow
            >
              <boxGeometry args={[6.2, 0.02, 0.25]} />
              <meshStandardMaterial color="#795548" roughness={0.6} />
            </mesh>
          ))}
        </group>
      </group>


      {/* (Potted Plant Removed) */}
      {/* (Laboratory Door Removed) */}

    </group>
  );
};

export default LabRoom;
