'use client';

import React, { useEffect, useState, useCallback, useRef } from 'react';
import { Play, Pause, X, ChevronRight, ChevronLeft, Volume2, VolumeX, FlaskConical, Languages, Check, BookOpen } from 'lucide-react';
import useStore from '../lib/store';

// ─── Tour Content ────────────────────────────────────────────────────────────
const TOUR_CONTENT = {
  en: {
    intro:           "Welcome to the Virtual Biology Lab! Today we'll study Mitosis in Onion Root Tip — one of the most important practicals in biology.",
    equipment:       "First, let's set up our equipment. We need: Water Beaker, HCl Beaker, Acetocarmine Stain, Onion Bulb, Cutting Tile, Scalpel, Forceps, Needle, Watch Glass, Fixative Vial, Dropper, Bunsen Burner, Glass Slide, Cover Slip, Filter Paper, and a Microscope.",
    onion:           "This is the Onion Bulb (Allium cepa). Place it in the water beaker to grow fresh roots for 2–3 days. The root tips are the best place to observe mitosis because they contain meristematic cells that divide rapidly.",
    roots:           "After root growth, use the Scalpel to cut 1–2 cm of fresh root tips. These root tips from the meristematic zone have most actively dividing cells.",
    watchglass:      "Transfer the root tips to the Watch Glass using Forceps. The watch glass serves as a small reaction vessel for chemical treatments.",
    fixation:        "Place the root tips in the Fixative Vial containing aceto-alcohol (1:3 ratio of acetic acid and ethyl alcohol). This preserves the cells in their current state and prevents further division.",
    hcl:             "Transfer root tips to the watch glass. Use the Dropper to add N/10 Hydrochloric Acid (HCl). This step is called Maceration — HCl softens the cell wall by dissolving pectin in the middle lamella, making it easier to squash the tissue.",
    heating:         "Gently heat the watch glass with the Bunsen Burner for 3–5 minutes. Moderate heating speeds up maceration without damaging the chromosomes.",
    staining:        "Add 2–3 drops of Acetocarmine stain using the Dropper. Acetocarmine specifically stains chromosomes deep red or magenta, making them clearly visible under the microscope.",
    slide:           "Transfer a small piece of root tip onto the Glass Slide using a needle. Place it in the center of the slide for easy observation.",
    coverslip:       "Place a Cover Slip over the root tip. This protects the sample and creates a uniform thin layer.",
    squash:          "Gently press the Cover Slip with the Needle or your thumb to squash the tissue. This separates cells into a monolayer, so chromosomes can be seen individually.",
    blot:            "Place a piece of Filter Paper over the slide and press gently. This absorbs excess stain and flattens the cells further.",
    microscope:      "Place the slide on the Microscope stage. Start with the 10X objective lens, then switch to 40X or 100X (oil immersion) for detailed observation of chromosomes.",
    observation:     "Now observe the cells! You can see different stages of Mitosis: 🟢 Interphase (resting), 🟣 Prophase (chromatin condenses), 🔵 Metaphase (chromosomes align), 🟠 Anaphase (chromosomes separate), 🟡 Telophase (two nuclei form).",
    result:          "Congratulations! You have successfully prepared and observed mitosis in onion root tip. The clear stages of cell division confirm that the meristematic zone is the site of active cell division. Happy experimenting! 🎉",
    workoutNow:      "WORKOUT NOW",
    practiceNow:     "PRACTICE NOW",
  },
  hi: {
    intro:           "वर्चुअल बायोलॉजी लैब में आपका स्वागत है! आज हम प्याज की जड़ की नोक में माइटोसिस का अध्ययन करेंगे।",
    equipment:       "पहले उपकरण सेट करें: पानी का बीकर, HCl बीकर, एसिटोकार्मिन दाग, प्याज, कटिंग टाइल, स्केलपेल, फोर्सेप्स, सुई, वॉच ग्लास, फिक्सेटिव वायल, ड्रॉपर, बुन्सेन बर्नर, ग्लास स्लाइड, कवर स्लिप, फिल्टर पेपर और माइक्रोस्कोप।",
    onion:           "यह प्याज का बल्ब है। इसे पानी के बीकर में रखें और 2-3 दिन तक ताज़ी जड़ें उगाएं। जड़ की नोक में मेरिस्टेमेटिक कोशिकाएं होती हैं जो तेजी से विभाजित होती हैं।",
    roots:           "जड़ उगने के बाद, स्केलपेल से 1-2 सेमी की ताजी जड़ की नोक काटें। ये नोकें सक्रिय रूप से विभाजित होने वाली कोशिकाओं से भरी होती हैं।",
    watchglass:      "फोर्सेप्स से जड़ की नोकें वॉच ग्लास में स्थानांतरित करें। वॉच ग्लास रासायनिक उपचार के लिए एक छोटे बर्तन का काम करता है।",
    fixation:        "जड़ की नोकें फिक्सेटिव वायल में रखें जिसमें एसिटो-अल्कोहल (1:3 अनुपात) होता है। यह कोशिकाओं को उनकी वर्तमान स्थिति में संरक्षित करता है।",
    hcl:             "ड्रॉपर से N/10 HCl की 2-3 बूंदें वॉच ग्लास में डालें। यह मैसरेशन प्रक्रिया है — HCl कोशिका भित्ति को नरम बनाता है।",
    heating:         "बुन्सेन बर्नर से वॉच ग्लास को 3-5 मिनट तक धीरे-धीरे गर्म करें। यह मैसरेशन को तेज करता है।",
    staining:        "ड्रॉपर से एसिटोकार्मिन की 2-3 बूंदें डालें। यह क्रोमोसोम को गहरा लाल रंग देता है, जिससे वे माइक्रोस्कोप में स्पष्ट दिखते हैं।",
    slide:           "जड़ की नोक का एक छोटा टुकड़ा ग्लास स्लाइड पर रखें।",
    coverslip:       "कवर स्लिप लगाएं। यह नमूने के ऊपर रखा जाता है।",
    squash:          "सुई या अंगूठे से कवर स्लिप को दबाएं। यह ऊतक को अलग करता है।",
    blot:            "फिल्टर पेपर से अतिरिक्त दाग को हटाएं।",
    microscope:      "स्लाइड को माइक्रोस्कोप पर रखें और 10X से शुरू करके 40X तक देखें।",
    observation:     "अब कोशिकाएं देखें! माइटोसिस के चरण: इंटरफेज, प्रोफेज, मेटाफेज, एनाफेज, टेलोफेज स्पष्ट दिखेंगे।",
    result:          "बधाई! आपने प्याज की जड़ की नोक में माइटोसिस सफलतापूर्वक देख लिया। 🎉",
    workoutNow:      "वर्कआउट शुरू करें",
    practiceNow:     "अभ्यास करें",
  },
  mr: {
    intro:           "व्हर्च्युअल बायोलॉजी लॅबमध्ये स्वागत! आज आपण कांद्याच्या मुळाच्या टोकावर माइटोसिस अभ्यासू.",
    equipment:       "साहित्य: पाण्याचा बीकर, HCl बीकर, एसिटोकार्मिन डाग, कांदा, कापण्याची टाइल, स्केलपेल, फोर्सेप्स, सुई, वॉच ग्लास, फिक्सेटिव्ह व्हायल, ड्रॉपर, बुन्सन बर्नर, काचेची स्लाइड, कव्हर स्लिप, फिल्टर पेपर आणि सूक्ष्मदर्शक.",
    onion:           "हा कांद्याचा बल्ब आहे. 2-3 दिवस पाण्यात ठेवा. मुळाच्या टोकात मेरिस्टेमॅटिक पेशी असतात ज्या जलद विभाजित होतात.",
    roots:           "स्केलपेलने 1-2 सेमी ताजे मुळाचे टोक कापा. या टोकांमध्ये सक्रियपणे विभाजित पेशी असतात.",
    watchglass:      "फोर्सेप्सने मुळाचे टोक वॉच ग्लासमध्ये ठेवा.",
    fixation:        "मुळाचे टोक फिक्सेटिव्ह व्हायलमध्ये ठेवा (एसिटो-अल्कोहोल 1:3).",
    hcl:             "ड्रॉपरने N/10 HCl टाका. हे मॅसरेशन आहे — HCl पेशींची भित्ती मऊ करते.",
    heating:         "बुन्सन बर्नरने वॉच ग्लास 3-5 मिनिटे हळुवारपणे गरम करा.",
    staining:        "ड्रॉपरने एसिटोकार्मिनचे 2-3 थेंब टाका. हे गुणसूत्रे रंगवते.",
    slide:           "मुळाचा छोटा तुकडा काचेच्या स्लाइडवर ठेवा.",
    coverslip:       "कव्हर स्लिप लावा.",
    squash:          "सुई किंवा अंगठ्याने दाबा. ऊतक वेगळे होते.",
    blot:            "फिल्टर पेपरने जादा डाग काढा.",
    microscope:      "स्लाइड सूक्ष्मदर्शकावर ठेवा. 10X ते 40X पर्यंत पहा.",
    observation:     "पेशी पहा! माइटोसिसचे टप्पे: इंटरफेज, प्रोफेज, मेटाफेज, अ‍ॅनाफेज, टेलोफेज दिसतील.",
    result:          "अभिनंदन! कांद्याच्या मुळाच्या टोकावर माइटोसिस यशस्वीरित्या पाहिले. 🎉",
    workoutNow:      "वर्कआउट करा",
    practiceNow:     "सराव करा",
  },
  te: {
    intro:           "వర్చువల్ బయాలజీ ల్యాబ్కు స్వాగతం! ఈరోజు మనం ఉల్లిపాయ వేర్లలో మైటోసిస్ అధ్యయనం చేద్దాం.",
    equipment:       "సాధనాలు: నీటి బీకర్, HCl బీకర్, అస్టోకార్మిన్ స్టెయిన్, ఉల్లిపాయ, కట్టింగ్ టైల్, స్కాల్పెల్, ఫోర్సెప్స్, సూది, వాచ్ గ్లాస్, ఫిక్సేటివ్ వైల్, డ్రాపర్, బున్సెన్ బర్నర్, గాజు స్లయిడ్, కవర్ స్లిప్, ఫిల్టర్ పేపర్, మైక్రోస్కోప్.",
    onion:           "ఇది ఉల్లిపాయ బల్బ్. 2-3 రోజులు నీటిలో ఉంచండి. వేరు కొనల్లో మెరిస్టముటిక్ కణాలు ఉంటాయి.",
    roots:           "స్కాల్పెల్తో 1-2 సెమీ వేర్ల కొనలు కత్తిరించండి. ఇవి చురుగ్గా విభజనలు చేసే కణాలను కలిగి ఉంటాయి.",
    watchglass:      "ఫోర్సెప్స్ తో వేర్ల కొనలను వాచ్ గ్లాస్ లో ఉంచండి.",
    fixation:        "వేర్ల కొనలను ఫిక్సేటివ్ వైల్ (అస్టో-ఆల్కహాల్ 1:3) లో ఉంచండి.",
    hcl:             "డ్రాపర్తో N/10 HCl చుక్కలు వాచ్ గ్లాస్ లో వేయండి. ఇది మాసరేషన్.",
    heating:         "బున్సెన్ బర్నర్తో వాచ్ గ్లాస్ ను 3-5 నిమిషాలు వేడి చేయండి.",
    staining:        "డ్రాపర్తో అస్టోకార్మిన్ 2-3 చుక్కలు వేయండి. ఇది క్రోమోజోమ్లను రంగు వేస్తుంది.",
    slide:           "వేరు కొన చిన్న ముక్కను గాజు స్లయిడ్ పై ఉంచండి.",
    coverslip:       "కవర్ స్లిప్ ఉంచండి.",
    squash:          "సూది లేదా బొటన వేలితో నొక్కండి.",
    blot:            "ఫిల్టర్ పేపర్తో అదనపు స్టెయిన్ తీయండి.",
    microscope:      "స్లయిడ్ ను మైక్రోస్కోప్ పై ఉంచండి. 10X నుండి 40X వినియోగించండి.",
    observation:     "కణాలు పరిశీలించండి! మైటోసిస్ దశలు: ఇంటర్ఫేజ్, ప్రోఫేజ్, మెటాఫేజ్, అనాఫేజ్, టెలోఫేజ్ కనిపిస్తాయి.",
    result:          "అభినందనలు! ఉల్లిపాయ వేర్లలో మైటోసిస్ విజయవంతంగా పరిశీలించారు. 🎉",
    workoutNow:      "వర్కౌట్ చేయండి",
    practiceNow:     "ప్రాక్టీస్ చేయండి",
  },
};

