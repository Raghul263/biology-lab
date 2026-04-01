import React, { useEffect, useState } from 'react';
import useStore, { STEP_INFO } from '../lib/store';

const HUD = () => {
  const { currentStep, heldTool, setHeldTool, narrate, isVoiceEnabled, setStates, wrongActionMessage } = useStore();
  const info = STEP_INFO[currentStep] || { title: 'Biology Lab', instruction: 'Follow the laboratory procedure.' };

  useEffect(() => {
    narrate(`${info.title}. ${info.instruction}`);
  }, [currentStep]);

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '6px',
            padding: '3px 10px', background: 'rgba(255,109,0,0.15)',
            border: '1px solid rgba(255,109,0,0.4)', borderRadius: '20px',
            fontSize: '10px', color: '#ff9800', fontWeight: 700, letterSpacing: '1px',
          }}>
            🧪 EXPERIMENT
          </div>
          <button
            onClick={() => setStates({ isVoiceEnabled: !isVoiceEnabled })}
            style={{
              background: 'none', border: 'none',
              color: isVoiceEnabled ? '#ff9800' : 'rgba(255,255,255,0.3)',
              cursor: 'pointer', fontSize: '16px', pointerEvents: 'auto',
            }}
          >
            {isVoiceEnabled ? '🔊' : '🔇'}
          </button>
        </div>

        <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#ff9800', fontWeight: 700 }}>
          {info.title}
        </h3>
        <p style={{ margin: 0, fontSize: '0.82rem', opacity: 0.9, lineHeight: 1.55 }}>
          {info.instruction}
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
            ↩ RETURN {heldTool.toUpperCase()}
          </button>
        )}
      </div>

      {/* Wrong Action Toast */}
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
          ⚠️ {wrongActionMessage}
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
