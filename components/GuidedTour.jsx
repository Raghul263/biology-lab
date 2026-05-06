'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Play, Pause, X, ChevronRight, ChevronLeft, Volume2, VolumeX, FlaskConical, Languages, Check, BookOpen } from 'lucide-react';
import useStore from '../lib/store';
import { useVoiceAssistant } from '../lib/useVoiceAssistant';

// ─── Tour Content ────────────────────────────────────────────────────────────
const TOUR_CONTENT = {
  en: {
    intro: "Welcome to the Virtual Biology Lab! Today we'll study Mitosis in Onion Root Tip using a slide-based preparation method.",
    drycut: "First, place the Onion Bulb on the cutting tile. Use the Scalpel to cut off the old, dry roots. This encourages fresh root growth.",
    grow: "Transfer the onion to the Water Beaker. Let it sit for 3-6 days to grow fresh, active root tips.",
    freshcut: "Transfer the onion to the Watch Glass. Use the scalpel to cleanly cut the fresh root tips, ideally 5 to 10 millimeters long.",
    fixative: "Use Forceps to pick up the fresh root tips and place them directly into the Fixative Vial for fixation.",
    slide: "Place the Glass Slide on the table. Use the forceps to safely transfer the root tip from the vial onto the center of the slide.",
    hcl: "Using the Dropper, add Hydrochloric Acid (HCl) to the root on the slide. This softens the cell walls for easier squashing.",
    stain: "Next, add Acetocarmine Stain using the dropper. This will color the chromosomes, making them visible under the microscope.",
    burner: "Briefly heat the slide over the Bunsen Burner. This helps the stain penetrate the tissue and fixes the cells.",
    blot: "Carefully place Filter Paper over the root and blot gently to remove any excess acid or stain.",
    water: "Add a single drop of clean water to the tissue using the dropper to maintain hydration.",
    coverslip: "Place a Cover Slip over the root. Use a Needle to firmly squash the tissue into a single layer of cells.",
    microscope: "Finally, place the prepared slide on the Microscope stage. We are now ready to observe the stages of mitosis.",
    lens4x: "Switch to the 4x scanning lens. This magnification provides a broad view of the entire root tip structure.",
    lens10x: "Rotate to the 10x low power lens. You can now clearly identify the meristematic zone where cells are dividing.",
    lens40x: "Switch to the 40x high power lens. Individual cells and their nuclei are now visible. Look for cells in different mitotic stages.",
    lens100x: "At 100x magnification, use the fine focus. You can now clearly see chromosomes in Prophase, Metaphase, Anaphase, and Telophase. 🎉",
    workoutNow: "WORKOUT NOW",
    practiceNow: "PRACTICE NOW",
  },
  mr: {
    intro: "व्हर्च्युअल बायोलॉजी लॅबमध्ये आपले स्वागत आहे! आज आपण स्लाइड-आधारित तयारी पद्धती वापरून कांद्याच्या मुळाच्या टोकामध्ये समसूत्री विभाजनाचा (माइटोसिस) अभ्यास करणार आहोत।",
    drycut: "प्रथम, कांदा कटिंग टाइलवर ठेवा. जुनी, वाळलेली मुळे कापण्यासाठी स्केलपेल वापरा. यामुळे मुळांच्या नवीन वाढीस चालना मिळते।",
    grow: "कांदा पाण्याच्या बीकरमध्ये ठेवा. ताजी मुळे येण्यासाठी ३ ते ६ दिवस वाट पहा।",
    freshcut: "कांदा वॉच ग्लासवर ठेवा. स्केलपेल वापरून ताजी मुळे ५ ते १० मिलीमीटर लांबीची कापून घ्या।",
    fixative: "फोर्सेप्स वापरून मुळांची टोके उचलून फिक्सेटिव्ह व्हायलमध्ये टाका।",
    slide: "ग्लास स्लाइड टेबलवर ठेवा. मुळाचे टोक वायल मधून काढून स्लाइडच्या मध्यभागी ठेवा।",
    hcl: "ड्रॉपर वापरून, मुळावर हायड्रोक्लोरिक आम्ल (HCl) टाका. यामुळे पेशींच्या भिंती मऊ होतात।",
    stain: "त्यानंतर, ड्रॉपरने एसिटोकार्मिन स्टेन टाका. यामुळे गुणसूत्र रंगीत होतात आणि सूक्ष्मदर्शकाखाली स्पष्ट दिसतात।",
    burner: "स्लाइड बुन्सन बर्नरवर थोडा वेळ धरून गरम करा. यामुळे रंग पेशींच्या आत व्यवस्थित शिरतो।",
    blot: "फिल्टर पेपर वापरून जादा आम्ल आणि रंग हळुवारपणे पुसून काढा।",
    water: "मुळावर शुद्ध पाण्याचा एक थेंब टाका जेणेकरून ते कोरडे पडणार नाही।",
    coverslip: "मुळावर कव्हर स्लिप ठेवा आणि सुईने दाबा जेणेकरून पेशींचा एक पातळ थर तयार होईल।",
    microscope: "शेवटी, तयार स्लाइड सूक्ष्मदर्शकाच्या स्टेजवर ठेवा. आता आपण माइटोसिसच्या पायऱ्या पाहण्यासाठी तयार आहोत।",
    lens4x: "4x स्कॅनिंग लेन्सवर स्विच करा. यामुळे मुळाच्या संरचनेचे विहंगम दृश्य दिसते।",
    lens10x: "आता 10x लो पॉवर लेन्सवर जा. जेथे पेशींचे विभाजन होत आहे तो भाग स्पष्टपणे ओळखता येईल।",
    lens40x: "40x हाय पॉवर लेन्सवर स्विच करा. येथे पेशी आणि त्यांचे केंद्रक स्पष्ट दिसतील।",
    lens100x: "100x मॅग्निफिकेशनवर, गुणसूत्रांचे बारकाईने निरीक्षण करा. आपल्याला प्रोफेज ते टेलोफेज पर्यंतचे सर्व टप्पे स्पष्ट दिसतील। 🎉",
    workoutNow: "वर्कआउट करा",
    practiceNow: "सराव करा",
  },
  te: {
    intro: "వర్చువల్ బయాలజీ ల్యాబ్‌కు స్వాగతం! ఈరోజు మనం స్లైడ్ ఆధారిత తయారీ పద్ధతిని ఉపయోగించి ఉల్లిపాయ వేరు చివరలో సమవిభజన (మైటోసిస్) గురించి అధ్యయనం చేస్తాము.",
    drycut: "మొదట, ఉల్లిపాయను కట్టింగ్ టైల్ మీద ఉంచండి. పాత, ఎండిన వేర్లను కత్తిరించడానికి మాడ్పు (Scalpel) ఉపయోగించండి. ఇది కొత్త వేర్ల పెరుగుదలకు సహాయపడుతుంది.",
    grow: "ఉల్లిపాయను నీటి బీకర్‌లోకి మార్చండి. కొత్త వేర్లు పెరగడానికి 3 నుండి 6 రోజుల వరకు అలాగే ఉంచండి.",
    freshcut: "ఉల్లిపాయను వాచ్ గ్లాస్‌లోకి మార్చండి. కొత్త వేరు చివరలను 5 నుండి 10 మిల్లీమీటర్ల పొడవుతో కత్తిరించండి.",
    fixative: "చిమ్టా (Forceps) ఉపయోగించి వేరు చివరలను తీసి ఫిక్సేటివ్ వైల్‌లో ఉంచండి.",
    slide: "గాజు స్లైడ్ టేబుల్ మీద ఉంచండి. వేరు చివరను స్లైడ్ మధ్యలోకి జాగ్రత్తగా మార్చండి.",
    hcl: "డ్రాపర్ ఉపయోగించి, స్లైడ్ మీద ఉన్న వేరుపై హైడ్రోక్లోరిక్ ఆమ్లం (HCl) వేయండి. ఇది కణ కవచాలను మెత్తబరుస్తుంది.",
    stain: "తరువాత ఎసిటోకార్మిన్ స్టెయిన్ వేయండి. ఇది క్రోమోజోములకు రంగును అందిస్తుంది, తద్వారా మైక్రోస్కోప్ కింద అవి స్పష్టంగా కనిపిస్తాయి.",
    burner: "స్లైడ్‌ను బన్సెన్ బర్నర్ మీద కొద్దిగా వేడి చేయండి. ఇది రంగు కణజాలంలోకి వెళ్లడానికి సహాయపడుతుంది.",
    blot: "ఫిల్టర్ పేపర్ ఉపయోగించి అదనపు ఆమ్లం లేదా స్టెయిన్‌ను జాగ్రత్తగా తుడిచివేయండి.",
    water: "వేరుపై ఒక చుక్క శుభ్రమైన నీటిని వేయండి.",
    coverslip: "వేరుపై కవర్ స్లిప్ ఉంచండి. సూది ఉపయోగించి కణజాలాన్ని ఒకే పొరలా నొక్కండి (Squash).",
    microscope: "చివరగా, సిద్ధం చేసిన స్లైడ్‌ను మైక్రోస్కోప్ స్టేజ్ మీద ఉంచండి. మనం ఇప్పుడు మైటోసిస్ దశలను పరిశీలిస్తాము.",
    lens4x: "4x స్కానింగ్ లెన్స్‌కు మారండి. ఇది వేరు నిర్మాణం యొక్క ప్రాథమిక అవలోకనాన్ని ఇస్తుంది.",
    lens10x: "10x లో పవర్ లెన్స్‌కు మారండి. కణాలు విభజన చెందుతున్న ప్రాంతాన్ని మీరు ఇప్పుడు స్పష్టంగా చూడవచ్చు.",
    lens40x: "40x హై పవర్ లెన్స్‌కు మారండి. వ్యక్తిగత కణాలు మరియు వాటి కేంద్రకాలు ఇప్పుడు కనిపిస్తాయి.",
    lens100x: "100x వద్ద క్రోమోజోములను వివరంగా పరిశీలించండి. మీరు ఇక్కడ ప్రొఫేజ్ నుండి టెలోఫేజ్ వరకు అన్ని దశలను స్పష్టంగా చూడవచ్చు. 🎉",
    workoutNow: "వర్కౌట్ చేయండి",
    practiceNow: "ప్రాక్టీస్ చేయండి",
  }
};

