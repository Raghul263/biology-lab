import React from 'react';
import useStore from '../lib/store';



const instruments = [
  { id: 'waterBeaker', icon: <img src="/water_icon.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Water" />, name: 'Water Beaker', desc: 'For root growth' },
  { id: 'hclBeaker', icon: <img src="/hcl_icon.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="HCl" />, name: 'HCl Beaker', desc: 'N/10 Hydrochloric Acid' },
  { id: 'stainBeaker', icon: <img src="/stain_icon.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Stain" />, name: 'Stain Beaker', desc: 'Acetocarmine Stain' },
  { id: 'onion', icon: <img src="/onion_icon.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Onion" />, name: 'Onion Bulb', desc: 'Onion with roots' },
  { id: 'tile', icon: <img src="/tile_icon.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Tile" />, name: 'Cutting Tile', desc: 'Flat ceramic surface' },
  { id: 'scalpel', icon: <img src="/scalpel_icon.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Scalpel" />, name: 'Scalpel / Blade', desc: 'Surgical cutting tool' },
  { id: 'forceps', icon: <img src="/forceps_icon.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Forceps" />, name: 'Forceps', desc: 'For handling root tips' },
  { id: 'needle', icon: <img src="/needle_icon.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Needle" />, name: 'Needle', desc: 'For squashing tissue' },
  { id: 'watchGlass', icon: <img src="/watchglass_icon.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Watch Glass" />, name: 'Watch Glass', desc: 'For root tip collection' },
  { id: 'vial', icon: <img src="/vial_icon.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Vial" />, name: 'Fixative Vial', desc: 'Aceto-alcohol (1:3)' },
  { id: 'dropper', icon: <img src="/dropper_icon.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Dropper" />, name: 'Dropper', desc: 'For HCl and staining' },
  { id: 'burner', icon: <img src="/burner_icon.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Burner" />, name: 'Bunsen Burner', desc: 'For gentle heating' },
  { id: 'slide', icon: <img src="/slide_icon.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Slide" />, name: 'Glass Slide', desc: 'Mounting surface' },
  { id: 'coverSlip', icon: <img src="/coverslip_icon.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Cover Slip" />, name: 'Cover Slip', desc: 'Small glass square' },
  { id: 'filterPaper', icon: <img src="/filterpaper_icon.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Filter" />, name: 'Filter Paper', desc: 'For blotting stain' },
  { id: 'microscope', icon: <img src="/microscope_icon.png" style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="Microscope" />, name: 'Microscope', desc: 'Compound microscope' },
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
                <div style={{ 
                  width: '62px', height: '62px', marginBottom: '6px', 
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(0,0,0,0.35)', borderRadius: '50%', overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: 'inset 0 0 10px rgba(0,0,0,0.5)',
                  clipPath: 'circle(50%)'
                }}>
                  {inst.icon}
                </div>
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
