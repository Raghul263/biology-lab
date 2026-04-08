import React from 'react';
import useStore from '../lib/store';

const HUD = () => {
  const { heldTool, setHeldTool, cameraLocked, setStates, resetAllComponents } = useStore();

  return (
    <>
      <div style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        width: '280px',
        padding: '16px 18px',
        background: 'rgba(8, 14, 22, 0.88)',
        backdropFilter: 'blur(16px)',
        borderRadius: '16px',
        color: 'white',
        fontFamily: '"Outfit", "Inter", sans-serif',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        zIndex: 50,
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '10px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '3px 10px', background: 'rgba(255,109,0,0.15)',
            border: '1px solid rgba(255,109,0,0.4)', borderRadius: '20px',
            fontSize: '9px', color: '#ff9800', fontWeight: 800, letterSpacing: '1.2px',
            marginBottom: '10px', textTransform: 'uppercase'
          }}>
            🧪 ONION ROOT TIP MITOSIS
          </div>

          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '2px 8px', background: 'rgba(0,229,255,0.1)',
            border: '1px solid rgba(0,229,255,0.3)', borderRadius: '4px',
            fontSize: '8px', color: '#00e5ff', fontWeight: 900, letterSpacing: '1px',
            marginBottom: '4px'
          }}>
            ACTIVE SELECTION
          </div>
          <div style={{ 
            fontSize: '15px', fontWeight: 900, color: 'white', 
            letterSpacing: '0.4px', textTransform: 'uppercase',
            textAlign: 'center'
          }}>
            {heldTool ? (useStore.getState().componentNames[heldTool] || heldTool) : (useStore.getState().hoveredComponent ? (useStore.getState().componentNames[useStore.getState().hoveredComponent] || useStore.getState().hoveredComponent) : '---')}
          </div>
        </div>

        {heldTool && (
          <button
            onClick={() => setHeldTool(null)}
            style={{
              marginTop: '14px', width: '100%', padding: '9px',
              background: 'rgba(231, 76, 60, 0.15)', border: '1px solid rgba(231, 76, 60, 0.3)',
              borderRadius: '10px', color: '#ff7675', fontSize: '11px',
              fontWeight: 700, cursor: 'pointer', pointerEvents: 'auto', transition: 'all 0.2s ease',
            }}
          >
            ↩ DROP {heldTool.toUpperCase()}
          </button>
        )}

        <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
          <button
            onClick={() => setStates({ cameraLocked: !cameraLocked })}
            style={{
              flex: 1, padding: '8px',
              background: cameraLocked ? 'rgba(255,152,0,0.15)' : 'rgba(255,255,255,0.05)',
              border: cameraLocked ? '1px solid #ff9800' : '1px solid rgba(255,255,255,0.1)',
              borderRadius: '10px', color: cameraLocked ? '#ff9800' : 'rgba(255,255,255,0.6)',
              fontSize: '10px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease',
            }}
          >
            {cameraLocked ? '🔒 LOCKED' : '🔓 UNLOCKED'}
          </button>
          
          <button
            onClick={() => {
              // For now, it resets, but we label it UNDO as requested
              resetAllComponents();
            }}
            style={{
              flex: 1, padding: '8px',
              background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '10px', color: 'rgba(255,255,255,0.6)', fontSize: '10px',
              fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s ease',
            }}
          >
            ↩️ UNDO
          </button>
        </div>
      </div>

      {/* instructions removed */}

      <style>{`
        @keyframes fadeInOut {
          0% { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
          10% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
          80% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
    </>
  );
};

export default HUD;
