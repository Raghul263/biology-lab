import React from 'react';
import useStore, { STEPS } from '../lib/store';

const StatusBadge = ({ label, active, icon }) => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    gap: '7px',
    padding: '7px 14px',
    background: active ? 'rgba(42,157,143,0.2)' : 'rgba(255,255,255,0.05)',
    border: `1px solid ${active ? 'rgba(42,157,143,0.6)' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: '20px',
    fontSize: '12px',
    color: active ? '#4db6ac' : 'rgba(255,255,255,0.4)',
    fontWeight: active ? 600 : 400,
    transition: 'all 0.3s ease',
    boxShadow: active ? '0 0 10px rgba(42,157,143,0.3)' : 'none',
    flexShrink: 0,
  }}>
    <span style={{ fontSize: '14px' }}>{active ? icon : '○'}</span>
    {label}
  </div>
);

const BottomPanel = () => {
  const {
    currentStep,
    onionInBeaker,
    rootsGrown,
    acidTreated,
    rinsed,
    stainApplied,
    tipOnSlide,
    coverSlipApplied,
    slideOnMicroscope,
    resetExperiment,
    previousStep,
    microscopeZoomed,
  } = useStore();

  const magnification = slideOnMicroscope ? '400×' : 'OFF';

  const handleSaveResult = () => {
    const data = {
      step: currentStep,
      rootsGrown,
      acidTreated,
      rinsed,
      stainApplied,
      tipOnSlide,
      coverSlipApplied,
      slideOnMicroscope,
      savedAt: new Date().toISOString(),
    };
    console.log('Saved Result:', data);
    alert('✅ Experiment result saved! (Check console for data)');
  };

  return (
    <div style={{
      height: '70px',
      minHeight: '70px',
      background: 'rgba(8,12,18,0.92)',
      backdropFilter: 'blur(16px)',
      borderTop: '1px solid rgba(255,255,255,0.08)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 20px',
      gap: '10px',
      overflow: 'hidden',
    }}>
      {/* Lab title */}
      <div style={{
        fontSize: '11px',
        letterSpacing: '2px',
        color: '#4db6ac',
        fontWeight: 700,
        flexShrink: 0,
        marginRight: '8px',
      }}>
        STATUS
      </div>

      {/* Status badges */}
      <div style={{ display: 'flex', gap: '8px', flex: 1, overflowX: 'auto', scrollbarWidth: 'none' }}>
        <StatusBadge label="Root Growth" active={rootsGrown} icon="🌱" />
        <StatusBadge label="HCl Treatment" active={acidTreated} icon="🧪" />
        <StatusBadge label="Rinsed" active={rinsed} icon="💦" />
        <StatusBadge label="Stain Applied" active={stainApplied} icon="🔴" />
        <StatusBadge label="Slide Prepared" active={tipOnSlide} icon="🔲" />
        <StatusBadge label="Cover Slip" active={coverSlipApplied} icon="◻️" />
        <StatusBadge label="On Microscope" active={slideOnMicroscope} icon="🔬" />
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '7px',
          padding: '7px 14px',
          background: slideOnMicroscope ? 'rgba(156,39,176,0.2)' : 'rgba(255,255,255,0.05)',
          border: `1px solid ${slideOnMicroscope ? 'rgba(156,39,176,0.6)' : 'rgba(255,255,255,0.1)'}`,
          borderRadius: '20px',
          fontSize: '12px',
          color: slideOnMicroscope ? '#ce93d8' : 'rgba(255,255,255,0.4)',
          fontWeight: 600,
          flexShrink: 0,
        }}>
          🔍 {magnification}
        </div>
      </div>

      {/* Buttons */}
      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        <button
          onClick={previousStep}
          disabled={currentStep === STEPS.ARRANGE}
          style={{
            padding: '8px 18px',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '8px',
            color: currentStep === 1 ? 'rgba(255,255,255,0.2)' : 'white',
            fontSize: '12px',
            fontWeight: 600,
            cursor: currentStep === 1 ? 'not-allowed' : 'pointer',
            letterSpacing: '1px',
            transition: 'all 0.2s',
          }}
        >
          ← PREVIOUS
        </button>

        <button
          onClick={resetExperiment}
          style={{
            padding: '8px 18px',
            background: 'rgba(231,111,81,0.2)',
            border: '1px solid rgba(231,111,81,0.5)',
            borderRadius: '8px',
            color: '#ef9a9a',
            fontSize: '12px',
            fontWeight: 600,
            cursor: 'pointer',
            letterSpacing: '1px',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.target.style.background = 'rgba(231,111,81,0.35)'}
          onMouseLeave={e => e.target.style.background = 'rgba(231,111,81,0.2)'}
        >
          ↺ RESET
        </button>

        <button
          onClick={handleSaveResult}
          style={{
            padding: '8px 18px',
            background: currentStep >= STEPS.MICROSCOPE
              ? 'linear-gradient(135deg, #2a9d8f, #52b788)'
              : 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '8px',
            color: currentStep >= STEPS.MICROSCOPE ? 'white' : 'rgba(255,255,255,0.3)',
            fontSize: '12px',
            fontWeight: 700,
            cursor: currentStep >= STEPS.MICROSCOPE ? 'pointer' : 'not-allowed',
            letterSpacing: '1px',
          }}
        >
          💾 SAVE RESULT
        </button>
      </div>
    </div>
  );
};

export default BottomPanel;
