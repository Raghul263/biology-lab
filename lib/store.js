import { create } from 'zustand';

export const STEPS = {
  ARRANGE: 0,
  GROWTH_TILE: 1,
  CUT_INITIAL: 2,
  GROWTH_BEAKER: 3,
  CUT_FRESH: 4,
  TRANSFER_Vial: 5,
  FIXATION: 6,
  TREATMENT: 7,
  PREPARATION: 8,
  MICROSCOPE: 9,
  MITOSIS_STAGES: 10,
};

const useStore = create((set, get) => ({
  currentStep: STEPS.ARRANGE,
  heldTool: null,
  isVoiceEnabled: true,
  microscopeZoomed: false,
  placedComponents: {
    beaker: false,
    onion: false,
    tile: false,
    scalpel: false,
    forceps: false,
    needle: false,
    watchGlass: false,
    vial: false,
    dropper: false,
    burner: false,
    slide: false,
    coverSlip: false,
    filterPaper: false,
    microscope: false,
  },
  setupPositions: {},

  setStep: (step) => set({ currentStep: step }),
  
  setHeldTool: (tool) => set({ heldTool: tool }),
  
  setPlaced: (id, isPlaced) => set((state) => ({
    placedComponents: { ...state.placedComponents, [id]: isPlaced }
  })),
  
  setSetupPosition: (id, position) => set((state) => ({
    setupPositions: { ...state.setupPositions, [id]: position }
  })),
  
  toggleMicroscope: (zoomed) => set({ microscopeZoomed: zoomed }),
  
  setStates: (states) => set((state) => ({ ...state, ...states })),

  narrate: (text) => {
    if (!get().isVoiceEnabled) return;
    
    // Stop any current speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 0.8;
    
    // Use a natural sounding voice if available
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Female')) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;
    
    window.speechSynthesis.speak(utterance);
  },
}));

export default useStore;
