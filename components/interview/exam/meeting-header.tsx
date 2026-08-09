'use client';

import React from 'react';
import { Shield, Video } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MeetingHeaderProps {
  connectionStatus: 'disconnected' | 'connecting' | 'connected' | 'error';
  mode: 'ai' | 'normal';
  isFallbackMode: boolean;
  designationDisplay: string;
}

export function MeetingHeader({ connectionStatus, mode, isFallbackMode, designationDisplay }: MeetingHeaderProps) {
  return (
    <div className="absolute top-4 left-4 right-4 z-20 flex justify-between items-center bg-card/40 backdrop-blur-md px-4 py-2.5 rounded-md border border-border">
      <div className="flex items-center gap-2">
        <div className={cn(
          "w-2.5 h-2.5 rounded-full animate-pulse",
          connectionStatus === 'connected' ? "bg-emerald-500" :
            connectionStatus === 'connecting' ? "bg-amber-500" : "bg-red-500"
        )} />
        <span className="text-[10px] font-bold uppercase tracking-widest text-foreground">
          {mode === 'ai' ? (isFallbackMode ? 'Sophia (Fallback Gemini Mode)' : 'Sophia (AI Voice Agent)') : 'Hiring Committee Meeting'}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[9px] bg-muted text-muted-foreground font-bold px-2 py-0.5 rounded border border-border">
          {designationDisplay}
        </span>
        {mode === 'ai' ? (
          <div className="flex items-center gap-1 bg-red-950/30 border border-red-900/50 px-2 py-0.5 rounded text-[8px] text-red-400 font-bold tracking-tight">
            <Shield className="w-2.5 h-2.5" /> PROCTOR LOCKED
          </div>
        ) : (
          <div className="flex items-center gap-1 bg-emerald-950/30 border border-emerald-900/50 px-2 py-0.5 rounded text-[8px] text-emerald-400 font-bold tracking-tight">
            <Video className="w-2.5 h-2.5" /> LIVE CONNECTION
          </div>
        )}
      </div>
    </div>
  );
}
