'use client';

import React, { Suspense, useEffect } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { OrbitControls, PerspectiveCamera, Environment } from '@react-three/drei';
import useStore from '../lib/store';

// UI Panels
import HUD from './HUD';
import LeftPanel from './LeftPanel';
import MicroscopeUI from './MicroscopeUI';

// 3D Components
import LabRoom from './LabRoom';
import Onion from './Onion';
import WatchGlass from './WatchGlass';
import Tile from './Tile';
import Forceps from './Forceps';
import Beaker from './Beaker';
import HCLBeaker from './HCLBeaker';
import StainBeaker from './StainBeaker';
import Scalpel from './Scalpel';
import CoverSlip from './CoverSlip';
import Dropper from './Dropper';
import Slide from './Slide';
import Microscope from './Microscope';
import Burner from './Burner';
import Needle from './Needle';
import FixativeVial from './FixativeVial';
import FilterPaper from './FilterPaper';

class ErrorBoundary extends React.Component {
  constructor(props) { super(props); this.state = { hasError: false }; }
  static getDerivedStateFromError(error) { return { hasError: true }; }
  componentDidCatch(error, errorInfo) {
    console.error("3D Scene Error:", error, errorInfo);
  }
  render() {
    if (this.state.hasError) return (
      <div style={{ padding: '40px', color: '#ff9800', textAlign: 'center', background: '#050a0f', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <h2>⚠️ 3D Rendering Error</h2>
        <p>Your browser or hardware might be unable to render the 3D laboratory. Please check if WebGL is enabled.</p>
      </div>
    );
    return this.props.children;
  }
}

function DropTarget() {
  const { camera, gl } = useThree();

  useEffect(() => {
    const handleDragOver = (e) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
    };

    const handleDrop = (e) => {
      e.preventDefault();
      const id = e.dataTransfer.getData('inst_id');
      if (!id) return;

      const rect = gl.domElement.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(new THREE.Vector2(x, y), camera);

      // Height of the table top is exactly 0.93
      const plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -0.93);
      const intersect = new THREE.Vector3();
      raycaster.ray.intersectPlane(plane, intersect);

      if (intersect) {
        // TABLE DIMENSIONS: 4.4 x 1.8 (X: -2.2 to 2.2, Z: -0.9 to 0.9)
        // Strict limits to prevent any overhanging:
        const tableLimitX = 1.8; 
        const tableLimitZ = 0.5; 
        
        const store = useStore.getState();

        // Check if the drop is within the strict safe zone
        if (Math.abs(intersect.x) <= 2.1 && Math.abs(intersect.z) <= 0.8) {
          // Snap to the innermost safe position
          const safeX = Math.max(-tableLimitX, Math.min(tableLimitX, intersect.x));
          const safeZ = Math.max(-tableLimitZ, Math.min(tableLimitZ, intersect.z));
          
          store.setSetupPosition(id, [safeX, 0.93, safeZ]);
          store.setPlaced(id, true);
        } else {
          // No response for wrong placement (strict constraints)
        }
      }
    };

    window.addEventListener('drop', handleDrop);
    window.addEventListener('dragover', handleDragOver);
    return () => {
      window.removeEventListener('drop', handleDrop);
      window.removeEventListener('dragover', handleDragOver);
    };
  }, [camera, gl]);

  return null;
}

