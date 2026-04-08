import React from 'react';
import useStore from '../lib/store';

const FlaskIcon = ({ color }) => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))' }}>
    <path d="M9 3H15M10 3V10L6 18C5 20 6.5 22 9 22H15C17.5 22 19 20 18 18L14 10V3" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M8.5 13H15.5L17 18C17.5 19.5 16.5 20.5 15 20.5H9C7.5 20.5 6.5 19.5 7 18L8.5 13Z" fill={color} opacity="0.8"/>
    <path d="M11 5H13" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.5"/>
  </svg>
);

const ForcepsIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M11 4L7 20M13 4L17 20" stroke="#bdc3c7" strokeWidth="2" strokeLinecap="round"/>
    <path d="M10 6L14 6" stroke="#bdc3c7" strokeWidth="1"/>
    <path d="M11 4C11 3.44772 11.4477 3 12 3C12.5523 3 13 3.44772 13 4" stroke="#bdc3c7" strokeWidth="2"/>
  </svg>
);

const NeedleIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 14V21" stroke="#bdc3c7" strokeWidth="1" strokeLinecap="round"/>
    <rect x="10" y="3" width="4" height="11" rx="1.5" fill="#34495e"/>
    <path d="M12 11V14" stroke="white" strokeWidth="0.5" opacity="0.5"/>
  </svg>
);

const WatchGlassIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12" stroke="white" strokeWidth="1.5" strokeOpacity="0.4"/>
    <ellipse cx="12" cy="11" rx="9" ry="5" stroke="white" strokeWidth="1.5" strokeOpacity="0.8"/>
    <path d="M5 11C5 13.7614 8.13401 16 12 16C15.866 16 19 13.7614 19 11" stroke="white" strokeWidth="1" strokeOpacity="0.3"/>
  </svg>
);

const instruments = [
  { id: 'waterBeaker', icon: <FlaskIcon color="#4fc3f7" />, name: 'Water Beaker', desc: 'For root growth' },
  { id: 'hclBeaker', icon: <FlaskIcon color="#dce775" />, name: 'HCl Beaker', desc: 'N/10 Hydrochloric Acid' },
  { id: 'stainBeaker', icon: <FlaskIcon color="#e91e63" />, name: 'Stain Beaker', desc: 'Acetocarmine Stain' },
  { id: 'onion', icon: '🧅', name: 'Onion Bulb', desc: 'Onion with roots' },
  { id: 'tile', icon: '⬜', name: 'Cutting Tile', desc: 'Flat ceramic surface' },
  { id: 'scalpel', icon: '🔪', name: 'Scalpel / Blade', desc: 'Surgical cutting tool' },
  { id: 'forceps', icon: <ForcepsIcon />, name: 'Forceps', desc: 'For handling root tips' },
  { id: 'needle', icon: <NeedleIcon />, name: 'Needle', desc: 'For squashing tissue' },
  { id: 'watchGlass', icon: <WatchGlassIcon />, name: 'Watch Glass', desc: 'For root tip collection' },
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
