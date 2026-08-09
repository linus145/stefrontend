'use client';

import React from 'react';
import { VideoOff } from 'lucide-react';

interface CandidateTileProps {
  candidateName: string;
  isCameraMuted: boolean;
  videoCallbackRef: (node: HTMLVideoElement | null) => void;
  isListening: boolean;
  isMicMuted: boolean;
  micVolume: number;
  userTranscript?: string;
}

export function CandidateTile({
  candidateName,
  isCameraMuted,
  videoCallbackRef,
  isListening,
  isMicMuted,
  micVolume,
  userTranscript
}: CandidateTileProps) {
  return (
    <div className="relative w-full h-full min-h-[280px] bg-card border border-border rounded-lg overflow-hidden flex items-center justify-center shadow-lg transition-all group">
      <div className="absolute top-3 left-3 bg-accent border border-border px-2 py-1 rounded text-[10px] text-foreground font-semibold z-10">
        {candidateName}
      </div>

      {!isCameraMuted ? (
        <video
          ref={videoCallbackRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
          style={{ transform: 'scaleX(-1)' }}
        />
      ) : (
        <div className="flex flex-col items-center justify-center">
          <div className="w-24 h-24 rounded-full bg-muted border border-border flex items-center justify-center mb-4">
            <VideoOff size={32} className="text-muted-foreground" />
          </div>
          <span className="text-xs text-muted-foreground font-medium">Your camera is turned off</span>
        </div>
      )}

      {isListening && !isMicMuted && (
        <div className="absolute top-3 right-3 bg-popover border border-border px-2.5 py-1.5 rounded-md flex items-center gap-2 z-10">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden flex p-0.5">
            <div className="h-full bg-emerald-500 rounded-sm transition-all duration-100" style={{ width: `${Math.min(100, micVolume)}%` }} />
          </div>
        </div>
      )}

      {userTranscript && (
        <div className="absolute bottom-3 left-3 right-3 bg-popover border border-border p-2.5 rounded text-xs text-popover-foreground leading-normal max-h-[80px] overflow-y-auto z-10">
          <span className="text-[8px] text-emerald-500 font-bold uppercase tracking-wider block mb-0.5">You:</span>
          <p>{userTranscript}</p>
        </div>
      )}
    </div>
  );
}