const STEP_KEYS = [
  'intro', 'drycut', 'grow', 'freshcut', 'fixative',
  'slide', 'hcl', 'stain', 'burner', 'blot',
  'water', 'coverslip', 'microscope', 'lens4x', 'lens10x', 'lens40x', 'lens100x'
];

const STEP_META = [
  { title: 'Welcome',          icon: '👋', highlight: null },
  { title: 'Trim Old Roots',   icon: '✂️', highlight: 'tile' },
  { title: 'Grow Fresh Roots', icon: '🧅', highlight: 'waterBeaker' },
  { title: 'Cut Root Tips',    icon: '🔪', highlight: 'watchGlass' },
  { title: 'Fixation',         icon: '🧪', highlight: 'vial' },
  { title: 'Place on Slide',   icon: '🪟', highlight: 'slide' },
  { title: 'Add HCl',          icon: '⚗️', highlight: 'hclBeaker' },
  { title: 'Add Stain',        icon: '🎨', highlight: 'stainBeaker' },
  { title: 'Heat the Slide',   icon: '🔥', highlight: 'burner' },
  { title: 'Blot Excess',      icon: '📄', highlight: 'filterPaper' },
  { title: 'Add Water Drop',   icon: '💧', highlight: 'dropper' },
  { title: 'Squash Tissue',    icon: '👇', highlight: 'coverSlip' },
  { title: 'Microscope View',  icon: '🔬', highlight: 'microscope' },
  { title: '4X Magnification', icon: '🔍', highlight: null },
  { title: '10X Medium Power', icon: '🔍', highlight: null },
  { title: '40X High Power',   icon: '🔬', highlight: null },
  { title: '100X Chromosomes', icon: '🧬', highlight: null }
];

