import React, { useState } from 'react';
import useStore from '../lib/store';

const PHASES = {
  Interphase: { name: 'Interphase', emoji: '🌑', color: '#1565c0', description: 'Cell is in its normal metabolic state. DNA is uncoiled as chromatin. The nucleus is clearly visible with a prominent nucleolus.' },
  Prophase: { name: 'Prophase', emoji: '🔵', color: '#1a237e', description: 'Chromatin condenses into discrete chromosomes. The nuclear envelope begins to break down. Spindle fibers start forming.' },
  Metaphase: { name: 'Metaphase', emoji: '🟢', color: '#1b5e20', description: 'Chromosomes align along the cell equatorial plate (metaphase plate). Spindle fibers attach to centromeres of each chromosome.' },
  Anaphase: { name: 'Anaphase', emoji: '🟠', color: '#bf360c', description: 'Centromeres split and sister chromatids are pulled toward opposite poles by shortening spindle fibers. The cell elongates.' },
  Telophase: { name: 'Telophase', emoji: '🔴', color: '#4a148c', description: 'Nuclear envelopes reform around each set of chromosomes. Chromosomes begin to decondense. Cytokinesis begins — the cell pinches into two daughter cells.' },
};

const CellTile = ({ phase, isSelected, onClick, focus }) => {
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
      width: '85px', height: '85px', margin: '8px',
      borderRadius: '35% 65% 50% 50%', background: c.cell, opacity: 0.7,
      border: isSelected ? '3px solid #ff9100' : '1px solid rgba(255,255,255,0.1)',
      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      filter: `blur(${blurAmount}px)`, transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      boxShadow: isSelected ? '0 0 20px #ff9100, inset 0 0 10px rgba(0,0,0,0.5)' : 'none',
      transform: isSelected ? 'scale(1.05)' : 'scale(1)',
    }}>
      <div style={{ color: c.chr, fontSize: '28px', pointerEvents: 'none' }}>{PHASES[phase].emoji}</div>
      <div style={{ position: 'absolute', inset: -2, border: '1px solid currentColor', color: c.chr, borderRadius: 'inherit', opacity: 0.2 }} />
    </div>
  );
};

const MicroscopeUI = () => {
  const { toggleMicroscope, squashed, rootProcessingState } = useStore();
  const [focus, setFocus] = useState(0.5);
  const [selectedCell, setSelectedCell] = useState(null);

  const [cells] = useState(() => {
    const arr = [];
    const keys = Object.keys(PHASES);
    for (let i = 0; i < 20; i++) {
      const phase = i < 5 ? 'Interphase' : keys[Math.floor(Math.random() * keys.length)];
      arr.push({ id: i, phase });
    }
    return arr.sort(() => Math.random() - 0.5);
  });

  const handleCellClick = (cell) => {
    if (!squashed) return;
    setSelectedCell(cell);
  };

  const activePhase = selectedCell ? PHASES[selectedCell.phase] : null;

  return (
    <div style={{
      position: 'absolute', inset: 0, background: 'rgba(5,7,12,0.98)',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      zIndex: 200, fontFamily: '"Outfit", sans-serif', color: 'white',
      backdropFilter: 'blur(12px)'
    }}>
      <div style={{
        position: 'absolute', top: '30px', left: '30px',
        display: 'flex', flexDirection: 'column', gap: '10px'
      }}>
        <div style={{ padding: '4px 12px', background: 'rgba(255,145,0,0.15)', border: '1px solid rgba(255,145,0,0.3)', borderRadius: '4px', fontSize: '10px', color: '#ff9100', fontWeight: 800 }}>40X OBJECTIVE</div>
        <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '12px' }}>Total Magnification: 400X</div>
        
        {squashed ? (
          <div style={{ color: '#4caf50', fontSize: '11px', marginTop: '8px', fontWeight: 600 }}>
            ✨ SPECIMEN READY
          </div>
        ) : (
          <div style={{ color: '#f44336', fontSize: '11px', marginTop: '8px', fontWeight: 600 }}>
            ⚠️ SPECIMEN TOO THICK
          </div>
        )}
      </div>

      <button onClick={() => toggleMicroscope(false)}
        style={{ position: 'absolute', top: '30px', right: '30px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.2)', color: 'white', width: '40px', height: '40px', borderRadius: '50%', fontSize: '20px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >✕</button>

      <div style={{ position: 'relative' }}>
        <div style={{
          width: '560px', height: '560px', borderRadius: '50%', overflow: 'hidden',
          background: '#05070a', border: '14px solid #1a1a1a', display: 'flex',
          flexWrap: 'wrap', padding: '50px', justifyContent: 'center', alignItems: 'center',
          boxShadow: '0 0 100px rgba(0,0,0,0.8), inset 0 0 80px black', position: 'relative'
        }}>
          {squashed ? (
            cells.map(cell => (
              <CellTile key={cell.id} phase={cell.phase} focus={focus}
                isSelected={selectedCell?.id === cell.id}
                onClick={() => handleCellClick(cell)} />
            ))
          ) : (
            <div style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', opacity: 0.8
            }}>
               <div style={{ width: '200px', height: '140px', background: rootProcessingState === 'STAINED' ? '#4a148c' : '#37474f', borderRadius: '40% 60% 30% 70%', filter: 'blur(10px)' }} />
               <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px', textAlign: 'center' }}>
                 Tissues are layered. Use Filter Paper to squash the specimen.
               </p>
            </div>
          )}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle, transparent 35%, black 100%)', opacity: 0.9 }} />
        </div>
        <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', pointerEvents: 'none', background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.02) 0%, transparent 70%)' }} />
      </div>

      <div style={{
        marginTop: '35px', width: '480px', padding: '24px',
        background: 'rgba(255,255,255,0.02)', borderRadius: '24px',
        border: '1px solid rgba(255,255,255,0.05)', textAlign: 'center'
      }}>
        {activePhase ? (
          <div className="animate-fade-in">
            <h2 style={{ color: '#ff9100', margin: '0 0 10px 0', fontSize: '22px', letterSpacing: '1px' }}>
              {activePhase.emoji} {activePhase.name.toUpperCase()}
            </h2>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.7, margin: 0 }}>
              {activePhase.description}
            </p>
          </div>
        ) : (
          <div>
            <p style={{ color: 'rgba(255,145,0,0.7)', fontSize: '13px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '8px' }}>
              {squashed ? '🔍 Identifying Cell Phases' : '⚠️ Observation Blocked'}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '12px' }}>
              {squashed ? 'Click on any stained cell to analyze its mitotic stage.' : 'Prepare the slide correctly to see individual cells.'}
            </p>
          </div>
        )}
      </div>

      <div style={{ marginTop: '30px', display: 'flex', alignItems: 'center', gap: '20px', width: '320px' }}>
        <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', fontWeight: 800 }}>FOCUS WHEEL</span>
        <div style={{ flex: 1 }}>
          <input type="range" min="0" max="1" step="0.01" value={focus}
            onChange={(e) => setFocus(parseFloat(e.target.value))}
            style={{ width: '100%', cursor: 'pointer', accentColor: '#ff9100', height: '4px', background: 'rgba(255,255,255,0.1)', borderRadius: '2px' }}
          />
        </div>
        <span style={{ fontSize: '12px', color: '#ff9100', fontWeight: 700, width: '40px' }}>{Math.round(focus * 100)}%</span>
      </div>

      <style>{`
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
        input[type=range]::-webkit-slider-thumb { border-radius: 50%; box-shadow: 0 0 10px #ff9100; }
      `}</style>
    </div>
  );
};

export default MicroscopeUI;
