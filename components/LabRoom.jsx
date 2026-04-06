import React, { useMemo } from 'react';
import { useTexture } from '@react-three/drei';
import * as THREE from 'three';
import useStore from '../lib/store';
import SpecimenJar from './SpecimenJar';

// Helper for Framed Bio Posters
const BioPoster = ({ position, rotation, texture, scale = [1.2, 1.6] }) => (
  <group position={position} rotation={rotation}>
    <mesh castShadow>
      <boxGeometry args={[scale[0] + 0.1, scale[1] + 0.1, 0.05]} />
      <meshStandardMaterial color="#222" roughness={0.4} />
    </mesh>
    <mesh position={[0, 0, 0.03]}>
      <planeGeometry args={scale} />
      <meshStandardMaterial map={texture} roughness={0.5} transparent={true} />
    </mesh>
  </group>
);

const LabRoom = () => {
  const { heldTool, setHeldTool, setSetupPosition } = useStore();
  // Use try-catch or ensure these files exist
  const textures = useTexture({
    chalkboard: '/biology_chalkboard_final.png',
    cell: '/cell_poster.png',
    dna: '/dna_poster.png',
    mitosis: '/mitosis_poster.png',
    leftPoster: '/left_poster.png',
    rightPoster: '/right_poster.png',
    leftWall1: '/biology_image_4.png',
    leftWall2: '/biology_image_5.png',
  });
  
  const wallColor = "#fff3e0";
  const floorColor = "#eceff1";
  const woodColor = "#5d4037";
  const blueChairColor = "#1565c0";

  const shelfJarsData = useMemo(() => {
    const data = {};
    const shelfYPositions = [0, 0.8, 1.6, 2.4];
    shelfYPositions.forEach(yPos => {
      const row = [];
      const xStart = -1.0;
      const xEnd = 1.1;
      const xStep = 0.35;
      for (let x = xStart; x <= xEnd; x += xStep) {
        if (Math.random() > 0.1) {
           const heightType = Math.random() > 0.5 ? { radius: 0.08, height: 0.22 } : { radius: 0.1, height: 0.16 };
           row.push({
             id: `jar-${yPos}-${x}`,
             x: x, 
             z: 0,
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
      {/* 1. Floor & Ceiling */}
      <mesh receiveShadow position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color={floorColor} roughness={0.8} />
      </mesh>
      <gridHelper args={[14, 14, '#555555', '#7f8c8d']} position={[0, -0.04, 0]} />
      
      <mesh receiveShadow position={[0, 4, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[14, 14]} />
        <meshStandardMaterial color="#fffbe6" roughness={1} />
      </mesh>

      {/* 2. Walls */}
      <mesh position={[0, 2, -7]}>
        <planeGeometry args={[14, 10]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-7, 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[14, 10]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[7, 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[14, 10]} />
        <meshStandardMaterial color={wallColor} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* 3. Side Wall Posters */}
      <BioPoster position={[6.9, 2.5, -2]} rotation={[0, -Math.PI / 2, 0]} texture={textures.cell} scale={[1.8, 2.2]} />
      <BioPoster position={[6.9, 2.5, 1.8]} rotation={[0, -Math.PI / 2, 0]} texture={textures.dna} scale={[1.6, 2.0]} />
      
      {/* Left Wall Posters (Educational Sequence) */}
      <BioPoster position={[-6.9, 2.6, -5.5]} rotation={[0, Math.PI / 2, 0]} texture={textures.mitosis} scale={[1.4, 1.8]} />
      <BioPoster position={[-6.9, 2.5, -1.8]} rotation={[0, Math.PI / 2, 0]} texture={textures.leftWall1} scale={[1.6, 2.0]} />
      <BioPoster position={[-6.9, 2.5, 1.9]} rotation={[0, Math.PI / 2, 0]} texture={textures.leftWall2} scale={[1.6, 2.0]} />

      {/* 4. BACK WALL: Central Chalkboard & Side Posters */}
      <BioPoster position={[-3.8, 2.3, -6.8]} rotation={[0, 0, 0]} texture={textures.leftPoster} scale={[2.2, 2.8]} />
      <BioPoster position={[3.8, 2.3, -6.8]} rotation={[0, 0, 0]} texture={textures.rightPoster} scale={[2.2, 2.8]} />

      <group position={[0, 2.3, -6.9]}>
        <mesh castShadow>
          <boxGeometry args={[4.5, 2.5, 0.1]} />
          <meshStandardMaterial color={woodColor} />
        </mesh>
        <mesh position={[0, 0, 0.051]}>
          <planeGeometry args={[4.2, 2.2]} />
          <meshStandardMaterial map={textures.chalkboard} roughness={0.8} />
        </mesh>
        <mesh position={[0, -1.3, 0.1]} castShadow>
          <boxGeometry args={[4.5, 0.05, 0.15]} />
          <meshStandardMaterial color={woodColor} />
        </mesh>
      </group>

      {/* 5. Decorative Details */}
      <group position={[0, 3.7, -6.95]}>
        <mesh><boxGeometry args={[4.2, 0.4, 0.02]} /><meshStandardMaterial color="#e3f2fd" /></mesh>
        {[...Array(12)].map((_, i) => (
          <mesh key={`strip-${i}`} position={[-1.9 + i * 0.35, 0, 0.015]}><boxGeometry args={[0.02, 0.3, 0.01]} /><meshBasicMaterial color="#90caf9" /></mesh>
        ))}
      </group>

      {/* 6. Furniture: Lab Bench */}
      <group position={[0, 0, 0]}>
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow><boxGeometry args={[4.0, 0.8, 1.6]} /><meshStandardMaterial color={woodColor} /></mesh>
        <mesh 
          position={[0, 0.85, 0]} 
          castShadow receiveShadow
          onPointerDown={(e) => {
            if (heldTool) {
              e.stopPropagation();
              // Check if it's one of our repositionable items
              const repositionables = [
                'waterBeaker', 'hclBeaker', 'stainBeaker', 'onion', 'tile', 
                'scalpel', 'forceps', 'needle', 'watchGlass', 'vial', 
                'dropper', 'burner', 'slide', 'coverSlip', 'filterPaper', 'microscope'
              ];
              
              if (repositionables.includes(heldTool)) {
                // Determine the intersection point on the table surface
                const point = e.point;
                const store = useStore.getState();
                const setupPositions = store.setupPositions;
                
                // --- SPECIALIZED SNAPPING FOR ONION ---
                if (heldTool === 'onion') {
                    const tilePos = setupPositions['tile'] || [0, 0.93, 0.3];
                    const beakerPos = setupPositions['waterBeaker'] || [-1.2, 0.93, -0.3];
                    const wgPos = setupPositions['watchGlass'] || [1.0, 0.93, -0.1];

                    if (Math.abs(point.x - tilePos[0]) < 0.45 && Math.abs(point.z - tilePos[2]) < 0.45) {
                        store.setStates({ onionPlacedOn: 'tile' });
                        store.showWrongAction("Onion fixed to Cutting Tile");
                        setHeldTool(null);
                        return;
                    } else if (Math.abs(point.x - beakerPos[0]) < 0.4 && Math.abs(point.z - beakerPos[2]) < 0.4) {
                        store.setStates({ onionPlacedOn: 'waterBeaker' });
                        store.showWrongAction("Onion placed in Water Beaker");
                        setHeldTool(null);
                        return;
                    } else if (Math.abs(point.x - wgPos[0]) < 0.3 && Math.abs(point.z - wgPos[2]) < 0.3) {
                        store.setStates({ onionPlacedOn: 'watchGlass' });
                        store.showWrongAction("Onion placed on Watch Glass");
                        setHeldTool(null);
                        return;
                    } else {
                       store.setStates({ onionPlacedOn: null });
                    }
                }

                // Clamp within safe table bounds
                const safeX = Math.max(-2.1, Math.min(2.1, point.x));
                const safeZ = Math.max(-0.8, Math.min(0.8, point.z));
                const y = heldTool === 'microscope' ? 1.0 : 0.93;
                
                // FIXED: Use the exact click point for better feedback
                setSetupPosition(heldTool, [safeX, y, safeZ]);
                setHeldTool(null);
                return;
              }
            }
          }}
        >
          <boxGeometry args={[4.4, 0.1, 1.8]} />
          <meshStandardMaterial color={woodColor} />
        </mesh>
        <group position={[1.7, 0, -0.4]}>
          <mesh position={[0, 0.35, 0]} castShadow><cylinderGeometry args={[0.15, 0.15, 0.7, 16]} /><meshStandardMaterial color="#d32f2f" metalness={0.6} /></mesh>
          <mesh position={[0, 0.7, 0]}><sphereGeometry args={[0.15, 16, 16, 0, Math.PI*2, 0, Math.PI/2]} /><meshStandardMaterial color="#d32f2f" /></mesh>
        </group>
      </group>

      {/* 7. Furniture: Desk & Chair */}
      <group position={[-5, 0, -5]}>
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow><boxGeometry args={[1.8, 0.8, 1.0]} /><meshStandardMaterial color={woodColor} /></mesh>
        <mesh position={[0, 0.85, 0]} castShadow receiveShadow><boxGeometry args={[2.0, 0.1, 1.2]} /><meshStandardMaterial color={woodColor} /></mesh>
        {/* Improved Professional Lab Chair */}
        <group position={[0.4, 0, 0.8]} rotation={[0, Math.PI, 0]}>
          {/* 5-Star Base & Wheels */}
          <mesh position={[0, 0.05, 0]}>
            <cylinderGeometry args={[0.3, 0.3, 0.04, 32]} />
            <meshStandardMaterial color="#212121" />
          </mesh>
          {/* Gas Lift Mechanism */}
          <mesh position={[0, 0.25, 0]}>
            <cylinderGeometry args={[0.04, 0.04, 0.4, 16]} />
            <meshStandardMaterial color="#222" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Ergonomic Seat Cushion */}
          <mesh position={[0, 0.5, 0]} castShadow>
            <cylinderGeometry args={[0.26, 0.26, 0.1, 24]} />
            <meshStandardMaterial color={blueChairColor} roughness={0.6} />
          </mesh>
          {/* Curved Backrest Support */}
          <group position={[0, 0.85, -0.24]} rotation={[-0.1, 0, 0]}>
            <mesh castShadow>
              <boxGeometry args={[0.48, 0.58, 0.08]} />
              <meshStandardMaterial color={blueChairColor} roughness={0.6} />
            </mesh>
          </group>
          {/* Professional Armrests */}
          <mesh position={[-0.32, 0.65, 0]} castShadow>
            <boxGeometry args={[0.06, 0.2, 0.35]} />
            <meshStandardMaterial color="#212121" roughness={0.8} />
          </mesh>
          <mesh position={[0.32, 0.65, 0]} castShadow>
            <boxGeometry args={[0.06, 0.2, 0.35]} />
            <meshStandardMaterial color="#212121" roughness={0.8} />
          </mesh>
        </group>
      </group>

      {/* 8. Furniture: Bookshelf */}
      <group position={[5.5, 0, -5]}>
        <mesh position={[0, 1.5, -0.6]} castShadow receiveShadow><boxGeometry args={[2.5, 3, 0.1]} /><meshStandardMaterial color="#8d6e63" /></mesh>
        <mesh position={[-1.25, 1.5, 0]} castShadow receiveShadow><boxGeometry args={[0.1, 3, 1.2]} /><meshStandardMaterial color={woodColor} /></mesh>
        <mesh position={[1.25, 1.5, 0]} castShadow receiveShadow><boxGeometry args={[0.1, 3, 1.2]} /><meshStandardMaterial color={woodColor} /></mesh>
        {[0, 0.8, 1.6, 2.4].map((y, i) => (
          <group key={`shelf-content-${i}`}>
            <mesh position={[0, y, 0]} castShadow receiveShadow><boxGeometry args={[2.5, 0.05, 1.2]} /><meshStandardMaterial color={woodColor} /></mesh>
            <group position={[0, y, 0]}>{renderShelfJars(y)}</group>
          </group>
        ))}
      </group>
    </group>
  );
};

export default LabRoom;