const STEP_KEYS = [
  'intro', 'equipment', 'onion', 'roots', 'watchglass',
  'fixation', 'hcl', 'heating', 'staining', 'slide',
  'coverslip', 'squash', 'blot', 'microscope', 'observation', 'result',
];

const STEP_META = [
  { title: 'Welcome',          icon: '👋', highlight: null },
  { title: 'Equipment Setup',  icon: '🧰', highlight: null },
  { title: 'Onion Bulb',       icon: '🧅', highlight: 'onion' },
  { title: 'Cut Root Tips',    icon: '✂️', highlight: 'scalpel' },
  { title: 'Watch Glass',      icon: '🔵', highlight: 'watchGlass' },
  { title: 'Fixation',         icon: '🧪', highlight: 'vial' },
  { title: 'HCl Maceration',   icon: '⚗️', highlight: 'hclBeaker' },
  { title: 'Heating',          icon: '🔥', highlight: 'burner' },
  { title: 'Staining',         icon: '🎨', highlight: 'stainBeaker' },
  { title: 'Mount on Slide',   icon: '🔬', highlight: 'slide' },
  { title: 'Cover Slip',       icon: '🪟', highlight: 'coverSlip' },
  { title: 'Squashing',        icon: '👇', highlight: 'needle' },
  { title: 'Blotting',         icon: '📄', highlight: 'filterPaper' },
  { title: 'Microscope',       icon: '🔭', highlight: 'microscope' },
  { title: 'Observation',      icon: '👁️', highlight: 'microscope' },
  { title: 'Result',           icon: '🎉', highlight: null },
];

