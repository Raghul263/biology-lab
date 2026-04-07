import React, { useState, useMemo } from 'react';
import useStore from '../lib/store';

const PHASES = {
  Interphase: { name: 'Interphase', emoji: '🌑', color: '#1565c0', description: 'Cell is in its normal metabolic state. DNA is uncoiled as chromatin. The nucleus is clearly visible with a prominent nucleolus.' },
  Prophase: { name: 'Prophase', emoji: '🔵', color: '#1a237e', description: 'Chromatin condenses into discrete chromosomes. The nuclear envelope begins to break down. Spindle fibers start forming.' },
  Metaphase: { name: 'Metaphase', emoji: '🟢', color: '#1b5e20', description: 'Chromosomes align along the cell equatorial plate (metaphase plate). Spindle fibers attach to centromeres of each chromosome.' },
  Anaphase: { name: 'Anaphase', emoji: '🟠', color: '#bf360c', description: 'Centromeres split and sister chromatids are pulled toward opposite poles by shortening spindle fibers. The cell elongates.' },
  Telophase: { name: 'Telophase', emoji: '🔴', color: '#4a148c', description: 'Nuclear envelopes reform around each set of chromosomes. Chromosomes begin to decondense. Cytokinesis begins — the cell pinches into two daughter cells.' },
};

const OBJECTIVES = [
  { power: 4, label: '4x', color: '#d32f2f', description: 'Scanning Objective - Broad overview of the specimen.' },
  { power: 10, label: '10x', color: '#fbc02d', description: 'Low Power Objective - Localizing interesting areas.' },
  { power: 40, label: '40x', color: '#1976d2', description: 'High Power Objective - Detailed cellular observation.' },
];

const CellTile = ({ phase, isSelected, onClick, focus, scale }) => {
  const c = {
    Interphase: { cell: '#37474f', chr: '#546e7a' },
    Prophase: { cell: '#1a237e', chr: '#7986cb' },
    Metaphase: { cell: '#1b5e20', chr: '#66bb6a' },
    Anaphase: { cell: '#bf360c', chr: '#ff8a65' },
    Telophase: { cell: '#4a148c', chr: '#ce93d8' },
  }[phase];

  const blurAmount = Math.abs(focus - 0.5) * 15;

  return (
    <div onClick={onClick} style={{
      width: `${85 * scale}px`, height: `${85 * scale}px`, margin: `${8 * scale}px`,
      borderRadius: '35% 65% 50% 50%', background: c.cell, opacity: 0.7,
      border: isSelected ? '3px solid #ff9100' : '1px solid rgba(255,255,255,0.1)',
      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      filter: `blur(${blurAmount}px)`, transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      boxShadow: isSelected ? '0 0 20px #ff9100, inset 0 0 10px rgba(0,0,0,0.5)' : 'none',
      transform: isSelected ? 'scale(1.05)' : 'scale(1)',
    }}>
      <div style={{ color: c.chr, fontSize: `${28 * scale}px`, pointerEvents: 'none' }}>{PHASES[phase].emoji}</div>
    </div>
  );
};

