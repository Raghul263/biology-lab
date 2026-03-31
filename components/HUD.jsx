import React, { useEffect } from 'react';
import useStore, { STEPS } from '../lib/store';

const HUD = () => {
  const { currentStep, heldTool, setHeldTool, narrate, isVoiceEnabled, setStates } = useStore();

  const getStepTitle = (step) => {
    switch(step) {
      case STEPS.ARRANGE:         return "Step 1 / 10 — Lab Setup";
      case STEPS.GROWTH_TILE:     return "Step 2 / 10 — Initial Growth";
      case STEPS.CUT_INITIAL:     return "Step 3 / 10 — Cut Dry Roots";
      case STEPS.GROWTH_BEAKER:   return "Step 4 / 10 — Nutrient Growth";
      case STEPS.CUT_FRESH:       return "Step 5 / 10 — Sampling Tips";
      case STEPS.TRANSFER_Vial:   return "Step 6 / 10 — Fixation Prep";
      case STEPS.FIXATION:        return "Step 7 / 10 — 24h Fixation";
      case STEPS.TREATMENT:       return "Step 8 / 10 — Chemical Staining";
      case STEPS.PREPARATION:     return "Step 9 / 10 — Slide Preparation";
      case STEPS.MICROSCOPE:      return "Step 10 / 10 — Observation";
      default: return "Biology Lab";
    }
  };

  const getStepInstruction = (step) => {
    switch(step) {
      case STEPS.ARRANGE:        return "Arrange all components correctly on the lab table to begin.";
      case STEPS.GROWTH_TILE:    return "Place the onion on the cutting tile. Observe the initial root growth.";
      case STEPS.CUT_INITIAL:    return "Use the scalpel to cut the dry roots. Place them into the watch glass.";
      case STEPS.GROWTH_BEAKER:  return "Place the onion bulb in the beaker with water for 3 to 6 days.";
      case STEPS.CUT_FRESH:      return "Cut 2–3 cm of fresh root tips for the experiment.";
      case STEPS.TRANSFER_Vial:  return "Use forceps to transfer the root tips into the Fixative Vial.";
      case STEPS.FIXATION:       return "Keep root tips in fixative for 24 hours. Then transfer to the slide.";
      case STEPS.TREATMENT:      return "Add HCl and stain, then heat gently using the Bunsen burner.";
      case STEPS.PREPARATION:    return "Remove the stain, cut the tip, add water, and place the cover slip.";
      case STEPS.MICROSCOPE:     return "Observe the slide under the microscope to see mitosis stages.";
      default: return "Follow the laboratory procedure.";
    }
  };

  useEffect(() => {
    const text = `${getStepTitle(currentStep)}. ${getStepInstruction(currentStep)}`;
    narrate(text);
  }, [currentStep, narrate]);

  return (
    <div style={{
      position: 'absolute',
      top: '16px',
      right: '16px',
      width: '260px',
      padding: '16px 18px',
      background: 'rgba(8, 14, 22, 0.85)',
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
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '3px 10px',
          background: 'rgba(42,157,143,0.2)',
          border: '1px solid rgba(42,157,143,0.4)',
          borderRadius: '20px',
          fontSize: '10px',
          color: '#4db6ac',
          fontWeight: 700,
          letterSpacing: '1px',
        }}>
          🧪 EXPERIMENT
        </div>
        <button 
          onClick={() => setStates({ isVoiceEnabled: !isVoiceEnabled })}
          style={{
            background: 'none',
            border: 'none',
            color: isVoiceEnabled ? '#4db6ac' : 'rgba(255,255,255,0.3)',
            cursor: 'pointer',
            fontSize: '16px',
            pointerEvents: 'auto',
          }}
        >
          {isVoiceEnabled ? '🔊' : '🔇'}
        </button>
      </div>

      <h3 style={{ margin: '0 0 8px 0', fontSize: '1rem', color: '#4db6ac', fontWeight: 700 }}>
        {getStepTitle(currentStep)}
      </h3>
      <p style={{ margin: 0, fontSize: '0.85rem', opacity: 0.9, lineHeight: 1.55 }}>
        {getStepInstruction(currentStep)}
      </p>

      {heldTool && (
        <button 
          onClick={() => setHeldTool(null)}
          style={{
            marginTop: '16px',
            width: '100%',
            padding: '10px',
            background: 'rgba(231, 76, 60, 0.15)',
            border: '1px solid rgba(231, 76, 60, 0.3)',
            borderRadius: '10px',
            color: '#ff7675',
            fontSize: '11px',
            fontWeight: 700,
            cursor: 'pointer',
            pointerEvents: 'auto',
            transition: 'all 0.2s ease',
          }}
        >
          ↩ RETURN INSTRUMENT
        </button>
      )}
    </div>
  );
};

export default HUD;

