import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import useStore from '../lib/store';

/* ── Pink Onion Shell ──────────────── */
const OnionShell = ({ scale = 0.45, color = "#d81b60" }) => {
  const { points, lineGeometry } = React.useMemo(() => {
    const pts = [];
    const s = 0.5 * scale;
    pts.push(new THREE.Vector2(0, -0.02 * s));
    pts.push(new THREE.Vector2(0.12 * s, -0.01 * s));
    pts.push(new THREE.Vector2(0.32 * s, 0.04 * s));
    pts.push(new THREE.Vector2(0.46 * s, 0.18 * s)); 
    pts.push(new THREE.Vector2(0.36 * s, 0.32 * s));
    pts.push(new THREE.Vector2(0.20 * s, 0.44 * s));
    pts.push(new THREE.Vector2(0.08 * s, 0.58 * s));
    pts.push(new THREE.Vector2(0.04 * s, 0.82 * s));
    pts.push(new THREE.Vector2(0, 0.90 * s));
    const linePts = pts.map(p => new THREE.Vector3(p.x, p.y, 0));
    return { points: pts, lineGeometry: new THREE.BufferGeometry().setFromPoints(linePts) };
  }, [scale]);

  return (
    <group position={[0, 0.1, 0]}>
      <mesh castShadow receiveShadow>
        <latheGeometry args={[points, 32]} />
        <meshStandardMaterial color={color} roughness={0.65} metalness={0.1} emissive="#ad1457" emissiveIntensity={0.12} />
      </mesh>
      {[...Array(24)].map((_, i) => (
        <primitive key={i} object={new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({ color: '#880e4f', opacity: 0.3, transparent: true }))} rotation={[0, (i * Math.PI) / 12, 0]} />
      ))}
      <mesh position={[0, -0.02 * (0.5 * scale), 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.04 * (0.5 * scale), 16]} />
        <meshStandardMaterial color="#8d6e63" roughness={1} />
      </mesh>
    </group>
  );
};

/* ── Procedural Roots (Bezier splines) ───────────────── */
const RootTendril = ({ index, grownLevel, isCut }) => {
  const curve = React.useMemo(() => {
    // Generate stable pseudo-random values based on index to prevent jittering/shaking
    const seed1 = Math.sin(index * 43758.5453) * 0.5 + 0.5;
    const seed2 = Math.cos(index * 12.9898) * 0.5 + 0.5;

    const pts = [];
    // Limit root length to 0.08 max so it stays completely inside the beaker glass
    const baseLength = isCut ? 0.015 : (0.05 + seed1 * 0.02) * grownLevel;
    const angle = (index / 60) * Math.PI * 2;
    const radius = 0.005 + seed2 * 0.05; 
    
    pts.push(new THREE.Vector3(Math.cos(angle) * (radius * 0.4), 0, Math.sin(angle) * (radius * 0.4)));
    for (let j = 1; j <= 4; j++) {
      const p = j / 4;
      const swayIdx = p * 2 + index;
      pts.push(new THREE.Vector3(
        (Math.cos(angle) * radius * 0.6) + (Math.sin(swayIdx) * 0.005) * grownLevel,
        -baseLength * p,
        (Math.sin(angle) * radius * 0.6) + (Math.cos(swayIdx) * 0.005) * grownLevel
      ));
    }
    return new THREE.CatmullRomCurve3(pts);
  }, [index, grownLevel, isCut]);

  return (
    <mesh castShadow>
      <tubeGeometry args={[curve, 8, 0.005, 6, false]} />
      {/* Opaque bright material ensures it's perfectly visible through the transparent water/beaker */}
      <meshStandardMaterial color="#ffffff" roughness={0.8} metalness={0} />
    </mesh>
  );
};