function Scene() {
  const { microscopeZoomed, heldTool, placedComponents, setupPositions, slideOnMicroscope } = useStore();

  const getPos = (id, fallback) => setupPositions[id] || fallback;

  // All components render once placed (they stay visible throughout the experiment)
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 10, 5]} intensity={1.2} castShadow />
      <hemisphereLight skyColor="#ffffff" groundColor="#444444" intensity={0.5} />
      <Environment preset="city" intensity={0.6} />

      {!microscopeZoomed && (
        <PerspectiveCamera makeDefault position={[0, 3.0, 4.5]} fov={38} rotation={[-Math.PI / 6, 0, 0]} />
      )}

      <Suspense fallback={
        <group position={[0, 1.2, 0]}>
          <mesh>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color="#ff9800" emissive="#ff9800" emissiveIntensity={2} />
          </mesh>
          <pointLight color="#ff9800" intensity={2} distance={2} />
        </group>
      }>
        <group>
          <LabRoom />
          <DropTarget />

          {/* Three Beakers */}
          {placedComponents.waterBeaker && <Beaker position={getPos('waterBeaker', [-1.2, 0.93, -0.3])} />}
          {placedComponents.hclBeaker && <HCLBeaker position={getPos('hclBeaker', [-1.5, 0.93, -0.3])} />}
          {placedComponents.stainBeaker && <StainBeaker position={getPos('stainBeaker', [-1.5, 0.93, 0.1])} />}

          {/* Core Lab Items */}
          {placedComponents.onion && <Onion position={getPos('onion', [-0.5, 0.93, 0])} />}
          {placedComponents.tile && <Tile position={getPos('tile', [0, 0.93, 0.3])} />}
          {placedComponents.scalpel && <Scalpel position={getPos('scalpel', [0.4, 0.93, 0.5])} />}
          {placedComponents.forceps && <Forceps position={getPos('forceps', [0.6, 0.93, 0])} />}
          {placedComponents.needle && <Needle position={getPos('needle', [0.8, 0.93, 0.4])} />}
          {placedComponents.watchGlass && <WatchGlass position={getPos('watchGlass', [1.0, 0.93, -0.1])} />}
          {placedComponents.vial && <FixativeVial position={getPos('vial', [-0.8, 0.93, 0.4])} />}
          {placedComponents.dropper && <Dropper position={getPos('dropper', [-1.3, 0.93, 0.5])} />}
          {placedComponents.burner && <Burner position={getPos('burner', [1.4, 0.93, 0.3])} />}
          {placedComponents.slide && !slideOnMicroscope && <Slide position={getPos('slide', [0.2, 0.93, 0.5])} />}
          {placedComponents.coverSlip && <CoverSlip position={getPos('coverSlip', [0.5, 0.93, 0.6])} />}
          {placedComponents.filterPaper && <FilterPaper position={getPos('filterPaper', [-0.6, 0.93, 0.6])} />}
          {placedComponents.microscope && <Microscope position={getPos('microscope', [0, 1.0, -0.7])} />}
        </group>
      </Suspense>

      <OrbitControls
        enabled={!microscopeZoomed}
        enableRotate={!heldTool && !useStore.getState().cameraLocked}
        makeDefault
        minPolarAngle={Math.PI / 4}
        maxPolarAngle={Math.PI / 2.2}
        target={[0, 1.2, 0]}
        minDistance={1.5}
        maxDistance={6.0}
        minAzimuthAngle={-Math.PI / 2.1}
        maxAzimuthAngle={Math.PI / 2.1}
        enablePan={false}
      />
    </>
  );
}

export default function Simulation() {
  const { microscopeZoomed, setHeldTool } = useStore();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setHeldTool(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [setHeldTool]);

  return (
    <div style={{
      width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column',
      background: '#050a0f', overflow: 'hidden', fontFamily: '"Inter", system-ui, sans-serif',
    }}>
      {/* Top bar */}
      <div style={{
        height: '46px', minHeight: '46px', background: 'rgba(5, 15, 25, 0.96)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        display: 'flex', alignItems: 'center', paddingLeft: '20px', paddingRight: '20px',
        zIndex: 100, justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '20px' }}>🧬</span>
          <div>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'white', letterSpacing: '0.5px' }}>
              Virtual Biology Lab
            </span>
            <span style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginLeft: '10px' }}>
              Onion Root Tip — Mitosis Experiment
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{
            padding: '4px 12px', background: 'rgba(255,109,0,0.15)',
            border: '1px solid rgba(255,109,0,0.4)', borderRadius: '20px',
            fontSize: '11px', color: '#ff9800', fontWeight: 600,
          }}>
            🟢 SIMULATION ACTIVE
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.35)' }}>
            {new Date().toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}
          </div>
        </div>
      </div>

      {/* Main content area */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', minHeight: 0 }}>
        <LeftPanel />

        <div 
          style={{ flex: 1, position: 'relative', minWidth: 0 }}
          onContextMenu={(e) => e.preventDefault()}
        >
          <ErrorBoundary>
            <Canvas shadows>
              <Scene />
            </Canvas>
          </ErrorBoundary>

          <HUD />
          {microscopeZoomed && <MicroscopeUI />}
        </div>
      </div>
    </div>
  );
}
