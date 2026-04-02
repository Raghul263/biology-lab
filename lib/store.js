import { create } from 'zustand';

// ─── INITIAL PLACED STATE (Items on the table) ────────────────
const INITIAL_PLACED = {
  waterBeaker: false, hclBeaker: false, stainBeaker: false,
  onion: false, tile: false, scalpel: false, forceps: false,
  needle: false, watchGlass: false, vial: false, dropper: false,
  burner: false, slide: false, coverSlip: false, filterPaper: false,
  microscope: false,
};

// ─── FREE-FLOW EXPERIMENT STATE ─────────────────────────────
const INITIAL_EXPERIMENT = {
  onionPlacedOn: null, // 'tile', 'waterBeaker', 'watchGlass'
  onionRootsState: 'DRY', // 'DRY', 'CUT_DRY', 'GROWN', 'CUT_FRESH'
  
  rootsInWatchGlass: false,
  rootsInForceps: false,
  rootsRemovedFromOnion: false,
  vialCapOpen: false, 
  rootsInVial: false, 
  fixationTime: 0, // Used to track 24h simulation
  
  rootOnSlide: false,
  dropperContents: null, // 'HCL', 'STAIN', 'WATER'
  
  slideFluids: [], // Array to track drops on the slide e.g. ['HCL', 'STAIN', 'WATER']
  slideHeatedTime: 0, // Track heat evaporation
  
  coverSlipPlaced: false, 
  squashed: false,
  slideOnMicroscope: false,
};

// ─── STORE ────────────────────────────────────────────────
const useStore = create((set, get) => ({
  heldTool: null,
  microscopeZoomed: false,
  wrongActionMessage: null, // We can keep this just for general non-blocking physical feedback if needed

  ...INITIAL_EXPERIMENT,

  placedComponents: { ...INITIAL_PLACED },
  setupPositions: {},

  // ─── TOOL MANAGEMENT ───────────────────────────────────
  setHeldTool: (tool) => set({ heldTool: tool }),

  // ─── PLACEMENT ─────────────────────────────────────────
  setPlaced: (id, isPlaced) => set((state) => ({
    placedComponents: { ...state.placedComponents, [id]: isPlaced }
  })),

  setSetupPosition: (id, position) => set((state) => ({
    setupPositions: { ...state.setupPositions, [id]: position }
  })),

  // ─── MICROSCOPE ────────────────────────────────────────
  toggleMicroscope: (zoomed) => set({ microscopeZoomed: zoomed }),

  // ─── WRONG ACTION (NON-BLOCKING FEEDBACK) ──────────────
  showWrongAction: (msg) => {
    set({ wrongActionMessage: msg });
    setTimeout(() => set({ wrongActionMessage: null }), 2500);
  },

  // ─── BATCH STATE UPDATE ────────────────────────────────
  setStates: (states) => set((state) => ({ ...state, ...states })),

  // ─── RESET ALL (TOTAL RESTART) ──────────────────────────
  resetExperiment: () => set({
    heldTool: null,
    microscopeZoomed: false,
    wrongActionMessage: null,
    ...INITIAL_EXPERIMENT,
    placedComponents: { ...INITIAL_PLACED },
    setupPositions: {},
  }),

  // ─── RESET ONLY COMPONENTS (RETURN TO BENCH) ───────────
  resetAllComponents: () => set({
    heldTool: null,
    placedComponents: { ...INITIAL_PLACED },
    setupPositions: {},
  }),
}));

export default useStore;
