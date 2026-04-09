import React, { useState, useMemo, useEffect, useRef } from 'react';
import useStore from '../lib/store';

// ─── Mitosis Phase Data ──────────────────────────────────────────────────────
const PHASES = {
  Interphase: {
    name: 'Interphase', color: '#7c3aed',
    label: 'Interphase – chromosomes are thin and nucleus is clear',
    description: 'Cell in normal metabolic state. DNA is uncoiled as chromatin. Nucleus is clearly visible with a prominent nucleolus.',
    renderCell: (scale, stained) => (
      <div style={{ position: 'relative', width: `${60 * scale}px`, height: `${70 * scale}px` }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: stained ? 'rgba(180,0,30,0.18)' : 'rgba(200,230,255,0.3)', border: `${1.5 * scale}px solid ${stained ? '#c0392b' : '#90caf9'}` }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: `${28 * scale}px`, height: `${28 * scale}px`, borderRadius: '50%', background: stained ? 'rgba(80,0,120,0.6)' : 'rgba(60,100,200,0.4)', border: `${1 * scale}px solid ${stained ? '#7b1fa2' : '#1565c0'}` }} />
        <div style={{ position: 'absolute', top: '38%', left: '44%', width: `${7 * scale}px`, height: `${7 * scale}px`, borderRadius: '50%', background: stained ? '#d81b60' : '#42a5f5', opacity: 0.9 }} />
      </div>
    )
  },
  Prophase: {
    name: 'Prophase', color: '#c2185b',
    label: 'Prophase – chromatin condenses into visible chromosomes',
    description: 'Chromatin condenses into discrete chromosomes. Nuclear envelope begins breaking down.',
    renderCell: (scale, stained) => (
      <div style={{ position: 'relative', width: `${60 * scale}px`, height: `${70 * scale}px` }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: stained ? 'rgba(180,0,30,0.15)' : 'rgba(200,230,255,0.25)', border: `${1.5 * scale}px dashed ${stained ? '#c0392b' : '#90caf9'}` }} />
        {[0, 45, 90, 135].map((angle, i) => (
          <div key={i} style={{ position: 'absolute', top: '50%', left: '50%', width: `${18 * scale}px`, height: `${3 * scale}px`, background: stained ? '#880e4f' : '#283593', transform: `translate(-50%,-50%) rotate(${angle}deg)`, borderRadius: `${2 * scale}px`, opacity: 0.9 }} />
        ))}
      </div>
    )
  },
  Metaphase: {
    name: 'Metaphase', color: '#d32f2f',
    label: 'Metaphase – chromosomes aligned at center plate',
    description: 'Chromosomes align along the equatorial plate. Spindle fibers attach to centromeres.',
    renderCell: (scale, stained) => (
      <div style={{ position: 'relative', width: `${60 * scale}px`, height: `${70 * scale}px` }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: stained ? 'rgba(180,0,30,0.15)' : 'rgba(200,230,255,0.25)', border: `${1.5 * scale}px solid ${stained ? '#c0392b' : '#90caf9'}` }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', display: 'flex', flexDirection: 'column', gap: `${2 * scale}px` }}>
          {[...Array(4)].map((_, i) => <div key={i} style={{ width: `${24 * scale}px`, height: `${4 * scale}px`, background: stained ? '#c62828' : '#1a237e', borderRadius: `${1.5 * scale}px` }} />)}
        </div>
      </div>
    )
  },
  Anaphase: {
    name: 'Anaphase', color: '#e64a19',
    label: 'Anaphase – sister chromatids pulling to opposite poles',
    description: 'Centromeres split and sister chromatids are pulled toward opposite poles.',
    renderCell: (scale, stained) => (
      <div style={{ position: 'relative', width: `${60 * scale}px`, height: `${75 * scale}px` }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '45%', background: stained ? 'rgba(180,0,30,0.15)' : 'rgba(200,230,255,0.25)', border: `${1.5 * scale}px solid ${stained ? '#c0392b' : '#90caf9'}` }} />
        <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: `${3 * scale}px` }}>
          {[...Array(3)].map((_, i) => <div key={i} style={{ width: `${10 * scale}px`, height: `${3 * scale}px`, background: stained ? '#b71c1c' : '#283593', borderRadius: '1px', transform: `rotate(${15 - i * 8}deg)` }} />)}
        </div>
        <div style={{ position: 'absolute', bottom: '15%', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: `${3 * scale}px` }}>
          {[...Array(3)].map((_, i) => <div key={i} style={{ width: `${10 * scale}px`, height: `${3 * scale}px`, background: stained ? '#b71c1c' : '#283593', borderRadius: '1px', transform: `rotate(${-15 + i * 8}deg)` }} />)}
        </div>
      </div>
    )
  },
  Telophase: {
    name: 'Telophase', color: '#388e3c',
    label: 'Telophase – two new daughter nuclei forming',
    description: 'Nuclear envelopes reform. Chromosomes decondense. Cytokinesis begins.',
    renderCell: (scale, stained) => (
      <div style={{ position: 'relative', width: `${60 * scale}px`, height: `${80 * scale}px` }}>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '40%', background: stained ? 'rgba(180,0,30,0.1)' : 'rgba(200,230,255,0.2)', border: `${1.5 * scale}px solid ${stained ? '#c0392b' : '#90caf9'}` }} />
        <div style={{ position: 'absolute', top: '15%', left: '50%', transform: 'translateX(-50%)', width: `${24 * scale}px`, height: `${24 * scale}px`, borderRadius: '50%', background: stained ? 'rgba(80,0,120,0.5)' : 'rgba(60,100,200,0.35)', border: `${1 * scale}px solid ${stained ? '#7b1fa2' : '#1565c0'}` }} />
        <div style={{ position: 'absolute', bottom: '15%', left: '50%', transform: 'translateX(-50%)', width: `${24 * scale}px`, height: `${24 * scale}px`, borderRadius: '50%', background: stained ? 'rgba(80,0,120,0.5)' : 'rgba(60,100,200,0.35)', border: `${1 * scale}px solid ${stained ? '#7b1fa2' : '#1565c0'}` }} />
        <div style={{ position: 'absolute', top: '50%', left: '10%', right: '10%', height: `${1.5 * scale}px`, background: stained ? 'rgba(150,0,50,0.4)' : 'rgba(100,150,255,0.4)', transform: 'translateY(-50%)' }} />
      </div>
    )
  },
};

