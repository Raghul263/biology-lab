import React, { useEffect, useRef } from 'react';
import useStore from '../lib/store';

const LabObserver = () => {
  const state = useStore();
  const lastActionTime = useRef(Date.now());
  const hintIndex = useRef(0);

  // Update last action time when major state changes
  useEffect(() => {
    lastActionTime.current = Date.now();
  }, [state.heldTool, state.onionRootsState, state.rootOnSlide, state.coverSlipPlaced]);

  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const idleTime = (now - lastActionTime.current) / 1000;

      if (idleTime > 45) {
        provideContextualHint();
        lastActionTime.current = now; // Reset timer so we don't spam
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [state]);

  const provideContextualHint = () => {
    const { 
      onionRootsState, onionPlacedOn, rootsInWatchGlass, 
      rootsInVial, fixationComplete, rootOnSlide, 
      slideFluids, coverSlipPlaced, squashed, showEnvFeedback 
    } = useStore.getState();

    // Contextual Logic for Subtle Hints
    if (onionRootsState === 'DRY') {
      showEnvFeedback("The onion bulb's base needs moisture to stimulate root growth.");
    } else if (onionRootsState === 'GROWN' && !onionPlacedOn) {
      showEnvFeedback("Fresh root tips are ready for collection. A scalpel and tile would be useful.");
    } else if (onionRootsState === 'CUT_FRESH' && !rootsInVial) {
      showEnvFeedback("Freshly cut tissue should be preserved in fixative to stop cell division at various stages.");
    } else if (rootsInVial && !fixationComplete) {
      showEnvFeedback("Fixation takes time. The aceto-alcohol is currently stabilizing the cellular structures.");
    } else if (fixationComplete && !rootsInWatchGlass && !rootOnSlide) {
      showEnvFeedback("The fixed roots are ready for softening. Hydrochloric acid in a watch glass is the standard next step.");
    } else if (rootOnSlide && slideFluids.length === 0) {
      showEnvFeedback("The tissue requires staining to make the chromosomes visible under magnification.");
    } else if (rootOnSlide && slideFluids.includes('STAIN') && !coverSlipPlaced) {
      showEnvFeedback("A cover slip will protect the lens and help in spreading the sample.");
    } else if (coverSlipPlaced && !squashed) {
      showEnvFeedback("The tissue layers are still too thick. A gentle squash with a needle handle might help.");
    }
  };

  // Special observation: Heating the slide
  useEffect(() => {
    if (state.slideHeatedTime > 0 && state.slideHeatedTime < 1) {
      state.showEnvFeedback("The heat facilitates the binding of the stain to the DNA.");
    }
  }, [state.slideHeatedTime > 0]);

  return null; // Non-visual component
};

export default LabObserver;
