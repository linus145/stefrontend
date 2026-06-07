'use client';

import React from 'react';
import { ArrowLeft, Star, MoreHorizontal } from 'lucide-react';
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
    <div className="px-4 sm:px-6 py-3 border-b border-border flex items-center justify-between bg-card relative z-10 shrink-0">
      <div className="flex items-center gap-3 min-w-0">
        {/* Mobile back button */}
        <button
          onClick={handleBackToList}
          className="w-9 h-9 flex items-center justify-center rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all md:hidden shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        
        {/* Circular Avatar */}
        <div className="w-10 h-10 rounded-full overflow-hidden border border-border shadow-sm shrink-0">
          <img
            src={otherParticipant?.profile?.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=818CF8&color=fff`}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        </div>
        
        {/* User Info & Headline */}
        <div className="flex-1 min-w-0">
          <h3 className="text-[14px] font-semibold text-foreground tracking-tight truncate">
            {displayName}
          </h3>
          <p className="text-[11px] text-muted-foreground truncate leading-normal font-normal">
            {subtitle || otherParticipant?.profile?.company_name || otherParticipant?.profile?.hr_name || 'Professional'}
          </p>
        </div>
      </div>

      {/* Action Icons */}
      <div className="flex items-center gap-1 shrink-0">
        <button className="w-8 h-8 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-all cursor-pointer">
          <MoreHorizontal className="w-4.5 h-4.5" />
        </button>
        <button className="w-8 h-8 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-all cursor-pointer">
          <Star className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

