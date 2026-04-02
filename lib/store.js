import { create } from 'zustand';

// ─── 9-STEP BIOLOGICAL WORKFLOW ───────────────────────────
export const STEPS = {
  ARRANGE:          0,
  CUT_DRY_ROOTS:    1,
  ROOT_GROWTH:      2,
  CUT_FRESH_ROOTS:  3,
  FIXATION:         4,
  PLACE_ON_SLIDE:   5,
  CHEMICAL_TREAT:   6,
  SLIDE_PREP:       7,
  MICROSCOPE:       8,
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

// ─── INITIAL PLACED STATE ─────────────────────────────────
const INITIAL_PLACED = {
  waterBeaker: false, hclBeaker: false, stainBeaker: false,
  onion: false, tile: false, scalpel: false, forceps: false,
  needle: false, watchGlass: false, vial: false, dropper: false,
  burner: false, slide: false, coverSlip: false, filterPaper: false,
  microscope: false,
};

// ─── INITIAL EXPERIMENT STATE ─────────────────────────────
const INITIAL_EXPERIMENT = {
  onionOnTile: false, dryRootsCut: false,
  onionOnBeaker: false, rootsGrown: false,
  onionAtWatchGlass: false, freshRootsCut: false,
  rootsInWatchGlass: false, rootsInForceps: false,
  vialCapOpen: false, rootsInVial: false, fixationComplete: false,
  rootOnSlide: false,
  dropperContents: null,
  hclAdded: false, stainAdded: false,
  heated: false, stainRemoved: false, waterDropAdded: false,
  coverSlipPlaced: false, squashed: false,
  slideOnMicroscope: false,
};

// ─── ALLOWED ACTIONS PER STEP ─────────────────────────────
const STEP_ACTIONS = {
  0: ['PLACE_ALL'],
  1: ['PLACE_ONION_TILE', 'CUT_DRY_ROOT'],
  2: ['PLACE_ONION_WATER'],
  3: ['MOVE_TO_WATCHGLASS', 'CUT_FRESH_ROOT'],
  4: ['PICK_ROOT_FORCEPS', 'OPEN_VIAL', 'DROP_ROOT', 'CLOSE_VIAL'],
  5: ['OPEN_VIAL', 'PICK_ROOT_VIAL', 'PLACE_ROOT_SLIDE'],
  6: ['DIP_HCL', 'ADD_HCL', 'DIP_STAIN', 'ADD_STAIN'],
  7: ['HEAT', 'BLOT', 'DIP_WATER', 'ADD_WATER', 'COVER_SLIP', 'SQUASH'],
  8: ['PLACE_MICROSCOPE', 'ZOOM_MICROSCOPE'],
};

// ─── STORE ────────────────────────────────────────────────
const useStore = create((set, get) => ({
  currentStep: STEPS.ARRANGE,
  heldTool: null,
  microscopeZoomed: false,
  wrongActionMessage: null,

  ...INITIAL_EXPERIMENT,

  placedComponents: { ...INITIAL_PLACED },
  setupPositions: {},

  // ─── STRICT STEP CONTROL ────────────────────────────────
  setStep: (step) => {
    set({ currentStep: step, wrongActionMessage: null });
  },

  // ─── ACTION VALIDATION ──────────────────────────────────
  validateAction: (action) => {
    const { currentStep, showWrongAction } = get();
    const allowed = STEP_ACTIONS[currentStep] || [];
    if (!allowed.includes(action)) {
      showWrongAction('Follow the procedure.');
      return false;
    }
    return true;
  },

  // ─── WRONG ACTION (BLOCKING) ────────────────────────────
  showWrongAction: (msg) => {
    set({ wrongActionMessage: msg || 'Follow the procedure.' });
    setTimeout(() => set({ wrongActionMessage: null }), 2500);
  },

  // ─── STEP ADVANCEMENT (AUTO) ────────────────────────────
  advanceStep: () => {
    const s = get();
    const checks = [
      () => Object.values(s.placedComponents).every(v => v),
      () => s.dryRootsCut,
      () => s.rootsGrown,
      () => s.freshRootsCut,
      () => s.fixationComplete,
      () => s.rootOnSlide,
      () => s.hclAdded && s.stainAdded,
      () => s.squashed,
      () => s.slideOnMicroscope,
    ];
    if (s.currentStep < STEP_COUNT && checks[s.currentStep] && checks[s.currentStep]()) {
      setTimeout(() => {
        get().setStep(s.currentStep + 1);
      }, 800);
    }
  },

  // ─── RESET ──────────────────────────────────────────────
  resetExperiment: () => set({
    currentStep: STEPS.ARRANGE,
    heldTool: null,
    microscopeZoomed: false,
    wrongActionMessage: null,
    ...INITIAL_EXPERIMENT,
    placedComponents: { ...INITIAL_PLACED },
    setupPositions: {},
  }),

  // ─── TOOL MANAGEMENT ───────────────────────────────────
  setHeldTool: (tool) => set({ heldTool: tool }),

  // ─── PLACEMENT ─────────────────────────────────────────
  setPlaced: (id, isPlaced) => set((state) => ({
    placedComponents: { ...state.placedComponents, [id]: isPlaced }
  })),

  setSetupPosition: (id, position) => set((state) => ({
    setupPositions: { ...state.setupPositions, [id]: position }
  })),

  // ─── CHECK ALL PLACED (STEP 0 → STEP 1) ────────────────
  checkAllPlaced: () => {
    const { placedComponents, setStep } = get();
    const allPlaced = Object.values(placedComponents).every(v => v === true);
    if (allPlaced) {
      setStep(STEPS.CUT_DRY_ROOTS);
    }
  },

  // ─── MICROSCOPE ────────────────────────────────────────
  toggleMicroscope: (zoomed) => set({ microscopeZoomed: zoomed }),

  // ─── BATCH STATE UPDATE ────────────────────────────────
  setStates: (states) => set((state) => ({ ...state, ...states })),
}));

export default useStore;
