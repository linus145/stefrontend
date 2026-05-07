'use client';

import React from 'react';
import { Loader2, Send } from 'lucide-react';
import { Message } from '@/services/chat.service';
import { format } from 'date-fns';
import { MessageItem } from './message-item';

interface ChatThreadProps {
  isSwitching: boolean;
  isLoadingHistory: boolean;
  displayMessages: Message[];
  currentUser: any;
  handleDeleteMessage: (id: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function ChatThread({
  isSwitching,
  isLoadingHistory,
  displayMessages,
  currentUser,
  handleDeleteMessage,
  messagesEndRef
}: ChatThreadProps) {
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-8 space-y-6 relative z-10">
      {isSwitching || isLoadingHistory ? (
        <div className="h-full flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground opacity-50">Loading...</p>
          </div>
        </div>
      ) : displayMessages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
          <div className="w-12 h-12 rounded-2xl bg-muted border border-border flex items-center justify-center text-muted-foreground mb-4">
            <Send className="w-6 h-6" />
          </div>
          <p className="text-sm text-muted-foreground">Start the conversation</p>
        </div>
      ) : (
        <>
          {displayMessages.map((msg: Message, idx: number) => (
            <MessageItem
              key={`${msg.id}-${idx}`}
              msgId={msg.id}
              isMine={String(msg.sender) === String(currentUser?.id) || String(msg.sender_data?.id) === String(currentUser?.id)}
              text={msg.text}
              time={format(new Date(msg.created_at), 'HH:mm')}
              avatar={msg.sender_data?.profile?.profile_image_url || `https://ui-avatars.com/api/?name=${msg.sender_data?.first_name || 'U'}&background=818CF8&color=fff`}
              onDelete={() => handleDeleteMessage(msg.id)}
            />
          ))}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
}
