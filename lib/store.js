import { create } from 'zustand';

// ─── 9-STEP BIOLOGICAL WORKFLOW ───────────────────────────
export const STEPS = {
  ARRANGE:          0,  // Place all equipment on table
  CUT_DRY_ROOTS:    1,  // Drag onion → tile, cut dry roots
  ROOT_GROWTH:      2,  // Place onion in water beaker, roots grow (3-6 days)
  CUT_FRESH_ROOTS:  3,  // Transfer onion → watch glass, cut 2-3cm fresh roots
  FIXATION:         4,  // Forceps → roots → open vial → drop → close → 24h
  PLACE_ON_SLIDE:   5,  // Open vial → pick root → place on glass slide
  CHEMICAL_TREAT:   6,  // HCl (1 drop) → Acetocarmine (2-3 drops) → slide turns red
  SLIDE_PREP:       7,  // Heat → blot → water drop → cover slip → squash
  MICROSCOPE:       8,  // Drag slide → microscope → observe mitosis
};

export const STEP_COUNT = 9;

// ─── STEP METADATA ────────────────────────────────────────
export const STEP_INFO = {
  [STEPS.ARRANGE]:         { title: 'Step 1 / 9 — Lab Setup',           instruction: 'Arrange all equipment on the lab table. Click each item in the left panel to place it.' },
  [STEPS.CUT_DRY_ROOTS]:   { title: 'Step 2 / 9 — Cut Dry Roots',       instruction: 'Drag the onion onto the cutting tile. Then select the blade and click the onion to cut the dry roots.' },
  [STEPS.ROOT_GROWTH]:     { title: 'Step 3 / 9 — Root Growth in Water', instruction: 'Place the onion on the water beaker. Observe root growth over 3–6 days.' },
  [STEPS.CUT_FRESH_ROOTS]: { title: 'Step 4 / 9 — Cut Fresh Roots',     instruction: 'Drag the onion from the beaker to the watch glass. Then select the blade and cut 2–3 cm of fresh root tips.' },
  [STEPS.FIXATION]:        { title: 'Step 5 / 9 — Fixation',            instruction: 'Use forceps to pick root tips from the watch glass. Open the vial cap, drop roots inside, and close the cap. Fix for 24 hours.' },
  [STEPS.PLACE_ON_SLIDE]:  { title: 'Step 6 / 9 — Place on Slide',      instruction: 'Open the vial, use forceps to pick one root tip, and place it on the glass slide.' },
  [STEPS.CHEMICAL_TREAT]:  { title: 'Step 7 / 9 — Chemical Treatment',  instruction: 'Dip the dropper into the HCl beaker and add 1 drop to the slide. Then dip into the Acetocarmine beaker and add 2–3 drops.' },
  [STEPS.SLIDE_PREP]:      { title: 'Step 8 / 9 — Slide Preparation',   instruction: 'Heat the slide gently on the burner. Blot with filter paper. Add a water drop. Place the cover slip. Tap gently with the needle.' },
  [STEPS.MICROSCOPE]:      { title: 'Step 9 / 9 — Microscope Analysis', instruction: 'Drag the prepared slide onto the microscope stage to observe the mitosis stages.' },
};

// ─── VOICE LINES ──────────────────────────────────────────
export const VOICE_LINES = {
  [STEPS.ARRANGE]:         'Arrange all equipment on the lab table to begin the experiment.',
  [STEPS.CUT_DRY_ROOTS]:   'Place the onion on the cutting tile and cut the dry roots using the blade.',
  [STEPS.ROOT_GROWTH]:     'Place the onion in water. Observe the root growth over 3 to 6 days.',
  [STEPS.CUT_FRESH_ROOTS]: 'Cut 2 to 3 centimeters of fresh root tips for the experiment.',
  [STEPS.FIXATION]:        'Use forceps to transfer root tips into the fixative vial containing aceto-alcohol.',
  [STEPS.PLACE_ON_SLIDE]:  'Open the vial and place one root tip onto the glass slide.',
  [STEPS.CHEMICAL_TREAT]:  'Add 1 drop of hydrochloric acid, then 2 to 3 drops of acetocarmine stain.',
  [STEPS.SLIDE_PREP]:      'Heat the slide gently. Blot excess stain. Add water. Place the cover slip and tap gently with the needle.',
  [STEPS.MICROSCOPE]:      'Place the slide on the microscope and observe the different stages of mitosis.',
};

