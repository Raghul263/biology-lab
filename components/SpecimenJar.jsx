import React from 'react';
import * as THREE from 'three';

const SpecimenJar = ({ 
  position = [0, 0, 0], 
  size = { radius: 0.08, height: 0.2 }, 
  lidColor = "#212121", 
  specimenColor = "#8d6e63",
  specimenType = 'box'
}) => {
  return (
    <group position={position}>
      {/* ─── GLASS JAR BODY ─── */}
      <mesh castShadow receiveShadow position={[0, size.height / 2, 0]}>
        <cylinderGeometry args={[size.radius, size.radius, size.height, 16]} />
        <meshPhysicalMaterial 
          transparent 
          opacity={0.3} 
          transmission={0.9}
          thickness={0.05}
          roughness={0.1}
          ior={1.5}
          color="#ffffff"
        />
      </mesh>

      {/* ─── LID (Black or Blue) ─── */}
      <mesh position={[0, size.height + 0.005, 0]}>
        <cylinderGeometry args={[size.radius + 0.005, size.radius + 0.005, 0.02, 16]} />
        <meshStandardMaterial color={lidColor} roughness={0.8} />
      </mesh>

      {/* ─── PRESERVATION LIQUID ─── */}
      <mesh position={[0, size.height / 2.2, 0]}>
        <cylinderGeometry args={[size.radius - 0.005, size.radius - 0.005, size.height * 0.8, 16]} />
        <meshStandardMaterial color="#e0f2f1" transparent opacity={0.4} />
      </mesh>

      {/* ─── SPECIMEN (Bio-sample) ─── */}
      <group position={[0, size.height / 2.5, 0]} rotation={[Math.random(), Math.random(), 0]}>
        {specimenType === 'box' && (
          <mesh castShadow>
             <boxGeometry args={[size.radius * 0.6, size.height * 0.4, size.radius * 0.4]} />
             <meshStandardMaterial color={specimenColor} />
          </mesh>
        )}
        {specimenType === 'sphere' && (
          <mesh castShadow>
             <sphereGeometry args={[size.radius * 0.4]} />
             <meshStandardMaterial color={specimenColor} />
          </mesh>
        )}
        {specimenType === 'cone' && (
          <mesh castShadow>
             <coneGeometry args={[size.radius * 0.4, size.height * 0.5, 8]} />
             <meshStandardMaterial color={specimenColor} />
          </mesh>
        )}
      </group>
    </group>
  );
};

export default SpecimenJar;
