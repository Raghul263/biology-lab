import React from 'react';
import useStore, { STEPS, STEP_COUNT } from '../lib/store';

const StatusBadge = ({ label, active, icon }) => (
  <div style={{
    display: 'flex', alignItems: 'center', gap: '7px', padding: '7px 14px',
    background: active ? 'rgba(255,109,0,0.15)' : 'rgba(255,255,255,0.05)',
    border: `1px solid ${active ? 'rgba(255,109,0,0.4)' : 'rgba(255,255,255,0.1)'}`,
    borderRadius: '20px', fontSize: '12px',
    color: active ? '#ff9800' : 'rgba(255,255,255,0.4)',
    fontWeight: active ? 600 : 400, transition: 'all 0.3s ease',
    boxShadow: active ? '0 0 10px rgba(255,109,0,0.2)' : 'none', flexShrink: 0,
  }}>
    <span style={{ fontSize: '14px' }}>{active ? icon : '○'}</span>
    {label}
  </div>
);

const BottomPanel = () => {
  const {
    currentStep, dryRootsCut, rootsGrown, hclAdded, stainAdded,
    rootOnSlide, coverSlipPlaced, squashed, slideOnMicroscope,
    resetExperiment,
  } = useStore();

  const handleSaveResult = () => {
    if (currentStep < STEPS.MICROSCOPE) return;
    const data = {
      step: currentStep, dryRootsCut, rootsGrown, hclAdded, stainAdded,
      rootOnSlide, coverSlipPlaced, squashed, slideOnMicroscope,
      savedAt: new Date().toISOString(),
    };
    console.log('Saved Result:', data);
    alert('✅ Experiment result saved! (Check console for data)');
  };

  return (
    <div style={{
      height: '70px', minHeight: '70px', background: 'rgba(8,12,18,0.92)',
      backdropFilter: 'blur(16px)', borderTop: '1px solid rgba(255,255,255,0.08)',
      display: 'flex', alignItems: 'center', padding: '0 20px', gap: '10px', overflow: 'hidden',
    }}>
      <div style={{
        fontSize: '11px', letterSpacing: '2px', color: '#ff9800',
        fontWeight: 700, flexShrink: 0, marginRight: '8px',
      }}>
        STEP {currentStep + 1} / {STEP_COUNT}
      </div>

      <div style={{ display: 'flex', gap: '8px', flex: 1, overflowX: 'auto', scrollbarWidth: 'none' }}>
        <StatusBadge label="Roots Cut" active={dryRootsCut} icon="✂️" />
        <StatusBadge label="Root Growth" active={rootsGrown} icon="🌱" />
        <StatusBadge label="HCl Added" active={hclAdded} icon="🧪" />
        <StatusBadge label="Stain Added" active={stainAdded} icon="🔴" />
        <StatusBadge label="On Slide" active={rootOnSlide} icon="🔲" />
        <StatusBadge label="Cover Slip" active={coverSlipPlaced} icon="◻️" />
        <StatusBadge label="Squashed" active={squashed} icon="🔨" />
        <StatusBadge label="Microscope" active={slideOnMicroscope} icon="🔬" />
      </div>

      <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
        <button
          onClick={resetExperiment}
          style={{
            padding: '8px 18px', background: 'rgba(231,111,81,0.2)',
            border: '1px solid rgba(231,111,81,0.5)', borderRadius: '8px',
            color: '#ef9a9a', fontSize: '12px', fontWeight: 600,
            cursor: 'pointer', letterSpacing: '1px', transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.target.style.background = 'rgba(231,111,81,0.35)'}
          onMouseLeave={e => e.target.style.background = 'rgba(231,111,81,0.2)'}
        >
          ↺ RESET
        </button>

      </div>
    </div>
  );
};

export default BottomPanel;
