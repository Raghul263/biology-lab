import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import useStore, { STEPS } from '../lib/store';

/* ── Pink Onion Shell with Perfect Proportions ──────────────── */
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
    const lGeom = new THREE.BufferGeometry().setFromPoints(linePts);

    return { points: pts, lineGeometry: lGeom };
  }, [scale]);

  return (
    <group position={[0, 0.1, 0]}>
      <mesh castShadow receiveShadow>
        <latheGeometry args={[points, 32]} />
        <meshStandardMaterial 
          color={color} 
          roughness={0.65} 
          metalness={0.1}
          emissive="#ad1457" 
          emissiveIntensity={0.12} 
        />
      </mesh>

      {/* Subtle Striations */}
      {[...Array(24)].map((_, i) => (
        <primitive 
          key={i}
          object={new THREE.Line(lineGeometry, new THREE.LineBasicMaterial({ color: '#880e4f', opacity: 0.3, transparent: true }))}
          rotation={[0, (i * Math.PI) / 12, 0]}
        />
      ))}

      {/* Root Base Plug */}
      <mesh position={[0, -0.02 * (0.5 * scale), 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.04 * (0.5 * scale), 16]} />
        <meshStandardMaterial color="#8d6e63" roughness={1} />
      </mesh>
    </group>
  );
};

/* ── Root tendril (Compact short cluster) ───────────────── */
const RootTendril = ({ index }) => {
  const curve = React.useMemo(() => {
    const pts = [];
    const length = 0.12 + (Math.sin(index * 3) * 0.04);
    const angle = (index / 40) * Math.PI * 2;
    const radius = 0.005 + Math.random() * 0.025;
    pts.push(new THREE.Vector3(Math.cos(angle) * (radius * 0.5), 0, Math.sin(angle) * (radius * 0.5)));
    for (let j = 1; j <= 5; j++) {
      const p = j / 5;
      pts.push(new THREE.Vector3(
        (Math.cos(angle) * radius * 0.7) + (Math.sin(p * 2.5 + index) * 0.01),
        -length * p,
        (Math.sin(angle) * radius * 0.7) + (Math.cos(p * 2.5 + index) * 0.01)
      ));
    }
    return new THREE.CatmullRomCurve3(pts);
  }, [index]);
  return (
    <mesh castShadow>
      <tubeGeometry args={[curve, 6, 0.002, 4, false]} />
      <meshStandardMaterial color="#fffef0" roughness={1.0} metalness={0} />
    </mesh>
  );
};

