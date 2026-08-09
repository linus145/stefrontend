'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';

interface UseSpeechProps {
  currentQuestionId: string;
  isMicMuted: boolean;
  isStarted: boolean;
  mode: 'ai' | 'normal';
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setUserTranscript: (t: string) => void;
}

export function useSpeech({
  currentQuestionId,
  isMicMuted,
  isStarted,
  mode,
  setAnswers,
  setUserTranscript
}: UseSpeechProps) {
  const [isListening, setIsListening] = useState(false);
  const [isNormalListening, setIsNormalListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isTranscribingActive, setIsTranscribingActive] = useState(true);

  const recognitionRef = useRef<any>(null);
  const normalRecognitionRef = useRef<any>(null);

  const SpeechRecognitionClass = typeof window !== 'undefined'
    ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition)
    : null;

  const startFallbackListening = useCallback(() => {
    if (!SpeechRecognitionClass) {
      toast.error("Speech recognition is not supported in this browser. Please use keyboard input.");
      return;
    }
    if (isMicMuted) return;

    if (recognitionRef.current) {
      try { recognitionRef.current.stop(); } catch (e) { }
    }

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: any) => {
      let finalTranscript = '';
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      const text = finalTranscript || interim;
      if (text) {
        setUserTranscript(text);
        if (currentQuestionId) {
          setAnswers(prev => ({ ...prev, [currentQuestionId]: text }));
        }
      }
    };

    recognition.onerror = (event: any) => {
      if (event.error !== 'no-speech') {
        console.error("Speech recognition error:", event.error);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      console.error("Failed to start SpeechRecognition:", e);
    }
  }, [currentQuestionId, isMicMuted, setAnswers, setUserTranscript, SpeechRecognitionClass]);

  const stopFallbackListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) { }
    }
    setIsListening(false);
  }, []);

  useEffect(() => {
    let active = true;

    if (mode !== 'normal' || !isStarted || !isTranscribingActive) {
      if (normalRecognitionRef.current) {
        try {
          normalRecognitionRef.current.stop();
        } catch (e) { }
        normalRecognitionRef.current = null;
      }
      return;
    }

    if (!SpeechRecognitionClass) {
      console.warn("SpeechRecognition is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      if (active) {
        setIsNormalListening(true);
      }
    };

    recognition.onresult = (event: any) => {
      if (!active) return;
      let finalResult = '';
      let interimResult = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalResult += event.results[i][0].transcript + ' ';
        } else {
          interimResult += event.results[i][0].transcript;
        }
      }

      if (finalResult && currentQuestionId) {
        setAnswers(prev => {
          const currentVal = prev[currentQuestionId] || '';
          const trimmedVal = currentVal.trim();
          const trimmedFinal = finalResult.trim();

          if (!trimmedVal) return { ...prev, [currentQuestionId]: trimmedFinal };
          if (trimmedVal.endsWith(trimmedFinal)) return prev;

          return {
            ...prev,
            [currentQuestionId]: `${trimmedVal}\n${trimmedFinal}`
          };
        });
      }

      setInterimTranscript(interimResult);
    };

    let hasError = false;

    recognition.onerror = (event: any) => {
      if (!active) return;
      if (event.error === 'aborted' || event.error === 'no-speech') return;
      console.error("Normal mode speech recognition error:", event.error);
      hasError = true;
      if (event.error === 'not-allowed' || event.error === 'audio-capture') {
        toast.error("Microphone access issue for speech recognition.");
        setIsTranscribingActive(false);
      }
    };

    recognition.onend = () => {
      if (active) {
        setIsNormalListening(false);
      }
      if (active && isStarted && isTranscribingActive && mode === 'normal') {
        const delay = hasError ? 3000 : 100;
        setTimeout(() => {
          if (active && isTranscribingActive) {
            try {
              recognition.start();
            } catch (e) {
              console.error("Failed to auto-restart normal recognition:", e);
            }
          }
        }, delay);
      }
    };

    normalRecognitionRef.current = recognition;
    try {
      recognition.start();
    } catch (e) {
      console.error("Failed to start normal recognition:", e);
    }

    return () => {
      active = false;
      if (normalRecognitionRef.current) {
        try {
          normalRecognitionRef.current.stop();
        } catch (e) { }
        normalRecognitionRef.current = null;
      }
    };
  }, [isStarted, mode, isTranscribingActive, currentQuestionId, setAnswers, SpeechRecognitionClass]);

  return {
    isListening,
    setIsListening,
    isNormalListening,
    interimTranscript,
    isTranscribingActive,
    setIsTranscribingActive,
    startFallbackListening,
    stopFallbackListening,
    recognitionRef,
    normalRecognitionRef
  };
}
