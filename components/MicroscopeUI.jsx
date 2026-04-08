import React, { useState, useMemo } from 'react';
import useStore from '../lib/store';

const PHASES = {
  Interphase: { 
    name: 'Interphase', color: '#880e4f', 
    label: 'Interphase – chromosomes are thin and nucleus is clear', 
    description: 'Cell is in its normal metabolic state. DNA is uncoiled as chromatin. The nucleus is clearly visible with a prominent nucleolus.',
    renderDNA: (scale) => (
      <div style={{ width: `${42 * scale}px`, height: `${42 * scale}px`, borderRadius: '50%', background: '#4527a0', border: `2px solid rgba(0,0,0,0.3)`, boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)' }} />
    )
  },
  Prophase: { 
    name: 'Prophase', color: '#ad1457', 
    label: 'Prophase – chromatin condenses into visible chromosomes', 
    description: 'Chromatin condenses into discrete chromosomes. The nuclear envelope begins to break down. Spindle fibers start forming.',
    renderDNA: (scale) => (
      <div style={{ position: 'relative', width: `${48 * scale}px`, height: `${48 * scale}px` }}>
        {[...Array(8)].map((_, i) => (
          <div key={i} style={{ 
            position: 'absolute', top: '50%', left: '50%', width: `${24 * scale}px`, height: `${4 * scale}px`, 
            background: '#311b92', transform: `translate(-50%, -50%) rotate(${i * 45 + Math.random()*20}deg)`, 
            borderRadius: '2px', opacity: 0.9
          }} />
        ))}
      </div>
    )
  },
  Metaphase: { 
    name: 'Metaphase', color: '#c2185b', 
    label: 'Metaphase – chromosomes aligned at center plate', 
    description: 'Chromosomes align along the cell equatorial plate (metaphase plate). Spindle fibers attach to centromeres of each chromosome.',
    renderDNA: (scale) => (
       <div style={{ display: 'flex', flexDirection: 'column', gap: `${2 * scale}px`, alignItems: 'center', filter: 'blur(0.5px)' }}>
          {[...Array(5)].map((_, i) => (
            <div key={i} style={{ width: `${28 * scale}px`, height: `${5 * scale}px`, background: '#1a237e', borderRadius: '1.5px', boxShadow: '0 1px 2px rgba(0,0,0,0.4)' }} />
          ))}
       </div>
    )
  },
  Anaphase: { 
    name: 'Anaphase', color: '#d81b60', 
    label: 'Anaphase – sister chromatids pulling to opposite poles', 
    description: 'Centromeres split and sister chromatids are pulled toward opposite poles by shortening spindle fibers. The cell elongates.',
    renderDNA: (scale) => (
       <div style={{ height: `${60 * scale}px`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: `${4 * scale}px`, transform: 'scaleY(0.8)' }}>
             {[...Array(4)].map((_, i) => <div key={i} style={{ width: `${12 * scale}px`, height: `${4 * scale}px`, background: '#283593', transform: `rotate(${20 + i*5}deg)`, borderRadius: '1px' }} />)}
          </div>
          <div style={{ display: 'flex', gap: `${4 * scale}px`, transform: 'scaleY(0.8)' }}>
             {[...Array(4)].map((_, i) => <div key={i} style={{ width: `${12 * scale}px`, height: `${4 * scale}px`, background: '#283593', transform: `rotate(${-20 - i*5}deg)`, borderRadius: '1px' }} />)}
          </div>
       </div>
    )
  },
  Telophase: { 
    name: 'Telophase', color: '#e91e63', 
    label: 'Telophase – two new daughter nuclei forming', 
    description: 'Nuclear envelopes reform around each set of chromosomes. Chromosomes begin to decondense. Cytokinesis begins — the cell pinches into two daughter cells.',
    renderDNA: (scale) => (
       <div style={{ height: `${65 * scale}px`, display: 'flex', flexDirection: 'column', justifyContent: 'space-around', alignItems: 'center', position: 'relative' }}>
          <div style={{ width: `${28 * scale}px`, height: `${28 * scale}px`, borderRadius: '50%', background: '#4527a0', opacity: 0.85, boxShadow: 'inset 0 0 8px rgba(0,0,0,0.4)' }} />
          <div style={{ width: '110%', height: '2px', background: 'rgba(0,0,0,0.15)', margin: `${3 * scale}px 0`, borderTop: '1px solid rgba(255,255,255,0.1)' }} />
          <div style={{ width: `${28 * scale}px`, height: `${28 * scale}px`, borderRadius: '50%', background: '#4527a0', opacity: 0.85, boxShadow: 'inset 0 0 8px rgba(0,0,0,0.4)' }} />
       </div>
    )
  },
};

const ZOOM_STEPS = [1, 2, 4, 10, 40];

const CellTile = ({ phase, isSelected, onClick, focus, scale, zoom }) => {
  const phaseData = PHASES[phase];
  const blurAmount = Math.abs(focus - 0.5) * 15;

  return (
    <div onClick={onClick} style={{
      width: `${85 * scale}px`, height: `${100 * scale}px`, margin: `${3 * scale}px`,
      borderRadius: '8px', background: 'rgba(233, 30, 99, 0.15)', backdropFilter: 'blur(2px)',
      border: isSelected ? '4px solid #00e5ff' : '1.5px solid rgba(255,255,255,0.06)',
      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      filter: `blur(${blurAmount}px)`, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      position: 'relative',
      boxShadow: isSelected ? '0 0 30px #00e5ff, inset 0 0 10px rgba(0,0,0,0.5)' : 'none',
      transform: isSelected ? 'scale(1.1) zIndex(10)' : 'scale(1)',
    }}>
      {/* 🧬 DNA GRAPHIC (MATCHES REFERENCE IMAGE) */}
      <div style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.4))', opacity: zoom >= 10 ? 1 : 0.4 }}>
        {phaseData.renderDNA(scale)}
      </div>
      
      {/* Select Label */}
      {isSelected && (
        <div style={{
          position: 'absolute', bottom: '-40px', left: '50%', transform: 'translateX(-50%)',
          background: '#00e5ff', color: '#000', padding: '4px 12px', borderRadius: '4px',
          fontSize: '11px', fontWeight: 900, whiteSpace: 'nowrap', zIndex: 100,
          boxShadow: '0 4px 15px rgba(0,229,255,0.5)', pointerEvents: 'none'
        }}>
          {phaseData.name.toUpperCase()}
        </div>
      )}
    </div>
  );
};

