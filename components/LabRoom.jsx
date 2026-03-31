import React from 'react';
import { useTexture } from '@react-three/drei';

import * as THREE from 'three';

const LabRoom = () => {
  const tableTexture = useTexture('/light_oak_texture.png');
  tableTexture.wrapS = tableTexture.wrapT = THREE.RepeatWrapping;
  tableTexture.repeat.set(4, 2);

  
  const chalkboardTexture = useTexture('/biology_chalkboard.jpg');

  return (
    <group>
      {/* Floor */}
      <group>
        <mesh receiveShadow position={[0, -0.05, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[20, 20]} />
          <meshStandardMaterial color="#caced1" roughness={0.8} /> {/* Matte grey tile base */}
        </mesh>
      </group>

      
      {/* Floor Tiles (Simulated via Grid outline) */}
      <gridHelper args={[20, 20, '#555555', '#7f8c8d']} position={[0, -0.04, 0]} />

      {/* Ceiling */}
      <mesh receiveShadow position={[0, 4, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[20, 20]} />
        <meshStandardMaterial color="#ffffff" roughness={1} />
      </mesh>
      
      {/* Ceiling Lights (Strip Lighting) */}
      {[...Array(4)].map((_, i) => (
        <group key={`light-grp-${i}`} position={[-6 + i * 4, 3.9, 0]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.2, 0.05, 10]} />
            <meshBasicMaterial color="#ffffff" />
          </mesh>
          <pointLight position={[0, -0.2, 0]} intensity={1.5} distance={15} color="#ffffff" />
        </group>
      ))}


      {/* --- Main Center Island Bench --- */}
      <group>
        {/* Table Top (Walnut Wood) */}
        <mesh castShadow receiveShadow position={[0, 0.85, 0]}>

          <boxGeometry args={[5, 0.1, 1.5]} />
          <meshStandardMaterial color="#1a2a44" roughness={0.9} metalness={0.1} />
        </mesh>








        
        {/* Table Legs for a "Cleanup Workbench" look */}
        {[
          [-2.3, 0.425, 0.65], [2.3, 0.425, 0.65],
          [-2.3, 0.425, -0.65], [2.3, 0.425, -0.65]
        ].map((pos, i) => (
          <mesh key={`leg-${i}`} position={pos} castShadow receiveShadow>
            <boxGeometry args={[0.1, 0.85, 0.1]} />
            <meshStandardMaterial color="#3e2723" roughness={0.8} />
          </mesh>


        ))}

        {/* Support beam */}
        <mesh position={[0, 0.75, 0]} castShadow receiveShadow>
          <boxGeometry args={[4.6, 0.05, 0.05]} />
          <meshStandardMaterial color="#3e2723" roughness={0.8} />
        </mesh>

        {/* --- Lab Stools --- */}
        {[[-1.2, 0, 1.1], [1.2, 0, 1.1]].map((pos, i) => (
          <group key={`stool-${i}`} position={pos}>
            {/* Seat */}
            <mesh position={[0, 0.62, 0]} castShadow>
              <cylinderGeometry args={[0.2, 0.22, 0.05, 32]} />
              <meshStandardMaterial color="#3e2723" roughness={0.6} />
            </mesh>
            {/* Frame/Legs */}
            {[[-0.1, 0.3, 0.1], [0.1, 0.3, 0.1], [-0.1, 0.3, -0.1], [0.1, 0.3, -0.1]].map((legPos, j) => (
              <mesh key={`leg-${i}-${j}`} position={legPos}>
                <boxGeometry args={[0.03, 0.6, 0.03]} />
                <meshStandardMaterial color="#444" metalness={0.8} />
              </mesh>
            ))}
            {/* Base ring */}
            <mesh position={[0, 0.25, 0]} rotation={[Math.PI/2, 0, 0]}>
              <torusGeometry args={[0.15, 0.015, 16, 32]} />
              <meshStandardMaterial color="#444" metalness={0.8} />
            </mesh>
          </group>
        ))}

        {/* Experiment Tray removed as requested */}
      </group>



      {/* --- Educational Growth Card (The "Page") --- 
      <group position={[0.6, 0.93, 0.2]} rotation={[-Math.PI / 2, 0, 0.2]}>
        <mesh receiveShadow>
          <planeGeometry args={[0.4, 0.5]} />
          <meshStandardMaterial color="#f8f8f8" roughness={0.8} />
        </mesh>
        <group position={[0, 0, 0.001]}>
          <mesh position={[0, 0.1, 0]}>
            <planeGeometry args={[0.3, 0.3]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <group position={[0, 0.1, 0.001]}>
            <mesh position={[0, 0.05, 0]}>
              <circleGeometry args={[0.08, 32]} />
              <meshBasicMaterial color="#ad1457" />
            </mesh>
            {[...Array(12)].map((_, i) => (
              <mesh key={i} position={[0, -0.05, 0]} rotation={[0, 0, (Math.random() - 0.5) * 0.4]}>
                <boxGeometry args={[0.004, 0.2, 0.001]} />
                <meshBasicMaterial color="#999" />
              </mesh>
            ))}
          </group>
          <mesh position={[0, -0.15, 0]}>
            <planeGeometry args={[0.3, 0.05]} />
            <meshBasicMaterial color="#ddd" />
          </mesh>
        </group>
      </group>
      */}

      {/* --- Blackboard on the back wall --- */}
      <group position={[0, 2.2, -6.5]}>
        {/* Blackboard frame */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[4.2, 2.2, 0.08]} />
          <meshStandardMaterial color="#3e2723" roughness={0.9} />
        </mesh>
        {/* Blackboard surface */}
        <mesh position={[0, 0, 0.041]}>
          <boxGeometry args={[3.8, 1.8, 0.01]} />
          <meshStandardMaterial map={chalkboardTexture} roughness={0.9} />
        </mesh>
        {/* Chalk tray */}
        <mesh position={[0, -1.05, 0.1]} castShadow>
          <boxGeometry args={[3.8, 0.06, 0.12]} />
          <meshStandardMaterial color="#4e342e" roughness={0.9} />
        </mesh>
        {/* Chalk pieces */}
        <mesh position={[-0.5, -1.0, 0.13]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.08, 6]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.2, -1.0, 0.13]} rotation={[0, 0, 0.3]} castShadow>
          <cylinderGeometry args={[0.015, 0.015, 0.06, 6]} />
          <meshStandardMaterial color="#ffeb3b" />
        </mesh>
      </group>

      {/* --- Side Cabinets & Shelving --- */}

      {/* --- Wall Shelving (Right side example) --- */}
      {[1.8, 2.7].map((y, idx) => (
        <group key={`shelf-group-${idx}`} position={[9.6, y, 0]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.7, 0.05, 12]} />
            <meshStandardMaterial color="#dddddd" roughness={0.6} />
          </mesh>
          {/* Populating shelf with large Specimen Jars */}
          {[...Array(6)].map((_, i) => (
            <group key={`specimen-${idx}-${i}`} position={[0, 0.4, -5 + i * 2]}>
              {/* Glass Jar */}
              <mesh castShadow>
                <cylinderGeometry args={[0.25, 0.25, 0.7, 16]} />
                <meshPhysicalMaterial 
                  color="#ffffff" 
                  transmission={0.95} 
                  roughness={0.1} 
                  thickness={0.05} 
                  transparent 
                  opacity={0.4} 
                />
              </mesh>
              {/* Lid */}
              <mesh position={[0, 0.35, 0]}>
                <cylinderGeometry args={[0.26, 0.26, 0.05, 16]} />
                <meshStandardMaterial color="#333" roughness={0.5} />
              </mesh>
              {/* Procedural Specimen (Skeleton/Plant) */}
              <group position={[0, -0.1, 0]} scale={0.4}>
                {i % 2 === 0 ? (
                  /* Procedural Small Bone/Skeleton structure */
                  <group>
                    <mesh position={[0, 0.5, 0]}>
                      <sphereGeometry args={[0.2]} />
                      <meshStandardMaterial color="#eee" />
                    </mesh>
                    <mesh position={[0, 0, 0]}>
                      <cylinderGeometry args={[0.05, 0.05, 0.8]} />
                      <meshStandardMaterial color="#eee" />
                    </mesh>
                    <mesh position={[0, -0.4, 0]} rotation={[0,0,Math.PI/4]}>
                      <boxGeometry args={[0.8, 0.05, 0.05]} />
                      <meshStandardMaterial color="#eee" />
                    </mesh>
                  </group>
                ) : (
                  /* Procedural Plant/Branch */
                  <group>
                    <mesh position={[0, 0.2, 0]}>
                      <cylinderGeometry args={[0.02, 0.03, 1]} />
                      <meshStandardMaterial color="#4a3e2a" />
                    </mesh>
                    {[...Array(4)].map((_, j) => (
                      <mesh key={j} position={[0, 0.2, 0]} rotation={[0, j * Math.PI / 2, Math.PI / 4]}>
                        <planeGeometry args={[0.3, 0.5]} />
                        <meshStandardMaterial color="#2d5a27" side={THREE.DoubleSide} />
                      </mesh>
                    ))}
                  </group>
                )}
              </group>
            </group>
          ))}
        </group>
      ))}

      {/* --- Fume Hood (Left back corner placeholder) --- */}
      <group position={[-8, 0, -6]}>
        <mesh castShadow receiveShadow position={[0, 1.5, 0]}>
          <boxGeometry args={[2, 3, 1.5]} />
          <meshStandardMaterial color="#f5f5f5" />
        </mesh>
        <mesh position={[0, 1.5, 0.76]}>
           <boxGeometry args={[1.8, 1.2, 0.05]} />
           <meshPhysicalMaterial transparent opacity={0.3} transmission={0.9} color="#aaddff" />
        </mesh>
      </group>

      {/* --- Detailed Wall Cabinets (Back Wall) --- */}
      <group position={[0, 3.2, -9.6]}>
        {[...Array(6)].map((_, i) => (
          <group key={`upper-cab-${i}`} position={[-5 + i * 2, 0, 0]}>
            <mesh castShadow receiveShadow>
              <boxGeometry args={[1.9, 2, 0.8]} />
              <meshStandardMaterial color="#f0f0f0" roughness={0.7} />
            </mesh>
            {/* Frosted Glass Door */}
            <mesh position={[0, 0, 0.41]}>
              <planeGeometry args={[1.7, 1.8]} />
              <meshPhysicalMaterial color="#cceeff" transmission={0.8} opacity={0.6} transparent roughness={0.3} />
            </mesh>
            {/* Cabinet Handle */}
            <mesh position={[0.7, -0.6, 0.45]}>
              <boxGeometry args={[0.03, 0.3, 0.03]} />
              <meshStandardMaterial color="#555" metalness={0.8} />
            </mesh>
          </group>
        ))}
      </group>

      {/* --- Biology Posters (Back Wall) --- */}
      <group position={[-7.5, 2.5, -9.9]}>
        <mesh>
          <planeGeometry args={[1.5, 2]} />
          <meshStandardMaterial color="#fff" />
        </mesh>
        {/* Procedural Mitosis Diagram Outline */}
        <group position={[0, 0, 0.01]} scale={0.3}>
          <mesh>
            <torusGeometry args={[1, 0.05, 16, 64]} />
            <meshStandardMaterial color="#333" />
          </mesh>
          <mesh position={[0,0.3,0]} rotation={[0,0,Math.PI/4]}>
             <boxGeometry args={[1.5, 0.1, 0.01]} />
             <meshStandardMaterial color="#990000" />
          </mesh>
          <mesh position={[0,-0.3,0]} rotation={[0,0,-Math.PI/4]}>
             <boxGeometry args={[1.5, 0.1, 0.01]} />
             <meshStandardMaterial color="#000099" />
          </mesh>
        </group>
      </group>

      <group position={[7.5, 2.5, -9.9]}>
        <mesh>
          <planeGeometry args={[1.5, 2]} />
          <meshStandardMaterial color="#fff" />
        </mesh>
        {/* Procedural Cell Structure Outline */}
        <group position={[0, 0, 0.01]} scale={0.3}>
           <mesh rotation={[0,0,Math.PI/6]}>
             <boxGeometry args={[1.2, 1.2, 0.05]} />
             <meshStandardMaterial color="#333" wireframe />
           </mesh>
           <mesh>
             <sphereGeometry args={[0.3]} />
             <meshStandardMaterial color="#9C27B0" />
           </mesh>
        </group>
      </group>

      {/* --- Laboratory Sink & Faucet (Left Wall Bench) --- */}
      <group position={[-9, 0.9, -4]}>
        {/* Sink Basin */}
        <mesh position={[0, -0.2, 0]}>
          <boxGeometry args={[1.2, 0.4, 3]} />
          <meshStandardMaterial color="#222" roughness={0.5} />
        </mesh>
        <mesh position={[0.4, 0.01, 0]}>
          <boxGeometry args={[0.2, 0.01, 2.8]} />
          <meshStandardMaterial color="#333" />
        </mesh>
        
        {/* Chrome Gooseneck Faucet */}
        <group position={[0.2, 0.1, 0]}>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.03, 0.04, 0.6, 16]} />
            <meshStandardMaterial color="#ccc" metalness={0.9} roughness={0.1} />
          </mesh>
          <mesh position={[0.15, 0.6, 0]} rotation={[0, 0, Math.PI / 2]}>
            <torusGeometry args={[0.15, 0.03, 16, 32, Math.PI]} />
            <meshStandardMaterial color="#ccc" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      </group>

      {/* --- Gas Taps (Main Island) --- */}
      <group position={[1.5, 0.92, -0.4]}>
        <mesh position={[0, 0.15, 0]}>
          <cylinderGeometry args={[0.02, 0.03, 0.3]} />
          <meshStandardMaterial color="#111" metalness={0.5} />
        </mesh>
        {/* Tap nozzles */}
        <mesh position={[0, 0.3, 0.05]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.01, 0.015, 0.1]} />
          <meshStandardMaterial color="#111" />
        </mesh>
        <mesh position={[0, 0.3, -0.05]} rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.01, 0.015, 0.1]} />
          <meshStandardMaterial color="#111" />
        </mesh>
      </group>

      {/* --- Walls Forming a Full Room --- */}
      {/* Wall Colors: Updated to a lighter, neutral off-white/light-grey */}
      <mesh position={[0, 2, -10]}>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#f8f9fa" roughness={0.9} />
      </mesh>
      
      {/* Wall Tile Texture Pattern via Grid overlay on back wall */}
      <gridHelper args={[20, 40, '#e9ecef', '#e9ecef']} position={[0, 2, -9.99]} rotation={[Math.PI / 2, 0, 0]} />
      <mesh position={[0, 2, 10]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#f8f9fa" roughness={0.9} />
      </mesh>
      <mesh position={[-10, 2, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[20, 10]} />
        <meshStandardMaterial color="#f8f9fa" roughness={0.9} />
      </mesh>

      {/* --- Floor-to-Ceiling Wooden Windows on Right Wall --- */}
      <group position={[10, 2, 0]} rotation={[0, -Math.PI / 2, 0]}>
        {/* Main Wall surrounding windows (top/bottom/sides if needed) */}
        {/* We use multiple smaller planes to create the "hole" for the massive window */}
        <mesh position={[0, 4.5, 0]}> {/* Top header */}
          <planeGeometry args={[20, 1]} />
          <meshStandardMaterial color="#f8f9fa" roughness={0.9} />
        </mesh>
        <mesh position={[0, -2.5, 0]}> {/* Bottom sill */}
          <planeGeometry args={[20, 1]} />
          <meshStandardMaterial color="#f8f9fa" roughness={0.9} />
        </mesh>
        <mesh position={[-9, 1, 0]}> {/* Left pillar */}
          <planeGeometry args={[2, 6]} />
          <meshStandardMaterial color="#f8f9fa" roughness={0.9} />
        </mesh>
        <mesh position={[9, 1, 0]}> {/* Right pillar */}
          <planeGeometry args={[2, 6]} />
          <meshStandardMaterial color="#f8f9fa" roughness={0.9} />
        </mesh>

        {/* --- Window Assembly (Wood Finishes) --- */}
        <group position={[0, 1, 0.05]}>
          {/* Main Wooden Frame Boundary */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[16.2, 6.2, 0.15]} />
            <meshStandardMaterial color="#5c4033" roughness={0.8} /> {/* Dark wood */}
          </mesh>
          
          {/* Window Glass Pane */}
          <mesh position={[0, 0, -0.05]}>
            <planeGeometry args={[16, 6]} />
            {/* Bright sky blue, semi-transparent to simulate looking outside */}
            <meshPhysicalMaterial color="#87CEEB" transmission={0.95} opacity={0.6} transparent roughness={0.1} />
          </mesh>

          {/* Wooden Vertical Mullions (Dividing into 4 panels) */}
          <mesh position={[-4, 0, 0.02]}>
            <boxGeometry args={[0.15, 6, 0.18]} />
            <meshStandardMaterial color="#5c4033" roughness={0.8} />
          </mesh>
          <mesh position={[0, 0, 0.02]}>
            <boxGeometry args={[0.15, 6, 0.18]} />
            <meshStandardMaterial color="#5c4033" roughness={0.8} />
          </mesh>
          <mesh position={[4, 0, 0.02]}>
            <boxGeometry args={[0.15, 6, 0.18]} />
            <meshStandardMaterial color="#5c4033" roughness={0.8} />
          </mesh>

          {/* Wooden Horizontal Transom (Dividing top and bottom panes) */}
          <mesh position={[0, 1.5, 0.02]}>
            <boxGeometry args={[16, 0.15, 0.18]} />
            <meshStandardMaterial color="#5c4033" roughness={0.8} />
          </mesh>
        </group>
      </group>

    </group>
  );
};

export default LabRoom;
