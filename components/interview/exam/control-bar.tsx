'use client';

import React from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, MessageSquare, Keyboard } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ControlBarProps {
  isMicMuted: boolean;
  handleToggleMic: () => void;
  isCameraMuted: boolean;
  handleToggleCamera: () => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  isKeyboardMode: boolean;
  setIsKeyboardMode: (kb: boolean) => void;
  handleSubmitMeeting: () => void;
  submitting: string | null;
  currentQuestionId: string;
}

export function ControlBar({
  isMicMuted,
  handleToggleMic,
  isCameraMuted,
  handleToggleCamera,
  isSidebarOpen,
  setIsSidebarOpen,
  isKeyboardMode,
  setIsKeyboardMode,
  handleSubmitMeeting,
  submitting,
  currentQuestionId
}: ControlBarProps) {
  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-card/90 border border-border px-6 py-3 rounded-full shadow-2xl z-20">
      <button
        onClick={handleToggleMic}
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer",
          isMicMuted ? "bg-rose-600 text-white" : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
        title={isMicMuted ? "Unmute microphone" : "Mute microphone"}
      >
        {isMicMuted ? <MicOff size={16} /> : <Mic size={16} />}
      </button>

      <button
        onClick={handleToggleCamera}
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer",
          isCameraMuted ? "bg-rose-600 text-white" : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
        title={isCameraMuted ? "Turn on camera" : "Turn off camera"}
      >
        {isCameraMuted ? <VideoOff size={16} /> : <Video size={16} />}
      </button>

      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer",
          isSidebarOpen ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
        title="Toggle Chat Sidebar"
      >
        <MessageSquare size={16} />
      </button>

      <button
        onClick={() => setIsKeyboardMode(!isKeyboardMode)}
        className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer",
          isKeyboardMode ? "bg-blue-600 text-white" : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
        )}
        title="Type Answer / Keyboard Mode"
      >
        <Keyboard size={16} />
      </button>

      <div className="w-[1px] h-6 bg-border mx-1" />

      <button
        onClick={handleSubmitMeeting}
        disabled={submitting === currentQuestionId}
        className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-40 text-white rounded-full font-bold text-[10px] uppercase tracking-wider shadow-lg flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
      >
        <PhoneOff size={12} />
        End Call
      </button>
    </div>
  );
}