const MicroscopeUI = () => {
  const { toggleMicroscope, rootOnSlide, slideOnMicroscope, zoomLevel, microscopeActive, setStates, squashed, slideStainApplied } = useStore();
  const [focus, setFocus] = useState(0.5);
  const [light, setLight] = useState(0.85);

  const handleZoomToggle = () => {
    const nextIdx = (ZOOM_STEPS.indexOf(zoomLevel) + 1) % ZOOM_STEPS.length;
    setStates({ zoomLevel: ZOOM_STEPS[nextIdx], selectedCell: null });
  };

  const currentZoomData = {
    1: { label: '1X', desc: 'Low Magnification - Root Overview', cellCount: 4, scale: 0.35 },
    2: { label: '2X', desc: 'Medium Magnification - Tissue Clusters', cellCount: 20, scale: 0.55 },
    4: { label: '4X', desc: 'High Magnification - Cellular Grid', cellCount: 60, scale: 0.8 },
    10: { label: '10X', desc: 'Ultra Magnification - Mitotic Identification', cellCount: 35, scale: 1.1 },
    40: { label: '40X', desc: 'Max Magnification - High Detail Analysis', cellCount: 15, scale: 2.2 },
  }[zoomLevel];

  const cells = useMemo(() => {
    const arr = [];
    const keys = Object.keys(PHASES);
    for (let i = 0; i < 80; i++) {
        const phase = keys[Math.floor(Math.random() * keys.length)];
        arr.push({ id: i, phase });
    }
    return arr;
  }, []);

  const glassTextures = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      left: `${Math.random() * 100}%`, top: `${Math.random() * 100}%`, size: 1 + Math.random() * 3,
      opacity: 0.05 + Math.random() * 0.15
    }));
  }, []);

  const selectedCellData = useStore(state => state.selectedCell);
  const hasStain = slideStainApplied;
  const bgColor = hasStain ? 'rgb(244, 224, 234)' : 'rgba(251, 251, 245, 0.1)';

  if (!microscopeActive) return null;

  return (
    <div 
      style={{
        position: 'absolute', inset: 0, background: 'rgba(5,7,10,0.97)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        zIndex: 500, fontFamily: '"Outfit", sans-serif', color: 'white',
        backdropFilter: 'blur(35px)'
      }}
    >
      {/* ⬅️ BACK TO LAB BUTTON */}
      <div style={{ position: 'absolute', top: '40px', left: '40px', zIndex: 600 }}>
        <button
          onClick={() => {
              setStates({ microscopeActive: false });
              toggleMicroscope(false);
          }}
          style={{
            background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)',
            color: 'white', padding: '12px 24px', borderRadius: '30px',
            fontSize: '11px', fontWeight: 900, letterSpacing: '2px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '10px', transition: 'all 0.2s'
          }}
          onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = '#00e5ff'; }}
          onMouseOut={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}
        >
          <span style={{ fontSize: '18px' }}>←</span> BACK TO LAB
        </button>
      </div>

      {/* 🔬 GLASS PLATE VIEWPORT */}
      <div 
        style={{ position: 'relative', cursor: 'default' }}
        onClick={(e) => e.stopPropagation()}
      >
          <div style={{
            width: '580px', height: '580px', borderRadius: '50%', overflow: 'hidden',
            background: bgColor, border: '18px solid #1a1a1a', display: 'flex',
            flexWrap: 'wrap', padding: '40px', justifyContent: 'center', alignItems: 'center',
            boxShadow: `0 0 150px rgba(0,0,0,1.0), inset 0 0 120px rgba(0,0,0,${Math.max(0.4, 0.9 - light)})`, 
            position: 'relative', transition: 'all 0.5s ease-out',
            filter: `brightness(${light + 0.05}) contrast(1.1) saturate(1.2)`
          }}>
          
          {/* Glass imperfections / Organic Noise */}
          {glassTextures.map((t, i) => (
            <div key={i} style={{ position: 'absolute', left: t.left, top: t.top, width: t.size, height: t.size, opacity: t.opacity, background: '#311b92', borderRadius: '50%', pointerEvents: 'none' }} />
          ))}

          {/* VIEWPORT LAYERS */}
          <div style={{ 
            width: '100%', height: '100%', position: 'relative',
            display: 'flex', justifyContent: 'center', alignItems: 'center', 
            transition: 'all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)'
          }}>
             {/* 📸 HIGH-RES BIOLOGICAL IMAGE (MATCHES REFERENCE) */}
             <div style={{
               position: 'absolute', inset: zoomLevel === 1 ? 0 : -40,
               backgroundImage: `url('file:///C:/Users/ASUS/.gemini/antigravity/brain/a27e18be-977f-45f4-9c94-291186d2a4d5/${zoomLevel === 1 ? 'onion_root_tip_1x_overview_1775630175859.png' : 'high_res_mitosis_sample_slide_1775562003218.png'}')`,
               backgroundSize: zoomLevel === 1 ? 'contain' : 'cover', backgroundPosition: 'center',
               backgroundRepeat: 'no-repeat',
               opacity: rootOnSlide ? 1 : 0.1, 
               filter: `blur(${Math.abs(focus - 0.5) * 15}px) contrast(1.15) saturate(1.4)`,
               transform: `scale(${zoomLevel === 1 ? 1 : (zoomLevel/3 + 1.2)})`, 
               transition: 'transform 0.8s ease-out, opacity 0.5s ease-in-out'
             }} />

             {/* 🧬 INTERACTIVE OVERLAY (10X and 40X) */}
             {rootOnSlide && zoomLevel >= 10 && (
                <div style={{ 
                  display: 'flex', flexWrap: 'wrap', justifyContent: 'center', alignItems: 'center', 
                  width: '100%', height: '100%', opacity: 0.3, mixBlendMode: 'plus-lighter'
                }}>
                   {cells.slice(0, currentZoomData.cellCount).map(cell => (
                     <CellTile 
                       key={cell.id} phase={cell.phase} focus={focus} zoom={zoomLevel}
                       scale={currentZoomData.scale}
                       isSelected={selectedCellData?.id === cell.id}
                       onClick={() => setStates({ selectedCell: cell })}
                     />
                   ))}
                </div>
             )}

             {/* TEXT FEEDBACK IF EMPTY */}
             {!rootOnSlide && (
               <div style={{ 
                 position: 'center', color: 'rgba(255,255,255,0.2)', fontSize: '14px', 
                 fontWeight: 900, letterSpacing: '4px', textAlign: 'center', zIndex: 10 
               }}>
                 PLACE SPECIMEN TO RESOLVE IMAGE
               </div>
             )}
          </div>

          {/* Vignette & Optical Distortion */}
          <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', background: 'radial-gradient(circle, transparent 40%, #000 120%)', opacity: 0.98 }} />
          <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', pointerEvents: 'none', border: '5px solid rgba(173, 20, 87, 0.05)', mixBlendMode: 'screen' }} />
        </div>

        {/* 🔘 ZOOM CONTROL */}
        <div style={{ position: 'absolute', right: '-120px', top: '50%', transform: 'translateY(-50%)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
          <button
            onClick={handleZoomToggle}
            style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: '#00e5ff', border: 'none', color: '#000',
              fontSize: '20px', fontWeight: 900, cursor: 'pointer',
              boxShadow: '0 8px 30px rgba(0,229,255,0.5)',
              transition: 'all 0.2s', activeScale: 0.9
            }}
          >
            {zoomLevel}X
          </button>
          <div style={{ fontSize: '11px', color: '#00e5ff', fontWeight: 900, letterSpacing: '3px' }}>MAGNIFY</div>
        </div>
      </div>

      {/* 🔭 DATA PANEL */}
      <div 
        style={{ marginTop: '60px', width: '540px', minHeight: '140px', padding: '35px', background: 'rgba(255,255,255,0.04)', borderRadius: '25px', border: '1px solid rgba(255,255,255,0.12)', textAlign: 'center', backdropFilter: 'blur(10px)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {selectedCellData && zoomLevel >= 10 ? (
          <div className="animate-slide-up">
            <div style={{ 
              display: 'inline-block', padding: '6px 20px', background: '#00e5ff', color: '#000', 
              borderRadius: '20px', fontSize: '12px', fontWeight: 900, marginBottom: '15px', letterSpacing: '2px'
            }}>
              HISTOLOGY IDENTIFIED
            </div>
            <h2 style={{ fontSize: '26px', margin: '0 0 12px 0', color: '#00e5ff', fontWeight: 900 }}>
              {PHASES[selectedCellData.phase].name.toUpperCase()}
            </h2>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.85)', fontWeight: 500, lineHeight: 1.6, margin: 0 }}>
              {PHASES[selectedCellData.phase].label}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
             <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', fontWeight: 900, letterSpacing: '3px', textTransform: 'uppercase', margin: 0 }}>
               {!rootOnSlide ? '🔭 Optical Wait State' : (zoomLevel < 10 ? currentZoomData.desc : '🔬 Stained Chromosomal Analysis')}
             </p>
             <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '14px', margin: '10px 0 0 0', fontWeight: 500 }}>
               {!rootOnSlide ? 'Please align slide to center stage for imaging.' : (zoomLevel < 10 ? 'Magnify further to resolve intracellular structures.' : 'Scan the field and select any stained chromosome cluster.')}
             </p>
          </div>
        )}
      </div>

      {/* 🎛️ CONTROLS */}
      <div 
        style={{ marginTop: '50px', display: 'flex', gap: '80px' }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', width: '240px' }}>
           <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: 900, letterSpacing: '3px' }}>FOCUS</span>
           <input type="range" min="0" max="1" step="0.01" value={focus} onChange={(e) => setFocus(parseFloat(e.target.value))}
             style={{ flex: 1, accentColor: '#00e5ff', cursor: 'pointer', height: '6px' }}
           />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', width: '240px' }}>
           <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: 900, letterSpacing: '3px' }}>EXP.</span>
           <input type="range" min="0.2" max="1" step="0.01" value={light} onChange={(e) => setLight(parseFloat(e.target.value))}
             style={{ flex: 1, accentColor: '#00e5ff', cursor: 'pointer', height: '6px' }}
           />
        </div>
      </div>

      <style>{`
        .animate-slide-up { animation: slideUp 0.5s cubic-bezier(0.2, 0.8, 0.2, 1); }
        @keyframes slideUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        button:active { transform: scale(0.9); }
        input[type=range]::-webkit-slider-thumb { width: 14px; height: 14px; border-radius: 50%; background: #00e5ff; cursor: pointer; box-shadow: 0 0 10px rgba(0,229,255,0.8); }
      `}</style>
    </div>
  );
};

export default MicroscopeUI;