// ─── INITIAL PLACED STATE ─────────────────────────────────
const INITIAL_PLACED = {
  waterBeaker: false,
  hclBeaker: false,
  stainBeaker: false,
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

// ─── INITIAL EXPERIMENT STATE ─────────────────────────────
const INITIAL_EXPERIMENT = {
  // Step 1-2
  onionOnTile: false,
  dryRootsCut: false,
  onionOnBeaker: false,
  rootsGrown: false,

  // Step 3-4
  onionAtWatchGlass: false,
  freshRootsCut: false,
  rootsInWatchGlass: false,
  rootsInForceps: false,
  vialCapOpen: false,
  rootsInVial: false,
  fixationComplete: false,

  // Step 5-6
  rootOnSlide: false,
  dropperContents: null, // null | 'hcl' | 'stain' | 'water'
  hclAdded: false,
  stainAdded: false,

  // Step 7
  heated: false,
  stainRemoved: false,
  waterDropAdded: false,
  coverSlipPlaced: false,
  squashed: false,

  // Step 8
  slideOnMicroscope: false,
};

// ─── STORE ────────────────────────────────────────────────
const useStore = create((set, get) => ({
  currentStep: STEPS.ARRANGE,
  heldTool: null,
  isVoiceEnabled: true,
  microscopeZoomed: false,
  wrongActionMessage: null,

  ...INITIAL_EXPERIMENT,

  placedComponents: { ...INITIAL_PLACED },
  setupPositions: {},

  // ─── Step Control ───────────────────────────────────────
  setStep: (step) => {
    set({ currentStep: step, wrongActionMessage: null });
    // Auto-narrate on step change
    const { narrate } = get();
    const voiceLine = VOICE_LINES[step];
    if (voiceLine) setTimeout(() => narrate(voiceLine), 300);
  },

  // ─── Wrong Action Handler ──────────────────────────────
  showWrongAction: (msg) => {
    set({ wrongActionMessage: msg || 'Follow the procedure.' });
    setTimeout(() => set({ wrongActionMessage: null }), 2500);
  },

  // ─── Reset ─────────────────────────────────────────────
  resetExperiment: () => set({
    currentStep: STEPS.ARRANGE,
    heldTool: null,
    microscopeZoomed: false,
    wrongActionMessage: null,
    ...INITIAL_EXPERIMENT,
    placedComponents: { ...INITIAL_PLACED },
    setupPositions: {},
  }),

  // ─── Tool Management ───────────────────────────────────
  setHeldTool: (tool) => set({ heldTool: tool }),

  // ─── Placement ─────────────────────────────────────────
  setPlaced: (id, isPlaced) => set((state) => ({
    placedComponents: { ...state.placedComponents, [id]: isPlaced }
  })),

  setSetupPosition: (id, position) => set((state) => ({
    setupPositions: { ...state.setupPositions, [id]: position }
  })),

  // ─── Check All Placed → Advance ───────────────────────
  checkAllPlaced: () => {
    const { placedComponents, setStep } = get();
    const allPlaced = Object.values(placedComponents).every(v => v === true);
    if (allPlaced) {
      setStep(STEPS.CUT_DRY_ROOTS);
    }
  },

  // ─── Microscope ────────────────────────────────────────
  toggleMicroscope: (zoomed) => set({ microscopeZoomed: zoomed }),

  // ─── Batch State Update ────────────────────────────────
  setStates: (states) => set((state) => ({ ...state, ...states })),

  // ─── Voice Narration ───────────────────────────────────
  narrate: (text) => {
    if (!get().isVoiceEnabled) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.95;
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Female')) || voices[0];
    if (preferredVoice) utterance.voice = preferredVoice;
    window.speechSynthesis.speak(utterance);
  },
}));

export default useStore;
