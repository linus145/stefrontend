'use client';

import React from 'react';
import { Loader2, Send } from 'lucide-react';
import { Message } from '@/services/chat.service';
import { format } from 'date-fns';
import { MessageItem } from '../message-item';

interface FloatingChatThreadProps {
  isLoadingHistory: boolean;
  displayMessages: Message[];
  currentUser: any;
  onDeleteMessage: (id: string) => void;
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
}

export function FloatingChatThread({
  isLoadingHistory,
  displayMessages,
  currentUser,
  onDeleteMessage,
  messagesEndRef
}: FloatingChatThreadProps) {
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-3.5 space-y-3 min-h-0">
      {isLoadingHistory ? (
        <div className="h-full flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-[#0a66c2] animate-spin" />
        </div>
      ) : displayMessages.length === 0 ? (
        <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
          <Send className="w-5 h-5 text-muted-foreground mb-2" />
          <p className="text-xs text-muted-foreground">Send a message to start chatting</p>
        </div>
      ) : (
        <>
          {displayMessages.map((msg, idx) => {
            const isMine = String(msg.sender) === String(currentUser?.id) || String(msg.sender_data?.id) === String(currentUser?.id);
            const msgTime = format(new Date(msg.created_at), 'HH:mm');
            const avatar = msg.sender_data?.profile?.profile_image_url || `https://ui-avatars.com/api/?name=${msg.sender_data?.first_name || 'U'}&background=0a66c2&color=fff`;

            return (
              <MessageItem
                key={`${msg.id}-${idx}`}
                msgId={msg.id}
                isMine={isMine}
                text={msg.text}
                time={msgTime}
                avatar={avatar}
                textSize="text-[12px]"
                paddingSize="px-2.5 py-1.5"
                onDelete={() => onDeleteMessage(msg.id)}
              />
            );
          })}
          <div ref={messagesEndRef} />
        </>
      )}
    </div>
  );
}
