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

interface MessageItemProps {
  msgId: string;
  isMine: boolean;
  text: string;
  time: string;
  avatar?: string;
  onDelete: () => void;
}

export function MessageItem({
  msgId,
  isMine,
  text,
  time,
  avatar,
  onDelete
}: MessageItemProps) {
  return (
    <div className={cn("flex gap-3 max-w-[90%] sm:max-w-[85%] items-end group/item", isMine ? "ml-auto flex-row-reverse" : "")}>
      {!isMine && (
        <img src={avatar} className="w-8 h-8 rounded-lg object-cover shrink-0 border border-border shadow-sm" alt="" />
      )}
      <div className={cn("flex flex-col relative", isMine ? "items-end" : "items-start")}>
        <div className={cn(
          "px-3 sm:px-4 py-2.5 sm:py-3 rounded-md text-[13px] leading-relaxed shadow-sm font-normal",
          isMine
            ? "bg-primary/10 text-foreground rounded-br-none border border-primary/20"
            : "bg-muted/50 text-foreground border border-border rounded-bl-none"
        )}>
          {text}
        </div>

        {/* Action Menu (Only for own messages) */}
        {isMine && (
          <div className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover/item:opacity-100 transition-opacity hidden sm:block">
            <DropdownMenu>
              <DropdownMenuTrigger className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted/80 text-muted-foreground outline-none transition-all">
                <MoreHorizontal className="w-4 h-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40 bg-card border-border rounded-xl shadow-xl">
                <DropdownMenuItem onClick={onDelete} className="flex items-center gap-3 py-2 px-3 rounded-lg text-xs font-medium text-destructive cursor-pointer hover:bg-destructive/10">
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete message</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        <span className="text-[10px] font-medium text-muted-foreground opacity-50 mt-1.5 px-1">{time}</span>
      </div>
    </div>
  );
}
