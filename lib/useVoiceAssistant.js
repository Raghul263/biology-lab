'use client';

import { useRef, useCallback, useState, useEffect } from 'react';

export function useVoiceAssistant() {
  const utteranceRef = useRef(null);
  const currentSpeakIdRef = useRef(0);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [hasFinishedNarration, setHasFinishedNarration] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const isMountedRef = useRef(true);
  const audioRef = useRef(null);

  // Load voices and monitor for changes
  useEffect(() => {
    isMountedRef.current = true;
    
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        setIsReady(true);
      }
    };

    if (window.speechSynthesis) {
      loadVoices();
      if (window.speechSynthesis.onvoiceschanged !== undefined) {
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }

    return () => {
      isMountedRef.current = false;
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const stop = useCallback(() => {
    currentSpeakIdRef.current++;
    setIsSpeaking(false);
    if (window.speechSynthesis) {
      // Some browsers get stuck if paused, so resume before cancel
      window.speechSynthesis.resume();
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, []);

  const pause = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.pause();
    }
    setIsSpeaking(false);
  }, []);

  const resume = useCallback(() => {
    if (window.speechSynthesis) {
      window.speechSynthesis.resume();
    }
    setIsSpeaking(true);
  }, []);

  const speak = useCallback((text, language, voiceEnabled = true) => {
    setHasFinishedNarration(false);
    
    if (!voiceEnabled || !text) { 
        setHasFinishedNarration(true); 
        return; 
    }
    
    const speakId = ++currentSpeakIdRef.current;
    
    if (window.speechSynthesis) {
      window.speechSynthesis.resume();
      window.speechSynthesis.cancel();
    }

    let retries = 0;
    const trySpeak = () => {
      if (!isMountedRef.current || speakId !== currentSpeakIdRef.current) return;

      const voices = window.speechSynthesis.getVoices();
      
      if (voices.length === 0 && retries < 15) { // Increased retries
        retries++;
        setTimeout(trySpeak, 200);
        return;
      }

      const targetLang = language === 'en' ? 'en' : language; 
      
      // 1. Broad matching for language code
      let matchingVoices = voices.filter(v => 
        v.lang.toLowerCase().startsWith(targetLang.toLowerCase()) || 
        v.lang.toLowerCase().replace('_', '-').startsWith(targetLang.toLowerCase())
      );

      // 3. Try any India-region voice as they often support regional scripts
      if (matchingVoices.length === 0 && (language === 'mr' || language === 'te')) {
        matchingVoices = voices.filter(v => v.lang.toLowerCase().includes('-in'));
      }

      // 4. Prefer local voices to avoid network failures
      let selectedVoice = matchingVoices.find(v => v.localService === true) || matchingVoices[0];

      // 5. Ultimate fallback: System default or very first voice
      if (!selectedVoice) {
        selectedVoice = voices.find(v => v.default) || voices[0];
      }

      // Check if we actually found a voice for the target language
      const hasProperVoice = selectedVoice && (
        selectedVoice.lang.toLowerCase().startsWith(targetLang.toLowerCase()) || 
        selectedVoice.name.toLowerCase().includes(language === 'mr' ? 'marathi' : 'telugu')
      );

      // If NO native voice found for Marathi/Telugu, use Google Translate TTS fallback
      if (!hasProperVoice && ['mr', 'te'].includes(language)) {
        try {
          if (audioRef.current) audioRef.current.pause();
          const ttsUrl = `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(text)}&tl=${language}&client=tw-ob`;
          const audio = new Audio(ttsUrl);
          audioRef.current = audio;
          audio.onplay = () => setIsSpeaking(true);
          audio.onended = () => {
            setIsSpeaking(false);
            setHasFinishedNarration(true);
          };
          audio.onerror = () => {
            console.warn('External TTS failed, falling back to system default');
            // Last resort: proceed with standard speak
          };
          audio.play().catch(() => {
              // If browser blocks audio play, fallback to system voice
              window.speechSynthesis.speak(new SpeechSynthesisUtterance(text));
          });
          return;
        } catch (e) {
          console.error('External TTS Error:', e);
        }
      }

      try {
        // Sanitize text: remove parentheses and extra whitespace which can confuse some TTS engines
        const sanitizedText = text.replace(/[()]/g, ' ').replace(/\s+/g, ' ').trim();
        const utterance = new SpeechSynthesisUtterance(sanitizedText);
        
        if (selectedVoice) {
          utterance.voice = selectedVoice;
          utterance.lang = selectedVoice.lang;
        } else {
          utterance.lang = language === 'en' ? 'en-US' : language;
        }

        utterance.rate = 0.9; // Slightly slower for better clarity in regional languages
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        utterance.onstart = () => {
          if (speakId !== currentSpeakIdRef.current) return;
          setIsSpeaking(true);
        };

        utterance.onend = () => {
          if (speakId !== currentSpeakIdRef.current) return;
          setIsSpeaking(false);
          setHasFinishedNarration(true);
        };

        utterance.onerror = (event) => {
          if (event.error !== 'interrupted' && event.error !== 'canceled') {
            console.warn('SpeechSynthesis Error:', event.error);
            // If it failed, try a simple English fallback as a last resort
            if (language !== 'en' && retries < 1) {
                retries++;
                setTimeout(() => speak(text, 'en', voiceEnabled), 100);
            }
          }
          if (speakId !== currentSpeakIdRef.current) return;
          setIsSpeaking(false);
          setHasFinishedNarration(true);
        };

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error('Failed to initiate speech:', err);
        setHasFinishedNarration(true);
      }
    };

    if (isMountedRef.current) {
      trySpeak();
    }
  }, []);

  const unlockAudio = useCallback(() => {
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const silent = new SpeechSynthesisUtterance('');
        window.speechSynthesis.speak(silent);
    }
  }, []);

  const replay = useCallback((text, language, voiceEnabled = true) => {
    stop();
    setTimeout(() => speak(text, language, voiceEnabled), 150);
  }, [speak, stop]);

  return { speak, stop, pause, resume, replay, unlockAudio, isSpeaking, hasFinishedNarration, setHasFinishedNarration, isReady };
}


