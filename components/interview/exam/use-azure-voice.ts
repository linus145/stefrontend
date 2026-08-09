'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { appConfig } from '@/lib/config';

const SAMPLE_RATE = 24000; // Match Azure VoiceLive 24kHz standard

interface UseAzureVoiceProps {
  examData: any;
  currentRound: any;
  currentQuestionId: string;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  isMicMuted: boolean;
  startFallbackListening: () => void;
  stopFallbackListening: () => void;
}

export function useAzureVoice({
  examData,
  currentRound,
  currentQuestionId,
  setAnswers,
  isMicMuted,
  startFallbackListening,
  stopFallbackListening
}: UseAzureVoiceProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [agentTranscript, setAgentTranscript] = useState('');
  const [userTranscript, setUserTranscript] = useState('');
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [micVolume, setMicVolume] = useState<number>(0);
  const [conversationLog, setConversationLog] = useState<Array<{ role: string, text: string }>>([]);
  const [isFallbackMode, setIsFallbackMode] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const micStreamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextPlayTimeRef = useRef(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const volumeAnimFrameRef = useRef<number>(0);
  const playbackContextRef = useRef<AudioContext | null>(null);

  const speakFallback = useCallback((text: string, onEnd?: () => void) => {
    if (typeof window === 'undefined') return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Select premium female English voice
    const voices = window.speechSynthesis.getVoices();
    const preferredVoice = voices.find(v => {
      const name = v.name.toLowerCase();
      const isEnglish = v.lang && v.lang.toLowerCase().startsWith("en-");
      return isEnglish && (
        name.includes("zira") || 
        name.includes("jenny") || 
        name.includes("aria") || 
        name.includes("samantha") || 
        name.includes("hazel") ||
        name.includes("female") ||
        name.includes("google us english")
      );
    }) || voices.find(v => v.lang && v.lang.toLowerCase().startsWith("en-")) || voices[0];
    
    if (preferredVoice) {
      utterance.voice = preferredVoice;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => {
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };
    utterance.onerror = () => {
      setIsSpeaking(false);
      if (onEnd) onEnd();
    };
    window.speechSynthesis.speak(utterance);
  }, []);

  const handleSendFallbackAnswer = async (typedText?: string) => {
    const textToSend = typedText || userTranscript;
    if (!textToSend?.trim()) {
      toast.error("Please say something or type your answer.");
      return;
    }
    stopFallbackListening();
    const updatedLog = [...conversationLog, { role: 'user', text: textToSend.trim() }];
    setConversationLog(updatedLog);
    setUserTranscript('');
    setConnectionStatus('connecting');

    try {
      const baseUrl = appConfig.serverApiBaseUrl;
      const response = await axios.post(`${baseUrl}/AIInterview/chat/`, {
        exam_token: examData?.exam_token,
        round_id: currentRound?.id,
        history: updatedLog
      });

      if (response.data.status === 'success' && response.data.data?.response) {
        const reply = response.data.data.response;
        setAgentTranscript(reply);
        setConversationLog(prev => [...prev, { role: 'agent', text: reply }]);
        setConnectionStatus('connected');
        speakFallback(reply, () => startFallbackListening());
      } else {
        throw new Error(response.data.message || "Failed to generate reply");
      }
    } catch (err) {
      console.error(err);
      toast.error("Sophia is experiencing latency. Please submit your text answer.");
      setConnectionStatus('error');
    }
  };

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
    const startTime = Math.max(ctx.currentTime, nextPlayTimeRef.current);
    source.start(startTime);
    nextPlayTimeRef.current = startTime + audioBuffer.duration;
  }, []);

  const stopMicMonitoring = useCallback(() => {
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
    setMicVolume(0);
  }, []);

  const startMicMonitoring = useCallback(async () => {
    try {
      if (typeof window !== 'undefined') (window as any).suspendProctoring = true;
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { sampleRate: SAMPLE_RATE, channelCount: 1, echoCancellation: true, noiseSuppression: true }
      });
      micStreamRef.current = stream;
      const audioContext = new AudioContext({ sampleRate: SAMPLE_RATE });
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      sourceNodeRef.current = source;
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      analyserRef.current = analyser;

      if (!isFallbackMode && wsRef.current?.readyState === WebSocket.OPEN && !isMicMuted) {
        const scriptProcessor = audioContext.createScriptProcessor(4096, 1, 1);
        scriptProcessorRef.current = scriptProcessor;
        source.connect(scriptProcessor);
        scriptProcessor.connect(audioContext.destination);
        scriptProcessor.onaudioprocess = (event) => {
          if (wsRef.current?.readyState === WebSocket.OPEN && !isMicMuted) {
            const inputData = event.inputBuffer.getChannelData(0);
            const int16Array = new Int16Array(inputData.length);
            for (let i = 0; i < inputData.length; i++) {
              const s = Math.max(-1, Math.min(1, inputData[i]));
              int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
            }
            wsRef.current.send(int16Array.buffer);
          }
        };
      }

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateVolume = () => {
        if (!analyserRef.current || isMicMuted) {
          setMicVolume(0);
          return;
        }
        analyserRef.current.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b, 0) / dataArray.length;
        setMicVolume(Math.min(100, Math.round((average / 255) * 150)));
        volumeAnimFrameRef.current = requestAnimationFrame(updateVolume);
      };
      updateVolume();
    } catch (err) {
      console.error(err);
      toast.error("Microphone access is required for the voice interview.");
    } finally {
      setTimeout(() => {
        if (typeof window !== 'undefined') (window as any).suspendProctoring = false;
      }, 1500);
    }
  }, [isFallbackMode, isMicMuted]);

  const switchToFallback = useCallback(() => {
    setIsFallbackMode(true);
    setConnectionStatus('connected');
    const candidateName = examData?.candidate_name || 'Candidate';
    const roundName = currentRound?.designation_display || currentRound?.designation;
    const greetingText = `Hello ${candidateName}! I am Sophia, your AI interviewer today. Let's begin the interview for the ${roundName}. Could you please introduce yourself and tell me a bit about your background?`;
    setAgentTranscript(greetingText);
    setConversationLog([{ role: 'agent', text: greetingText }]);
    startMicMonitoring();
    setTimeout(() => {
      speakFallback(greetingText, () => startFallbackListening());
    }, 500);
  }, [examData, currentRound, startMicMonitoring, speakFallback, startFallbackListening]);

  const connectToAzure = useCallback(async () => {
    const examToken = examData?.exam_token;
    const roundId = currentRound?.id;
    if (!examToken || !roundId) {
      switchToFallback();
      return;
    }
    setConnectionStatus('connecting');
    try {
      const wsHost = appConfig.wsBaseUrl;
      const wsProtocol = typeof window !== 'undefined' && window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${wsProtocol}//${wsHost}/ws/azure-voice/${examToken}/${roundId}/`;
      
      const ws = new WebSocket(wsUrl);
      ws.binaryType = 'arraybuffer';
      wsRef.current = ws;

      ws.onopen = () => {
      };

      ws.onmessage = (event) => {
        if (event.data instanceof ArrayBuffer) {
          playAudioChunk(event.data);
          return;
        }
        try {
          const msg = JSON.parse(event.data);
          switch (msg.type) {
            case 'SettingsApplied':
              setConnectionStatus('connected');
              startMicMonitoring();
              toast.success('Sophia is ready — voice session established.', { duration: 3000 });
              break;
            case 'AgentStartedSpeaking':
              setIsSpeaking(true);
              setAgentTranscript('');  // Reset transcript for the new speaking turn
              break;
            case 'AgentAudioDone':
              setIsSpeaking(false);
              break;
            case 'UserStartedSpeaking':
              setIsSpeaking(false);
              setUserTranscript('');  // Clear user transcript for new speaking turn
              // Interrupt current agent audio playing on client side
              if (playbackContextRef.current) {
                try {
                  playbackContextRef.current.close();
                } catch (e) {}
                  playbackContextRef.current = null;
              }
              nextPlayTimeRef.current = 0;
              break;
            case 'UserTranscriptDelta': {
              const delta = msg.delta || '';
              setUserTranscript(prev => prev + delta);
              break;
            }
            case 'AgentTranscriptDelta':
              setAgentTranscript(prev => prev + (msg.delta || ''));
              break;
            case 'AgentTranscriptDone': {
              const content = msg.transcript || '';
              setAgentTranscript(content);
              setConversationLog(prev => {
                if (prev.length > 0 && prev[prev.length - 1].role === 'agent') {
                  const updated = [...prev];
                  const lastMsg = updated[updated.length - 1];
                  if (!lastMsg.text.includes(content)) {
                    lastMsg.text = (lastMsg.text + ' ' + content).trim();
                  }
                  return updated;
                } else {
                  return [...prev, { role: 'agent', text: content }];
                }
              });
              break;
            }
            case 'UserTranscriptDone': {
              const content = msg.transcript || '';
              if (!content.trim()) break;
              setConversationLog(prev => {
                let newText = content;
                if (prev.length > 0 && prev[prev.length - 1].role === 'user') {
                  const updated = [...prev];
                  const lastMsg = updated[updated.length - 1];
                  if (!lastMsg.text.includes(content)) {
                    lastMsg.text = (lastMsg.text + ' ' + content).trim();
                  }
                  newText = lastMsg.text;
                  setUserTranscript(newText);
                  return updated;
                } else {
                  setUserTranscript(content);
                  return [...prev, { role: 'user', text: content }];
                }
              });
              // Note: answers[currentQuestionId] is maintained by the auto-save effect
              // in exam-voice-video-phase.tsx with the full conversation transcript.
              // Do NOT overwrite it here with just the latest user speech fragment.
              break;
            }
            case 'Error':
              switchToFallback();
              break;
          }
        } catch (e) { }
      };
      
      ws.onerror = () => switchToFallback();
      ws.onclose = () => {
        setConnectionStatus('disconnected');
        setIsSpeaking(false);
        stopMicMonitoring();
      };
    } catch (err) {
      switchToFallback();
    }
  }, [examData, currentRound, currentQuestionId, setAnswers, playAudioChunk, startMicMonitoring, stopMicMonitoring, switchToFallback]);

  return {
    isSpeaking,
    setIsSpeaking,
    agentTranscript,
    setAgentTranscript,
    userTranscript,
    setUserTranscript,
    connectionStatus,
    setConnectionStatus,
    micVolume,
    setMicVolume,
    conversationLog,
    setConversationLog,
    isFallbackMode,
    setIsFallbackMode,
    wsRef,
    audioContextRef,
    playbackContextRef,
    connectToDeepgram: connectToAzure, // Keep same name for compatibility
    stopMicMonitoring,
    startMicMonitoring,
    handleSendFallbackAnswer,
    speakFallback
  };
}