// ─── Zoom level config ────────────────────────────────────────────────────────
const ZOOM_CONFIG = {
  4:   { label: '4X',   multiplier: '4×',   desc: 'Overview – Root tissue architecture', cellCount: 0, scale: 0.45, imgKey: '4x'  },
  10:  { label: '10X',  multiplier: '10×',  desc: 'Low Power – Tissue differentiation', cellCount: 18, scale: 0.72, imgKey: '10x' },
  40:  { label: '40X',  multiplier: '40×',  desc: 'High Power – Cellular detail',       cellCount: 8, scale: 1.2, imgKey: '40x' },
  100: { label: '100X', multiplier: '100×', desc: 'Oil Immersion – Chromosome analysis',cellCount: 4, scale: 2.0, imgKey: '100x'},
};
const ZOOM_ORDER = [4, 10, 40, 100];

// ─── Rotary Lens Selector ─────────────────────────────────────────────────────
const LensRevolver = ({ currentZoom, onSwitch, isRotating }) => {
  const lenses = [
    { zoom: 4,   color: '#ef5350', label: '4×'   },
    { zoom: 10,  color: '#ffa726', label: '10×'  },
    { zoom: 40,  color: '#42a5f5', label: '40×'  },
    { zoom: 100, color: '#ab47bc', label: '100×' },
  ];
  const currentIdx = ZOOM_ORDER.indexOf(currentZoom);
  const angle = currentIdx * -90;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
      <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', fontWeight: 700 }}>OBJECTIVE</div>
      <div style={{
        position: 'relative', width: '88px', height: '88px',
        transition: isRotating ? 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)' : 'none',
        transform: `rotate(${angle}deg)`,
      }}>
        {/* Revolver disk */}
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'radial-gradient(circle, #2a2a2a 30%, #111 100%)', border: '3px solid #444', boxShadow: '0 4px 20px rgba(0,0,0,0.8), inset 0 2px 4px rgba(255,255,255,0.05)' }} />
        {lenses.map((lens, i) => {
          const lensAngle = i * 90;
          const rad = (lensAngle * Math.PI) / 180;
          const r = 28;
          const x = Math.sin(rad) * r;
          const y = -Math.cos(rad) * r;
          return (
            <div
              key={lens.zoom}
              onClick={() => onSwitch(lens.zoom)}
              style={{
                position: 'absolute', top: '50%', left: '50%',
                transform: `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) rotate(${-angle}deg)`,
                width: '22px', height: '22px', borderRadius: '50%',
                background: currentZoom === lens.zoom ? lens.color : '#333',
                border: `2px solid ${currentZoom === lens.zoom ? lens.color : '#555'}`,
                boxShadow: currentZoom === lens.zoom ? `0 0 8px ${lens.color}` : 'none',
                cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '6px', fontWeight: 900, color: '#fff',
                transition: 'all 0.3s ease', zIndex: 2,
              }}
            >
              {lens.label}
            </div>
          );
        })}
        {/* Center hub */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '16px', height: '16px', borderRadius: '50%', background: '#555', border: '2px solid #888', zIndex: 5 }} />
      </div>
      <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px' }}>CLICK TO ROTATE</div>
    </div>
  );
};

