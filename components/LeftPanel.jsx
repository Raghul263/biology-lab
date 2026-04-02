import React from 'react';
import useStore from '../lib/store';

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
  const { placedComponents, setPlaced, setHeldTool, heldTool } = useStore();

  const handleInteract = (inst) => {
    if (!placedComponents[inst.id]) {
      setPlaced(inst.id, true);
      setHeldTool(inst.id); // Add this so it immediately follows the cursor
    } else {
      // It's placed, so we can pick it up to reposition it on the table
      setHeldTool(heldTool === inst.id ? null : inst.id);
    }
  };

  const allPlaced = Object.values(placedComponents).every(v => v);

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
          {!allPlaced ? 'INITIAL SETUP' : 'EQUIPMENT'}
        </div>
        <div style={{ fontSize: '15px', fontWeight: 700, color: 'white' }}>
          {!allPlaced ? '📦 Unpack Supplies' : '🧫 Instrument Bench'}
        </div>
      </div>

      <div style={{
        flex: 1, 
        overflowY: 'auto', 
        padding: '12px',
        scrollbarWidth: 'thin', 
        scrollbarColor: 'rgba(255,109,0,0.5) transparent',
        display: !allPlaced ? 'grid' : 'block',
        gridTemplateColumns: !allPlaced ? '1fr 1fr' : 'none',
        gap: '8px',
      }}>
        {instruments.map((inst) => {
          const isPlaced = placedComponents[inst.id];
          const isSelected = heldTool === inst.id;
          const isArrangeStep = !allPlaced;

          return (
            <div
              key={inst.id}
              style={{
                background: isSelected ? 'rgba(255,152,0,0.2)' : isPlaced ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.07)',
                border: isSelected ? '1px solid #ff9800' : isPlaced ? '1px solid rgba(255,255,255,0.05)' : '1px solid rgba(255,255,255,0.1)',
                borderRadius: '12px', 
                padding: isArrangeStep ? '10px 6px' : '12px', 
                marginBottom: isArrangeStep ? '0' : '10px',
                cursor: 'pointer', transition: 'all 0.2s ease',
                opacity: (isArrangeStep && isPlaced) ? 0.3 : 1,
                display: 'flex',
                flexDirection: isArrangeStep ? 'column' : 'row',
                alignItems: 'center',
                textAlign: 'center',
                gap: isArrangeStep ? '6px' : '12px',
                position: 'relative',
              }}
              onClick={() => handleInteract(inst)}
              draggable={!isPlaced}
              onDragStart={(e) => {
                e.dataTransfer.setData('inst_id', inst.id);
                e.dataTransfer.effectAllowed = 'copy';
              }}
            >
              <span style={{ fontSize: isArrangeStep ? '22px' : '24px' }}>{inst.icon}</span>
              <div style={{ flex: 1, minWidth: 0, width: '100%' }}>
                <div style={{ 
                  fontSize: isArrangeStep ? '11px' : '13px', 
                  fontWeight: 600, 
                  color: isPlaced && isArrangeStep ? '#9e9e9e' : 'white',
                  lineHeight: 1.2,
                  whiteSpace: isArrangeStep ? 'normal' : 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis'
                }}>
                  {inst.name}
                </div>
                {!isArrangeStep && (
                  <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
                    {inst.desc}
                  </div>
                )}
              </div>
              {isPlaced && (
                <span style={{ 
                  position: isArrangeStep ? 'absolute' : 'static',
                  top: '5px', right: '5px',
                  fontSize: '14px', color: '#ff9800' 
                }}>✓</span>
              )}
            </div>
          );
        })}
      </div>

      <div style={{
        padding: '16px', background: 'rgba(0,0,0,0.2)',
        fontSize: '11px', color: 'rgba(255,255,255,0.3)', textAlign: 'center', lineHeight: 1.4,
      }}>
        {!allPlaced
          ? "Click items to place them on the lab table."
          : "Select a tool to use in the experiment."}
      </div>
    </div>
  );
};

export default LeftPanel;
