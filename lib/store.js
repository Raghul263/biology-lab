import { create } from 'zustand';

// ─── INITIAL PLACED STATE (Items on the table) ────────────────
const INITIAL_PLACED = {
  waterBeaker: false, hclBeaker: false, stainBeaker: false,
  onion: false, tile: false, scalpel: false, forceps: false,
  needle: false, watchGlass: false, vial: false, dropper: false,
  burner: false, slide: false, coverSlip: false, filterPaper: false,
  microscope: false,
};

const COMPONENT_NAMES = {
  waterBeaker: 'Water Beaker', hclBeaker: 'HCl Beaker', stainBeaker: 'Stain Beaker',
  onion: 'Onion Bulb', tile: 'Cutting Tile', scalpel: 'Scalpel', forceps: 'Forceps',
  needle: 'Needle', watchGlass: 'Watch Glass', vial: 'Fixative Vial', dropper: 'Dropper',
  burner: 'Bunsen Burner', slide: 'Glass Slide', coverSlip: 'Cover Slip', filterPaper: 'Filter Paper',
  microscope: 'Microscope',
};

// ─── FREE-FLOW EXPERIMENT STATE ─────────────────────────────
const INITIAL_EXPERIMENT = {
  onionPlacedOn: null, // 'tile', 'waterBeaker', 'watchGlass'
  onionInBeaker: false,
  rootGrowthStarted: false,
  rootGrowthCompleted: false,
  onionRootsState: 'DRY', // 'DRY', 'CUT_DRY', 'GROWN', 'CUT_FRESH'
  
  rootsInWatchGlass: false,
  rootsInForceps: false,
  rootsRemovedFromOnion: false,
  onionFinalPlaced: false, // New state for post-cut placement
  holdingRoot: false,
  rootInVial: false,
  rootOnSlide: false,
  dropperState: null, // null, "HCL_LOADED", "STAIN_LOADED"
  dropCount: 0, // 0 to 3 drops
  dropperHeadClicked: false,
  watchGlassHclApplied: false,
  watchGlassStainApplied: false,
  watchGlassWaterApplied: false,
  slideHclApplied: false,
  slideStainApplied: false,
  slideWaterApplied: false,
  fixationStarted: false,
  fixationCompleted: false,
  vialCapOpen: false,
  watchGlassRootCount: 0,
  
  rootProcessingState: 'FIXED', // 'FIXED', 'MACERATED', 'STAINED'
  
  watchGlassFluid: null, // null, 'HCL', 'STAIN'
  watchGlassHeatedTime: 0, // Track maceration/staining progress
  
  slideFluids: [], // Array to track drops on the slide e.g. ['HCL', 'STAIN', 'WATER']
  slideHeatedTime: 0, // Track heat evaporation
  
  coverSlipPlaced: false, 
  squashed: false,
  slideOnMicroscope: false,
  nearMicroscopeStage: false,
  slideOnBurner: false,
  burnerOn: false,
  slideHeated: false,
  slideHeatingProgress: 0,
  paperOnSlide: false,
  stainRemoved: false,
  cleaningProgress: 0,
  isCleaning: false,
  isSquashing: false,
  squashProgress: 0,
  
  // 🔬 Microscope Advanced View
  microscopeActive: false,
  zoomLevel: 4, // 4X, 10X, 40X, 100X
  selectedCell: null, // { phase: 'Metaphase', id: 12 }
  
  isCutting: false,
  cutStartTime: 0,
  hoveredComponent: null,

  // Step-based tracking for specialized logic
  currentStep: 1,
  rootTipsInWatchGlass: false,
  acidAdded: false,
  stainAdded: false,
  isHeatingSlide: false,
  heatingXOffset: 0,
};

export const STEPS = {
  PREPARATION: 1,
  CUT_INITIAL: 2,
  TREATMENT: 3,
  TRANSFER_Vial: 4,
};


// ─── STORE ────────────────────────────────────────────────
const useStore = create((set, get) => ({
  heldTool: null,
  microscopeZoomed: false,
  wrongActionMessage: null, // We can keep this just for general non-blocking physical feedback if needed

  ...INITIAL_EXPERIMENT,

  placedComponents: { ...INITIAL_PLACED },
  placementStack: [], // Tracks order of placement for UNDO
  setupPositions: {},
  setupRotations: {},
  componentNames: COMPONENT_NAMES,
  cameraLocked: false,
  lockedComponents: {},

  // ─── TOOL MANAGEMENT ───────────────────────────────────
  setHeldTool: (tool) => set({ heldTool: tool }),

  // ─── PLACEMENT ─────────────────────────────────────────
  setPlaced: (id, isPlaced) => set((state) => {
    const newStack = [...state.placementStack];
    if (isPlaced && !state.placedComponents[id]) {
      newStack.push(id);
    } else if (!isPlaced) {
      // Remove from stack if manually removed (though currently set to fixed)
      const index = newStack.indexOf(id);
      if (index > -1) newStack.splice(index, 1);
    }
    
    return {
      placedComponents: { ...state.placedComponents, [id]: isPlaced },
      placementStack: newStack
    };
  }),

  setSetupPosition: (id, position) => set((state) => ({
    setupPositions: { ...state.setupPositions, [id]: position }
  })),

  setSetupRotation: (id, rotation) => set((state) => ({
    setupRotations: { ...state.setupRotations, [id]: rotation }
  })),

  toggleComponentLock: (id) => set((state) => ({
    lockedComponents: {
      ...state.lockedComponents,
      [id]: !state.lockedComponents[id]
    }
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

  // ─── UNDO LAST PLACEMENT ────────────────────────────────
  undoPlacement: () => set((state) => {
    const newStack = [...state.placementStack];
    const lastId = newStack.pop();
    
    if (!lastId) return state;

    return {
      placementStack: newStack,
      placedComponents: { ...state.placedComponents, [lastId]: false },
      // If the undone item was the held tool, drop it
      heldTool: state.heldTool === lastId ? null : state.heldTool
    };
  }),

  // ─── RESET ALL (TOTAL RESTART) ──────────────────────────
  resetExperiment: () => set({
    heldTool: null,
    microscopeZoomed: false,
    wrongActionMessage: null,
    ...INITIAL_EXPERIMENT,
    placedComponents: { ...INITIAL_PLACED },
    placementStack: [],
    setupPositions: {},
    cameraLocked: false,
    lockedComponents: {},
  }),

  // ─── RESET ONLY COMPONENTS (RETURN TO BENCH) ───────────
  resetAllComponents: () => set({
    heldTool: null,
    placedComponents: { ...INITIAL_PLACED },
    placementStack: [],
    setupPositions: {},
    cameraLocked: false,
    lockedComponents: {},
    ...INITIAL_EXPERIMENT,
  }),
}));

export default useStore;