// ─── Rotary Knob ──────────────────────────────────────────────────────────────
const RotaryKnob = ({ label, value, onChange, min = 0, max = 1, color = '#00e5ff', size = 64 }) => {
  const angle = ((value - min) / (max - min)) * 270 - 135;
  const [dragging, setDragging] = useState(false);
  const startY = useRef(0);
  const startVal = useRef(value);

  const onMouseDown = (e) => { setDragging(true); startY.current = e.clientY; startVal.current = value; };
  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => {
      const delta = (startY.current - e.clientY) / 120;
      const next = Math.max(min, Math.min(max, startVal.current + delta * (max - min)));
      onChange(parseFloat(next.toFixed(3)));
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [dragging, min, max, onChange]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', userSelect: 'none' }}>
      <div
        onMouseDown={onMouseDown}
        style={{
          width: `${size}px`, height: `${size}px`, borderRadius: '50%',
          background: `radial-gradient(circle at 35% 35%, #3a3a3a, #111)`,
          border: `3px solid ${dragging ? color : '#333'}`,
          boxShadow: `0 4px 20px rgba(0,0,0,0.7), inset 0 2px 4px rgba(255,255,255,0.08), 0 0 ${dragging ? 12 : 0}px ${color}`,
          cursor: 'ns-resize', position: 'relative', transform: `rotate(${angle}deg)`,
          transition: dragging ? 'none' : 'box-shadow 0.2s ease',
        }}
      >
        {/* Indicator dot */}
        <div style={{ position: 'absolute', top: '8px', left: '50%', transform: 'translateX(-50%)', width: '5px', height: '5px', borderRadius: '50%', background: color, boxShadow: `0 0 6px ${color}` }} />
        {/* Grip lines */}
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{
            position: 'absolute', top: '50%', left: '50%', width: '70%', height: '1px',
            background: 'rgba(255,255,255,0.08)', transformOrigin: '0 0',
            transform: `translate(0, -50%) rotate(${i * 45}deg)`,
          }} />
        ))}
      </div>
      <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', fontWeight: 700 }}>{label}</div>
    </div>
  );
};