/* ── Sharp Leaf Shoots (Tucked perfectly) ───────────────── */
const FreshShoot = ({ index, count }) => {
  const { points, height } = React.useMemo(() => {
    const pts = [];
    const h = 0.12 + Math.random() * 0.04;
    for (let i = 0; i <= 10; i++) {
        const t = i / 10;
        const radius = (0.008 * (1 - t * 0.95)) + 0.001; 
        pts.push(new THREE.Vector2(radius, t * h));
    }
    return { points: pts, height: h };
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

/* ── MAIN ONION COMPONENT ───────────────────────────────── */
const Onion = ({ position = [-0.35, 0.93, -0.2] }) => {
  const {
    currentStep, setStep, setStates, heldTool, setHeldTool, showWrongAction,
    onionOnTile, dryRootsCut, onionOnBeaker, rootsGrown, onionAtWatchGlass
  } = useStore();

  const isHeld = heldTool === 'onion';
  const [rootScale, setRootScale] = useState(0.5);
  const [showClock, setShowClock] = useState(false);
  const [clockDay, setClockDay] = useState(0);

  const targetPos = useRef(new THREE.Vector3(...position));
  const targetRot = useRef(new THREE.Euler(0, 0, 0));
  const meshRef = useRef();
  const { raycaster } = useThree();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.93);

  useFrame(() => {
    if (isHeld && meshRef.current) {
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);
      if (intersection) {
        targetPos.current.set(intersection.x, 0.96, intersection.z);
        targetRot.current.set(0, 0, 0);
      }
    }
    if (meshRef.current) {
      meshRef.current.position.lerp(targetPos.current, 0.11);
      const targetQuat = new THREE.Quaternion().setFromEuler(targetRot.current);
      meshRef.current.quaternion.slerp(targetQuat, 0.16);
    }
  });

  useEffect(() => {
    if (!meshRef.current) return;
    const { setupPositions } = useStore.getState();
    const tilePos = setupPositions['tile'] || [0, 0.93, 0.3];
    const beakerPos = setupPositions['waterBeaker'] || [-1.2, 0.93, -0.3];
    const wgPos = setupPositions['watchGlass'] || [1.0, 0.93, -0.1];

    if (onionOnTile && !isHeld) {
      targetPos.current.set(tilePos[0], tilePos[1] + 0.05, tilePos[2]);
      targetRot.current.set(0, 0, Math.PI / 2);
    } else if (onionOnBeaker && !onionAtWatchGlass && !isHeld) {
      targetPos.current.set(beakerPos[0], beakerPos[1] + 0.12, beakerPos[2]);
      targetRot.current.set(0, 0, 0);
    } else if (onionAtWatchGlass && !isHeld) {
      targetPos.current.set(wgPos[0], wgPos[1] + 0.05, wgPos[2]);
      targetRot.current.set(0, 0, Math.PI / 2);
    } else if (!isHeld) {
      targetPos.current.set(...position);
      targetRot.current.set(0, 0, 0);
    }
  }, [onionOnTile, onionOnBeaker, onionAtWatchGlass, position, isHeld]);

  // Root growth logic — only during ROOT_GROWTH step
  useEffect(() => {
    if (currentStep === STEPS.ROOT_GROWTH && onionOnBeaker && !rootsGrown) {
      setShowClock(true);
      setClockDay(0);
      let day = 0;
      const interval = setInterval(() => {
        day += 1;
        setClockDay(day);
        setRootScale(0.5 + day * 0.3);
        if (day >= 6) {
          clearInterval(interval);
          setShowClock(false);
          setStates({ rootsGrown: true });
          // Auto-advance to next step
          setTimeout(() => setStep(STEPS.CUT_FRESH_ROOTS), 800);
        }
      }, 800);
      return () => clearInterval(interval);
    }
  }, [currentStep, onionOnBeaker, rootsGrown]);

  const handlePointerDown = (e) => {
    e.stopPropagation();
    if (isHeld) {
      const { setupPositions } = useStore.getState();
      const pos = meshRef.current.position;
      
      const tilePos = setupPositions['tile'] || [0, 0.93, 0.3];
      const beakerPos = setupPositions['waterBeaker'] || [-1.2, 0.93, -0.3];
      const wgPos = setupPositions['watchGlass'] || [1.0, 0.93, -0.1];

      // Try placing on Tile — only during CUT_DRY_ROOTS
      if (Math.abs(pos.x - tilePos[0]) < 0.3 && Math.abs(pos.z - tilePos[2]) < 0.3) {
        if (currentStep === STEPS.CUT_DRY_ROOTS) {
          setStates({ onionOnTile: true, onionOnBeaker: false, onionAtWatchGlass: false });
          setHeldTool(null);
        } else {
          showWrongAction('Follow the procedure.');
          setHeldTool(null);
        }
      } 
      // Try placing in Beaker — only during ROOT_GROWTH
      else if (Math.abs(pos.x - beakerPos[0]) < 0.3 && Math.abs(pos.z - beakerPos[2]) < 0.3) {
        if (currentStep === STEPS.ROOT_GROWTH) {
          setStates({ onionOnBeaker: true, onionOnTile: false, onionAtWatchGlass: false });
          setHeldTool(null);
        } else {
          showWrongAction('Follow the procedure.');
          setHeldTool(null);
        }
      }
      // Try placing at Watch Glass — only during CUT_FRESH_ROOTS
      else if (Math.abs(pos.x - wgPos[0]) < 0.3 && Math.abs(pos.z - wgPos[2]) < 0.3) {
        if (currentStep === STEPS.CUT_FRESH_ROOTS) {
          setStates({ onionAtWatchGlass: true, onionOnTile: false, onionOnBeaker: false });
          setHeldTool(null);
        } else {
          showWrongAction('Follow the procedure.');
          setHeldTool(null);
        }
      }
      else {
        setHeldTool(null);
      }
    } else {
      // Can only pick up onion during relevant steps
      if (currentStep === STEPS.CUT_DRY_ROOTS || currentStep === STEPS.ROOT_GROWTH || currentStep === STEPS.CUT_FRESH_ROOTS) {
        setHeldTool('onion');
      }
    }
  };

  const handleCut = (e) => {
    e.stopPropagation();
    if (heldTool === 'scalpel') {
      if (currentStep === STEPS.CUT_DRY_ROOTS && onionOnTile && !dryRootsCut) {
        setStates({ dryRootsCut: true });
        setHeldTool(null);
        setRootScale(0.1);
        setStep(STEPS.ROOT_GROWTH);
      } else if (currentStep === STEPS.CUT_FRESH_ROOTS && onionAtWatchGlass && !useStore.getState().freshRootsCut && rootsGrown) {
        setStates({ freshRootsCut: true, rootsInWatchGlass: true });
        setHeldTool(null);
        setStep(STEPS.FIXATION);
      } else {
        showWrongAction('Follow the procedure.');
      }
    }
  };

  const s = 0.45;

  return (
    <group ref={meshRef} onPointerDown={handlePointerDown}>
      <group position={[0, -0.0955, 0]}>
        <OnionShell scale={s} color="#d81b60" />

        {/* Shoots positioned into the neck */}
        <group position={[0, 0.28, 0]}>
          {[...Array(4)].map((_, i) => (
            <FreshShoot key={`shoot-${i}`} index={i} count={4} />
          ))}
        </group>

        {/* Roots flush at base */}
        <group position={[0, 0.0955, 0]} scale={[1, rootScale, 1]}>
          {[...Array(40)].map((_, i) => (
            <RootTendril key={`root-${i}`} index={i} />
          ))}
        </group>
      </group>

      {/* Target Highlights */}
      {((currentStep === STEPS.CUT_DRY_ROOTS && !onionOnTile) ||
        (currentStep === STEPS.ROOT_GROWTH && !onionOnBeaker && dryRootsCut) ||
        (currentStep === STEPS.CUT_FRESH_ROOTS && !onionAtWatchGlass)) && !isHeld && (
        <group position={[0, 0.02, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.08, 0.005, 16, 32]} />
            <meshBasicMaterial color="#ff9800" transparent opacity={0.6} />
          </mesh>
        </group>
      )}

      {((currentStep === STEPS.CUT_DRY_ROOTS && onionOnTile && heldTool === 'scalpel') ||
       (currentStep === STEPS.CUT_FRESH_ROOTS && onionAtWatchGlass && heldTool === 'scalpel')) ? (
        <group position={[0, -0.01, 0]}>
          <mesh rotation={[-Math.PI / 2, 0, 0]} onClick={handleCut}>
            <torusGeometry args={[0.05, 0.004, 16, 32]} />
            <meshBasicMaterial color="#ff5252" transparent opacity={0.7} />
          </mesh>
        </group>
      ) : null}

      {showClock && (
        <group position={[0, 0.35, 0]}>
          <mesh>
             <boxGeometry args={[0.12, 0.06, 0.01]} />
             <meshBasicMaterial color="#000000" transparent opacity={0.8} />
          </mesh>
        </group>
      )}
    </group>
  );
};

export default Onion;