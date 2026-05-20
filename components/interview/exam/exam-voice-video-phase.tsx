'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Video, VideoOff, Volume2, Sparkles, 
  CornerDownLeft, Shield, AlertCircle, RefreshCw, Keyboard, UserCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

// Initialize Web Speech APIs
const SpeechRecognition = typeof window !== 'undefined' ? ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition) : null;

interface Question {
  id: string;
  question_text: string;
  question_type: string;
  mcq_options: any;
  candidate_answer: string | null;
  answered_at: string | null;
}

interface Round {
  id: string;
  designation: string;
  designation_display: string;
  strategy_tier: string;
  difficulty: string;
  question_format: string;
  programming_language: string;
  timer_seconds: number;
  max_questions: number;
  questions: Question[];
}

interface ExamVoiceVideoPhaseProps {
  currentRound: Round;
  activeQuestionIndex: number;
  setActiveQuestionIndex: (idx: number) => void;
  answers: Record<string, string>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  handleSubmitAnswer: (questionId: string) => void;
  submitting: string | null;
  examData: any;
  logViolation: (type: string, metadata: any, severity: 'LOW' | 'MEDIUM' | 'HIGH') => void;
}

export function ExamVoiceVideoPhase({
  currentRound,
  activeQuestionIndex,
  setActiveQuestionIndex,
  answers,
  setAnswers,
  handleSubmitAnswer,
  submitting,
  examData,
  logViolation
}: ExamVoiceVideoPhaseProps) {
  const currentQuestion = currentRound.questions[activeQuestionIndex];

  // States
  const [isStarted, setIsStarted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false); // AI speaking state
  const [isListening, setIsListening] = useState(false); // STT microphone state
  const isListeningRef = useRef(false);
  useEffect(() => {
    isListeningRef.current = isListening;
  }, [isListening]);
  const [isKeyboardMode, setIsKeyboardMode] = useState(false); // Fallback typing mode
  const [transcript, setTranscript] = useState(''); // Realtime subtitles
  const [voiceList, setVoiceList] = useState<SpeechSynthesisVoice[]>([]);
  const [localCameraStream, setLocalCameraStream] = useState<MediaStream | null>(null);

  // References
  const recognitionRef = useRef<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const [micVolume, setMicVolume] = useState<number>(0);

  // 1. Camera Initialization (Direct rendering for visual excellence)
  useEffect(() => {
    async function initCamera() {
      try {
        if (typeof window !== 'undefined') {
          (window as any).suspendProctoring = true;
        }

        // Try reusing the global proctoring camera stream first to avoid hardware locking conflicts!
        if (typeof window !== 'undefined' && (window as any).proctoringStream) {
          const stream = (window as any).proctoringStream as MediaStream;
          setLocalCameraStream(stream);
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
          audio: false // audio processed by SpeechRecognition
        });
        setLocalCameraStream(stream);
      } catch (err) {
        console.error("Camera access failed:", err);
        toast.error("Webcam access is required for identity and surveillance integrity.");
        logViolation("CAMERA_DISABLED", { error: "camera_permission_denied" }, "HIGH");
      } finally {
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            (window as any).suspendProctoring = false;
          }
        }, 1500);
      }
    }
    initCamera();
  }, []);

  // 1b. Callback ref — binds stream IMMEDIATELY when the <video> element enters the DOM
  const videoCallbackRef = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node && localCameraStream) {
      node.srcObject = localCameraStream;
      node.play().catch(() => {});
    }
  }, [localCameraStream]);

  // 1c. Secure cleanup of camera tracks on unmount
  useEffect(() => {
    return () => {
      if (localCameraStream && typeof window !== 'undefined' && localCameraStream !== (window as any).proctoringStream) {
        localCameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [localCameraStream]);

  // 2. Microphone Audio Level Analyzer (to drive the glowing avatar orbit dynamically!)
  useEffect(() => {
    if (!isListening) {
      setMicVolume(0);
      return;
    }
    
    let animationFrameId: number;
    async function setupAudioMeter() {
      try {
        if (typeof window !== 'undefined') {
          (window as any).suspendProctoring = true;
        }
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 64;
        source.connect(analyser);
        
        audioContextRef.current = audioContext;
        analyserRef.current = analyser;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const draw = () => {
          if (!analyserRef.current || !isListening) return;
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
          setMicVolume(Math.min(100, Math.round((average / 255) * 150))); // Boost visually
          animationFrameId = requestAnimationFrame(draw);
        };
        draw();
      } catch (e) {
        console.error("Mic analyzer setup failed:", e);
      } finally {
        setTimeout(() => {
          if (typeof window !== 'undefined') {
            (window as any).suspendProctoring = false;
          }
        }, 1500);
      }
    }
    setupAudioMeter();

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, [isListening]);

  // 3. Speech Recognition Engine setup (Speech-to-Text)
  useEffect(() => {
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = 'en-US';

      rec.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const currentAnswerText = (finalTranscript || interimTranscript).trim();
        setTranscript(currentAnswerText);
        setAnswers(prev => ({ ...prev, [currentQuestion.id]: currentAnswerText }));
      };

      rec.onerror = (e: any) => {
        if (e.error === 'no-speech' || e.error === 'aborted') {
          // Ignore transient silence warnings
          return;
        }
        console.warn("Speech recognition notice:", e.error);
        if (e.error === 'not-allowed') {
          toast.error("Microphone access is blocked. Please allow mic permissions in your browser.");
          setIsListening(false);
        }
      };

      rec.onend = () => {
        // Auto-restart STT listener if browser stops it on silence but user wants it active
        if (isListeningRef.current) {
          try {
            rec.start();
          } catch (err) {
            // Silence restart contention
          }
        } else {
          setIsListening(false);
        }
      };

      recognitionRef.current = rec;
    }
  }, [currentQuestion.id]);

  // 4. Voice Loading (Text-to-Speech voices)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const loadVoices = () => {
        setVoiceList(window.speechSynthesis.getVoices());
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // 5. Speech vocalization (Text-to-Speech)
  const speakAIResponse = (text: string) => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel(); // Cancel current audio
      
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Select best premium English voice
      const premiumVoice = voiceList.find(v => 
        v.name.includes('Google US English') || 
        v.name.includes('Google UK English Female') ||
        v.name.includes('Samantha') || 
        (v.lang.startsWith('en-') && v.name.includes('Natural'))
      ) || voiceList[0];

      if (premiumVoice) utterance.voice = premiumVoice;
      utterance.rate = 1.0; // Normal rate
      utterance.pitch = 1.05; // Slightly pleasant high-fidelity pitch

      utterance.onstart = () => {
        setIsSpeaking(true);
        setIsListening(false);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        // Automatically start listening after Sophia finishes her question
        if (!isKeyboardMode) {
          handleToggleListen(true);
        }
      };

      window.speechSynthesis.speak(utterance);
    } else {
      // Browsers without speech synthesis fallback directly to start listening
      if (!isKeyboardMode) handleToggleListen(true);
    }
  };

  // 6. Automatically speak when entering or moving questions
  useEffect(() => {
    if (isStarted && currentQuestion) {
      setTranscript(answers[currentQuestion.id] || '');
      speakAIResponse(currentQuestion.question_text);
    }
  }, [activeQuestionIndex, isStarted]);

  // Handle Start round
  const handleStartRound = () => {
    setIsStarted(true);
    // Initialize Speech Engine and play Welcome + first question
    const welcomeSpeech = `Hi, I am your AI HR Agent. I will conduct this conversational interview for the ${examData?.job_title || 'Position'}. Let's begin. Here is your first question: ${currentQuestion.question_text}`;
    speakAIResponse(welcomeSpeech);
  };

  // Toggle Microphone Capturing
  const handleToggleListen = (forceState?: boolean) => {
    const targetState = forceState !== undefined ? forceState : !isListening;

    if (targetState) {
      if (!recognitionRef.current) {
        toast.error("Speech synthesis or recognition is not supported in this browser. Please use keyboard fallback mode.");
        setIsKeyboardMode(true);
        return;
      }
      try {
        window.speechSynthesis.cancel(); // stop AI speech immediately
        setIsSpeaking(false);
        recognitionRef.current.start();
        setIsListening(true);
        toast.success("Microphone active. Speak clearly.");
      } catch (err) {
        console.error("Failed to start voice recognition:", err);
      }
    } else {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    }
  };

  // Submit Spoken Response
  const handleSubmitSpokenAnswer = async () => {
    // Stop recording first
    if (isListening) {
      handleToggleListen(false);
    }

    const currentAnswer = answers[currentQuestion.id];
    if (!currentAnswer?.trim()) {
      toast.error("I couldn't hear your response. Please click record and speak, or type your response.");
      return;
    }

    // Call existing submission service directly
    handleSubmitAnswer(currentQuestion.id);
  };

  // Move to next question after submission completes
  useEffect(() => {
    if (submitting === null && answers[currentQuestion.id] === currentQuestion.candidate_answer && currentQuestion.candidate_answer) {
      // Successfully saved!
      // Speak brief supportive transitional text, then shift question index
      const isLast = activeQuestionIndex === currentRound.questions.length - 1;
      
      if (!isLast) {
        setActiveQuestionIndex(activeQuestionIndex + 1);
      } else {
        // Voice round complete
        const finalWord = "Thank you. You have successfully answered all conversational questions for this round. Please click Finish Exam in the top bar to complete your evaluation.";
        speakAIResponse(finalWord);
      }
    }
  }, [submitting, currentQuestion.candidate_answer]);

  // Accessibility Fallback Typing
  const handleKeyboardInputSave = () => {
    const currentAnswer = answers[currentQuestion.id];
    if (!currentAnswer?.trim()) {
      toast.error("Please type your answer before saving.");
      return;
    }
    handleSubmitAnswer(currentQuestion.id);
  };

  return (
    <div className="w-full bg-card border border-border rounded-sm shadow-2xl overflow-hidden relative min-h-[580px] flex flex-col">
      {/* Visual background elements */}
      <div className="absolute inset-0 pointer-events-none opacity-5 dark:opacity-10">
        <div className="absolute top-10 left-10 w-[300px] h-[300px] bg-primary rounded-full blur-[100px]" />
        <div className="absolute bottom-10 right-10 w-[300px] h-[300px] bg-primary/60 rounded-full blur-[100px]" />
      </div>

      {/* Screen Header Bar */}
      <div className="relative z-10 bg-secondary/60 backdrop-blur-md px-6 py-4 border-b border-border flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
          <span className="text-[10px] text-primary font-bold uppercase tracking-widest">Sophia Intermediary Workspace</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-secondary/40 rounded-full border border-border">
            <Shield className="w-3 h-3 text-emerald-500" />
            <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-tight">AI SURVEILLANCE LOCKED</span>
          </div>
          <button 
            onClick={() => {
              window.speechSynthesis.cancel();
              speakAIResponse(currentQuestion.question_text);
            }}
            title="Repeat Question"
            className="p-1.5 hover:bg-secondary text-muted-foreground hover:text-foreground rounded transition-all"
          >
            <RefreshCw size={13} className={cn(isSpeaking && "animate-spin")} />
          </button>
          <button 
            onClick={() => {
              handleToggleListen(false);
              setIsKeyboardMode(!isKeyboardMode);
            }}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-bold border transition-all",
              isKeyboardMode 
                ? "bg-primary/10 border-primary/30 text-primary" 
                : "bg-secondary border-border text-muted-foreground hover:border-border/80"
            )}
          >
            <Keyboard size={12} />
            {isKeyboardMode ? "Voice Mode" : "Type Answer"}
          </button>
        </div>
      </div>

      {/* Main Connection Intro Screen */}
      <AnimatePresence mode="wait">
        {!isStarted ? (
          <motion.div 
            key="welcome"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="flex-1 relative z-10 flex flex-col items-center justify-center p-12 text-center"
          >
            <div className="relative w-28 h-28 mb-8">
              {/* Outer pulsing neon ring */}
              <div className="absolute inset-0 rounded-full bg-blue-600/20 border-2 border-blue-500/50 animate-ping opacity-60" />
              {/* Inner glowing ball */}
              <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-[0_0_40px_rgba(37,99,235,0.6)] flex items-center justify-center border border-white/20">
                <Sparkles className="w-10 h-10 text-white animate-pulse" />
              </div>
            </div>

            <h3 className="text-2xl font-bold tracking-tight text-foreground mb-2">AI HR Agent is Ready</h3>
            <p className="text-muted-foreground text-xs font-medium max-w-sm leading-relaxed mb-8">
              You are about to start a natural, verbal Voice Interview conducted by our AI Specialist Sophia. She will speak questions and evaluate your voice transcripts.
            </p>

            <div className="p-4 bg-secondary/60 border border-border rounded-sm max-w-sm mb-8 text-left space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                <p className="text-[10px] text-muted-foreground leading-normal">Ensure your room is quiet and your camera captures your face in full frame.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                <p className="text-[10px] text-muted-foreground leading-normal">Web Speech API will translate your speech locally. Speak slowly and clearly.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                <p className="text-[10px] text-muted-foreground leading-normal">The surveillance proctoring tracks eye positions, face integrity, and device fraud checks.</p>
              </div>
            </div>

            <button 
              onClick={handleStartRound}
              className="px-10 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-sm font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] active:scale-95 cursor-pointer"
            >
              Establish Live Call
            </button>
          </motion.div>
        ) : (
          /* Live Interview Workspace split screen */
          <motion.div 
            key="workspace"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 relative z-10 flex flex-col md:flex-row min-h-[500px]"
          >
            {/* Left Box: AI Sophia Interviewer (Orb visual) */}
            <div className="flex-1 border-r border-border flex flex-col items-center justify-center p-8 relative bg-secondary/20">
              <div className="text-center absolute top-6 left-6 right-6 flex justify-between items-center">
                <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-wider">AI Host Agent</span>
                <span className={cn(
                  "text-[9px] font-bold px-2 py-0.5 rounded-full border tracking-wide uppercase",
                  isSpeaking 
                    ? "bg-primary/10 border-primary/30 text-primary" 
                    : isListening 
                      ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 animate-pulse" 
                      : "bg-secondary border-border text-muted-foreground"
                )}>
                  {isSpeaking ? "Speaking..." : isListening ? "Listening..." : "Idle"}
                </span>
              </div>

              {/* Sophisticated SVG Orb Avatar driven by state */}
              <div className="relative w-48 h-48 flex items-center justify-center">
                {/* Outer Glow Halo */}
                <div className={cn(
                  "absolute inset-0 rounded-full transition-all duration-700 blur-[30px] opacity-40",
                  isSpeaking 
                    ? "bg-blue-500 scale-110" 
                    : isListening 
                      ? "bg-emerald-500 scale-105" 
                      : "bg-slate-700 scale-95"
                )} />

                {/* Simulated Wave Orbits */}
                <svg className="w-full h-full" viewBox="0 0 200 200">
                  <defs>
                    <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2563eb" />
                      <stop offset="100%" stopColor="#4f46e5" />
                    </linearGradient>
                    <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>

                  {/* Ring 1 - Idle Orbit */}
                  <motion.circle 
                    cx="100" cy="100" r="70" 
                    fill="none" 
                    stroke="url(#blueGrad)" 
                    strokeWidth="1.5" 
                    strokeDasharray="4 8"
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
                  />

                  {/* Ring 2 - Audio level reaction circle */}
                  <motion.circle 
                    cx="100" cy="100" 
                    r={78 + (isListening ? micVolume * 0.15 : 0)} 
                    fill="none" 
                    stroke={isListening ? "url(#emeraldGrad)" : "url(#blueGrad)"} 
                    strokeWidth="1"
                    opacity="0.3"
                    animate={{ scale: isSpeaking ? [1, 1.05, 1] : 1 }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  />

                  {/* SVG Center pulsing Avatar Sphere */}
                  <motion.circle 
                    cx="100" cy="100" 
                    r={55 + (isListening ? micVolume * 0.08 : 0)} 
                    fill={isListening ? "url(#emeraldGrad)" : "url(#blueGrad)"} 
                    className="shadow-2xl border border-white/10"
                    animate={{
                      r: isSpeaking ? [52, 57, 52] : 55
                    }}
                    transition={{ repeat: Infinity, duration: 0.6, ease: "easeInOut" }}
                  />

                  {/* Speaking sine wave indicator lines */}
                  {isSpeaking && (
                    <>
                      <path d="M 60,100 Q 80,70 100,100 T 140,100" fill="none" stroke="white" strokeWidth="2" opacity="0.6" />
                      <path d="M 60,100 Q 80,125 100,100 T 140,100" fill="none" stroke="white" strokeWidth="1.5" opacity="0.4" />
                    </>
                  )}
                </svg>
              </div>

              <div className="mt-8 text-center">
                <p className="text-foreground font-bold text-sm tracking-wide">AI HR Agent</p>
                <p className="text-muted-foreground text-[10px] uppercase font-bold mt-1 tracking-widest">Enterprise Interview Orchestrator</p>
              </div>
            </div>

            {/* Right Box: Candidate & Camera / Audio Subtitles */}
            <div className="flex-1 flex flex-col bg-secondary/10 p-8 justify-between min-h-[500px]">
              {/* Surveillance Webcam view with dynamic canvas overlays */}
              <div className="flex-1 flex flex-col">
                <div className="relative w-full flex-1 min-h-[280px] bg-background rounded-sm border border-border overflow-hidden shadow-2xl group flex items-center justify-center">
                  <video 
                    ref={videoCallbackRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                    style={{ transform: 'scaleX(-1)' }}
                  />

                  {/* Dynamic Proctoring Eye & Gaze tracker lines */}
                  <div className="absolute inset-0 pointer-events-none">
                    {/* Bounding box lines */}
                    <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-blue-500 opacity-60" />
                    <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-blue-500 opacity-60" />
                    <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-blue-500 opacity-60" />
                    <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-blue-500 opacity-60" />

                    {/* Central scan line */}
                    <div className="absolute top-1/2 left-4 right-4 h-[1px] bg-blue-500/20 border-t border-blue-500/10 shadow-[0_0_10px_rgba(59,130,246,0.3)] animate-pulse" />

                    {/* Simulated Gaze Crosshair */}
                    <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border border-indigo-500/30 flex items-center justify-center">
                      <div className="w-1 h-1 rounded-full bg-indigo-500 animate-ping" />
                    </div>
                  </div>

                  <div className="absolute bottom-2 left-2 flex items-center gap-1.5 bg-black/80 backdrop-blur-md px-2 py-1 rounded border border-white/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[8px] text-white font-bold tracking-tight uppercase">PROCTOR: TF.JS EYE-GAZE ACTIVE</span>
                  </div>
                </div>

                {/* Mic Vol Indicator level */}
                {isListening && (
                  <div className="w-full mt-3 flex items-center justify-between gap-3 bg-secondary/60 border border-border px-3 py-1.5 rounded-sm">
                    <span className="text-[9px] font-bold text-emerald-500 uppercase tracking-wide">Mic Level:</span>
                    <div className="flex-1 h-1.5 bg-background rounded-full overflow-hidden flex gap-0.5 p-0.5">
                      <div className="h-full bg-emerald-500 rounded-sm transition-all duration-100" style={{ width: `${Math.min(100, micVolume)}%` }} />
                    </div>
                    <span className="text-[8px] font-mono text-muted-foreground">{Math.min(100, micVolume)}%</span>
                  </div>
                )}
              </div>

              {/* Subtitles Transcript panel */}
              <div className="my-6 p-5 bg-card border border-border rounded-sm flex-1 min-h-[140px] flex flex-col justify-between">
                <div>
                  <span className="text-[9px] text-primary font-bold uppercase tracking-wider block mb-2">AI HR Agent's Question ({activeQuestionIndex + 1}/{currentRound.questions.length})</span>
                  <p className="text-foreground text-xs leading-relaxed font-semibold">{currentQuestion?.question_text}</p>
                </div>

                {!isKeyboardMode ? (
                  <div className="border-t border-border mt-4 pt-4">
                    <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider block mb-2">Live Answer Transcription</span>
                    <p className="text-muted-foreground text-xs italic leading-relaxed min-h-[40px]">
                      {transcript || (isListening ? "Listening, speak now..." : "Click record response below to talk...")}
                    </p>
                  </div>
                ) : (
                  <div className="border-t border-border mt-4 pt-4 flex flex-col gap-2">
                    <label className="text-[9px] text-primary font-bold uppercase tracking-wider">Type Your Answer</label>
                    <textarea 
                      value={answers[currentQuestion.id] || ''}
                      onChange={(e) => setAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                      placeholder="Type your comprehensive response here..."
                      className="w-full bg-background border border-input rounded-sm text-xs py-2 px-3 text-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none min-h-[70px]"
                    />
                  </div>
                )}
              </div>

              {/* Workspace actions */}
              <div className="flex items-center justify-between bg-card px-6 py-4 border border-border rounded-sm">
                {!isKeyboardMode ? (
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleToggleListen()}
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer",
                        isListening 
                          ? "bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:bg-red-700" 
                          : "bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:bg-emerald-700"
                      )}
                    >
                      {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-bold">{isListening ? "RECORDING..." : "MIC MUTED"}</p>
                      <p className="text-[8px] text-muted-foreground/60 font-medium">{isListening ? "AI is transcribing your voice" : "Click mic to speak answer"}</p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleKeyboardInputSave}
                      disabled={submitting === currentQuestion.id}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase tracking-wider rounded-sm disabled:opacity-40 transition-all"
                    >
                      {submitting === currentQuestion.id ? "Saving..." : "Save Answer"}
                    </button>
                  </div>
                )}

                {!isKeyboardMode && (
                  <button 
                    onClick={handleSubmitSpokenAnswer}
                    disabled={submitting === currentQuestion.id}
                    className="group px-6 py-3 bg-primary text-primary-foreground font-bold text-[10px] uppercase tracking-widest rounded-sm hover:bg-primary/90 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40"
                  >
                    {submitting === currentQuestion.id ? "Analyzing Speech..." : "Submit Response"}
                    <CornerDownLeft size={10} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
