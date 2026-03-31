import React from 'react';
import useStore, { STEPS } from '../lib/store';

const instruments = [
  { id: 'beaker', icon: '🧪', name: 'Beaker (Water)', desc: 'Medium size beaker for root growth' },
  { id: 'onion', icon: '🧅', name: 'Onion Bulb', desc: 'Onion with emerging roots' },
  { id: 'tile', icon: '⬜', name: 'Cutting Tile', desc: 'Flat white ceramic surface' },
  { id: 'scalpel', icon: '🔪', name: 'Scalpel / Blade', desc: 'Surgical steel cutting tool' },
  { id: 'forceps', icon: '✂️', name: 'Forceps', desc: 'For handling root tips delicately' },
  { id: 'needle', icon: '📍', name: 'Needle', desc: 'For sample manipulation' },
  { id: 'watchGlass', icon: '🥣', name: 'Watch Glass', desc: 'For chemical treatment' },
  { id: 'vial', icon: '🧪', name: 'Fixative Vial', desc: 'Labeled: Aceto-alcohol (1:3)' },
  { id: 'dropper', icon: '💧', name: 'Dropper', desc: 'For HCl and staining' },
  { id: 'burner', icon: '🔥', name: 'Bunsen Burner', desc: 'For gentle heating' },
  { id: 'slide', icon: '🔲', name: 'Glass Slide', desc: 'Mounting surface' },
  { id: 'coverSlip', icon: '◻️', name: 'Cover Slip', desc: 'Small glass square' },
  { id: 'filterPaper', icon: '📄', name: 'Filter Paper', desc: 'For blotting and squashing' },
  { id: 'microscope', icon: '🔬', name: 'Microscope', desc: 'Complex compound microscope' },
];

const LeftPanel = () => {
  const { currentStep, setStep, placedComponents, setPlaced, setHeldTool, heldTool } = useStore();

  const handleInteract = (inst) => {
    if (currentStep === STEPS.ARRANGE) {
      setPlaced(inst.id, true);
      
      // Check if all are placed to advance
      const updated = { ...placedComponents, [inst.id]: true };
      const allPlaced = Object.values(updated).every(v => v === true);
      if (allPlaced) {
        setStep(STEPS.GROWTH_TILE);
      }
    } else {
      // Inventory behavior for subsequent steps
      setHeldTool(heldTool === inst.id ? null : inst.id);
    }
  };

  return (
    <div style={{
      width: '240px',
      minWidth: '240px',
      height: '100%',
      background: 'rgba(10,15,20,0.85)',
      backdropFilter: 'blur(16px)',
      borderRight: '1px solid rgba(255,255,255,0.08)',
      display: 'flex',
      flexDirection: 'column',
      padding: '0',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '20px 16px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(42,157,143,0.15)',
        flexShrink: 0,
      }}>
        <div style={{ fontSize: '9px', letterSpacing: '3px', color: '#4db6ac', marginBottom: '4px', fontWeight: 600 }}>
          {currentStep === STEPS.ARRANGE ? 'INITIAL SETUP' : 'EQUIPMENT'}
        </div>
        <div style={{ fontSize: '15px', fontWeight: 700, color: 'white' }}>
          {currentStep === STEPS.ARRANGE ? '📦 Unpack Supplies' : '🧫 Instrument Bench'}
        </div>
      </div>

      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        scrollbarWidth: 'thin',
        scrollbarColor: 'rgba(42,157,143,0.5) transparent',
      }}>
        {instruments.map((inst) => {
          const isPlaced = placedComponents[inst.id];
          const isSelected = heldTool === inst.id;
          
          return (
            <div 
              key={inst.id} 
              style={{
                background: isSelected ? 'rgba(77,182,172,0.2)' : isPlaced ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.07)',
                border: isSelected ? '1px solid #4db6ac' : isPlaced ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px',
                padding: '12px',
                marginBottom: '10px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                opacity: (currentStep === STEPS.ARRANGE && isPlaced) ? 0.4 : 1,
                pointerEvents: (currentStep === STEPS.ARRANGE && isPlaced) ? 'none' : 'auto',
              }}
              draggable={currentStep === STEPS.ARRANGE && !isPlaced}
              onDragStart={(e) => {
                e.dataTransfer.setData('inst_id', inst.id);
                e.dataTransfer.effectAllowed = 'copy';
              }}
              onClick={() => handleInteract(inst)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '24px' }}>{inst.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, color: isPlaced ? '#9e9e9e' : 'white' }}>
                    {inst.name}
                  </div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                    {inst.desc}
                  </div>
                </div>
                {isPlaced && <span style={{ fontSize: '14px', color: '#4db6ac' }}>✓</span>}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        padding: '16px',
        background: 'rgba(0,0,0,0.2)',
        fontSize: '11px',
        color: 'rgba(255,255,255,0.3)',
        textAlign: 'center',
        lineHeight: 1.4,
      }}>
        {currentStep === STEPS.ARRANGE 
          ? "Drag components onto the lab table to unpack them." 
          : "Select tool to use in the experiment."}
      </div>
    </div>
  );
};

export default LeftPanel;