// ─── Vertical Rack (Fine / Coarse Focus) ─────────────────────────────────────
const FocusRack = ({ label, value, onChange, min = 0, max = 1, color = '#00e5ff' }) => {
  const pct = ((value - min) / (max - min)) * 100;
  const [dragging, setDragging] = useState(false);
  const trackRef = useRef();

  const calcValue = (clientY) => {
    const rect = trackRef.current.getBoundingClientRect();
    const raw = 1 - Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
    return min + raw * (max - min);
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => onChange(parseFloat(calcValue(e.clientY).toFixed(3)));
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [dragging]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', userSelect: 'none' }}>
      <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', fontWeight: 700 }}>{label}</div>
      <div
        ref={trackRef}
        onMouseDown={(e) => { setDragging(true); onChange(parseFloat(calcValue(e.clientY).toFixed(3))); }}
        style={{
          width: '22px', height: '100px', borderRadius: '11px',
          background: '#111', border: `2px solid ${dragging ? color : '#333'}`,
          position: 'relative', cursor: 'ns-resize',
          boxShadow: `inset 0 2px 8px rgba(0,0,0,0.8), 0 0 ${dragging ? 8 : 0}px ${color}`,
          transition: 'box-shadow 0.2s',
        }}
      >
        {/* Track fill */}
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: `${pct}%`, borderRadius: '11px', background: `linear-gradient(to top, ${color}55, transparent)`, transition: 'height 0.05s' }} />
        {/* Notch lines */}
        {[...Array(5)].map((_, i) => (
          <div key={i} style={{ position: 'absolute', left: '4px', right: '4px', top: `${i * 24 + 4}px`, height: '1px', background: 'rgba(255,255,255,0.06)' }} />
        ))}
        {/* Thumb */}
        <div style={{
          position: 'absolute', bottom: `calc(${pct}% - 10px)`, left: '50%', transform: 'translateX(-50%)',
          width: '18px', height: '18px', borderRadius: '50%',
          background: `radial-gradient(circle at 35% 35%, #555, #222)`,
          border: `2px solid ${color}`,
          boxShadow: `0 2px 6px rgba(0,0,0,0.6), 0 0 6px ${color}55`,
          transition: dragging ? 'none' : 'bottom 0.05s',
        }} />
      </div>
    </div>
  );
};

// ─── Light Diaphragm ─────────────────────────────────────────────────────────
const LightDial = ({ value, onChange }) => (
  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', userSelect: 'none' }}>
    <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.5)', letterSpacing: '2px', fontWeight: 700 }}>LIGHT</div>
    <div style={{ position: 'relative', width: '48px' }}>
      <input type="range" min="0.15" max="1" step="0.01" value={value} onChange={e => onChange(parseFloat(e.target.value))}
        style={{ width: '100px', height: '6px', cursor: 'pointer', accentColor: '#ffe082', writingMode: 'vertical-lr', direction: 'rtl', height: '90px', width: '22px' }}
      />
    </div>
    <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: `rgba(255,224,130,${value})`, boxShadow: `0 0 ${value * 20}px rgba(255,224,130,0.6)`, border: '2px solid #555', transition: 'all 0.2s' }} />
  </div>
);

