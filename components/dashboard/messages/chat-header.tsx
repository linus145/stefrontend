'use client';

import React from 'react';
import { ArrowLeft, Phone, Video, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatRoom } from '@/services/chat.service';
import { getDisplayName, getDisplaySubtitle } from './utils';

interface ChatHeaderProps {
  activeRoom: ChatRoom | undefined;
  otherParticipant: any;
  isConnected: boolean;
  handleBackToList: () => void;
}

export function ChatHeader({
  activeRoom,
  otherParticipant,
  isConnected,
  handleBackToList
}: ChatHeaderProps) {
  const displayName = getDisplayName(activeRoom, otherParticipant);
  const subtitle = getDisplaySubtitle(activeRoom, otherParticipant);

  return (
    <div className="px-4 sm:px-8 py-4 border-b border-border flex items-center justify-between bg-background/80 backdrop-blur-md relative z-10">
      <div className="flex items-center gap-3">
        {/* Mobile back button */}
        <button
          onClick={handleBackToList}
          className="w-9 h-9 flex items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all md:hidden"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="w-10 h-10 rounded-xl overflow-hidden border border-border shadow-sm">
          <img
            src={otherParticipant?.profile?.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=818CF8&color=fff`}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-foreground tracking-tight">
            {displayName}
          </h3>
          <div className="flex items-center gap-1.5">
            {subtitle ? (
              <p className="text-[10px] text-primary font-bold uppercase tracking-wider">
                {subtitle}
              </p>
            ) : (
              <>
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  isConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-400"
                )} />
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                  {isConnected ? 'Online' : 'Reconnecting...'}
                </p>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <button className="w-9 h-9 hidden sm:flex items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all shadow-sm">
          <Phone className="w-4 h-4" />
        </button>
        <button className="w-9 h-9 hidden sm:flex items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all shadow-sm">
          <Video className="w-4 h-4" />
        </button>
        <button className="w-9 h-9 flex items-center justify-center rounded-xl border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all shadow-sm">
          <Info className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
