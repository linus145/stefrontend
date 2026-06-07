'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash2 } from 'lucide-react';

interface FloatingMessageItemProps {
  msgId: string;
  isMine: boolean;
  text: string;
  time: string;
  avatar: string;
  senderName: string;
  onDelete: () => void;
}

export function FloatingMessageItem({
  msgId,
  isMine,
  text,
  time,
  avatar,
  senderName,
  onDelete
}: FloatingMessageItemProps) {
  return (
    <div className="flex gap-2.5 items-start group/item w-full hover:bg-muted/5 py-1 px-1.5 rounded transition-colors select-text">
      <img src={avatar} className="w-8 h-8 rounded-full object-cover shrink-0 border border-border shadow-sm mt-0.5" alt="" />
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="text-[11px] font-semibold text-foreground tracking-tight">
            {senderName}
          </span>
          <span className="text-[9px] text-muted-foreground opacity-60">
            • {time}
          </span>
          {isMine && (
            <div className="opacity-0 group-hover/item:opacity-100 transition-opacity ml-auto">
              <DropdownMenu>
                <DropdownMenuTrigger className="w-5 h-5 flex items-center justify-center rounded hover:bg-muted text-muted-foreground outline-none transition-all">
                  <MoreHorizontal className="w-3 h-3" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-28 bg-card border-border rounded-md shadow-xl">
                  <DropdownMenuItem onClick={onDelete} className="flex items-center gap-1.5 py-1 px-2 rounded-md text-[10px] font-medium text-destructive cursor-pointer hover:bg-destructive/10">
                    <Trash2 className="w-3 h-3" />
                    <span>Delete</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
        <div className="text-[12px] text-foreground leading-normal font-normal whitespace-pre-wrap">
          {text}
        </div>
      </div>
    </div>
  );
}
