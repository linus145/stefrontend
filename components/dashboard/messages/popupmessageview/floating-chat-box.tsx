'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { chatService, ChatRoom, Message } from '@/services/chat.service';
import { getDisplayName } from '../utils';
import { useChat, WsMessage } from '@/hooks/useChat';
import { FloatingChatHeader } from './floating-chat-header';
import { FloatingChatThread } from './floating-chat-thread';
import { FloatingChatInput } from './floating-chat-input';
import { cn } from '@/lib/utils';
import { EmojiClickData } from 'emoji-picker-react';
import { toast } from 'sonner';

interface FloatingChatBoxProps {
  roomId: string;
  onClose: () => void;
  currentUser: any;
  isDark: boolean;
  rightOffset?: number;
}

export function FloatingChatBox({ roomId, onClose, currentUser, isDark, rightOffset = 380 }: FloatingChatBoxProps) {
  const queryClient = useQueryClient();
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [displayMessages, setDisplayMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // Fetch rooms to extract current active room details
  const { data: roomsData } = useQuery({
    queryKey: ['chat-rooms', 'personal'],
    queryFn: () => chatService.getRooms('personal'),
    enabled: false, // Cached data
  });

  const rooms: ChatRoom[] = Array.isArray(roomsData) ? roomsData : [];
  const activeRoom = rooms.find(r => r.id === roomId);
  const partner = activeRoom?.participants_data?.find(p => String(p.id) !== String(currentUser?.id));
  const displayName = getDisplayName(activeRoom, partner);

  // Fetch messages history
  const { data: historyData, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['chat-history', roomId],
    queryFn: () => chatService.getMessageHistory(roomId),
    enabled: !!roomId,
  });

  useEffect(() => {
    if (Array.isArray(historyData)) {
      setDisplayMessages(historyData);
    }
  }, [historyData]);

  // WebSocket Live Messages
  const handleIncomingMessage = useCallback((wsMsg: WsMessage) => {
    const newMsg: Message = {
      id: wsMsg.id,
      room: roomId,
      sender: wsMsg.sender_id,
      sender_data: {
        id: wsMsg.sender_id,
        email: wsMsg.sender_email,
        first_name: wsMsg.sender_email.split('@')[0],
        last_name: '',
        role: '',
      },
      text: wsMsg.text,
      is_read: false,
      created_at: wsMsg.created_at,
    };

    setDisplayMessages(prev => {
      if (prev.some(m => m.id === newMsg.id)) return prev;
      return [...prev, newMsg];
    });

    queryClient.invalidateQueries({ queryKey: ['chat-rooms', 'personal'] });
  }, [roomId, queryClient]);

  const { isConnected, sendMessage } = useChat(roomId, handleIncomingMessage);

  // Scroll to bottom
  useEffect(() => {
    if (!isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [displayMessages, isMinimized]);

  const handleSend = () => {
    if (!messageInput.trim()) return;
    sendMessage(messageInput.trim());
    setMessageInput('');
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setMessageInput(prev => prev + emojiData.emoji);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDeleteMessage = async (messageId: string) => {
    try {
      await chatService.deleteMessage(messageId);
      setDisplayMessages(prev => prev.filter(m => m.id !== messageId));
      toast.success('Message deleted.');
    } catch (error) {
      toast.error('Failed to delete message.');
    }
  };

  return (
    <div
      style={{
        width: isMinimized ? '340px' : isExpanded ? '450px' : '340px',
        height: isMinimized ? '48px' : isExpanded ? '580px' : '450px',
        maxHeight: 'calc(100vh - 80px)',
        right: `${rightOffset}px`
      }}
      className={cn(
        "fixed bottom-0 z-50 bg-background border border-border rounded-t-md shadow-2xl flex flex-col transition-all duration-300 ease-in-out"
      )}
    >
      <FloatingChatHeader
        partner={partner}
        displayName={displayName}
        isConnected={isConnected}
        isMinimized={isMinimized}
        isExpanded={isExpanded}
        onToggleMinimize={() => setIsMinimized(!isMinimized)}
        onToggleExpand={() => setIsExpanded(!isExpanded)}
        onClose={onClose}
      />

      {!isMinimized && (
        <>
          <FloatingChatThread
            isLoadingHistory={isLoadingHistory}
            displayMessages={displayMessages}
            currentUser={currentUser}
            onDeleteMessage={handleDeleteMessage}
            messagesEndRef={messagesEndRef}
          />

          <FloatingChatInput
            messageInput={messageInput}
            setMessageInput={setMessageInput}
            onSend={handleSend}
            showEmojiPicker={showEmojiPicker}
            setShowEmojiPicker={setShowEmojiPicker}
            onEmojiClick={onEmojiClick}
            isDark={isDark}
            emojiPickerRef={emojiPickerRef}
          />
        </>
      )}
    </div>
  );
}
