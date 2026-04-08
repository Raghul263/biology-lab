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
      setHeldTool(inst.id); 
    } else {
      // PERMANENT FIX: Disable picking up the onion from sidebar once it's fixed to the table
      if (inst.id === 'onion') return;
      
      // Other components can still be picked up to reposition
      setHeldTool(heldTool === inst.id ? null : inst.id);
    }
  };

  const allPlaced = Object.values(placedComponents).every(v => v);

  return (
    <div style={{
      width: '280px', minWidth: '280px', height: '100%',
      background: 'rgba(10,15,22,0.92)', backdropFilter: 'blur(20px)',
      borderRight: '1px solid rgba(255,255,255,0.1)',
      display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden',
    }}>
      {/* header removed */}

      <div style={{
        flex: 1, 
        overflowY: 'auto', 
        padding: '16px 12px',
        scrollbarWidth: 'thin', 
        scrollbarColor: 'rgba(255,109,0,0.5) transparent',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '12px',
      }}>
        {instruments.map((inst) => {
          const isPlaced = placedComponents[inst.id];
          const isSelected = heldTool === inst.id;

          return (
            <div
              key={inst.id}
              style={{
                background: isSelected ? 'rgba(255,152,0,0.2)' : isPlaced ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.06)',
                border: isSelected ? '1px solid #ff9800' : isPlaced ? '1px solid rgba(255,255,255,0.08)' : '1px solid rgba(255,255,255,0.15)',
                borderRadius: '14px', 
                padding: '12px 8px', 
                cursor: 'pointer', transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: isPlaced && !isSelected ? 0.45 : 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '8px',
                position: 'relative',
                boxShadow: isSelected ? '0 0 15px rgba(255,152,0,0.2)' : 'none',
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
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, width: '100%' }}>
                <span style={{ fontSize: '32px', marginBottom: '4px', filter: isPlaced ? 'grayscale(0.5)' : 'none' }}>{inst.icon}</span>
                <span style={{ 
                  color: isSelected ? '#ff9800' : 'rgba(255,255,255,0.95)', 
                  fontSize: '10px', fontWeight: 800, 
                  letterSpacing: '0.6px',
                  textTransform: 'uppercase', textAlign: 'center',
                  width: '100%', 
                  wordWrap: 'break-word',
                  lineHeight: '1.3'
                }}>
                  {inst.name}
                </span>
              </div>
              
              {isPlaced && (
                <span style={{ 
                  position: 'absolute',
                  top: '8px', right: '8px',
                  fontSize: '10px', color: '#ff9800',
                  background: 'rgba(255,152,0,0.2)', 
                  border: '1px solid rgba(255,152,0,0.4)',
                  borderRadius: '50%', width: '16px', height: '16px', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 'bold'
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
