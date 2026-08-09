'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Video } from 'lucide-react';

interface LobbyScreenProps {
  mode: 'ai' | 'normal';
  isInterviewer: boolean;
  handleStartInterview: () => void;
}

export function LobbyScreen({ mode, isInterviewer, handleStartInterview }: LobbyScreenProps) {
  return (
    <motion.div
      key="lobby"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      className="flex-1 relative z-10 flex flex-col items-center justify-center p-12 text-center bg-background"
    >
      <div className="relative w-28 h-28 mb-8">
        <div className="absolute inset-0 rounded-full bg-blue-600/20 border-2 border-blue-500/50 animate-ping opacity-60" />
        <div className="absolute inset-2 rounded-full bg-gradient-to-tr from-card to-muted border border-border shadow-2xl flex items-center justify-center">
          {mode === 'ai' ? (
            <Sparkles className="w-10 h-10 text-blue-500 animate-pulse" />
          ) : (
            <Video className="w-10 h-10 text-emerald-500 animate-pulse" />
          )}
        </div>
      </div>

      <h3 className="text-2xl font-bold tracking-tight text-foreground mb-2">
        {mode === 'ai' ? 'AI HR Interview Agent' : 'Online In-Person Interview'}
      </h3>
      <p className="text-muted-foreground text-xs max-w-sm leading-relaxed mb-8">
        {mode === 'ai'
          ? 'Join Sophia, our AI Interview specialist, for a real-time verbal assessment. Ensure your microphone is active.'
          : 'Join the private video meeting to speak with the hiring committee. Prepare your screen and camera.'}
      </p>

      <div className="p-4 bg-card border border-border rounded-md max-w-sm mb-8 text-left space-y-3">
        <div className="flex items-start gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5" />
          <p className="text-[10px] text-muted-foreground leading-normal">Position your camera in a well-lit environment facing you.</p>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5" />
          <p className="text-[10px] text-muted-foreground leading-normal">
            {mode === 'ai'
              ? 'Sophia uses a primary high-fidelity socket or zero-latency Gemini fallback.'
              : 'The interview will be conducted live over standard webRTC audio/video.'}
          </p>
        </div>
        <div className="flex items-start gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5" />
          <p className="text-[10px] text-muted-foreground leading-normal">Identity tracking & screen validation is currently online.</p>
        </div>
      </div>

      <button
        onClick={handleStartInterview}
        className="px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-md font-bold text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] active:scale-95 cursor-pointer"
      >
        {mode === 'ai' ? 'Start AI Interview' : (isInterviewer ? 'Join as Host' : 'Join Meeting')}
      </button>
    </motion.div>
  );
}
