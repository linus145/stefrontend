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
  textSize?: string;
  paddingSize?: string;
  onDelete: () => void;
}

export function MessageItem({
  msgId,
  isMine,
  text,
  time,
  avatar,
  textSize = "text-[12px] sm:text-xs",
  paddingSize = "px-2.5 py-1.5 sm:px-3 sm:py-2",
  onDelete
}: MessageItemProps) {
  return (
    <div className={cn("flex gap-3 max-w-[90%] sm:max-w-[85%] items-end group/item", isMine ? "ml-auto flex-row-reverse" : "")}>
      {!isMine && (
        <img src={avatar} className="w-8 h-8 rounded-full object-cover shrink-0 border border-border shadow-sm" alt="" />
      )}
      <div className={cn("flex flex-col relative", isMine ? "items-end" : "items-start")}>
        <div className={cn(
          "rounded-md leading-normal shadow-sm font-normal",
          textSize,
          paddingSize,
          isMine
            ? "bg-primary/10 text-foreground rounded-br-none border border-primary/20"
            : "bg-muted/50 text-foreground border border-border rounded-bl-none"
        )}>
          {text}
        </div>

        {/* Action Menu (For both own messages and other messages) */}
        <div className={cn(
          "absolute top-1/2 -translate-y-1/2 opacity-60 group-hover/item:opacity-100 transition-opacity flex items-center justify-center",
          isMine ? "-left-8" : "-right-8"
        )}>
          <DropdownMenu>
            <DropdownMenuTrigger className="w-6 h-6 flex items-center justify-center rounded-md hover:bg-muted text-muted-foreground hover:text-foreground outline-none transition-all cursor-pointer">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align={isMine ? "end" : "start"} className="!min-w-0 w-auto p-1 bg-card border border-border rounded-lg shadow-md">
              <DropdownMenuItem
                onClick={onDelete}
                variant="destructive"
                className="w-7 h-7 p-0 flex items-center justify-center rounded-md cursor-pointer"
                title="Delete message"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <span className="text-[10px] font-medium text-muted-foreground opacity-50 mt-1.5 px-1">{time}</span>
      </div>
    </div>
  );
}
