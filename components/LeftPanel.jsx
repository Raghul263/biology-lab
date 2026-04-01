import React from 'react';
import useStore, { STEPS } from '../lib/store';

const instruments = [
  { id: 'waterBeaker', icon: '🧪', name: 'Water Beaker', desc: 'For root growth' },
  { id: 'hclBeaker', icon: '🧪', name: 'HCl Beaker', desc: 'N/10 Hydrochloric Acid' },
  { id: 'stainBeaker', icon: '🧪', name: 'Stain Beaker', desc: 'Acetocarmine Stain' },
  { id: 'onion', icon: '🧅', name: 'Onion Bulb', desc: 'Onion with roots' },
  { id: 'tile', icon: '⬜', name: 'Cutting Tile', desc: 'Flat ceramic surface' },
  { id: 'scalpel', icon: '🔪', name: 'Scalpel / Blade', desc: 'Surgical cutting tool' },
  { id: 'forceps', icon: '✂️', name: 'Forceps', desc: 'For handling root tips' },
  { id: 'needle', icon: '📍', name: 'Needle', desc: 'For squashing tissue' },
  { id: 'watchGlass', icon: '🥣', name: 'Watch Glass', desc: 'For root tip collection' },
  { id: 'vial', icon: '🧫', name: 'Fixative Vial', desc: 'Aceto-alcohol (1:3)' },
  { id: 'dropper', icon: '💧', name: 'Dropper', desc: 'For HCl and staining' },
  { id: 'burner', icon: '🔥', name: 'Bunsen Burner', desc: 'For gentle heating' },
  { id: 'slide', icon: '🔲', name: 'Glass Slide', desc: 'Mounting surface' },
  { id: 'coverSlip', icon: '◻️', name: 'Cover Slip', desc: 'Small glass square' },
  { id: 'filterPaper', icon: '📄', name: 'Filter Paper', desc: 'For blotting stain' },
  { id: 'microscope', icon: '🔬', name: 'Microscope', desc: 'Compound microscope' },
];

const LeftPanel = () => {
  const { currentStep, placedComponents, setPlaced, setHeldTool, heldTool, checkAllPlaced, showWrongAction } = useStore();

  const handleInteract = (inst) => {
    if (currentStep === STEPS.ARRANGE) {
      if (placedComponents[inst.id]) return;
      setPlaced(inst.id, true);
      checkAllPlaced();
    } else {
      // Only allow picking tools that are relevant to the current step
      const toolSteps = {
        scalpel: [STEPS.CUT_DRY_ROOTS, STEPS.CUT_FRESH_ROOTS],
        forceps: [STEPS.FIXATION, STEPS.PLACE_ON_SLIDE],
        dropper: [STEPS.CHEMICAL_TREAT, STEPS.SLIDE_PREP],
        filterPaper: [STEPS.SLIDE_PREP],
        needle: [STEPS.SLIDE_PREP],
      };
      const allowed = toolSteps[inst.id];
      if (allowed && allowed.includes(currentStep)) {
        setHeldTool(heldTool === inst.id ? null : inst.id);
      } else if (allowed) {
        showWrongAction('This tool is not needed right now.');
      }
    }
  };

  return (
    <div style={{
      width: '240px', minWidth: '240px', height: '100%',
      background: 'rgba(10,15,20,0.85)', backdropFilter: 'blur(16px)',
      borderRight: '1px solid rgba(255,255,255,0.08)',
      display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden',
    }}>
      <div style={{
        padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,109,0,0.15)', flexShrink: 0,
      }}>
        <div style={{ fontSize: '9px', letterSpacing: '3px', color: '#ff9800', marginBottom: '4px', fontWeight: 600 }}>
          {currentStep === STEPS.ARRANGE ? 'INITIAL SETUP' : 'EQUIPMENT'}
        </div>
        <div style={{ fontSize: '15px', fontWeight: 700, color: 'white' }}>
          {currentStep === STEPS.ARRANGE ? '📦 Unpack Supplies' : '🧫 Instrument Bench'}
        </div>
      </div>

      <div style={{
        flex: 1, overflowY: 'auto', padding: '16px',
        scrollbarWidth: 'thin', scrollbarColor: 'rgba(255,109,0,0.5) transparent',
      }}>
        {instruments.map((inst) => {
          const isPlaced = placedComponents[inst.id];
          const isSelected = heldTool === inst.id;

          return (
            <div
              key={inst.id}
              style={{
                background: isSelected ? 'rgba(255,152,0,0.2)' : isPlaced ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.07)',
                border: isSelected ? '1px solid #ff9800' : isPlaced ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', padding: '12px', marginBottom: '10px',
                cursor: 'pointer', transition: 'all 0.2s ease',
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
                  <div style={{ fontSize: '13px', fontWeight: 600, color: isPlaced && currentStep === STEPS.ARRANGE ? '#9e9e9e' : 'white' }}>
                    {inst.name}
                  </div>
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                    {inst.desc}
                  </div>
                </div>
                {isPlaced && <span style={{ fontSize: '14px', color: '#ff9800' }}>✓</span>}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{
        padding: '16px', background: 'rgba(0,0,0,0.2)',
        fontSize: '11px', color: 'rgba(255,255,255,0.3)', textAlign: 'center', lineHeight: 1.4,
      }}>
        {currentStep === STEPS.ARRANGE
          ? "Click items to place them on the lab table."
          : "Select a tool to use in the experiment."}
      </div>
    </div>
  );
};

export default LeftPanel;
