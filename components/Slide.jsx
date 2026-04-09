import React, { useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import useStore from '../lib/store';
import * as THREE from 'three';

const Slide = ({ position: initialPosition = [0, 0.93, 0.2], isAttached = false }) => {
  const {
    rootOnSlide, slideHclApplied, slideStainApplied, slideWaterApplied, slideOnBurner, burnerOn, 
    slideHeated, slideHeatingProgress, paperOnSlide, cleaningProgress, stainRemoved,
    coverSlipPlaced, squashed, isSquashing, squashProgress,
    slideOnMicroscope, setStates, heldTool, setHeldTool
  } = useStore();

  const isHeld = heldTool === 'slide';
  const groupRef = useRef();
  const meshRef = useRef();
  const [unlockTime, setUnlockTime] = useState(0); 
  const { raycaster, clock } = useThree();
  const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.93);

  useFrame((state, delta) => {
    if (isAttached) {
        if (groupRef.current) groupRef.current.position.set(0, 0.012, 0);
        return;
    }

    if (unlockTime > 0) setUnlockTime(prev => Math.max(0, prev - delta));

    const pos = groupRef.current?.position;
    const burnerPos = useStore.getState().setupPositions['burner'] || [0.7, 0.93, 0];
    const isDirectlyOverBurner = pos && Math.abs(pos.x - burnerPos[0]) < 0.12 && Math.abs(pos.z - burnerPos[2]) < 0.12;
    const isNearFlame = isDirectlyOverBurner && burnerOn && !slideHeated;
    const isActiveHeating = isHeld && isNearFlame;

    // 🕒 FREE HEATING TIMER LOGIC
    if (isActiveHeating) {
      const newProgress = Math.min(100, (slideHeatingProgress || 0) + (delta * 12));
      setStates({ slideHeatingProgress: newProgress });
      
      // ✅ AUTO SNAP ON COMPLETION
      if (newProgress >= 100) {
        setStates({ slideHeated: true, slideOnBurner: true });
        useStore.getState().setSetupPosition('slide', [burnerPos[0], 1.35, burnerPos[2]]);
        setHeldTool(null);
      }
    }

    if (isHeld && groupRef.current) {
      const intersection = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersection);
      if (intersection) {
        let cx = Math.max(-2.0, Math.min(2.0, intersection.x));
        let cz = Math.max(-0.8, Math.min(0.8, intersection.z));
        let cy = 0.93;

        // 🔥 GHOSTING GUIDE (Snap to top height (Tripod Ring) when over burner)
        if (unlockTime <= 0 && isDirectlyOverBurner) {
            cx = burnerPos[0];
            cz = burnerPos[2];
            cy = 1.35;
        }

        groupRef.current.position.set(cx, cy, cz);
      }
    } else if (!isHeld && groupRef.current) {
        const { setupPositions } = useStore.getState();
        const p = setupPositions['slide'] || initialPosition;
        groupRef.current.position.set(...p);

        // 📳 HEATING VIBRATION
        const isVibrating = isActiveHeating || (slideOnBurner && burnerOn && !slideHeated);
        if (isVibrating && meshRef.current) {
          meshRef.current.position.x = (Math.random() - 0.5) * 0.0015;
          meshRef.current.position.z = (Math.random() - 0.5) * 0.0015;
        } else if (meshRef.current) {
          meshRef.current.position.set(0, 0, 0);
        }
    }
  });

  const handleInteraction = (e) => {
    if (heldTool !== 'dropper') {
        if (e && e.stopPropagation) e.stopPropagation();
    }
    
    // 🧬 RELEASE LOGIC (From Microscope Stage)
    if (slideOnMicroscope) {
        setStates({ slideOnMicroscope: false, microscopeActive: false });
        setHeldTool('slide');
        setUnlockTime(2.0); 
        return; 
    }

    // 🧬 Detach from Burner
    if (slideOnBurner) {
        setStates({ slideOnBurner: false });
        setHeldTool('slide');
        setUnlockTime(2.0);
        return; 
    }

    if (isHeld) {
      const pos = groupRef.current.position;
      const burnerPos = useStore.getState().setupPositions['burner'] || [0.7, 0.93, 0];
      const microPos = useStore.getState().setupPositions['microscope'] || [0, 1.0, -0.7];
      
      // 🔬 PLACE ON MICROSCOPE
      if (Math.abs(pos.x - microPos[0]) < 0.25 && Math.abs(pos.z - microPos[2]) < 0.3) {
        setStates({ slideOnMicroscope: true });
        useStore.getState().setSetupPosition('slide', [microPos[0], 1.0 + 0.1, microPos[1] + 0.08]);
      } else if (Math.abs(pos.x - burnerPos[0]) < 0.2 && Math.abs(pos.z - burnerPos[2]) < 0.2) {
        const isActuallyOnTop = Math.abs(pos.x - burnerPos[0]) < 0.12 && Math.abs(pos.z - burnerPos[2]) < 0.12;
        if (isActuallyOnTop) {
           setStates({ slideOnBurner: true });
           useStore.getState().setSetupPosition('slide', [burnerPos[0], 1.35, burnerPos[2]]);
        } else {
           useStore.getState().setSetupPosition('slide', [pos.x, 0.93, pos.z]);
        }
      } else {
        useStore.getState().setSetupPosition('slide', [pos.x, 0.93, pos.z]);
      }
      setHeldTool(null);
      return;
    }

    if (heldTool === 'forceps') {
      const { rootOnSlide, holdingRoot, setStates } = useStore.getState();
      if (holdingRoot && !rootOnSlide) {
        setStates({ rootOnSlide: true, holdingRoot: false });
      } else if (!holdingRoot && rootOnSlide) {
        setStates({ rootOnSlide: false, holdingRoot: true });
      }
    } else if (heldTool === 'filterPaper' && rootOnSlide && !paperOnSlide && !stainRemoved) {
      setStates({ paperOnSlide: true, isCleaning: true, cleaningProgress: 0 });
      setHeldTool(null);
    } else if (heldTool === 'needle' && coverSlipPlaced && !squashed) {
      setStates({ squashed: true });
      setHeldTool(null);
    } else if (!heldTool) {
      setHeldTool('slide');
      setUnlockTime(2.0); 
    }
  };

  const pos = groupRef.current?.position;
  const burnerPos = useStore.getState().setupPositions['burner'] || [0.7, 0.93, 0];
  const isNearFlame = pos && burnerOn && Math.abs(pos.x - burnerPos[0]) < 0.15 && Math.abs(pos.z - burnerPos[2]) < 0.15 && !slideHeated;
  const isActiveHeating = isHeld && isNearFlame;

  return (
    <group 
      ref={groupRef} 
      position={initialPosition}
      onPointerDown={handleInteraction}
      onPointerOver={() => {
        if (isHeld) document.body.style.cursor = 'grabbing';
        else if (squashed) document.body.style.cursor = 'move';
        else document.body.style.cursor = 'pointer';
        setStates({ hoveredComponent: 'slide' });
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
        setStates({ hoveredComponent: null });
      }}
    >
      <group ref={meshRef}>
        {/* 🟦 THE SLIDE BASE */}
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.4, 0.005, 0.15]} />
          <meshPhysicalMaterial 
            color="#ffffff" 
            transparent 
            transmission={1.0}
            thickness={0.05} 
            roughness={0.02} 
            ior={1.5} 
            clearcoat={1} 
            emissive={isActiveHeating || (slideOnBurner && burnerOn) ? "#ff3d00" : "#000000"} 
            emissiveIntensity={isActiveHeating || (slideOnBurner && burnerOn) ? 0.3 : 0}
          />
        </mesh>

        {/* ✅ HEATED Status Badge (Exact Image Match) */}
        {slideHeated && slideOnBurner && (
           <Html position={[0, 0.3, 0]} center pointerEvents="none" distanceFactor={2.5}>
             <div style={{
               display: 'flex', alignItems: 'center', gap: '12px',
               padding: '10px 24px', background: '#2e7d32', color: '#ffffff',
               fontSize: '22px', fontWeight: 800, borderRadius: '8px',
               boxShadow: '0 6px 15px rgba(0,0,0,0.5)', borderBottom: '4px solid #1b5e20',
               whiteSpace: 'nowrap', pointerEvents: 'none', userSelect: 'none',
               fontFamily: '"Inter", sans-serif'
             }}>
               <div style={{
                 width: '28px', height: '28px', background: 'rgba(255,255,255,0.2)',
                 borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center'
               }}>
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
                   <polyline points="20 6 9 17 4 12" />
                 </svg>
               </div>
               HEATED
             </div>
           </Html>
        )}

        {/* 💧 HCl Puddle */}
        {slideHclApplied && !stainRemoved && (
          <mesh position={[0, 0.003, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.055, 32]} />
            <meshPhysicalMaterial color="#81d4fa" transparent opacity={0.3 * (1 - (cleaningProgress || 0))} transmission={0.9} roughness={0.0} ior={1.33} 
              emissive={slideOnBurner && burnerOn ? "#ff3d00" : "#000000"}
              emissiveIntensity={slideOnBurner && burnerOn ? 0.5 : 0}
            />
          </mesh>
        )}

        {/* 💧 Water Puddle */}
        {slideWaterApplied && !stainRemoved && (
          <mesh position={[0, 0.0035, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.06, 32]} />
            <meshPhysicalMaterial color="#e1f5fe" transparent opacity={0.4 * (1 - (cleaningProgress || 0))} transmission={0.9} roughness={0.0} ior={1.33} />
          </mesh>
        )}

        {/* 🔴 Stain Puddle */}
        {slideStainApplied && !stainRemoved && (
          <mesh position={[0, 0.004, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.045, 32]} />
            <meshPhysicalMaterial color="#d32f2f" transparent opacity={0.7 * (1 - (cleaningProgress || 0))} transmission={0.5} roughness={0.1}
              emissive={slideOnBurner && burnerOn ? "#ff3d00" : "#000000"}
              emissiveIntensity={slideOnBurner && burnerOn ? 0.8 : 0}
            />
          </mesh>
        )}

        {/* 🧬 ONION ROOT TIP */}
        {rootOnSlide && (
          <group position={[0, 0.006, 0]}>
            <mesh 
              scale={squashed ? [3.0, 0.04, 3.0] : (isSquashing ? [1 + squashProgress * 2.0, 1 - squashProgress * 0.96, 1 + squashProgress * 2.0] : [1, 1, 1])}
              position={[0, (squashed || isSquashing) ? -0.001 : 0, 0]}
            >
              <cylinderGeometry args={[0.005, 0.006, 0.02, 16]} />
              <meshStandardMaterial 
                color={slideStainApplied ? "#ff1744" : "#f0e6c8"} 
                transparent={squashed || isSquashing}
                opacity={(squashed || isSquashing) ? 0.7 : 1.0}
                emissive={slideOnBurner && burnerOn ? "#ff3d00" : (slideStainApplied ? "#c62828" : "#000000")}
                emissiveIntensity={slideOnBurner && burnerOn ? 1.0 : (slideStainApplied ? 0.2 : 0)}
              />
            </mesh>
          </group>
        )}
        
        {/* 🔲 COVER SLIP (ATTACHED) */}
        {coverSlipPlaced && (
          <mesh position={[0, squashed ? 0.005 : 0.008, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.12, 0.001, 0.12]} />
            <meshPhysicalMaterial color="#ffffff" transparent transmission={1.0} thickness={0.01} roughness={0.01} ior={1.5} />
          </mesh>
        )}

        {/* 🔘 UNIFIED HIT AREA (Covers Slide + Cover Slip) */}
        {!isAttached && (
          <mesh position={[0, 0.01, 0]} visible={false}>
            <boxGeometry args={[0.42, 0.03, 0.16]} />
          </mesh>
        )}

        {/* 🌫️ HEAT DISTORTION (Subtle Point Light) */}
        {slideOnBurner && burnerOn && (
           <pointLight position={[0, -0.05, 0]} color="#ffab91" intensity={1} distance={0.3} />
        )}

        {/* 🔥 TOP-SIDE HEAT ANIMATION (Only during active heating) */}
        {isActiveHeating && (
           <mesh position={[0, 0.008, 0]} rotation={[-Math.PI / 2, 0, 0]}>
             <circleGeometry args={[0.06, 16]} />
             <meshStandardMaterial 
                color="#ff9800" 
                transparent 
                opacity={0.3} 
                emissive="#ff3d00" 
                emissiveIntensity={1.5 + Math.sin(clock.elapsedTime * 15) * 0.5} 
             />
           </mesh>
        )}
 
      </group>
    </group>
  );
};

export default Slide;