const LANGUAGE_OPTIONS = [
  { id: 'en', name: 'English' },
  { id: 'hi', name: 'Hindi (हिंदी)' },
  { id: 'mr', name: 'Marathi (मराठी)' },
  { id: 'te', name: 'Telugu (తెలుగు)' },
];

// ─── Component ───────────────────────────────────────────────────────────────
export default function GuidedTour({ onClose, onWorkout }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [language, setLanguage] = useState('en');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [hasFinishedNarration, setHasFinishedNarration] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const langRef = useRef(null);
  const currentSpeakIdRef = useRef(0);
  const isMountedRef = useRef(true);
  const { setPlaced } = useStore();

  // Load voices
  useEffect(() => {
    if (window.speechSynthesis) window.speechSynthesis.getVoices();
    if (window.speechSynthesis?.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => window.speechSynthesis.getVoices();
    }
  }, []);

  // Cleanup on unmount / close
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (window.speechSynthesis) window.speechSynthesis.cancel();
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

  // Pause / resume synthesis
  useEffect(() => {
    if (!window.speechSynthesis) return;
    if (isPaused) window.speechSynthesis.pause();
    else window.speechSynthesis.resume();
  }, [isPaused]);

  // ─── Speak ───
  const utteranceRef = useRef(null);

  const speak = useCallback((text) => {
    if (!voiceEnabled) { setHasFinishedNarration(true); return; }
    const speakId = ++currentSpeakIdRef.current;
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    if (!window.speechSynthesis) return;

    let retries = 0;
    const trySpeak = () => {
      if (!isMountedRef.current || speakId !== currentSpeakIdRef.current) return;
      const voices = window.speechSynthesis.getVoices();
      if (voices.length === 0 && retries < 5) { retries++; setTimeout(trySpeak, 200); return; }

      const localeMap = { en: 'en-IN', hi: 'hi-IN', mr: 'mr-IN', te: 'te-IN' };
      const targetLang = localeMap[language] || 'en-US';

      let langVoices = voices.filter(v => v.lang.replace('_', '-').startsWith(targetLang));
      if (!langVoices.length) langVoices = voices.filter(v => v.lang.startsWith(targetLang.split('-')[0]));
      if (!langVoices.length) langVoices = voices.filter(v => v.lang.startsWith(language));

      let selectedVoice =
        langVoices.find(v => v.name.toLowerCase().includes('google')) || langVoices[0];

      if (!selectedVoice && language === 'mr') {
        const hiVoices = voices.filter(v => v.lang.startsWith('hi'));
        selectedVoice = hiVoices.find(v => v.name.toLowerCase().includes('google')) || hiVoices[0];
      }
      if (!selectedVoice && ['hi', 'mr', 'te'].includes(language)) {
        const inVoices = voices.filter(v => v.lang.includes('-IN'));
        selectedVoice = inVoices.find(v => v.name.toLowerCase().includes('google')) || inVoices[0];
      }
      
      // Ultimate fallback to anything
      if (!selectedVoice && voices.length > 0) {
        selectedVoice = voices.find(v => v.lang.startsWith('en')) || voices[0];
      }

      const utterance = new SpeechSynthesisUtterance(text);
      if (selectedVoice) { utterance.voice = selectedVoice; utterance.lang = selectedVoice.lang; }
      else utterance.lang = targetLang;
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      utteranceRef.current = utterance;

      const safety = setTimeout(() => {
        if (speakId !== currentSpeakIdRef.current) return;
        setHasFinishedNarration(true);
      }, 12000);

      utterance.onend = () => {
        if (speakId !== currentSpeakIdRef.current) return;
        clearTimeout(safety);
        setHasFinishedNarration(true);
      };
      
      utterance.onerror = () => {
        if (speakId !== currentSpeakIdRef.current) return;
        clearTimeout(safety);
        setHasFinishedNarration(true);
      };

      window.speechSynthesis.speak(utterance);
      if (isPaused) window.speechSynthesis.pause();
    };
    if (isMountedRef.current) setTimeout(trySpeak, 50);
  }, [voiceEnabled, language, isPaused]);

  // ─── Placement Animation ───
  const animatePlacement = useCallback((id, targetPos) => {
    const startPos = [-4, 3, targetPos[2]]; // Fly in from left-top
    const store = useStore.getState();
    
    // Initial jump to start position
    store.setSetupPosition(id, startPos);
    store.setPlaced(id, true);
    
    const startTime = performance.now();
    const duration = 1000; // 1 second flight

    const tick = (now) => {
      if (!isMountedRef.current) return;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Elastic-ish ease out
      const ease = 1 - Math.pow(1 - progress, 4);
      
      const currentPos = [
        startPos[0] + (targetPos[0] - startPos[0]) * ease,
        startPos[1] + (targetPos[1] - startPos[1]) * ease,
        startPos[2] + (targetPos[2] - startPos[2]) * ease
      ];
      
      useStore.getState().setSetupPosition(id, currentPos);
      
      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };
    requestAnimationFrame(tick);
  }, []);

  // ─── Trigger narration on step change ───
  useEffect(() => {
    setHasFinishedNarration(false);
    setIsAnimating(true);
    const text = TOUR_CONTENT[language]?.[STEP_KEYS[stepIndex]] || TOUR_CONTENT.en[STEP_KEYS[stepIndex]];
    speak(text);
    
    // Auto-place highlighted item on the desk for a truly "guided" experience
    const meta = STEP_META[stepIndex];
    if (meta.highlight) {
      const store = useStore.getState();
      if (!store.placedComponents[meta.highlight]) {
        // Target position on table
        const xOffset = (Math.random() - 0.5) * 1.5;
        const zOffset = (Math.random() - 0.5) * 0.5;
        const targetPos = [xOffset, 0.93, zOffset];
        
        animatePlacement(meta.highlight, targetPos);
      }
    }

    const t = setTimeout(() => setIsAnimating(false), 400);
    return () => clearTimeout(t);
  }, [stepIndex, language, speak]);

  // ─── Space bar ───
  useEffect(() => {
    const handler = (e) => { if (e.code === 'Space') { e.preventDefault(); setIsPaused(p => !p); } };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const currentText = TOUR_CONTENT[language]?.[STEP_KEYS[stepIndex]] || TOUR_CONTENT.en[STEP_KEYS[stepIndex]];
  const currentMeta = STEP_META[stepIndex];
  const isLast = stepIndex === STEP_KEYS.length - 1;
  const isFirst = stepIndex === 0;

  return (
    <div style={{
      position: 'absolute',
      inset: 0,
      zIndex: 200,
      pointerEvents: 'none',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '24px 20px 96px',
    }}>
      <style>{`
        @keyframes tourFadeUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes tourFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes tourPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(74,222,128,0.3); }
          50% { box-shadow: 0 0 35px rgba(74,222,128,0.7); }
        }
        @keyframes nextBtnPulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 16px rgba(74,222,128,0.3); }
          50% { transform: scale(1.04); box-shadow: 0 0 28px rgba(74,222,128,0.6); }
        }
        .tour-btn { transition: all 0.2s ease; cursor: pointer; border: none; outline: none; }
        .tour-btn:hover { opacity: 0.85; transform: scale(1.05); }
        .tour-btn:active { transform: scale(0.96); }
        .next-btn { animation: nextBtnPulse 2.2s ease-in-out infinite; }
      `}</style>

      {/* Soft vignette */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(ellipse at center, transparent 60%, rgba(0,0,0,0.3) 100%)',
        pointerEvents: 'none',
      }} />

      {/* ── Caption Card ── */}
      <div style={{
        position: 'relative',
        zIndex: 10,
        pointerEvents: 'auto',
        maxWidth: '540px',
        width: '100%',
        background: 'rgba(5,10,15,0.88)',
        backdropFilter: 'blur(24px)',
        border: '1px solid rgba(74,222,128,0.2)',
        borderRadius: '24px',
        padding: '20px 24px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(74,222,128,0.08)',
        animation: 'tourFadeUp 0.5s ease-out',
        cursor: 'grab',
      }}>
        {/* Step badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '12px',
        }}>
          <div style={{
            width: '32px', height: '32px',
            borderRadius: '10px',
            background: 'rgba(74,222,128,0.15)',
            border: '1px solid rgba(74,222,128,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '16px',
          }}>
            {currentMeta.icon}
          </div>
          <div>
            <div style={{ fontSize: '10px', color: 'rgba(74,222,128,0.7)', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>
              Step {stepIndex + 1} of {STEP_KEYS.length}
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.9)', fontWeight: 700, marginTop: '2px' }}>
              {currentMeta.title}
            </div>
          </div>
          {/* Close */}
          <button
            className="tour-btn"
            onClick={() => {
              if (window.speechSynthesis) window.speechSynthesis.cancel();
              onClose();
            }}
            style={{
              marginLeft: 'auto',
              padding: '6px',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '8px',
              color: 'rgba(255,255,255,0.5)',
              display: 'flex',
            }}
          >
            <X size={14} />
          </button>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'linear-gradient(90deg, transparent, rgba(74,222,128,0.2), transparent)', marginBottom: '14px' }} />

        {/* Text */}
        <p style={{
          margin: 0,
          fontSize: '13.5px',
          fontWeight: 400,
          color: 'rgba(255,255,255,0.88)',
          lineHeight: 1.7,
          letterSpacing: '0.2px',
          animation: isAnimating ? 'tourFadeUp 0.35s ease-out' : 'none',
        }}>
          {currentText}
        </p>

        {/* Progress bar */}
        <div style={{
          marginTop: '16px',
          height: '3px',
          background: 'rgba(255,255,255,0.08)',
          borderRadius: '2px',
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${((stepIndex + 1) / STEP_KEYS.length) * 100}%`,
            background: 'linear-gradient(90deg, #4ade80, #22d3ee)',
            borderRadius: '2px',
            transition: 'width 0.5s ease',
          }} />
        </div>

        {/* NEXT / FINAL buttons */}
        {hasFinishedNarration && (
          <div style={{ marginTop: '16px', display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {!isLast && (
              <button
                className="tour-btn next-btn"
                onClick={() => setStepIndex(i => i + 1)}
                style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  padding: '9px 22px',
                  background: 'linear-gradient(135deg, #16a34a, #15803d)',
                  borderRadius: '12px',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 700,
                }}
              >
                NEXT STEP <ChevronRight size={14} />
              </button>
            )}
            {isLast && (
              <>
                <button
                  className="tour-btn"
                  onClick={() => { if (window.speechSynthesis) window.speechSynthesis.cancel(); onWorkout(); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '9px 22px',
                    background: 'linear-gradient(135deg, #7c3aed, #6d28d9)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 700,
                    boxShadow: '0 0 20px rgba(124,58,237,0.3)',
                  }}
                >
                  <BookOpen size={14} />
                  {TOUR_CONTENT[language]?.workoutNow || 'WORKOUT NOW'}
                </button>
                <button
                  className="tour-btn"
                  onClick={onClose}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px',
                    padding: '9px 22px',
                    background: 'linear-gradient(135deg, #059669, #047857)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 700,
                    boxShadow: '0 0 20px rgba(5,150,105,0.3)',
                  }}
                >
                  <FlaskConical size={14} />
                  {TOUR_CONTENT[language]?.practiceNow || 'PRACTICE NOW'}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* ── Control Bar ── */}
      <div style={{
        pointerEvents: 'auto',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        background: 'rgba(5,10,15,0.9)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '100px',
        padding: '10px 20px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
        animation: 'tourFadeIn 0.6s ease-out 0.3s both',
      }}>

        {/* Language picker */}
        <div style={{ position: 'relative' }} ref={langRef}>
          <button
            className="tour-btn"
            onClick={() => setIsLangOpen(o => !o)}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              padding: '6px 10px',
              background: isLangOpen ? 'rgba(255,255,255,0.1)' : 'transparent',
              borderRadius: '10px',
              color: isLangOpen ? 'white' : 'rgba(255,255,255,0.55)',
              fontSize: '11px', fontWeight: 700,
            }}
          >
            <Languages size={13} />
            <span style={{ minWidth: '20px' }}>{language.toUpperCase()}</span>
          </button>

          {isLangOpen && (
            <div style={{
              position: 'absolute',
              bottom: 'calc(100% + 12px)',
              left: 0,
              background: 'rgba(5,10,15,0.97)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '20px',
              padding: '10px',
              minWidth: '170px',
              boxShadow: '0 16px 40px rgba(0,0,0,0.6)',
              animation: 'tourFadeUp 0.2s ease-out',
              zIndex: 999,
            }}>
              {LANGUAGE_OPTIONS.map(lang => (
                <button
                  key={lang.id}
                  onClick={() => { setLanguage(lang.id); setIsLangOpen(false); }}
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    width: '100%', padding: '9px 14px',
                    background: language === lang.id ? 'rgba(74,222,128,0.15)' : 'transparent',
                    border: 'none', borderRadius: '12px',
                    cursor: 'pointer',
                    color: language === lang.id ? '#4ade80' : 'rgba(255,255,255,0.7)',
                    fontSize: '12px', fontWeight: language === lang.id ? 700 : 400,
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {lang.name}
                  {language === lang.id && <Check size={13} />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }} />

        {/* Prev / Play / Next */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            className="tour-btn"
            disabled={isFirst}
            onClick={() => { if (!isFirst) { window.speechSynthesis?.cancel(); setStepIndex(i => i - 1); } }}
            style={{
              padding: '5px',
              color: isFirst ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.55)',
              background: 'transparent',
              borderRadius: '8px',
            }}
          >
            <ChevronLeft size={16} />
          </button>

          <button
            className="tour-btn"
            onClick={() => setIsPaused(p => !p)}
            style={{
              padding: '8px',
              background: 'rgba(74,222,128,0.12)',
              border: '1px solid rgba(74,222,128,0.25)',
              borderRadius: '50%',
              color: '#4ade80',
              display: 'flex',
            }}
          >
            {isPaused ? <Play size={18} fill="currentColor" /> : <Pause size={18} fill="currentColor" />}
          </button>

          <button
            className="tour-btn"
            disabled={isLast}
            onClick={() => { if (!isLast) { window.speechSynthesis?.cancel(); setStepIndex(i => i + 1); } }}
            style={{
              padding: '5px',
              color: isLast ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.55)',
              background: 'transparent',
              borderRadius: '8px',
            }}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }} />

        {/* Voice toggle */}
        <button
          className="tour-btn"
          onClick={() => setVoiceEnabled(v => !v)}
          style={{
            padding: '5px',
            color: voiceEnabled ? '#4ade80' : 'rgba(255,255,255,0.25)',
            background: 'transparent',
          }}
        >
          {voiceEnabled ? <Volume2 size={15} /> : <VolumeX size={15} />}
        </button>

        {/* Step dots */}
        <div style={{ display: 'flex', gap: '4px', padding: '0 4px' }}>
          {STEP_KEYS.map((_, i) => (
            <button
              key={i}
              onClick={() => { window.speechSynthesis?.cancel(); setStepIndex(i); }}
              style={{
                height: '6px',
                width: i === stepIndex ? '18px' : '6px',
                borderRadius: '3px',
                background: i === stepIndex
                  ? '#4ade80'
                  : i < stepIndex ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.15)',
                transition: 'all 0.35s ease',
                cursor: 'pointer',
                border: 'none',
                padding: 0,
              }}
            />
          ))}
        </div>

        {/* Stop tour */}
        <button
          className="tour-btn"
          onClick={() => {
            if (window.speechSynthesis) window.speechSynthesis.cancel();
            onClose();
          }}
          style={{
            padding: '5px',
            color: 'rgba(255,255,255,0.25)',
            background: 'transparent',
          }}
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
