'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { toast } from 'sonner';
import { WebRTCMeeting } from './webrtc-meeting';
import { LobbyScreen } from './lobby-screen';
import { MeetingHeader } from './meeting-header';
import { SophiaTile } from './sophia-tile';
import { CandidateTile } from './candidate-tile';
import { ControlBar } from './control-bar';
import { MeetingSidebar } from './meeting-sidebar';
import { useCamera } from './use-camera';
import { useSpeech } from './use-speech';
import { useAzureVoice } from './use-azure-voice';
// import { useDeepgramVoice } from './use-deepgram-voice';
import { ExamVoiceVideoPhaseProps } from '@/types/exam-types';
import { cn } from '@/lib/utils';

export function ExamVoiceVideoPhase({
  currentRound,
  activeQuestionIndex,
  answers,
  setAnswers,
  handleSubmitAnswer,
  submitting,
  examData,
  logViolation,
  mode = 'ai',
  isInterviewer = false
}: ExamVoiceVideoPhaseProps) {
  const currentQuestion = (currentRound?.questions && currentRound.questions[activeQuestionIndex]) || {
    id: currentRound?.id || 'default_round',
    question_text: "Face-to-Face Online Interview in progress. Recruiter will ask questions live.",
    question_type: "ONLINE_INTERVIEW",
    mcq_options: null,
    candidate_answer: null,
    answered_at: null
  };

  const [isStarted, setIsStarted] = useState(false);
  const [isKeyboardMode, setIsKeyboardMode] = useState(false);
  const [isMicMuted, setIsMicMuted] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');

  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const aiAutoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const lastSavedTranscriptRef = useRef<string>('');

  const {
    isListening,
    interimTranscript,
    isTranscribingActive,
    startFallbackListening,
    stopFallbackListening,
    recognitionRef,
    normalRecognitionRef
  } = useSpeech({
    currentQuestionId: currentQuestion?.id,
    isMicMuted,
    isStarted,
    mode,
    setAnswers,
    setUserTranscript: (t) => setUserTranscript(t)
  });

  // Azure Voice Agent Hook (Active)
  const {
    isSpeaking,
    agentTranscript,
    userTranscript,
    setUserTranscript,
    connectionStatus,
    micVolume,
    conversationLog,
    isFallbackMode,
    wsRef,
    connectToDeepgram,
    stopMicMonitoring,
    handleSendFallbackAnswer
  } = useAzureVoice({
    examData,
    currentRound,
    currentQuestionId: currentQuestion?.id,
    setAnswers,
    isMicMuted,
    startFallbackListening,
    stopFallbackListening
  });

  /*
  // Deepgram Voice Hook (Commented Out)
  const {
    isSpeaking,
    agentTranscript,
    userTranscript,
    setUserTranscript,
    connectionStatus,
    micVolume,
    conversationLog,
    isFallbackMode,
    wsRef,
    connectToDeepgram,
    stopMicMonitoring,
    handleSendFallbackAnswer
  } = useDeepgramVoice({
    examData,
    currentRound,
    currentQuestionId: currentQuestion?.id,
    setAnswers,
    isMicMuted,
    startFallbackListening,
    stopFallbackListening
  });
  */

  const {
    isCameraMuted,
    videoCallbackRef,
    handleToggleCamera
  } = useCamera({
    mode,
    logViolation
  });

  const handleStartInterview = () => {
    setIsStarted(true);
    if (mode === 'ai') connectToDeepgram();
  };

  const handleToggleMic = () => {
    const nextMicState = !isMicMuted;
    setIsMicMuted(nextMicState);
    if (nextMicState) {
      if (isFallbackMode) stopFallbackListening();
    } else {
      if (isFallbackMode) startFallbackListening();
    }
  };

  const handleKeyboardSubmit = () => {
    const text = currentQuestion?.id ? (answers[currentQuestion.id] || '') : '';
    if (!text?.trim()) {
      toast.error("Please type your response before submitting.");
      return;
    }
    if (isFallbackMode) {
      handleSendFallbackAnswer(text.trim());
    } else if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "InjectAgentMessage", message: "" }));
      wsRef.current.send(JSON.stringify({ type: "InjectUserMessage", message: text.trim() }));
      setUserTranscript(text.trim());
      setAnswers(prev => ({ ...prev, [currentQuestion.id]: text.trim() }));
      toast.success("Answer sent to AI.");
    } else {
      if (currentQuestion?.id) handleSubmitAnswer(currentQuestion.id);
    }
  };

  const handleSubmitMeeting = () => {
    if (mode === 'ai') {
      if (conversationLog.length === 0) {
        toast.error("No conversation logs captured yet. Speak to Sophia first.");
        return;
      }
      const fullTranscript = conversationLog
        .map(entry => `${entry.role === 'agent' ? 'Interviewer' : 'Candidate'}: ${entry.text}`)
        .join('\n');
      if (currentQuestion?.id) {
        setAnswers(prev => ({ ...prev, [currentQuestion.id]: fullTranscript }));
        handleSubmitAnswer(currentQuestion.id, fullTranscript);
      }
    } else {
      if (currentQuestion?.id) {
        const note = answers[currentQuestion.id] || "Completed Online Interview Round.";
        handleSubmitAnswer(currentQuestion.id, note);
      }
    }
    if (wsRef.current) {
      try { wsRef.current.close(); } catch (e) { }
    }
    stopMicMonitoring();
    stopFallbackListening();
    if (typeof window !== 'undefined') {
      try { window.speechSynthesis.cancel(); } catch (e) { }
    }
    setIsStarted(false);
    toast.success("Call ended successfully.");
  };

  const autoSaveTranscript = useCallback(async (text: string) => {
    if (!currentQuestion?.id || !examData?.exam_token) return;
    setAutoSaveStatus('saving');
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
      await axios.post(`${baseUrl}/AIrounds/exam-submit/${currentQuestion.id}/`, {
        exam_token: examData.exam_token,
        answer: text,
      });
      setAutoSaveStatus('saved');
    } catch (err) {
      setAutoSaveStatus('error');
    }
  }, [currentQuestion?.id, examData?.exam_token]);

  // ── Auto-save for AI voice mode: persist conversation transcript in real time ──
  useEffect(() => {
    if (mode !== 'ai' || !isStarted || conversationLog.length === 0) return;
    if (!currentQuestion?.id || !examData?.exam_token) return;

    // Build the full transcript from conversation log
    const fullTranscript = conversationLog
      .map(entry => `${entry.role === 'agent' ? 'Interviewer' : 'Candidate'}: ${entry.text}`)
      .join('\n');

    // Don't save if nothing changed
    if (fullTranscript === lastSavedTranscriptRef.current) return;

    // Debounce: save 3 seconds after the last conversation update
    if (aiAutoSaveTimeoutRef.current) clearTimeout(aiAutoSaveTimeoutRef.current);
    aiAutoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api';
        // Use the generic endpoint for auto-save to avoid triggering expensive AI transcript
        // splitting on every save. The final End Call uses the AIInterview split endpoint.
        const submitPath = `${baseUrl}/AIrounds/exam-submit/${currentQuestion.id}/`;

        await axios.post(submitPath, {
          exam_token: examData.exam_token,
          answer: fullTranscript,
        });
        lastSavedTranscriptRef.current = fullTranscript;
        // Also update local answers state so the wrapper knows this question is answered
        setAnswers(prev => ({ ...prev, [currentQuestion.id]: fullTranscript }));
      } catch (err) {
        // Silent fail — End Call will retry the final save
        console.error('AI voice auto-save failed:', err);
      }
    }, 3000);

    return () => {
      if (aiAutoSaveTimeoutRef.current) clearTimeout(aiAutoSaveTimeoutRef.current);
    };
  }, [conversationLog, mode, isStarted, currentQuestion?.id, examData?.exam_token, setAnswers]);

  // ── Auto-save for NORMAL (online interview) mode ──
  useEffect(() => {
    if (mode !== 'normal' || !isStarted) return;
    const currentText = answers[currentQuestion.id];
    if (currentText === undefined) return;
    if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    autoSaveTimeoutRef.current = setTimeout(() => {
      autoSaveTranscript(currentText);
    }, 2000);
    return () => {
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
    };
  }, [answers[currentQuestion.id], mode, isStarted, currentQuestion.id, autoSaveTranscript]);

  useEffect(() => {
    return () => {
      if (wsRef.current) {
        try { wsRef.current.close(); } catch (e) { }
      }
      stopMicMonitoring();
      stopFallbackListening();
      if (normalRecognitionRef.current) {
        try { normalRecognitionRef.current.stop(); } catch (e) { }
      }
      if (autoSaveTimeoutRef.current) clearTimeout(autoSaveTimeoutRef.current);
      if (aiAutoSaveTimeoutRef.current) clearTimeout(aiAutoSaveTimeoutRef.current);
      if (typeof window !== 'undefined') window.speechSynthesis.cancel();
    };
  }, [stopMicMonitoring, stopFallbackListening, wsRef, normalRecognitionRef]);

  return (
    <div className="w-full h-full flex-1 bg-background text-foreground overflow-hidden relative flex flex-col font-sans">
      <AnimatePresence mode="wait">
        {!isStarted ? (
          <LobbyScreen
            mode={mode}
            isInterviewer={isInterviewer}
            handleStartInterview={handleStartInterview}
          />
        ) : (
          <motion.div
            key="meeting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col md:flex-row relative overflow-hidden h-full"
          >
            <div className="flex-1 flex flex-col relative bg-background p-6 h-full">
              <MeetingHeader
                connectionStatus={connectionStatus}
                mode={mode}
                isFallbackMode={isFallbackMode}
                designationDisplay={currentRound.designation_display || currentRound.designation}
              />

              {mode === 'normal' ? (
                <div className="flex-1 w-full h-full min-h-[500px] my-0 relative z-10 rounded-lg overflow-hidden bg-background flex flex-col">
                  <WebRTCMeeting
                    roomId={`STE-Interview-${examData?.session_id || examData?.exam_token || 'room'}`}
                    displayName={isInterviewer ? 'Interviewer (Host)' : (examData?.candidate_name || 'Candidate')}
                    className="w-full h-full flex-1"
                    onEndCall={handleSubmitMeeting}
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                  />
                </div>
              ) : (
                <div className={cn(
                  "flex-1 grid gap-6 items-stretch justify-center my-4 min-h-0 w-full h-full",
                  isSidebarOpen ? "grid-cols-1 xl:grid-cols-2" : "grid-cols-1 md:grid-cols-2"
                )}>
                  <SophiaTile
                    isSpeaking={isSpeaking}
                    agentTranscript={agentTranscript}
                  />
                  <CandidateTile
                    candidateName={examData?.candidate_name || 'Candidate (You)'}
                    isCameraMuted={isCameraMuted}
                    videoCallbackRef={videoCallbackRef}
                    isListening={isListening}
                    isMicMuted={isMicMuted}
                    micVolume={micVolume}
                    userTranscript={userTranscript}
                  />
                </div>
              )}

              {mode === 'ai' && (
                <ControlBar
                  isMicMuted={isMicMuted}
                  handleToggleMic={handleToggleMic}
                  isCameraMuted={isCameraMuted}
                  handleToggleCamera={handleToggleCamera}
                  isSidebarOpen={isSidebarOpen}
                  setIsSidebarOpen={setIsSidebarOpen}
                  isKeyboardMode={isKeyboardMode}
                  setIsKeyboardMode={setIsKeyboardMode}
                  handleSubmitMeeting={handleSubmitMeeting}
                  submitting={submitting}
                  currentQuestionId={currentQuestion?.id}
                />
              )}
            </div>

            {mode === 'ai' && (
              <AnimatePresence>
                <MeetingSidebar
                  isOpen={isSidebarOpen}
                  onClose={() => setIsSidebarOpen(false)}
                  conversationLog={conversationLog}
                  isKeyboardMode={isKeyboardMode}
                  currentQuestionId={currentQuestion?.id}
                  answers={answers}
                  setAnswers={setAnswers}
                  handleKeyboardSubmit={handleKeyboardSubmit}
                  isFallbackMode={isFallbackMode}
                  isListening={isListening}
                  handleSendFallbackAnswer={handleSendFallbackAnswer}
                  userTranscript={userTranscript}
                  agentTranscript={agentTranscript}
                  isSpeaking={isSpeaking}
                />
              </AnimatePresence>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
