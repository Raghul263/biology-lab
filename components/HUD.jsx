import React from 'react';
import useStore from '../lib/store';

const HUD = () => {
  const { heldTool, setHeldTool, wrongActionMessage } = useStore();

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '3px 10px', background: 'rgba(255,109,0,0.15)',
            border: '1px solid rgba(255,109,0,0.4)', borderRadius: '20px',
            fontSize: '10px', color: '#ff9800', fontWeight: 700, letterSpacing: '1px',
          }}>
            🧪 ONION ROOT TIP MITOSIS
          </div>
        </div>

        <h3 style={{ margin: '0 0 6px 0', fontSize: '1rem', color: '#ff9800', fontWeight: 700 }}>
          Free-Flow Simulator
        </h3>
        <p style={{ margin: 0, fontSize: '0.82rem', opacity: 0.9, lineHeight: 1.55 }}>
          Experiment freely using the tools. Interactions are strictly physics-based.
        </p>

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

        <button
          onClick={() => {
            if (window.confirm("Return all equipment to the instrument bench? (Current experiment progress will be kept)")) {
              useStore.getState().resetAllComponents();
            }
          }}
          style={{
            marginTop: '10px', width: '100%', padding: '8px',
            background: 'rgba(255, 255, 255, 0.05)', border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '10px', color: 'rgba(255,255,255,0.6)', fontSize: '10px',
            fontWeight: 600, cursor: 'pointer', pointerEvents: 'auto', transition: 'all 0.2s ease',
            textTransform: 'uppercase', letterSpacing: '1px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
        >
          🔄 RESET EQUIPMENT
        </button>
      </div>

      {/* Action Toast */}
      {wrongActionMessage && (
        <div style={{
          position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
          padding: '14px 28px', background: 'rgba(231, 76, 60, 0.9)',
          borderRadius: '12px', color: 'white', fontSize: '14px', fontWeight: 700,
          fontFamily: '"Inter", sans-serif', zIndex: 200,
          boxShadow: '0 8px 32px rgba(231,76,60,0.4)',
          animation: 'fadeInOut 2.5s ease-in-out',
          pointerEvents: 'none',
        }}>
          💡 {wrongActionMessage}
        </div>
      )}

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