/* ── Fresh Shoots ───────────────── */
const FreshShoot = ({ index, count }) => {
  const { points } = React.useMemo(() => {
    const pts = [];
    const h = 0.12 + Math.random() * 0.04;
    for (let i = 0; i <= 10; i++) {
        const t = i / 10;
        pts.push(new THREE.Vector2((0.008 * (1 - t * 0.95)) + 0.001, t * h));
    }
    return { points: pts };
  }, []);
  const angle = (index / count) * Math.PI * 2;
  const tilt = 0.08 + Math.random() * 0.05;
  return (
    <group rotation={[0, angle, 0]}>
      <group rotation={[tilt, 0, 0]} position={[0, 0, 0]}>
        <mesh castShadow>
          <latheGeometry args={[points, 12]} />
          <meshStandardMaterial color="#76ff03" roughness={0.5} emissive="#004400" emissiveIntensity={0.08} />
        </mesh>
      </group>
    </group>
  );
};

/* ── MAIN ONION (PHYSICS/FREE FLOW) ───────────────────────────────── */
const Onion = ({ position = [-0.35, 0.93, -0.2] }) => {
  const {
    heldTool, setHeldTool, onionPlacedOn, onionRootsState, setStates, setupPositions, showWrongAction, rootsRemovedFromOnion
  } = useStore();

  const isHeld = heldTool === 'onion';
  const meshRef = useRef();
  const targetPos = useRef(new THREE.Vector3(...position));
  const targetRot = useRef(new THREE.Euler(0, 0, 0));
  const { raycaster } = useThree();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.93);
  const lastPlacedTime = useRef(0);
  const prevPlacedOn = useRef(null);

  const [growthTimer, setGrowthTimer] = useState(0);

  // Fixed random positions for harvested roots to prevent jitter
  const harvestedRootSegments = React.useMemo(() => {
    return [...Array(5)].map((_, i) => ({
      pos: [(Math.random() - 0.5) * 0.22, 0.006, (Math.random() - 0.5) * 0.22],
      rot: [Math.random() * 0.2, Math.random() * Math.PI, Math.PI / 2 + (Math.random() - 0.5) * 0.2]
    }));
  }, []);

  // Position Lerping Contextually Based On Placement
  useFrame((state, delta) => {
    if (isHeld && meshRef.current) {
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);
      if (intersection) {
        intersection.x = Math.max(-2.0, Math.min(2.0, intersection.x));
        intersection.z = Math.max(-0.8, Math.min(0.8, intersection.z));
        
        // 🧲 MAGNETIC HOVER PREVIEW:
        const beakerPos = setupPositions['waterBeaker'] || [-1.2, 0.93, -0.3];
        const distToBeaker = Math.hypot(intersection.x - beakerPos[0], intersection.z - beakerPos[2]);
        
        if (distToBeaker < 0.25) { // Strict snap zone for alignment preview
          // STEP 1: Show alignment preview (hover state) high above the beaker
          targetPos.current.set(beakerPos[0], beakerPos[1] + 0.35, beakerPos[2]);
          targetRot.current.set(0, 0, 0);
        } else {
          // Free movement
          targetPos.current.set(intersection.x, 1.08, intersection.z); // Slightly higher for floating look
          targetRot.current.set(0, 0, 0); 
        }
      }
    } else {
      const tilePos = setupPositions['tile'] || [0, 0.93, 0.3];
      const beakerPos = setupPositions['waterBeaker'] || [-1.2, 0.93, -0.3];
      const wgPos = setupPositions['watchGlass'] || [1.0, 0.93, -0.1];

      if (onionPlacedOn === 'tile') {
        targetPos.current.set(tilePos[0], tilePos[1] + 0.05, tilePos[2]);
        targetRot.current.set(0, 0, Math.PI / 2); // Straight "0 to 0" horizontal angle
      } else if (onionPlacedOn === 'waterBeaker') {
        // MATCH PREVIEW HEIGHT
        targetPos.current.set(beakerPos[0], beakerPos[1] + 0.08, beakerPos[2]);
        targetRot.current.set(0, 0, 0); // Balance with toothpicks on beaker
      } else if (onionPlacedOn === 'watchGlass') {
        targetPos.current.set(wgPos[0], wgPos[1] + 0.05, wgPos[2]);
        targetRot.current.set(0, 0, Math.PI / 2); // Straight "0 to 0" horizontal angle
      } else {
         // Resting somewhere else unattached (on the table)
         const savedPos = setupPositions['onion'] || position;
         targetPos.current.set(savedPos[0], savedPos[1] + 0.05, savedPos[2]);
         targetRot.current.set(0, 0, 0);
      }
    }

    if (meshRef.current) {
      if (onionPlacedOn) {
        if (onionPlacedOn === 'waterBeaker') {
           // STEP 2: Smooth vertical drop animation into beaker
           meshRef.current.position.lerp(targetPos.current, 0.03); // slow vertical drop
           meshRef.current.quaternion.slerp(new THREE.Quaternion().setFromEuler(targetRot.current), 0.1);
           
           // WATER CONTACT CONDITION: check if bottom reached water surface
           const distToTarget = meshRef.current.position.distanceTo(targetPos.current);
           if (distToTarget < 0.015) {
               meshRef.current.position.copy(targetPos.current); // fix in place once reached
               if (!useStore.getState().onionBottomInWater) {
                   setStates({ onionInBeaker: true, onionBottomInWater: true });
               }
           }
        } else {
           // HARD LOCK: Direct positioning and rotation when fixed to tile or watch glass
           meshRef.current.position.copy(targetPos.current);
           meshRef.current.quaternion.setFromEuler(targetRot.current);
        }
      } else {
        // SMOOTH LERP: Only use smooth motion while dragging or resting on table
        meshRef.current.position.lerp(targetPos.current, 0.2);
        meshRef.current.quaternion.slerp(new THREE.Quaternion().setFromEuler(targetRot.current), 0.2);
      }
    }
    
    // Procedural Growth Logic
    const isReadyForGrowth = onionRootsState === 'DRY' || onionRootsState === 'CUT_DRY' || onionRootsState === 'CUT_FRESH';
    const currentRootGrowthStarted = useStore.getState().rootGrowthStarted;
    const currentRootGrowthCompleted = useStore.getState().rootGrowthCompleted;
    const isBottomInWater = useStore.getState().onionBottomInWater;

    // ROOT GROWTH TRIGGER
    if (onionPlacedOn === 'waterBeaker' && isReadyForGrowth && isBottomInWater) {
       if (!currentRootGrowthStarted) {
           setStates({ rootGrowthStarted: true });
       }
       
       // Smooth continuous growth over 6.5 seconds
       if (growthTimer > 6.5) {
           if (!currentRootGrowthCompleted) {
               setStates({ onionRootsState: 'GROWN', rootGrowthCompleted: true });
           }
       } else {
           setGrowthTimer(t => t + delta);
       }

       // Auto zoom to beaker during growth
       if (growthTimer > 0 && growthTimer <= 6.5) {
           // Higher zoom angle so the user still sees the table straight normally
           const zoomPos = new THREE.Vector3(targetPos.current.x, targetPos.current.y + 1.2, targetPos.current.z + 2.0);
           state.camera.position.lerp(zoomPos, 0.05);
           // Temporarily disable OrbitControls' fighting by overriding its target implicitly
       } else if (growthTimer > 6.5 && growthTimer < 7.5) {
           // Smoothly return toward default position [0, 3.0, 4.5] for 1 second after
           state.camera.position.lerp(new THREE.Vector3(0, 3.0, 4.5), 0.03);
           setGrowthTimer(t => t + delta);
       }
    } else {
       if (onionRootsState !== 'GROWN') {
          if (growthTimer !== 0) setGrowthTimer(0);
       }
    }

    // Track placement state changes for cooldown
    if (onionPlacedOn !== prevPlacedOn.current) {
       if (onionPlacedOn) lastPlacedTime.current = Date.now();
       prevPlacedOn.current = onionPlacedOn;
       
       if (onionPlacedOn !== 'waterBeaker' && useStore.getState().onionInBeaker) {
           setStates({ onionInBeaker: false, onionBottomInWater: false });
       }
    }

    // Handle Natural Cut Sequence timing
    const { isCutting, cutStartTime } = useStore.getState();
    if (isCutting && cutStartTime) {
       const t = (Date.now() - cutStartTime) / 400;
       if (t > 0.8) {
          if (onionPlacedOn === 'watchGlass') {
             setStates({ 
               onionRootsState: 'CUT_FRESH', 
               rootsInWatchGlass: true, 
               rootTipsInWatchGlass: true, 
               watchGlassRootCount: 8,
               isCutting: false, 
               cutStartTime: 0 
             });
             showWrongAction('Root tips collected in watch glass.');
          } else if (onionPlacedOn === 'tile') {
             setStates({ onionRootsState: 'CUT_DRY', isCutting: false, cutStartTime: 0 });
             showWrongAction('Dry roots cut on tile.');
          } else {
             // 🪵 CUT ON TABLE (FREE FLOW)
             if (onionRootsState === 'GROWN') {
                setStates({ 
                    onionRootsState: 'CUT_FRESH', 
                    watchGlassRootCount: 8, // Support picking up from "virtual" pile on table
                    isCutting: false, 
                    cutStartTime: 0 
                });
                showWrongAction('Roots cut on table.');
             } else {
                setStates({ isCutting: false, cutStartTime: 0 });
             }
          }
       }
    }
  });

  // SMART SWAPPING: Auto-drop if user picks up a different tool
  const prevHeld = useRef(heldTool);
  useEffect(() => {
    if (prevHeld.current === 'onion' && heldTool !== 'onion' && meshRef.current) {
      const pos = meshRef.current.position;
      // Only auto-save if NOT placed on something (otherwise snapping handles it)
      if (!onionPlacedOn) {
        useStore.getState().setSetupPosition('onion', [pos.x, 0.93, pos.z]);
      }
    }
    prevHeld.current = heldTool;
  }, [heldTool, onionPlacedOn]);

  const handleDrop = () => {
    const { setupPositions, placedComponents } = useStore.getState();
    const pos = meshRef.current.position;
    
    const tilePos = setupPositions['tile'] || [0, 0.93, 0.3];
    const beakerPos = setupPositions['waterBeaker'] || [-1.2, 0.93, -0.3];
    const wgPos = setupPositions['watchGlass'] || [1.0, 0.93, -0.1];

    // Find the single CLOSEST target to prevent overlapping magnetic zones
    const distToTile = placedComponents.tile ? Math.hypot(pos.x - tilePos[0], pos.z - tilePos[2]) : Infinity;
    const distToBeaker = placedComponents.waterBeaker ? Math.hypot(pos.x - beakerPos[0], pos.z - beakerPos[2]) : Infinity;
    const distToWG = placedComponents.watchGlass ? Math.hypot(pos.x - wgPos[0], pos.z - wgPos[2]) : Infinity;

    const SNAP_DIST = 0.25; // Strict condition: must be above beaker opening
    let closestTarget = null;
    let minDist = SNAP_DIST;

    if (distToTile < minDist) { closestTarget = 'tile'; minDist = distToTile; }
    if (distToBeaker < minDist) { closestTarget = 'waterBeaker'; minDist = distToBeaker; }
    if (distToWG < minDist) { closestTarget = 'watchGlass'; minDist = distToWG; }

    if (closestTarget === 'tile') {
      setStates({ onionPlacedOn: 'tile' });
    } else if (closestTarget === 'waterBeaker') {
      setStates({ onionPlacedOn: 'waterBeaker' });
    } else if (closestTarget === 'watchGlass') {
      setStates({ onionPlacedOn: 'watchGlass' });
    } else {
      setStates({ onionPlacedOn: null });
      useStore.getState().setSetupPosition('onion', [pos.x, 0.93, pos.z]);
    }
    setHeldTool(null);
  };

  const handlePointerDown = (e) => {
    e.stopPropagation();
    
    // ALLOW LEFT CLICK TO FIX/DROP ONION
    if (isHeld) {
      handleDrop();
      return;
    }

    // IF NOT HELD: 
    if (!heldTool) {
      // Pick up the onion freely (No permanent lock anymore)
      setHeldTool('onion');
    } else {
      // 🧠 SMART ZONE INTERACTION (ONLY enabled if NOT holding a primary tool action)
      const localPoint = meshRef.current.worldToLocal(e.point.clone());
      const isClickingBulb = localPoint.y < 0.05; 
      
      // OTHERWISE: Tool Action on roots
      if (heldTool === 'scalpel') {
        if (!isCut) {
          // ALLOW CUTTING ON TABLE, TILE, OR WATCHGLASS for better UX
          setStates({ isCutting: true, cutStartTime: Date.now() });
        }
      } else if (heldTool === 'forceps') {
        if (onionPlacedOn === 'tile' || onionPlacedOn === 'watchGlass') {
          if (!rootsRemovedFromOnion) {
            setStates({ holdingRoot: true, rootsRemovedFromOnion: true });
          }
        }
      }
    }
  };

  const handleContextMenu = (e) => {
    e.nativeEvent.preventDefault();
    e.stopPropagation();
    // Removed old right-click unlock logic. Onion moves purely by clicking and dragging now.
  };

  const getGrowthRatio = () => {
      if (onionRootsState === 'GROWN' || onionRootsState === 'CUT_FRESH') return 1.0;
      if (growthTimer > 0) {
          const progress = Math.min(growthTimer / 6.5, 1);
          return 0.6 + (progress * 0.4); // Smoothly grow from 0.6 to 1.0
      }
      return 0.6; 
  };

  const isCut = onionRootsState === 'CUT_DRY' || onionRootsState === 'CUT_FRESH';

   const tilePos = setupPositions['tile'] || [0, 0.93, 0.3];

   return (
    <>
      <group ref={meshRef} onPointerDown={handlePointerDown} onContextMenu={handleContextMenu}>
        {/* 🟢 INTERACTION ZONES */}
        {isHeld && (
          <mesh 
            position={[0, 0, 0]}
            onPointerDown={handlePointerDown}
            onPointerOver={() => { 
                document.body.style.cursor = 'cell'; 
                useStore.getState().setStates({ hoveredComponent: 'onion' });
            }}
            onPointerOut={() => {
                document.body.style.cursor = 'auto';
                useStore.getState().setStates({ hoveredComponent: null });
            }}
          >
            <planeGeometry args={[1.8, 1.8]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        )}

        {!isHeld && (
          <mesh 
            position={[0, 0.1, 0]}
            onPointerDown={handlePointerDown}
            onContextMenu={handleContextMenu}
          >
            <boxGeometry args={[0.25, 0.35, 0.25]} />
            <meshBasicMaterial transparent opacity={0} depthWrite={false} />
          </mesh>
        )}
        
        <group position={[0, -0.0955, 0]}>
        <OnionShell scale={0.45} />
        


        <group position={[0, 0.28, 0]}>
          {[...Array(4)].map((_, i) => <FreshShoot key={`shoot-${i}`} index={i} count={4} />)}
        </group>

        {/* Roots flow from base - HIDDEN if collected by Forceps */}
        {!rootsRemovedFromOnion && (
          <group position={[0, 0.0955, 0]}>
            {[...Array(80)].map((_, i) => (
              <RootTendril key={`root-${i}`} index={i} grownLevel={getGrowthRatio()} isCut={isCut} />
            ))}
          </group>
        )}
      </group>

      {/* Floating clock logic */}
      {growthTimer > 0 && growthTimer < 6.5 && (
         <group position={[0, 0.45, 0]}>
            <mesh position={[0, 0, -0.01]}>
              <planeGeometry args={[0.4, 0.15]} />
              <meshBasicMaterial color="#ff9800" opacity={0.8} transparent />
            </mesh>
            <Text 
              color="white" 
              fontSize={0.06} 
              maxWidth={0.4} 
              lineHeight={1} 
              letterSpacing={0.02} 
              textAlign="center" 
              anchorX="center" 
              anchorY="middle"
            >
              ⏱️ 3-6 Days
            </Text>
         </group>
      )}
      </group>

      {/* Detached Harvested Roots - remain physically on surface ONLY FOR DRY ROOTS */}
      {onionRootsState === 'CUT_DRY' && !rootsRemovedFromOnion && (
        <group position={[tilePos[0] - 0.1, tilePos[1], tilePos[2]]}>
          {harvestedRootSegments.map((segment, i) => (
            <mesh 
              key={`harvested-${i}`}
              position={segment.pos}
              rotation={segment.rot}
            >
              <cylinderGeometry args={[0.007, 0.007, 0.04, 8]} />
              <meshStandardMaterial color="#fffef0" roughness={0.3} />
            </mesh>
          ))}
        </group>
      )}
    </>
  );
};

export default Onion;