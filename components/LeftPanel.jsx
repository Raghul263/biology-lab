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
      {/* header removed */}

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
              onClick={(e) => {
                e.stopPropagation();
                handleInteract(inst);
              }}
              draggable={!isPlaced}
              onDragStart={(e) => {
                e.dataTransfer.setData('inst_id', inst.id);
                e.dataTransfer.effectAllowed = 'copy';
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, minWidth: 0 }}>
                <span style={{ fontSize: isArrangeStep ? '26px' : '28px' }}>{inst.icon}</span>
                <span style={{ 
                  color: isSelected ? '#ff9800' : 'rgba(255,255,255,0.95)', 
                  fontSize: '10px', fontWeight: 800, 
                  marginTop: '6px', letterSpacing: '0.4px',
                  textTransform: 'uppercase', textAlign: 'center',
                  width: '100%', overflow: 'hidden', textOverflow: 'clip', whiteSpace: 'normal',
                  lineHeight: '1.2'
                }}>
                  {inst.name}
                </span>
                {(!isArrangeStep || isSelected) && (
                  <span style={{ 
                    color: 'rgba(255,255,255,0.45)', fontSize: '8.5px', 
                    marginTop: '3px', textAlign: 'center', fontWeight: 500
                  }}>
                    {inst.desc}
                  </span>
                )}
              </div>
              
              {isPlaced && (
                <span style={{ 
                  position: isArrangeStep ? 'absolute' : 'static',
                  top: '6px', right: '6px',
                  fontSize: '11px', color: '#ff9800',
                  background: 'rgba(255,152,0,0.15)', border: '1px solid rgba(255,152,0,0.3)',
                  borderRadius: '50%', width: '18px', height: '18px', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center'
                }}>✓</span>
              )}
            </div>
          );
        })}
      </div>

      {/* footer instructions removed */}
    </div>
  );
};

export default LeftPanel;
