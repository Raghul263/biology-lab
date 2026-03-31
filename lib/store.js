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

const INITIAL_PLACED = {
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
};

const useStore = create((set, get) => ({
  currentStep: STEPS.ARRANGE,
  heldTool: null,
  isVoiceEnabled: true,
  microscopeZoomed: false,
  
  // Experiment Flags
  onionInBeaker: false,
  onionPlacedOnTile: false,
  initialRootsGrown: false,
  beakerRootsGrown: false,
  rootsGrown: false, // UI alias
  acidTreated: false,
  rinsed: false,
  stainApplied: false,
  tipOnSlide: false,
  coverSlipApplied: false,
  slideOnMicroscope: false,
  
  // Interaction States
  rootTipsInWatchGlass: false,
  rootsInForceps: false,
  acidAdded: false,
  stainAdded: false,
  isCutting: false,

  placedComponents: { ...INITIAL_PLACED },
  setupPositions: {},

  setStep: (step) => set({ currentStep: step }),
  
  nextStep: () => {
    const { currentStep } = get();
    if (currentStep < STEPS.MITOSIS_STAGES) {
      set({ currentStep: currentStep + 1 });
    }
  },

  previousStep: () => {
    const { currentStep } = get();
    if (currentStep > STEPS.ARRANGE) {
      set({ currentStep: currentStep - 1 });
    }
  },

  resetExperiment: () => set({
    currentStep: STEPS.ARRANGE,
    heldTool: null,
    microscopeZoomed: false,
    onionInBeaker: false,
    onionPlacedOnTile: false,
    initialRootsGrown: false,
    beakerRootsGrown: false,
    rootsGrown: false,
    acidTreated: false,
    rinsed: false,
    stainApplied: false,
    tipOnSlide: false,
    coverSlipApplied: false,
    slideOnMicroscope: false,
    rootTipsInWatchGlass: false,
    rootsInForceps: false,
    acidAdded: false,
    stainAdded: false,
    isCutting: false,
    placedComponents: { ...INITIAL_PLACED },
    setupPositions: {}, // This forces components back to default positions
  }),
  
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
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.0;
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Female')) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;
    window.speechSynthesis.speak(utterance);
  },
}));

export default useStore;
