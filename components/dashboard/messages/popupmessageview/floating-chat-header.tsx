'use client';

import React from 'react';
import { ChevronUp, ChevronDown, X, Maximize2, Minimize2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FloatingChatHeaderProps {
  partner: any;
  displayName: string;
  isConnected: boolean;
  isMinimized: boolean;
  isExpanded: boolean;
  onToggleMinimize: () => void;
  onToggleExpand: () => void;
  onClose: () => void;
}

export function FloatingChatHeader({
  partner,
  displayName,
  isConnected,
  isMinimized,
  isExpanded,
  onToggleMinimize,
  onToggleExpand,
  onClose
}: FloatingChatHeaderProps) {
  return (
    <div
      onClick={onToggleMinimize}
      className="h-12 border-b border-border flex items-center justify-between px-3 cursor-pointer bg-card/60 rounded-t-md hover:bg-muted/30 select-none shrink-0"
    >
      <div className="flex items-center gap-2 max-w-[60%]">
        <div className="relative shrink-0">
          <img
            src={partner?.profile?.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0a66c2&color=fff`}
            alt={displayName}
            className="w-8 h-8 rounded-full object-cover border border-border"
          />
          <span className={cn(
            "w-2.5 h-2.5 rounded-full border-2 border-background absolute bottom-0 right-0",
            isConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-400"
          )} />
        </div>
        <div className="truncate">
          <h4 className="text-xs font-semibold text-foreground truncate leading-tight">{displayName}</h4>
          <p className="text-[9.5px] text-muted-foreground truncate leading-normal font-normal">
            {partner?.role ? partner.role.charAt(0).toUpperCase() + partner.role.slice(1).toLowerCase() : 'Professional'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-all"
        >
          {isMinimized ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {!isMinimized && (
            <button
              onClick={onToggleExpand}
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-all"
            >
              {isExpanded ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          )}
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