const MicroscopeUI = () => {
  const { toggleMicroscope, squashed, rootProcessingState, rootOnSlide, slideFluids, slideOnMicroscope } = useStore();
  const [focus, setFocus] = useState(0.5);
  const [light, setLight] = useState(0.8);
  const [objectivePower, setObjectivePower] = useState(4);
  const [selectedCell, setSelectedCell] = useState(null);

  const activeObjective = OBJECTIVES.find(o => o.power === objectivePower);
  const totalMagnification = objectivePower * 10;
  
  // High-fidelity background textures to feel like a real glass slide
  const glassTextures = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      size: 1 + Math.random() * 3,
      opacity: 0.05 + Math.random() * 0.1,
      rotation: Math.random() * 360
    }));
  }, []);

  const [cells] = useState(() => {
    const arr = [];
    const keys = Object.keys(PHASES);
    for (let i = 0; i < 40; i++) {
      const phase = keys[Math.floor(Math.random() * keys.length)];
      arr.push({ id: i, phase });
    }
    return arr.sort(() => Math.random() - 0.5);
  });

  const cellsToRender = useMemo(() => {
    if (objectivePower === 4) return cells.slice(0, 8);
    if (objectivePower === 10) return cells.slice(0, 18);
    return cells;
  }, [objectivePower, cells]);

  const cellScale = useMemo(() => {
    if (objectivePower === 4) return 0.4;
    if (objectivePower === 10) return 0.7;
    return 1.2;
  }, [objectivePower]);

  const hasStain = slideFluids.includes('STAIN');
  const bgColor =hasStain ? 'rgba(74, 20, 140, 0.1)' : 'rgba(255, 255, 255, 0.02)';

  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'rgba(5,7,12,0.98)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      zIndex: 200, fontFamily: '"Outfit", sans-serif', color: 'white',
      backdropFilter: 'blur(20px)'
    }}>
      {/* 🟢 TOP CONTROL BAR */}
      <div style={{ position: 'absolute', top: '30px', left: '30px', display: 'flex', gap: '20px', alignItems: 'center' }}>
        <div>
          <div style={{ padding: '4px 12px', background: activeObjective.color + '22', border: `1px solid ${activeObjective.color}55`, borderRadius: '4px', fontSize: '10px', color: activeObjective.color, fontWeight: 800, letterSpacing: '1px' }}>
            {activeObjective.label.toUpperCase()} OBJECTIVE
          </div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px', marginTop: '8px' }}>Total Magnification: {totalMagnification}X</div>
        </div>

        {/* ➕ ➖ Zoom Buttons (Vertical) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
          <button
            onClick={() => {
              const idx = OBJECTIVES.findIndex(o => o.power === objectivePower);
              if (idx < OBJECTIVES.length - 1) setObjectivePower(OBJECTIVES[idx + 1].power);
            }}
            disabled={objectivePower === OBJECTIVES[OBJECTIVES.length - 1].power}
            style={{
              width: '40px', height: '40px', borderRadius: '50%',
              border: `1px solid ${objectivePower === OBJECTIVES[OBJECTIVES.length - 1].power ? 'rgba(255,255,255,0.1)' : activeObjective.color + '88'}`,
              background: objectivePower === OBJECTIVES[OBJECTIVES.length - 1].power ? 'rgba(255,255,255,0.03)' : activeObjective.color + '22',
              color: objectivePower === OBJECTIVES[OBJECTIVES.length - 1].power ? 'rgba(255,255,255,0.2)' : activeObjective.color,
              cursor: objectivePower === OBJECTIVES[OBJECTIVES.length - 1].power ? 'not-allowed' : 'pointer',
              fontSize: '22px', fontWeight: 300, lineHeight: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
              boxShadow: objectivePower === OBJECTIVES[OBJECTIVES.length - 1].power ? 'none' : `0 0 14px ${activeObjective.color}44`
            }}
          >+</button>

          <div style={{ textAlign: 'center', minWidth: '42px' }}>
            <div style={{ fontSize: '18px', fontWeight: 700, color: activeObjective.color, lineHeight: 1 }}>{activeObjective.label}</div>
            <div style={{ fontSize: '8px', color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', marginTop: '2px' }}>ZOOM</div>
          </div>

          <button
            onClick={() => {
              const idx = OBJECTIVES.findIndex(o => o.power === objectivePower);
              if (idx > 0) setObjectivePower(OBJECTIVES[idx - 1].power);
            }}
            disabled={objectivePower === OBJECTIVES[0].power}
            style={{
              width: '40px', height: '40px', borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.2)',
              background: objectivePower === OBJECTIVES[0].power ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.08)',
              color: objectivePower === OBJECTIVES[0].power ? 'rgba(255,255,255,0.2)' : 'white',
              cursor: objectivePower === OBJECTIVES[0].power ? 'not-allowed' : 'pointer',
              fontSize: '22px', fontWeight: 300, lineHeight: 1,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.2s',
            }}
          >−</button>
        </div>
      </div>

      <div style={{ position: 'absolute', top: '30px', right: '30px', display: 'flex', gap: '15px' }}>
        {slideOnMicroscope && (
          <button
            onClick={() => {
              const microPos = useStore.getState().setupPositions['microscope'] || [0, 1.0, -0.7];
              useStore.getState().setSetupPosition('slide', [microPos[0] + 0.35, 0.93, microPos[2]]);
              useStore.getState().setStates({ slideOnMicroscope: false });
              toggleMicroscope(false);
            }}
            style={{
              padding: '0 20px', height: '40px', borderRadius: '20px',
              background: 'rgba(244, 67, 54, 0.15)', border: '1px solid rgba(244, 67, 54, 0.4)',
              color: '#ff5252', fontSize: '11px', fontWeight: 700, letterSpacing: '1px',
              cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px',
              transition: 'all 0.2s', textTransform: 'uppercase'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(244, 67, 54, 0.25)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(244, 67, 54, 0.15)'; }}
          >
            <span style={{ fontSize: '16px' }}>⏏</span> REMOVE SLIDE
          </button>
        )}

        <button onClick={() => toggleMicroscope(false)}
          style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', width: '40px', height: '40px', borderRadius: '50%', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >✕</button>
      </div>

      {/* 🔴 CIRCULAR FIELD OF VIEW */}
      <div style={{ position: 'relative' }}>
        <div style={{
          width: '560px', height: '560px', borderRadius: '50%', overflow: 'hidden',
          background: bgColor, border: '14px solid #1a1a1a', display: 'flex',
          flexWrap: 'wrap', padding: '50px', justifyContent: 'center', alignItems: 'center',
          boxShadow: `0 0 100px rgba(0,0,0,0.8), inset 0 0 120px rgba(0,0,0,${1 - light})`, position: 'relative',
          transition: 'all 0.4s ease'
        }}>
          
          {/* Glass Textures (Dust/Scratches) */}
          {glassTextures.map((t, i) => (
            <div key={i} style={{ position: 'absolute', left: t.left, top: t.top, width: t.size, height: t.size, opacity: t.opacity, background: 'white', borderRadius: '50%', transform: `rotate(${t.rotation}deg)` }} />
          ))}

          {rootOnSlide ? (
            squashed ? (
              cellsToRender.map(cell => (
                <CellTile key={cell.id} phase={cell.phase} focus={focus} scale={cellScale}
                  isSelected={selectedCell?.id === cell.id}
                  onClick={() => setSelectedCell(cell)} />
              ))
            ) : (
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', opacity: 0.8,
                filter: `blur(${10 + Math.abs(focus - 0.5) * 20}px)`, transform: `scale(${objectivePower/10})`
              }}>
                 <div style={{ width: '200px', height: '140px', background: hasStain ? '#4a148c' : '#37474f', borderRadius: '40% 60% 30% 70%' }} />
              </div>
            )
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <div style={{ color: 'rgba(255,255,255,0.1)', fontSize: '10px', textTransform: 'uppercase', letterSpacing: '4px' }}>Empty Field</div>
            </div>
          )}

          {/* Lens Vignette & Aberration Overlay */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle, transparent 40%, black 110%)', opacity: 0.95 }} />
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', pointerEvents: 'none', border: '2px solid rgba(255,255,255,0.03)', mixBlendMode: 'overlay' }} />
        </div>
      </div>

      {/* 🔵 INFO PANEL */}
      <div style={{
        marginTop: '35px', width: '480px', padding: '24px',
        background: 'rgba(255,255,255,0.02)', borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center'
      }}>
        {selectedCell ? (
          <div className="animate-fade-in">
            <h2 style={{ color: '#ff9100', margin: '0 0 10px 0', fontSize: '22px', letterSpacing: '1px' }}>
              {PHASES[selectedCell.phase].emoji} {PHASES[selectedCell.phase].name.toUpperCase()}
            </h2>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, margin: 0 }}>
              {PHASES[selectedCell.phase].description}
            </p>
          </div>
        ) : (
          <div>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '13px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
              {!rootOnSlide ? '🔬 Stage Empty' : (squashed ? '🔍 Identifying Cell Phases' : '⚠️ Observation Obstruction')}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px' }}>
              {!rootOnSlide ? 'Ensure the slide contains a specimen before viewing.' : (squashed ? 'Click on any stained cell to analyze its mitotic stage.' : 'Tissues are currently too thick. Preparing the slide correctly.')}
            </p>
          </div>
        )}
      </div>

      {/* 🟠 FOCUS & LIGHT WHEELS */}
      <div style={{ marginTop: '30px', display: 'flex', alignItems: 'center', gap: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', width: '220px' }}>
          <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontWeight: 800, letterSpacing: '1px' }}>FOCUS</span>
          <input type="range" min="0" max="1" step="0.01" value={focus}
            onChange={(e) => setFocus(parseFloat(e.target.value))}
            style={{ flex: 1, cursor: 'pointer', accentColor: '#ff9100', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}
          />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', width: '220px' }}>
          <span style={{ fontSize: '9px', color: 'rgba(255,255,255,0.3)', fontWeight: 800, letterSpacing: '1px' }}>ILLUM.</span>
          <input type="range" min="0.2" max="1" step="0.01" value={light}
            onChange={(e) => setLight(parseFloat(e.target.value))}
            style={{ flex: 1, cursor: 'pointer', accentColor: activeObjective.color, height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}
          />
        </div>
      </div>

      <style>{`
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        input[type=range]::-webkit-slider-thumb { width:12px; height:12px; border-radius: 50%; box-shadow: 0 0 10px #ff9100; cursor: pointer; }
      `}</style>
    </div>
  );
};

export default MicroscopeUI;