// ─── Lens Axis Elevator (the barrel moves up/down on zoom change) ─────────────
const LensTube = ({ zoom, prevZoom }) => {
  const heights = { 4: 0, 10: 14, 40: 28, 100: 42 };
  const h = heights[zoom] ?? 0;
  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {/* Nose-piece tube */}
      <div style={{
        width: '14px', background: 'linear-gradient(to bottom, #888, #555)', borderRadius: '3px',
        height: `${40 + h}px`, transition: 'height 0.45s cubic-bezier(0.34,1.2,0.64,1)',
        boxShadow: 'inset -2px 0 4px rgba(0,0,0,0.5), 2px 0 4px rgba(0,0,0,0.3)',
      }} />
      {/* Current lens barrel */}
      <div style={{ width: '22px', height: '28px', background: 'linear-gradient(to bottom, #aaa, #666)', borderRadius: '2px 2px 8px 8px', boxShadow: '-2px 2px 8px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '4px' }}>
        <div style={{ fontSize: '6px', fontWeight: 900, color: '#000' }}>{ZOOM_CONFIG[zoom]?.label}</div>
      </div>
    </div>
  );
};

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
const MicroscopeUI = () => {
  const { toggleMicroscope, rootOnSlide, slideOnMicroscope, zoomLevel, microscopeActive, setStates, squashed, slideStainApplied } = useStore();

  const [focus, setFocus]         = useState(0.5);   // 0 = blurry, 1 = sharp
  const [coarse, setCoarse]       = useState(0.5);   // coarse focus knob
  const [light, setLight]         = useState(0.75);  // light intensity
  const [isRotating, setIsRotating] = useState(false);
  const [prevZoom, setPrevZoom]   = useState(zoomLevel);

  const zoomData = ZOOM_CONFIG[zoomLevel] || ZOOM_CONFIG[4];
  const stained  = !!slideStainApplied;

  // Combined focus = average of coarse + fine
  const effectiveFocus = (coarse + focus) / 2;
  const blurPx = Math.abs(effectiveFocus - 0.5) * 18;

  const cells = useMemo(() => {
    const keys = Object.keys(PHASES);
    return Array.from({ length: 80 }, (_, i) => ({ id: i, phase: keys[Math.floor(Math.random() * keys.length)] }));
  }, []);

  const glassTextures = useMemo(() =>
    Array.from({ length: 24 }).map(() => ({
      left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`,
      size: 0.5 + Math.random() * 2.5, opacity: 0.03 + Math.random() * 0.1,
    })), []);

  const selectedCellData = useStore(s => s.selectedCell);

  const handleZoomSwitch = (newZoom) => {
    if (newZoom === zoomLevel || isRotating) return;
    setIsRotating(true);
    setPrevZoom(zoomLevel);
    setTimeout(() => {
      setStates({ zoomLevel: newZoom, selectedCell: null });
      setIsRotating(false);
    }, 520);
  };

  const imgSrc = {
    4:   '/microscope/real_root_4x.png',
    10:  '/microscope/real_root_10x_sharp.png',
    40:  '/microscope/real_root_10x_sharp.png',
    100: '/microscope/real_root_100x.png',
  }[zoomLevel];

  if (!microscopeActive) return null;

  // ── Layout: split-screen (left = microscope controls, right = lens view) ──
  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'linear-gradient(135deg, #0a0a0f 0%, #0d0d1a 100%)',
      display: 'flex', alignItems: 'stretch',
      zIndex: 500, fontFamily: '"Outfit", "Inter", sans-serif', color: 'white',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes lensRotatePulse { 0%,100% { box-shadow: 0 0 0 3px rgba(0,229,255,0.3); } 50% { box-shadow: 0 0 0 8px rgba(0,229,255,0.1); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes lensFlicker { 0%,100% { opacity: 1; } 50% { opacity: 0.92; } }
        .anim-slide-up { animation: slideUp 0.4s ease; }
        input[type=range]::-webkit-slider-thumb { appearance: none; width: 14px; height: 14px; border-radius: 50%; background: #ffe082; cursor: pointer; box-shadow: 0 0 8px rgba(255,224,130,0.8); }
        input[type=range] { -webkit-appearance: none; appearance: none; background: transparent; }
        input[type=range]::-webkit-slider-runnable-track { background: rgba(255,255,255,0.12); border-radius: 3px; }
      `}</style>

      {/* ══════════ LEFT PANEL — Microscope Body & Controls ══════════ */}
      <div style={{
        width: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '24px 16px', borderRight: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.015)',
      }}>
        {/* Back button */}
        <button
          onClick={() => { setStates({ microscopeActive: false }); toggleMicroscope(false); }}
          style={{
            position: 'absolute', top: '20px', left: '20px',
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'white', padding: '8px 18px', borderRadius: '20px',
            fontSize: '10px', fontWeight: 900, letterSpacing: '2px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '8px',
          }}
          onMouseOver={e => e.currentTarget.style.borderColor = '#00e5ff'}
          onMouseOut={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'}
        >
          ← BACK TO LAB
        </button>

        {/* ── Microscope SVG / schematic body ── */}
        <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0px', marginBottom: '20px' }}>
          {/* Arm */}
          <div style={{ width: '10px', height: '90px', background: 'linear-gradient(to right, #888, #ccc, #888)', borderRadius: '5px', boxShadow: '2px 0 8px rgba(0,0,0,0.5)' }} />
          
          {/* Lens tube with elevator */}
          <LensTube zoom={zoomLevel} prevZoom={prevZoom} />

          {/* Stage platform */}
          <div style={{ width: '120px', height: '10px', background: 'linear-gradient(to bottom, #bbb, #777)', borderRadius: '3px', margin: '4px 0', boxShadow: '0 4px 12px rgba(0,0,0,0.6)' }} />
          
          {/* Base */}
          <div style={{ width: '90px', height: '20px', background: 'linear-gradient(to bottom, #777, #444)', borderRadius: '4px', boxShadow: '0 6px 20px rgba(0,0,0,0.7)' }} />
        </div>

        {/* ── CONTROLS PANEL ── */}
        <div style={{
          background: 'rgba(255,255,255,0.04)', borderRadius: '18px',
          border: '1px solid rgba(255,255,255,0.08)', padding: '18px 20px',
          display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap', justifyContent: 'center',
          boxShadow: '0 0 40px rgba(0,0,0,0.4)',
        }}>
          {/* Coarse Focus */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
            <RotaryKnob label="COARSE" value={coarse} onChange={setCoarse} size={58} color="#ff9800" />
          </div>

          {/* Fine Focus rack */}
          <FocusRack label="FINE" value={focus} onChange={setFocus} color="#00e5ff" />

          {/* Lens Revolver */}
          <LensRevolver currentZoom={zoomLevel} onSwitch={handleZoomSwitch} isRotating={isRotating} />

          {/* Light Diaphragm */}
          <LightDial value={light} onChange={setLight} />
        </div>

        {/* Zoom Label */}
        <div style={{ marginTop: '14px', padding: '6px 16px', background: 'rgba(0,229,255,0.08)', border: '1px solid rgba(0,229,255,0.25)', borderRadius: '20px', fontSize: '10px', color: '#00e5ff', fontWeight: 900, letterSpacing: '3px', textAlign: 'center' }}>
          {zoomData.multiplier} — {zoomData.desc}
        </div>

        {/* Phase info card */}
        <div style={{ marginTop: '14px', width: '90%', padding: '14px 18px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.07)', textAlign: 'center', minHeight: '70px', display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '6px' }}>
          {selectedCellData && zoomLevel >= 40 ? (
            <div className="anim-slide-up">
              <div style={{ display: 'inline-block', padding: '3px 12px', background: '#00e5ff', color: '#000', borderRadius: '12px', fontSize: '10px', fontWeight: 900, letterSpacing: '2px', marginBottom: '8px' }}>IDENTIFIED</div>
              <div style={{ fontSize: '18px', fontWeight: 900, color: '#00e5ff' }}>{PHASES[selectedCellData.phase]?.name.toUpperCase()}</div>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.5, marginTop: '4px' }}>{PHASES[selectedCellData.phase]?.label}</div>
            </div>
          ) : (
            <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: '11px', fontWeight: 700, letterSpacing: '2px' }}>
              {!rootOnSlide ? '🔭 Place specimen on stage' : zoomLevel < 40 ? '🔬 Switch to 40× or 100× to analyse cells' : 'Click a cell to identify phase'}
            </div>
          )}
        </div>
      </div>

      {/* ══════════ RIGHT PANEL — Optical Eyepiece View ══════════ */}
      <div style={{
        width: '50%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '24px',
        background: 'radial-gradient(ellipse at center, #0d0d1a 0%, #060608 100%)',
      }}>
        {/* Eyepiece label */}
        <div style={{ marginBottom: '16px', fontSize: '10px', color: 'rgba(255,255,255,0.35)', letterSpacing: '4px', fontWeight: 700 }}>EYEPIECE VIEW — {zoomData.multiplier} OBJECTIVE</div>

        {/* ── Circular Lens Viewport ── */}
        <div style={{
          position: 'relative', width: '440px', height: '440px',
          animation: isRotating ? 'lensRotatePulse 0.52s ease' : 'none',
        }}>
          {/* Outer housing ring */}
          <div style={{
            position: 'absolute', inset: '-14px', borderRadius: '50%',
            background: 'radial-gradient(circle, #333 60%, #111 100%)',
            border: '4px solid #555',
            boxShadow: '0 0 0 2px #222, 0 0 60px rgba(0,0,0,0.9), inset 0 4px 12px rgba(255,255,255,0.05)',
          }} />

          {/* Lens viewport */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: '50%', overflow: 'hidden',
            background: isRotating ? '#080810' : '#d8e8d0',
            transition: 'background 0.4s ease',
            boxShadow: 'inset 0 0 60px rgba(0,0,0,0.85)',
            filter: `brightness(${light})`,
            animation: isRotating ? 'lensFlicker 0.52s ease' : 'none',
          }}>

            {/* Rotating transition overlay */}
            {isRotating && (
              <div style={{ position: 'absolute', inset: 0, background: '#000', opacity: 0.85, zIndex: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '40px', height: '40px', border: '3px solid rgba(0,229,255,0.3)', borderTop: '3px solid #00e5ff', borderRadius: '50%', animation: 'spin 0.5s linear infinite' }} />
              </div>
            )}

            {/* Background microscope image — always visible */}
            {!isRotating && (
              <div style={{
                position: 'absolute', inset: 0, zIndex: 1,
                backgroundImage: `url('${imgSrc}')`,
                backgroundSize: 'cover', backgroundPosition: 'center',
                filter: `blur(${blurPx}px) contrast(1.15) saturate(${stained ? 1.6 : 1.1}) brightness(${rootOnSlide ? 1.0 : 0.55})`,
                transform: `scale(${
                  zoomLevel === 4   ? 1.05 :
                  zoomLevel === 10  ? 1.25 :
                  zoomLevel === 40  ? 2.8  :
                  /* 100x */          5.0
                })`,
                transition: 'transform 0.7s cubic-bezier(0.2,0.8,0.2,1), filter 0.4s ease',
                mixBlendMode: 'multiply',
              }} />
            )}

            {/* Dim overlay + hint when no specimen placed */}
            {!rootOnSlide && !isRotating && (
              <div style={{ position: 'absolute', inset: 0, zIndex: 6, display: 'flex', alignItems: 'flex-end', justifyContent: 'center', paddingBottom: '30px', background: 'rgba(0,0,0,0.18)', borderRadius: '50%' }}>
                <div style={{ padding: '4px 12px', background: 'rgba(0,0,0,0.55)', borderRadius: '12px', color: 'rgba(255,255,255,0.4)', fontSize: '9px', fontWeight: 700, letterSpacing: '2px' }}>NO SPECIMEN LOADED</div>
              </div>
            )}


            {/* Crosshair reticle */}
            {rootOnSlide && !isRotating && (
              <div style={{ position: 'absolute', inset: 0, zIndex: 8, pointerEvents: 'none' }}>
                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '1px', background: 'rgba(0,229,255,0.2)' }} />
                <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '1px', background: 'rgba(0,229,255,0.2)' }} />
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '30px', height: '30px', border: '1px solid rgba(0,229,255,0.35)', borderRadius: '50%' }} />
              </div>
            )}

            {/* Bokeh vignette (lens depth of field) */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%', pointerEvents: 'none', zIndex: 9,
              background: 'radial-gradient(circle, transparent 48%, rgba(0,0,0,0.75) 100%)',
            }} />

            {/* Glass reflections */}
            {glassTextures.map((t, i) => (
              <div key={i} style={{
                position: 'absolute', left: t.left, top: t.top,
                width: t.size, height: t.size, borderRadius: '50%',
                opacity: t.opacity, background: '#607d8b', pointerEvents: 'none', zIndex: 10,
              }} />
            ))}

            {/* Chromatic ring */}
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%', pointerEvents: 'none', zIndex: 11,
              border: '6px solid rgba(0,229,255,0.05)', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.6)',
            }} />
          </div>
        </div>

        {/* Zoom indicator strip */}
        <div style={{ marginTop: '20px', display: 'flex', gap: '8px' }}>
          {ZOOM_ORDER.map(z => (
            <button
              key={z}
              onClick={() => handleZoomSwitch(z)}
              disabled={isRotating}
              style={{
                padding: '6px 14px', borderRadius: '20px', fontSize: '10px', fontWeight: 900,
                cursor: isRotating ? 'not-allowed' : 'pointer', border: 'none',
                background: zoomLevel === z ? '#00e5ff' : 'rgba(255,255,255,0.07)',
                color: zoomLevel === z ? '#000' : 'rgba(255,255,255,0.55)',
                boxShadow: zoomLevel === z ? '0 0 14px rgba(0,229,255,0.5)' : 'none',
                transition: 'all 0.2s ease',
              }}
            >
              {ZOOM_CONFIG[z].label}
            </button>
          ))}
        </div>

        {/* Scale bar */}
        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center', gap: '8px', opacity: 0.4 }}>
          <div style={{ width: '60px', height: '2px', background: '#fff' }} />
          <span style={{ fontSize: '9px', letterSpacing: '2px' }}>
            {{ 4: '500µm', 10: '200µm', 40: '50µm', 100: '10µm' }[zoomLevel]}
          </span>
        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default MicroscopeUI;
