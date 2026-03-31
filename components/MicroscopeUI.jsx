import React, { useState } from 'react';
import useStore from '../lib/store';

const PHASES = {
  Interphase: { name: 'Interphase', emoji: '🌑', color: '#1565c0', description: 'Cell is in its normal metabolic state. DNA is uncoiled as chromatin.' },
  Prophase: { name: 'Prophase', emoji: '🔵', color: '#1a237e', description: 'Chromatid fibers condense into discrete chromosomes. Nuclear envelope breaks down.' },
  Metaphase: { name: 'Metaphase', emoji: '🟢', color: '#1b5e20', description: 'Chromosomes align along the cell\'s equatorial plate (metaphase plate).' },
  Anaphase: { name: 'Anaphase', emoji: '🟠', color: '#bf360c', description: 'Centromeres split, and sister chromatids are pulled toward opposite poles.' },
  Telophase: { name: 'Telophase', emoji: '🔴', color: '#4a148c', description: 'Nuclear envelopes reform. The cell begins to pinch and divide (cytokinesis).' },
};

const CellTile = ({ phase, isSelected, onClick, focus }) => {
  const c = {
    Interphase: { cell: '#37474f', chr: '#546e7a', accent: '#263238', liquid: '#eceff1' },
    Prophase: { cell: '#1a237e', chr: '#7986cb', accent: '#283593', liquid: '#e1bee7' },
    Metaphase: { cell: '#1b5e20', chr: '#66bb6a', accent: '#2e7d32', liquid: '#c8e6c9' },
    Anaphase: { cell: '#bf360c', chr: '#ff8a65', accent: '#d84315', liquid: '#ffccbc' },
    Telophase: { cell: '#4a148c', chr: '#ce93d8', accent: '#6a1b9a', liquid: '#e1bee7' },
  }[phase];

  // Blur amount based on focus (0.5 is perfect)
  const blurAmount = Math.abs(focus - 0.5) * 15;

  return (
    <div 
      onClick={onClick}
      style={{
        width: '85px', height: '85px',
        margin: '8px', borderRadius: '35% 65% 50% 50%',
        background: c.cell, opacity: 0.7,
        border: isSelected ? '3px solid #00e5ff' : '1px solid rgba(255,255,255,0.1)',
        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
        filter: `blur(${blurAmount}px)`, transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative',
        boxShadow: isSelected ? '0 0 20px #00e5ff, inset 0 0 10px rgba(0,0,0,0.5)' : 'none',
        transform: isSelected ? 'scale(1.05)' : 'scale(1)',
      }}
    >
      <div style={{ color: c.chr, fontSize: '28px', pointerEvents: 'none' }}>{PHASES[phase].emoji}</div>
      {/* Irregular cell wall overlay */}
      <div style={{ position: 'absolute', inset: -2, border: '1px solid currentColor', color: c.chr, borderRadius: 'inherit', opacity: 0.2 }} />
    </div>
  );
};

const MicroscopeUI = () => {
  const { toggleMicroscope } = useStore();
  const [focus, setFocus] = useState(0.5);
  const [selectedCell, setSelectedCell] = useState(null);
  
  // High density of cells for realistic "Field of View" (4x4)
  const [cells] = useState(() => {
    const arr = [];
    const keys = Object.keys(PHASES);
    for (let i = 0; i < 16; i++) {
        // Skew distribution toward mitosis stages for the practical
        const phase = i < 4 ? 'Interphase' : keys[Math.floor(Math.random() * keys.length)];
        arr.push({ id: i, phase });
    }
    // Shuffle
    return arr.sort(() => Math.random() - 0.5);
  });

  const activePhase = selectedCell ? PHASES[selectedCell.phase] : null;

  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'rgba(5,7,12,0.98)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      zIndex: 200, fontFamily: '"Outfit", sans-serif', color: 'white',
      backdropFilter: 'blur(10px)'
    }}>
      {/* Eyepiece Navigation Panel */}
      <div style={{
        position: 'absolute', top: '30px', left: '30px', 
        display: 'flex', flexDirection: 'column', gap: '10px'
      }}>
        <div style={{ padding: '4px 12px', background: 'rgba(0,229,255,0.1)', border: '1px solid rgba(0,229,255,0.2)', borderRadius: '4px', fontSize: '10px', color: '#00e5ff', fontWeight: 800 }}>40X OBJECTIVE</div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Total Magnification: 400X</div>
      </div>

      <button 
        onClick={() => toggleMicroscope(false)}
        style={{ position: 'absolute', top: '30px', right: '30px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', width: '40px', height: '40px', borderRadius: '50%', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >✕</button>

      {/* Main Field of View */}
      <div style={{ position: 'relative' }}>
        <div style={{
          width: '520px', height: '520px', borderRadius: '50%', overflow: 'hidden',
          background: '#05070a', border: '12px solid #1a1a1a', display: 'flex',
          flexWrap: 'wrap', padding: '50px', justifyContent: 'center', alignItems: 'center',
          boxShadow: '0 0 100px rgba(0,0,0,0.8), inset 0 0 60px black', position: 'relative'
        }}>
          {cells.map(cell => (
            <CellTile 
              key={cell.id} 
              phase={cell.phase} 
              focus={focus}
              isSelected={selectedCell?.id === cell.id}
              onClick={() => setSelectedCell(cell)}
            />
          ))}
          
          {/* Eyepiece Scratches & Vignette (for realism) */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle, transparent 35%, black 100%)', opacity: 0.9 }} />
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'url("https://www.transparenttextures.com/patterns/dust.png")', opacity: 0.05 }} />
        </div>
        
        {/* Optical Aberration Effect Overlay */}
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', pointerEvents: 'none', background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.02) 0%, transparent 70%)' }} />
      </div>

      {/* Dynamic Observation Sidebar */}
      <div style={{
        marginTop: '35px', width: '420px', padding: '24px', 
        background: 'rgba(255,255,255,0.02)', borderRadius: '24px', 
        border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center'
      }}>
        {activePhase ? (
          <div className="animate-fade-in">
            <h2 style={{ color: '#00e5ff', margin: '0 0 10px 0', fontSize: '24px', letterSpacing: '1px' }}>{activePhase.emoji} {activePhase.name.toUpperCase()}</h2>
            <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: 0 }}>{activePhase.description}</p>
          </div>
        ) : (
          <div>
            <p style={{ color: 'rgba(0,229,255,0.6)', fontSize: '13px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>Scanning Specimen...</p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>Click on any cell in the field of view to analyze its mitotic stage.</p>
          </div>
        )}
      </div>

      {/* Control Strip */}
      <div style={{ marginTop: '30px', display: 'flex', alignItems: 'center', gap: '20px', width: '320px' }}>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontWeight: 800 }}>FOCUS WHEEL</span>
        <div style={{ flex: 1, position: 'relative' }}>
          <input 
            type="range" min="0" max="1" step="0.01" value={focus} 
            onChange={(e) => setFocus(parseFloat(e.target.value))}
            style={{ 
                width: '100%', cursor: 'pointer', accentColor: '#00e5ff',
                height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px'
            }}
          />
        </div>
        <span style={{ fontSize: '12px', color: '#00e5ff', fontWeight: 700, width: '40px' }}>{Math.round(focus * 100)}%</span>
      </div>

      <style>{`
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        input[type=range]::-webkit-slider-thumb { border-radius: 50%; box-shadow: 0 0 10px #00e5ff; }
      `}</style>
    </div>
  );
};

export default MicroscopeUI;