const DEFAULT_POSITIONS = {
  waterBeaker: [-1.5, 0.93, -0.2],
  hclBeaker: [-1.8, 0.93, 0.2],
  stainBeaker: [-1.8, 0.93, 0.6],
  onion: [-0.5, 0.93, -0.2],
  tile: [0.1, 0.93, 0.3],
  scalpel: [0.8, 0.93, 0.4],
  forceps: [1.0, 0.93, 0.1],
  needle: [1.2, 0.93, 0.4],
  watchGlass: [1.4, 0.93, -0.1],
  vial: [-0.2, 0.93, -0.4],
  dropper: [-1.4, 0.93, 0.6],
  burner: [1.7, 0.93, 0.3],
  slide: [0.5, 0.93, 0.7],
  coverSlip: [0.8, 0.93, 0.8],
  filterPaper: [-0.4, 0.93, 0.7],
  microscope: [-0.8, 0.93, 0.2]
};

const LANGUAGE_OPTIONS = [
  { id: 'en', name: 'English' },
  { id: 'mr', name: 'Marathi (मరాఠీ)' },
  { id: 'te', name: 'Telugu (తెలుగు)' },
];

// ─── Component ───────────────────────────────────────────────────────────────
export default function GuidedTour({ onClose, onWorkout, onPractice }) {
  const { tourStepIndex: stepIndex, selectedLanguage: language, setTourStepIndex: setStepIndex, setSelectedLanguage: setLanguage, setPlaced } = useStore();
  const { speak, stop, pause, resume: play, replay, unlockAudio, isSpeaking, hasFinishedNarration, setHasFinishedNarration, isReady } = useVoiceAssistant();

  const [isPaused, setIsPaused] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const langRef = useRef(null);
  const isMountedRef = useRef(true);

  // Cleanup on unmount / close
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Click outside lang picker
  useEffect(() => {
    const handler = (e) => {
      if (langRef.current && !langRef.current.contains(e.target)) setIsLangOpen(false);
    };
    if (isLangOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isLangOpen]);

  const handleTogglePlayPause = useCallback(() => {
    setIsPaused(p => {
      const isNowPaused = !p;
      if (isNowPaused) {
        pause();
      } else {
        const text = TOUR_CONTENT[language]?.[STEP_KEYS[stepIndex]] || TOUR_CONTENT.en[STEP_KEYS[stepIndex]];
        replay(text, language, voiceEnabled);
      }
      return isNowPaused;
    });
  }, [language, stepIndex, pause, replay, voiceEnabled]);

  // ─── Placement Animation (Initial fly in) ───
  const animatePlacement = useCallback((id, targetPos, versionToken) => {
    return new Promise(resolve => {
       const startPos = [-4, 3, targetPos[2]];
       const store = useStore.getState();
       store.setSetupPosition(id, startPos);
       store.setPlaced(id, true);
       const startTime = performance.now();
       const duration = 1200; // Snappier duration for sequential arrival
       const tick = (now) => {
         if (!isMountedRef.current || activeSequenceVersion.current !== versionToken) {
           resolve(); return;
         }
         const elapsed = now - startTime;
         const progress = Math.min(elapsed / duration, 1);
         const ease = 1 - Math.pow(1 - progress, 4);
         const currentPos = [
           startPos[0] + (targetPos[0] - startPos[0]) * ease,
           startPos[1] + (targetPos[1] - startPos[1]) * ease,
           startPos[2] + (targetPos[2] - startPos[2]) * ease
         ];
         useStore.getState().setSetupPosition(id, currentPos);
         if (progress < 1) requestAnimationFrame(tick);
         else resolve();
       };
       requestAnimationFrame(tick);
    });
  }, []);

  // ─── Puppeteer / Video Autoplay Engine ───
  const activeSequenceVersion = useRef(0);
  
  const tweenItem = useCallback((id, targetPos, duration = 1000, versionToken) => {
    return new Promise(resolve => {
       const store = useStore.getState();
       const startPos = store.setupPositions[id] || DEFAULT_POSITIONS[id];
       // Immediately ensure placed
       if (!store.placedComponents[id]) store.setPlaced(id, true);
       const startTime = performance.now();
       const tick = (now) => {
           if (!isMountedRef.current || activeSequenceVersion.current !== versionToken) {
               resolve(); return; // Abort if cancelled or step changed
           }
           const prog = Math.min((now - startTime) / duration, 1);
           const ease = 1 - Math.pow(1 - prog, 3);
           const curPos = [
              startPos[0] + (targetPos[0] - startPos[0]) * ease,
              startPos[1] + (targetPos[1] - startPos[1]) * ease,
              startPos[2] + (targetPos[2] - startPos[2]) * ease
           ];
           store.setSetupPosition(id, curPos);
           if (prog < 1) requestAnimationFrame(tick);
           else resolve();
       };
       requestAnimationFrame(tick);
    });
  }, []);

  const tweenRotation = useCallback((id, targetRot, duration = 1000, versionToken) => {
    return new Promise(resolve => {
       const store = useStore.getState();
       const startRot = store.setupRotations[id] || [0, Math.PI / 4, 0];
       const startTime = performance.now();
       const tick = (now) => {
           if (!isMountedRef.current || activeSequenceVersion.current !== versionToken) {
               resolve(); return;
           }
           const prog = Math.min((now - startTime) / duration, 1);
           const ease = 1 - Math.pow(1 - prog, 3);
           const curRot = [
              startRot[0] + (targetRot[0] - startRot[0]) * ease,
              startRot[1] + (targetRot[1] - startRot[1]) * ease,
              startRot[2] + (targetRot[2] - startRot[2]) * ease
           ];
           store.setSetupRotation(id, curRot);
           if (prog < 1) requestAnimationFrame(tick);
           else resolve();
       };
       requestAnimationFrame(tick);
    });
  }, []);

  // ─── Trigger narration on step or language change ───
  useEffect(() => {
    if (!isReady) return;
    setIsPaused(false);
    const text = TOUR_CONTENT[language]?.[STEP_KEYS[stepIndex]] || TOUR_CONTENT.en[STEP_KEYS[stepIndex]];
    speak(text, language, voiceEnabled);
  }, [stepIndex, language, speak, voiceEnabled, isReady]);

  // ─── Trigger 3D animation on step change ───
  useEffect(() => {
    setIsAnimating(true);
    
    // Track versions to abort previous overlapping tweens
    activeSequenceVersion.current += 1;
    const vToken = activeSequenceVersion.current;
    const store = useStore.getState();

    // ─── Full Required State Compiler ───
    const states = {
      onionPlacedOn: null, onionInBeaker: false, rootGrowthStarted: false, rootGrowthCompleted: false, onionRootsState: 'DRY',
      rootsInWatchGlass: false, rootsRemovedFromOnion: false, rootInVial: false, rootOnSlide: false,
      watchGlassFluid: null, watchGlassHclApplied: false, watchGlassStainApplied: false, watchGlassHeatedTime: 0,
      fixationStarted: false, fixationCompleted: false, rootProcessingState: 'UNCUT',
      coverSlipPlaced: false, squashed: false, squashProgress: 0, paperOnSlide: false, slideOnMicroscope: false,
      slideFluids: [], slideHclApplied: false, slideStainApplied: false, slideWaterApplied: false, slideHeatedTime: 0
    };

    if (stepIndex >= 1) { // drycut
      states.onionPlacedOn = 'tile';
      states.onionRootsState = 'CUT_DRY';
    }
    if (stepIndex >= 2) { // grow
      states.onionPlacedOn = 'waterBeaker'; states.onionInBeaker = true;
      states.rootGrowthStarted = true; states.rootGrowthCompleted = true; states.onionRootsState = 'GROWN';
    }
    if (stepIndex >= 3) { // freshcut
      states.onionPlacedOn = 'watchGlass';
      states.rootsRemovedFromOnion = true; states.onionRootsState = 'CUT_FRESH';
      states.rootsInWatchGlass = true;
      states.watchGlassRootCount = 8;
    }
    if (stepIndex >= 4) { // fixative
      states.onionPlacedOn = null; // Onion returns to table
      states.rootsInWatchGlass = true; states.watchGlassRootCount = 7; states.rootInVial = true; 
      states.vialCapOpen = false; // Closed at end of fixation
      states.fixationStarted = true; states.fixationCompleted = true; states.rootProcessingState = 'FIXED';
    }
    if (stepIndex >= 5) { // slide
      states.rootInVial = false; states.rootOnSlide = true;
    }
    if (stepIndex >= 6) { // hcl
      states.slideFluids = ['HCL']; states.slideHclApplied = true;
    }
    if (stepIndex >= 7) { // stain
      states.slideFluids = ['HCL', 'STAIN']; states.slideStainApplied = true; states.rootProcessingState = 'STAINED';
    }
    if (stepIndex >= 8) { // burner
      states.slideHeatedTime = 100; states.rootProcessingState = 'MACERATED';
      states.burnerOn = false; // Ensure off by default at start of next steps
    }
    if (stepIndex >= 9) { // blot
      states.paperOnSlide = true;
    }
    if (stepIndex >= 10) { // water
      states.paperOnSlide = false;
      states.slideFluids = ['HCL', 'STAIN', 'WATER']; states.slideWaterApplied = true;
    }
    if (stepIndex >= 11) { // coverslip
      states.coverSlipPlaced = true;
      states.squashed = true; states.squashProgress = 1;
    }
    if (stepIndex >= 12) { // microscope
      states.slideOnMicroscope = true;
      states.microscopeActive = true;
    }
    if (stepIndex === 13) { states.zoomLevel = 4; }
    if (stepIndex === 14) { states.zoomLevel = 10; }
    if (stepIndex === 15) { states.zoomLevel = 40; }
    if (stepIndex === 16) { states.zoomLevel = 100; }

    // ─── Layout Reset ───
    const newPlaced = { ...store.placedComponents };
    const requiredItems = new Set();
    const currentStepItems = [];
    const stepRequirements = {
      1: ['onion', 'tile', 'scalpel'],
      2: ['waterBeaker'],
      3: ['watchGlass'],
      4: ['vial', 'forceps'],
      5: ['slide'],
      6: ['hclBeaker', 'dropper'],
      7: ['stainBeaker'],
      8: ['burner'],
      9: ['filterPaper'],
      10: [],
      11: ['coverSlip', 'needle'],
      12: ['microscope']
    };

    for (let i = 0; i <= stepIndex; i++) {
        if (stepRequirements[i]) {
            stepRequirements[i].forEach(it => {
                if (i === stepIndex) currentStepItems.push(it);
                else requiredItems.add(it);
            });
        }
    }

    requiredItems.forEach(item => {
      if (!newPlaced[item]) newPlaced[item] = true;
      store.setSetupPosition(item, DEFAULT_POSITIONS[item]);
    });
    store.setStates({ placedComponents: newPlaced });

    const newItemsToAnimate = currentStepItems.filter(item => !store.placedComponents[item] && !requiredItems.has(item));

    const wait = (ms) => new Promise(res => setTimeout(res, ms));
    const check = () => vToken === activeSequenceVersion.current;

    const playCutscene = async () => {
      // ─── Phase 1: Sequential Component Arrival ───
      for (const item of newItemsToAnimate) {
         if (!check()) return;
         await animatePlacement(item, DEFAULT_POSITIONS[item], vToken);
         await wait(200); // Small gap between arrivals for visual clarity
      }

      if (!check()) return;
      const D = DEFAULT_POSITIONS;
      
      if (stepIndex === 1) { // dry cut
         await tweenItem('onion', [D.tile[0], 1.1, D.tile[2]], 1500, vToken);
         if (!check()) return; store.setStates({ onionPlacedOn: 'tile' });
         // Vertical Chop
         await tweenItem('scalpel', [D.tile[0]+0.1, 1.25, D.tile[2]], 1400, vToken);
         await tweenRotation('scalpel', [0, -Math.PI / 2, -Math.PI / 2], 600, vToken);
         await wait(400);
         await tweenItem('scalpel', [D.tile[0]+0.1, 0.95, D.tile[2]], 600, vToken);
         if (!check()) return; store.setStates({ onionRootsState: 'CUT_DRY' });
         await wait(600);
         await tweenItem('scalpel', [D.tile[0]+0.1, 1.2, D.tile[2]], 600, vToken);
         await tweenRotation('scalpel', [0, Math.PI / 4, 0], 800, vToken);
         await tweenItem('scalpel', D.scalpel, 1400, vToken);
      }
      else if (stepIndex === 2) { // grow
         store.setStates({ onionPlacedOn: null });
         await tweenItem('onion', [D.waterBeaker[0], 1.2, D.waterBeaker[2]], 1800, vToken);
         if (!check()) return;
         await wait(600);
         store.setStates({ onionPlacedOn: 'waterBeaker', rootGrowthStarted: true, rootGrowthCompleted: true, onionRootsState: 'GROWN' });
      }
      else if (stepIndex === 3) { // fresh cut
         store.setStates({ onionPlacedOn: null, onionRootsState: 'GROWN' });
         await tweenItem('onion', [D.watchGlass[0], 1.1, D.watchGlass[2]], 1800, vToken);
         if (!check()) return; store.setStates({ onionPlacedOn: 'watchGlass' });
         // Vertical Chop
         await tweenItem('scalpel', [D.watchGlass[0]+0.1, 1.25, D.watchGlass[2]], 1400, vToken);
         await tweenRotation('scalpel', [0, -Math.PI / 2, -Math.PI / 2], 600, vToken);
         await wait(400);
         await tweenItem('scalpel', [D.watchGlass[0]+0.1, 0.95, D.watchGlass[2]], 600, vToken);
         if (!check()) return; store.setStates({ rootsRemovedFromOnion: true, onionRootsState: 'CUT_FRESH', rootsInWatchGlass: true, watchGlassRootCount: 8 });
         await wait(600);
         await tweenItem('scalpel', [D.watchGlass[0]+0.1, 1.2, D.watchGlass[2]], 600, vToken);
         await tweenRotation('scalpel', [0, Math.PI / 4, 0], 800, vToken);
         await tweenItem('scalpel', D.scalpel, 1600, vToken);
      }
      else if (stepIndex === 4) { // fixative
         // First, move onion back to table to clear the workspace
         await tweenItem('onion', D.onion, 1500, vToken);
         if (!check()) return; store.setStates({ onionPlacedOn: null });
         await wait(400);

         // Open the Vial Cap
         if (!check()) return; store.setStates({ vialCapOpen: true });
         await wait(600);

         // Then move forceps to pick up the root
         await tweenItem('forceps', [D.watchGlass[0], 0.95, D.watchGlass[2]], 1600, vToken);
         if (!check()) return; store.setStates({ rootsInWatchGlass: true, watchGlassRootCount: 7, holdingRoot: true });
         await tweenItem('forceps', [D.vial[0], 1.05, D.vial[2]], 1600, vToken);
         await wait(400);
         await tweenItem('forceps', [D.vial[0], 0.95, D.vial[2]], 1000, vToken);
         if (!check()) return; store.setStates({ rootInVial: true, holdingRoot: false });
         
         // Move forceps away then CLOSE the cap to start fixation
         await tweenItem('forceps', [D.vial[0], 1.2, D.vial[2]], 800, vToken);
         if (!check()) return; store.setStates({ vialCapOpen: false, fixationStarted: true });
         
         // Wait for the 24h fixation animation to finish (~3.2s)
         await wait(3200);
         if (!check()) return; store.setStates({ fixationCompleted: true, rootProcessingState: 'FIXED' });
         
         await wait(400);
         await tweenItem('forceps', D.forceps, 1600, vToken);
      }
      else if (stepIndex === 5) { // slide
         // Open cap to take root out
         if (!check()) return; store.setStates({ vialCapOpen: true });
         await wait(600);

         await tweenItem('forceps', [D.vial[0], 1.0, D.vial[2]], 1400, vToken);
         if (!check()) return; store.setStates({ rootInVial: false, holdingRoot: true });
         await tweenItem('forceps', [D.slide[0], 1.0, D.slide[2]], 1800, vToken);
         if (!check()) return; store.setStates({ rootOnSlide: true, holdingRoot: false });
         await wait(600);

         // Close cap after taking out
         store.setStates({ vialCapOpen: false });
         await tweenItem('forceps', D.forceps, 1600, vToken);
      }
      else if (stepIndex === 6) { // hcl
         await tweenRotation('dropper', [0, 0, 0], 600, vToken);
         await tweenItem('dropper', [D.hclBeaker[0], 1.2, D.hclBeaker[2]], 1500, vToken);
         await wait(600);
         await tweenItem('dropper', [D.slide[0], 1.05, D.slide[2]], 1600, vToken);
         await tweenItem('dropper', [D.slide[0], 0.98, D.slide[2]], 1000, vToken); 
         if (!check()) return; store.setStates({ slideFluids: ['HCL'], slideHclApplied: true });
         await wait(800);
         await tweenRotation('dropper', [Math.PI / 2, 0, Math.PI], 800, vToken);
         await tweenItem('dropper', D.dropper, 1500, vToken);
      }
      else if (stepIndex === 7) { // stain
         await tweenRotation('dropper', [0, 0, 0], 600, vToken);
         await tweenItem('dropper', [D.stainBeaker[0], 1.2, D.stainBeaker[2]], 1500, vToken);
         await wait(600);
         await tweenItem('dropper', [D.slide[0], 1.05, D.slide[2]], 1600, vToken);
         await tweenItem('dropper', [D.slide[0], 0.98, D.slide[2]], 1000, vToken);
         if (!check()) return; store.setStates({ slideFluids: ['HCL', 'STAIN'], slideStainApplied: true, rootProcessingState: 'STAINED' });
         await wait(800);
         await tweenRotation('dropper', [Math.PI / 2, 0, Math.PI], 800, vToken);
         await tweenItem('dropper', D.dropper, 1500, vToken);
      }
      else if (stepIndex === 8) { // burner
         // Move slide to top of burner (Tripod Gauze is at 1.35)
         await tweenItem('slide', [D.burner[0], 1.36, D.burner[2]], 1800, vToken);
         if (!check()) return; 
         
         // Turn burner ON
         store.setStates({ burnerOn: true });
         await wait(3000); 
         
         // Heating complete
         if (!check()) return; 
         store.setStates({ slideHeatedTime: 100, rootProcessingState: 'MACERATED' });
         
         // Turn burner OFF
         await wait(500);
         store.setStates({ burnerOn: false });
         await wait(800);
         
         // Return slide to table
         await tweenItem('slide', D.slide, 1800, vToken);
      }
      else if (stepIndex === 9) { // blot
         // 🚀 PHASE 1: Move single sheet to slide
         await tweenItem('filterPaper', [D.slide[0], 0.95, D.slide[2]], 1500, vToken);
         if (!check()) return; 
         
         // 🧼 PHASE 2: Start rubbing/cleaning animation (removes acid/stain visuals)
         store.setStates({ paperOnSlide: true, isCleaning: true, cleaningProgress: 0 });
         await wait(2400); 
         if (!check()) return; 
         store.setStates({ isCleaning: false, stainRemoved: true });
         
         // 📥 PHASE 3: Return sheet to the filter paper box
         await tweenItem('filterPaper', D.filterPaper, 1600, vToken);
         if (!check()) return;
         
         // 📦 PHASE 4: Merge back into pile
         store.setStates({ paperOnSlide: false });
      }
      else if (stepIndex === 10) { // water drop
         await tweenRotation('dropper', [0, 0, 0], 600, vToken);
         await tweenItem('dropper', [D.waterBeaker[0], 1.2, D.waterBeaker[2]], 1500, vToken);
         await wait(600);
         await tweenItem('dropper', [D.slide[0], 1.05, D.slide[2]], 1600, vToken);
         await tweenItem('dropper', [D.slide[0], 0.98, D.slide[2]], 1000, vToken);
         if (!check()) return; store.setStates({ slideFluids: ['HCL', 'STAIN', 'WATER'], slideWaterApplied: true });
         await wait(800);
         await tweenRotation('dropper', [Math.PI / 2, 0, Math.PI], 800, vToken);
         await tweenItem('dropper', D.dropper, 1500, vToken);
      }
      else if (stepIndex === 11) { // coverslip & squash
         await tweenItem('coverSlip', [D.slide[0], 0.95, D.slide[2]], 1600, vToken);
         if (!check()) return; store.setStates({ coverSlipPlaced: true });
         await wait(600);
         await tweenItem('needle', [D.slide[0], 0.98, D.slide[2]], 1400, vToken);
         await tweenItem('needle', [D.slide[0], 0.93, D.slide[2]], 1000, vToken);
         if (!check()) return; store.setStates({ squashed: true, squashProgress: 1 });
         await wait(800);
         await tweenItem('needle', D.needle, 1400, vToken);
      }
      else if (stepIndex === 12) { // microscope
         await tweenItem('slide', [D.microscope[0], 1.2, D.microscope[2]], 2000, vToken);
         if (!check()) return; store.setStates({ slideOnMicroscope: true, microscopeActive: true });
         await wait(800);
         await tweenItem('slide', [D.microscope[0], -5.0, D.microscope[2]], 10, vToken); 
      }
      else if (stepIndex >= 13) {
         if (!check()) return; 
         store.setStates({ slideOnMicroscope: true, microscopeActive: true });
      }
      if (check()) store.setStates(states);
    };

    const runTour = async () => {
      setIsAnimating(true);
      await playCutscene();
      if (isMountedRef.current) setIsAnimating(false);
    };

    runTour();
    
    return () => {
       activeSequenceVersion.current += 1;
    };
  }, [stepIndex]);

  // ─── Space bar ───
  useEffect(() => {
    const handler = (e) => { if (e.code === 'Space') { e.preventDefault(); handleTogglePlayPause(); } };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleTogglePlayPause]);

  const currentText = TOUR_CONTENT[language]?.[STEP_KEYS[stepIndex]] || TOUR_CONTENT.en[STEP_KEYS[stepIndex]];
  const currentMeta = STEP_META[stepIndex];
  const isLast = stepIndex === STEP_KEYS.length - 1;
  const isFirst = stepIndex === 0;

  return (
    <div style={{
      position: 'absolute', inset: 0, zIndex: 200, pointerEvents: 'none',
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'space-between', padding: '24px 20px 96px',
    }}>
      <style>{`
        @keyframes tourFadeUp { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes tourFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes nextBtnPulse { 0%, 100% { transform: scale(1); box-shadow: 0 0 16px rgba(74,222,128,0.3); } 50% { transform: scale(1.04); box-shadow: 0 0 28px rgba(74,222,128,0.6); } }
        .tour-btn { transition: all 0.2s ease; cursor: pointer; border: none; outline: none; }
        .tour-btn:hover { opacity: 0.85; transform: scale(1.05); }
        .tour-btn:active { transform: scale(0.96); }
        .next-btn { animation: nextBtnPulse 2.2s ease-in-out infinite; }
      `}</style>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.3) 100%)', pointerEvents: 'none' }} />
      <div style={{
        position: 'relative', zIndex: 10, pointerEvents: 'auto', maxWidth: '540px', width: '100%', background: 'rgba(5,10,15,0.88)', backdropFilter: 'blur(24px)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: '24px', padding: '20px 24px', boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(74,222,128,0.08)', animation: 'tourFadeUp 0.5s ease-out'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'rgba(74,222,128,0.15)', border: '1px solid rgba(74,222,128,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>{currentMeta.icon}</div>
          <div>
            <div style={{ fontSize: '10px', color: 'rgba(74,222,128,0.7)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>Step {stepIndex + 1} of {STEP_KEYS.length}</div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)', fontWeight: 700, marginTop: '2px' }}>{currentMeta.title}</div>
          </div>
        </div>
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(74,222,128,0.2), transparent)', marginBottom: '14px' }} />
        <p style={{ margin: 0, fontSize: '13.5px', fontWeight: 400, color: 'rgba(255,255,255,0.88)', lineHeight: 1.7, letterSpacing: '0.2px', animation: isAnimating ? 'tourFadeUp 0.35s ease-out' : 'none' }} onClick={unlockAudio}>{currentText}</p>
        <div style={{ marginTop: '16px', height: '3px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${((stepIndex + 1) / STEP_KEYS.length) * 100}%`, background: 'linear-gradient(90deg, #4ade80, #22d3ee)', borderRadius: '2px', transition: 'width 0.5s ease' }} />
        </div>
        {hasFinishedNarration && (
          <div style={{ marginTop: '16px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {!isLast && (
              <button className="tour-btn next-btn" onClick={() => setStepIndex(i => i + 1)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 22px', background: 'linear-gradient(135deg, #16a34a, #15803d)', borderRadius: '12px', color: 'white', fontSize: '12px', fontWeight: 700 }}>
                NEXT STEP <ChevronRight size={14} />
              </button>
            )}
            {isLast && (
              <>
                <button className="tour-btn" onClick={() => { stop(); onWorkout(); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 22px', background: 'linear-gradient(135deg, #7c3aed, #6d28d9)', borderRadius: '12px', color: 'white', fontSize: '12px', fontWeight: 700, boxShadow: '0 0 20px rgba(124,58,237,0.3)' }}><BookOpen size={14} /> {TOUR_CONTENT[language]?.workoutNow || 'WORKOUT NOW'}</button>
                <button className="tour-btn" onClick={() => { stop(); onPractice(); }} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '9px 22px', background: 'linear-gradient(135deg, #059669, #047857)', borderRadius: '12px', color: 'white', fontSize: '12px', fontWeight: 700, boxShadow: '0 0 20px rgba(5,150,105,0.3)' }}><FlaskConical size={14} /> {TOUR_CONTENT[language]?.practiceNow || 'PRACTICE NOW'}</button>
              </>
            )}
          </div>
        )}
      </div>
      <div style={{
        pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: '16px', background: 'rgba(5,10,15,0.9)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '100px', padding: '10px 20px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)', animation: 'tourFadeIn 0.6s ease-out 0.3s both'
      }}>
        <div style={{ position: 'relative' }} ref={langRef}>
          <button className="tour-btn" onClick={() => setIsLangOpen(o => !o)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 10px', background: isLangOpen ? 'rgba(255,255,255,0.1)' : 'transparent', borderRadius: '10px', color: isLangOpen ? 'white' : 'rgba(255,255,255,0.55)', fontSize: '11px', fontWeight: 700 }}><Languages size={13} /> <span style={{ minWidth: '20px' }}>{language.toUpperCase()}</span></button>
          {isLangOpen && (
            <div style={{ position: 'absolute', bottom: 'calc(100% + 12px)', left: 0, background: 'rgba(5,10,15,0.97)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '10px', minWidth: '170px', boxShadow: '0 16px 40px rgba(0,0,0,0.6)', animation: 'tourFadeUp 0.2s ease-out', zIndex: 999 }}>
              {LANGUAGE_OPTIONS.map(lang => (
                <button key={lang.id} onClick={() => { setLanguage(lang.id); setIsLangOpen(false); }} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '9px 14px', background: language === lang.id ? 'rgba(74,222,128,0.15)' : 'transparent', border: 'none', borderRadius: '12px', cursor: 'pointer', color: language === lang.id ? '#4ade80' : 'rgba(255,255,255,0.7)', fontSize: '12px', fontWeight: language === lang.id ? 700 : 400, textAlign: 'left', transition: 'all 0.15s ease' }}>{lang.name} {language === lang.id && <Check size={13} />}</button>
              ))}
            </div>
          )}
        </div>
        <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button className="tour-btn" disabled={isFirst} onClick={() => { if (!isFirst) { setIsPaused(false); setStepIndex(i => i - 1); } }} style={{ padding: '5px', color: isFirst ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.55)', background: 'transparent' }}><ChevronLeft size={16} /></button>
          <button className="tour-btn" onClick={handleTogglePlayPause} style={{ padding: '8px', background: 'rgba(74,222,128,0.12)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: '50%', color: '#4ade80', display: 'flex' }}>{isPaused ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}</button>
          <button className="tour-btn" disabled={isLast} onClick={() => { if (!isLast) { setIsPaused(false); setStepIndex(i => i + 1); } }} style={{ padding: '5px', color: isLast ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.55)', background: 'transparent' }}><ChevronRight size={16} /></button>
        </div>
        <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button className="tour-btn" onClick={() => { unlockAudio(); setVoiceEnabled(v => !v); }} style={{ padding: '5px', color: !isReady ? 'rgba(255,255,255,0.1)' : voiceEnabled ? '#4ade80' : 'rgba(255,255,255,0.25)', background: 'transparent', position: 'relative' }}>
            {voiceEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
            {isSpeaking && (
              <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '6px', height: '6px', background: '#4ade80', borderRadius: '50%', boxShadow: '0 0 8px #4ade80' }} />
            )}
            {!isReady && voiceEnabled && (
              <span style={{ position: 'absolute', bottom: '-4px', left: '50%', transform: 'translateX(-50%)', fontSize: '6px', color: 'rgba(255,255,255,0.4)', whiteSpace: 'nowrap' }}>LOAD...</span>
            )}
          </button>
          <div style={{ display: 'flex', gap: '3px', padding: '0 4px', alignItems: 'center' }}>
            {STEP_KEYS.map((_, i) => (
              <button 
                key={i} 
                onClick={() => { setIsPaused(false); setStepIndex(i); }} 
                style={{ 
                  height: '4px', 
                  width: i === stepIndex ? '12px' : '4px', 
                  borderRadius: '2px', 
                  background: i === stepIndex ? '#4ade80' : i < stepIndex ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.15)', 
                  transition: 'all 0.3s ease', 
                  cursor: 'pointer', border: 'none', padding: 0,
                  boxShadow: i === stepIndex ? '0 0 8px rgba(74,222,128,0.4)' : 'none'
                }} 
              />
            ))}
          </div>
        </div>
        <button className="tour-btn" onClick={() => { stop(); onClose(); }} style={{ padding: '5px', color: 'rgba(255,255,255,0.25)', background: 'transparent' }}><X size={15} /></button>
      </div>
    </div>
  );
}
