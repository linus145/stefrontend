'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mic, MicOff, Sparkles, 
  CornerDownLeft, Shield, Keyboard
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import axios from 'axios';

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
  handleSubmitAnswer: (questionId: string, directAnswer?: string) => void;
  submitting: string | null;
  examData: any;
  logViolation: (type: string, metadata: any, severity: 'LOW' | 'MEDIUM' | 'HIGH') => void;
}

// ─── Deepgram Voice Agent Constants ───
const DEEPGRAM_AGENT_URL = 'wss://agent.deepgram.com/v1/agent/converse';
const SAMPLE_RATE = 16000;

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

  // ─── State ───
  const [isStarted, setIsStarted] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isKeyboardMode, setIsKeyboardMode] = useState(false);
  const [agentTranscript, setAgentTranscript] = useState('');  // What AI said
  const [userTranscript, setUserTranscript] = useState('');     // What user said
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [localCameraStream, setLocalCameraStream] = useState<MediaStream | null>(null);
  const [micVolume, setMicVolume] = useState<number>(0);
  const [conversationLog, setConversationLog] = useState<Array<{role: string, text: string}>>([]);

  // ─── Refs ───
  const wsRef = useRef<WebSocket | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioQueueRef = useRef<ArrayBuffer[]>([]);
  const isPlayingRef = useRef(false);
  const playbackContextRef = useRef<AudioContext | null>(null);
  const nextPlayTimeRef = useRef(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const volumeAnimFrameRef = useRef<number>(0);

  // ─── AI Voice Agent prompt is now constructed dynamically on the backend ───

  // ─── 1. Camera Initialization ───
  useEffect(() => {
    async function initCamera() {
      try {
        if (typeof window !== 'undefined') {
          (window as any).suspendProctoring = true;
        }

        if (typeof window !== 'undefined' && (window as any).proctoringStream) {
          const stream = (window as any).proctoringStream as MediaStream;
          setLocalCameraStream(stream);
          return;
        }

        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 640, height: 480, facingMode: 'user' },
          audio: false
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

  // ─── 1b. Video callback ref ───
  const videoCallbackRef = useCallback((node: HTMLVideoElement | null) => {
    videoRef.current = node;
    if (node && localCameraStream) {
      node.srcObject = localCameraStream;
      node.play().catch(() => {});
    }
  }, [localCameraStream]);

  // ─── 1c. Camera cleanup ───
  useEffect(() => {
    return () => {
      if (localCameraStream && typeof window !== 'undefined' && localCameraStream !== (window as any).proctoringStream) {
        localCameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [localCameraStream]);

  // ─── 2. Audio Playback Engine ─── 
  // Plays raw Linear16 PCM audio chunks from Deepgram in sequence
  const playAudioChunk = useCallback((audioData: ArrayBuffer) => {
    if (!playbackContextRef.current || playbackContextRef.current.state === 'closed') {
      playbackContextRef.current = new AudioContext({ sampleRate: SAMPLE_RATE });
    }
    const ctx = playbackContextRef.current;

    const int16Array = new Int16Array(audioData);
    const float32Array = new Float32Array(int16Array.length);
    for (let i = 0; i < int16Array.length; i++) {
      float32Array[i] = int16Array[i] / 32768;
    }

    const audioBuffer = ctx.createBuffer(1, float32Array.length, SAMPLE_RATE);
    audioBuffer.copyToChannel(float32Array, 0);

    const source = ctx.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(ctx.destination);

    const currentTime = ctx.currentTime;
    const startTime = Math.max(currentTime, nextPlayTimeRef.current);
    source.start(startTime);
    nextPlayTimeRef.current = startTime + audioBuffer.duration;

    source.onended = () => {
      // Will be superseded by AgentAudioDone event from server
    };
  }, []);

  // ─── 3. Microphone → Linear16 PCM streaming ───
  const startMicStream = useCallback(async () => {
    try {
      if (typeof window !== 'undefined') {
        (window as any).suspendProctoring = true;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          sampleRate: SAMPLE_RATE,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        } 
      });
      micStreamRef.current = stream;

      const audioContext = new AudioContext({ sampleRate: SAMPLE_RATE });
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      sourceNodeRef.current = source;

      // Analyser for volume visualization
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      // ScriptProcessor to capture raw PCM and send to WebSocket
      const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
      scriptProcessorRef.current = scriptProcessor;

      source.connect(scriptProcessor);
      scriptProcessor.connect(audioContext.destination);

      scriptProcessor.onaudioprocess = (event) => {
        if (wsRef.current?.readyState === WebSocket.OPEN) {
          const inputData = event.inputBuffer.getChannelData(0);
          // Convert Float32 → Int16 (Linear16 PCM)
          const int16Array = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            const s = Math.max(-1, Math.min(1, inputData[i]));
            int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }
          wsRef.current.send(int16Array.buffer);
        }
      };

      // Volume metering animation loop
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setMicVolume(Math.min(100, Math.round((average / 255) * 150)));
        volumeAnimFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();

      setIsListening(true);
    } catch (err) {
      console.error("Mic stream setup failed:", err);
      toast.error("Microphone access is required for the voice interview.");
    } finally {
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          (window as any).suspendProctoring = false;
        }
      }, 1500);
    }
  }, []);

  const stopMicStream = useCallback(() => {
    cancelAnimationFrame(volumeAnimFrameRef.current);

    if (scriptProcessorRef.current) {
      scriptProcessorRef.current.disconnect();
      scriptProcessorRef.current = null;
    }
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (micStreamRef.current) {
      micStreamRef.current.getTracks().forEach(t => t.stop());
      micStreamRef.current = null;
    }
    analyserRef.current = null;
    setIsListening(false);
    setMicVolume(0);
  }, []);

  // ─── 4. Deepgram Voice Agent WebSocket Connection ───
  const connectToDeepgram = useCallback(async () => {
    const deepgramKey = examData?.deepgram_api_key;
    const examToken = examData?.exam_token;
    const roundId = currentRound?.id;

    if (!deepgramKey || !examToken || !roundId) {
      toast.error("Voice Agent configuration missing. Please contact support.");
      setConnectionStatus('error');
      return;
    }

    setConnectionStatus('connecting');

    try {
      // Fetch dynamic settings from the backend
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
      const response = await axios.get(`${baseUrl}/AIInterview/settings/`, {
        params: {
          exam_token: examToken,
          round_id: roundId
        }
      });

      if (response.data.status !== 'success' || !response.data.data?.settings) {
        throw new Error(response.data.message || "Failed to load voice agent configuration");
      }

      const settings = response.data.data.settings;

      // Browser WebSocket auth via subprotocol
      const ws = new WebSocket(DEEPGRAM_AGENT_URL, ['token', deepgramKey]);
      ws.binaryType = 'arraybuffer';
      wsRef.current = ws;

      ws.onopen = () => {
        console.log('[Deepgram] WebSocket connected');
        ws.send(JSON.stringify(settings));
        console.log('[Deepgram] Settings sent');
      };

      ws.onmessage = (event) => {
        // Binary = audio data from the agent
        if (event.data instanceof ArrayBuffer) {
          playAudioChunk(event.data);
          return;
        }

        // JSON = control messages
        try {
          const msg = JSON.parse(event.data);
          
          switch (msg.type) {
            case 'SettingsApplied':
              console.log('[Deepgram] Settings applied successfully');
              setConnectionStatus('connected');
              // Start mic streaming after settings are confirmed
              startMicStream();
              break;

            case 'AgentStartedSpeaking':
              setIsSpeaking(true);
              break;

            case 'AgentAudioDone':
              setIsSpeaking(false);
              break;

            case 'UserStartedSpeaking':
              // User barged in — agent will stop speaking
              setIsSpeaking(false);
              break;

            case 'ConversationText': {
              const role = msg.role; // 'agent' or 'user'
              const content = msg.content || '';
              
              if (role === 'agent' || role === 'assistant') {
                setAgentTranscript(content);
                setConversationLog(prev => [...prev, { role: 'agent', text: content }]);
              } else if (role === 'user') {
                setUserTranscript(content);
                setConversationLog(prev => [...prev, { role: 'user', text: content }]);
                // Save the user's transcript as the answer for the current question
                setAnswers(prev => ({ ...prev, [currentQuestion.id]: content }));
              }
              break;
            }

            case 'AgentThinking':
              // Agent is processing — could show a thinking indicator
              break;

            case 'Error':
            case 'Warning':
              console.warn('[Deepgram]', msg.type, msg.message || msg.description);
              if (msg.type === 'Error') {
                toast.error(`Voice Agent: ${msg.message || msg.description || 'Connection error'}`);
              }
              break;

            default:
              console.log('[Deepgram] Message:', msg.type, msg);
          }
        } catch (e) {
          // Non-JSON message — ignore
        }
      };

      ws.onerror = (error) => {
        console.error('[Deepgram] WebSocket error:', error);
        setConnectionStatus('error');
        toast.error('Voice Agent connection error. Please refresh and try again.');
      };

      ws.onclose = (event) => {
        console.log('[Deepgram] WebSocket closed:', event.code, event.reason);
        setConnectionStatus('disconnected');
        setIsSpeaking(false);
        stopMicStream();
      };
    } catch (err: any) {
      console.error("[Deepgram] Settings fetch failed:", err);
      toast.error(err.message || 'Failed to initialize voice agent configurations.');
      setConnectionStatus('error');
    }
  }, [examData, currentRound?.id, playAudioChunk, startMicStream, stopMicStream, currentQuestion?.id]);

  // ─── 5. Cleanup on unmount ───
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      stopMicStream();
      if (playbackContextRef.current && playbackContextRef.current.state !== 'closed') {
        playbackContextRef.current.close();
      }
    };
  }, [stopMicStream]);

  // ─── 6. Handle Start Round ───
  const handleStartRound = () => {
    setIsStarted(true);
    connectToDeepgram();
  };

  // ─── 7. Toggle mic mute/unmute ───
  const handleToggleMic = () => {
    if (micStreamRef.current) {
      const audioTrack = micStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsListening(audioTrack.enabled);
        if (!audioTrack.enabled) {
          setMicVolume(0);
        }
      }
    }
  };

  // ─── 8. Inject text message for keyboard mode ───
  const handleKeyboardSubmit = () => {
    const text = answers[currentQuestion.id];
    if (!text?.trim()) {
      toast.error("Please type your answer before submitting.");
      return;
    }

    // Inject user message into the Deepgram conversation
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: "InjectAgentMessage",
        message: "" // Clear any pending agent speech
      }));
      wsRef.current.send(JSON.stringify({
        type: "InjectUserMessage",
        message: text.trim()
      }));
      setUserTranscript(text.trim());
      setConversationLog(prev => [...prev, { role: 'user', text: text.trim() }]);
      toast.success("Answer submitted to AI interviewer.");
    } else {
      // Fallback: just save locally
      handleSubmitAnswer(currentQuestion.id);
    }
  };

  // ─── 9. Submit full conversation transcript as the answer ───
  const handleSubmitConversation = () => {
    if (conversationLog.length === 0) {
      toast.error("No conversation recorded yet. Please speak to the AI interviewer.");
      return;
    }

    // Build a structured transcript from the conversation
    const fullTranscript = conversationLog
      .map(entry => `${entry.role === 'agent' ? 'Interviewer' : 'Candidate'}: ${entry.text}`)
      .join('\n');

    setAnswers(prev => ({ ...prev, [currentQuestion.id]: fullTranscript }));
    
    // Pass the transcript directly to avoid state batching race conditions!
    handleSubmitAnswer(currentQuestion.id, fullTranscript);
  };

  // ─── RENDER ───
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
          <div className={cn(
            "w-2.5 h-2.5 rounded-full",
            connectionStatus === 'connected' ? "bg-emerald-500 animate-pulse" :
            connectionStatus === 'connecting' ? "bg-amber-500 animate-pulse" :
            connectionStatus === 'error' ? "bg-red-500" :
            "bg-primary animate-pulse"
          )} />
          <span className="text-[10px] text-primary font-bold uppercase tracking-widest">
            {connectionStatus === 'connected' ? 'Sophia Live — Voice Agent Active' :
             connectionStatus === 'connecting' ? 'Connecting to Voice Agent...' :
             connectionStatus === 'error' ? 'Connection Error' :
             'Sophia Intermediary Workspace'}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 bg-secondary/40 rounded-full border border-border">
            <Shield className="w-3 h-3 text-emerald-500" />
            <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-tight">AI SURVEILLANCE LOCKED</span>
          </div>
          {isStarted && (
            <button 
              onClick={() => {
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
          )}
        </div>
      </div>

      {/* Main Content */}
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
              <div className="absolute inset-0 rounded-full bg-blue-600/20 border-2 border-blue-500/50 animate-ping opacity-60" />
              <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 shadow-[0_0_40px_rgba(37,99,235,0.6)] flex items-center justify-center border border-white/20">
                <Sparkles className="w-10 h-10 text-white animate-pulse" />
              </div>
            </div>

            <h3 className="text-2xl font-bold tracking-tight text-foreground mb-2">AI HR Agent is Ready</h3>
            <p className="text-muted-foreground text-xs font-medium max-w-sm leading-relaxed mb-8">
              You are about to start a natural, verbal Voice Interview conducted by our AI Specialist Sophia. She will speak questions and evaluate your voice responses in real-time using advanced AI.
            </p>

            <div className="p-4 bg-secondary/60 border border-border rounded-sm max-w-sm mb-8 text-left space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                <p className="text-[10px] text-muted-foreground leading-normal">Ensure your room is quiet and your camera captures your face in full frame.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                <p className="text-[10px] text-muted-foreground leading-normal">Sophia uses Deepgram Voice AI for natural speech recognition and synthesis. Speak clearly.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5" />
                <p className="text-[10px] text-muted-foreground leading-normal">The surveillance proctoring tracks eye positions, face integrity, and device fraud checks.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" />
                <p className="text-[10px] text-muted-foreground leading-normal">Powered by Google Gemini AI — the interviewer dynamically adapts questions based on your answers.</p>
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
                      scale: isSpeaking ? [0.95, 1.04, 0.95] : 1
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
                <p className="text-foreground font-bold text-sm tracking-wide">AI HR Agent — Sophia</p>
                <p className="text-muted-foreground text-[10px] uppercase font-bold mt-1 tracking-widest">
                  {connectionStatus === 'connected' ? 'Deepgram Voice Agent • Gemini AI' : 'Enterprise Interview Orchestrator'}
                </p>
              </div>

              {/* Agent's last spoken text */}
              {agentTranscript && (
                <div className="absolute bottom-6 left-6 right-6 bg-card/90 backdrop-blur-sm border border-border rounded-sm p-3 max-h-[100px] overflow-y-auto">
                  <span className="text-[8px] text-primary font-bold uppercase tracking-wider block mb-1">Sophia said:</span>
                  <p className="text-[11px] text-foreground leading-relaxed">{agentTranscript}</p>
                </div>
              )}
            </div>

            {/* Right Box: Candidate & Camera / Audio Subtitles */}
            <div className="flex-1 flex flex-col bg-secondary/10 p-8 justify-between min-h-[500px]">
              {/* Surveillance Webcam view */}
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
                    <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-blue-500 opacity-60" />
                    <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-blue-500 opacity-60" />
                    <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-blue-500 opacity-60" />
                    <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-blue-500 opacity-60" />
                    <div className="absolute top-1/2 left-4 right-4 h-[1px] bg-blue-500/20 border-t border-blue-500/10 shadow-[0_0_10px_rgba(59,130,246,0.3)] animate-pulse" />
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

              {/* Transcript panel */}
              <div className="my-6 p-5 bg-card border border-border rounded-sm flex-1 min-h-[140px] flex flex-col justify-between">
                <div>
                  <span className="text-[9px] text-primary font-bold uppercase tracking-wider block mb-2">
                    Live Interview — {currentRound.designation_display || currentRound.designation}
                  </span>
                  {agentTranscript ? (
                    <p className="text-foreground text-xs leading-relaxed font-semibold">{agentTranscript}</p>
                  ) : (
                    <p className="text-muted-foreground text-xs italic">
                      {connectionStatus === 'connected' ? 'Sophia is preparing...' : 'Waiting for connection...'}
                    </p>
                  )}
                </div>

                {!isKeyboardMode ? (
                  <div className="border-t border-border mt-4 pt-4">
                    <span className="text-[9px] text-emerald-500 font-bold uppercase tracking-wider block mb-2">Your Response (Live Transcription)</span>
                    <p className="text-muted-foreground text-xs italic leading-relaxed min-h-[40px]">
                      {userTranscript || (isListening ? "Listening, speak now..." : "Microphone is muted")}
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
                      onClick={handleToggleMic}
                      disabled={connectionStatus !== 'connected'}
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer disabled:opacity-40",
                        isListening 
                          ? "bg-red-600 text-white shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:bg-red-700" 
                          : "bg-emerald-600 text-white shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:bg-emerald-700"
                      )}
                    >
                      {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                    </button>
                    <div>
                      <p className="text-[10px] text-muted-foreground font-bold">{isListening ? "RECORDING..." : "MIC MUTED"}</p>
                      <p className="text-[8px] text-muted-foreground/60 font-medium">
                        {connectionStatus === 'connected' 
                          ? (isListening ? "Deepgram is transcribing your voice" : "Click mic to unmute")
                          : "Waiting for connection..."
                        }
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handleKeyboardSubmit}
                      disabled={connectionStatus !== 'connected'}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-[10px] uppercase tracking-wider rounded-sm disabled:opacity-40 transition-all"
                    >
                      Send to Sophia
                    </button>
                  </div>
                )}

                <button 
                  onClick={handleSubmitConversation}
                  disabled={submitting === currentQuestion.id || conversationLog.length === 0}
                  className="group px-6 py-3 bg-primary text-primary-foreground font-bold text-[10px] uppercase tracking-widest rounded-sm hover:bg-primary/90 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-40"
                >
                  {submitting === currentQuestion.id ? "Saving Transcript..." : "Save & Next Round"}
                  <CornerDownLeft size={10} className="group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
