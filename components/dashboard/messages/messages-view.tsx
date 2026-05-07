'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Loader2, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { chatService, ChatRoom, Message } from '@/services/chat.service';
import { useAuth } from '@/hooks/useAuth';
import { useDashboardTheme } from '@/context/DashboardThemeContext';
import { useChat, WsMessage } from '@/hooks/useChat';
import { EmojiClickData } from 'emoji-picker-react';
import { toast } from 'sonner';

// Import extracted components
import { RoomSidebar } from './room-sidebar';
import { ChatHeader } from './chat-header';
import { ChatThread } from './chat-thread';
import { ChatInput } from './chat-input';

export function MessagesView({
  isCollapsed,
  targetUserId,
  roomType,
  chatIntent
}: {
  isCollapsed?: boolean,
  targetUserId?: string | null,
  roomType?: 'connection' | 'direct' | 'personal',
  chatIntent?: 'connection' | 'direct' | null
}) {
  const { user: currentUser } = useAuth();
  const { isDark } = useDashboardTheme();
  const queryClient = useQueryClient();
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);

  // ─── Single source-of-truth for displayed messages ───
  const [displayMessages, setDisplayMessages] = useState<Message[]>([]);

  // ─── Fetch chat rooms (filtered by roomType) ───
  const { data: roomsData, isLoading: isLoadingRooms } = useQuery({
    queryKey: ['chat-rooms', roomType],
    queryFn: () => chatService.getRooms(roomType),
    refetchInterval: 30000, // Refresh room list every 30s for latest-message previews
  });

  const rooms: ChatRoom[] = Array.isArray(roomsData) ? roomsData : [];

  // Track whether we've already resolved a room for this targetUserId
  const initDoneRef = useRef<string | null>(null);

  // ─── Initialize chat with target user if provided ───
  // Uses chatIntent to determine which room type to prefer.
  // Only runs ONCE per unique targetUserId (guarded by initDoneRef).
  useEffect(() => {
    if (!targetUserId || isLoadingRooms) return;
    // Skip if we already resolved this targetUserId
    if (initDoneRef.current === targetUserId) return;

    // Helper: find existing room by type
    const findRoom = (type: string) => rooms.find(r =>
      r.room_type === type &&
      r.participants_data?.some(p => String(p.id) === String(targetUserId))
    );

    // If intent is known, search for that room type first
    if (chatIntent === 'direct') {
      const directRoom = findRoom('direct');
      if (directRoom) {
        initDoneRef.current = targetUserId;
        setActiveRoomId(directRoom.id);
        return;
      }
    } else if (chatIntent === 'connection') {
      const connRoom = findRoom('connection');
      if (connRoom) {
        initDoneRef.current = targetUserId;
        setActiveRoomId(connRoom.id);
        return;
      }
    }

    // Fallback: search any room with this user (prefer connection > direct)
    const anyRoom = findRoom('connection') || findRoom('direct');
    if (anyRoom) {
      initDoneRef.current = targetUserId;
      setActiveRoomId(anyRoom.id);
      return;
    }

    // No existing room found — create one based on intent
    // Mark as done BEFORE the API call to prevent duplicate calls
    initDoneRef.current = targetUserId;

    if (chatIntent === 'direct') {
      chatService.sendDirectMessage(targetUserId)
        .then(room => {
          setActiveRoomId(room.id);
          queryClient.invalidateQueries({ queryKey: ['chat-rooms', roomType] });
        })
        .catch(err => console.error('Failed to create direct chat:', err));
    } else {
      // Default: try connection first, then direct
      chatService.initialize1to1(targetUserId)
        .then(room => {
          setActiveRoomId(room.id);
          queryClient.invalidateQueries({ queryKey: ['chat-rooms', roomType] });
        })
        .catch(() => {
          chatService.sendDirectMessage(targetUserId)
            .then(room => {
              setActiveRoomId(room.id);
              queryClient.invalidateQueries({ queryKey: ['chat-rooms', roomType] });
            })
            .catch(err => console.error('Failed to initialize chat:', err));
        });
    }
  }, [targetUserId, isLoadingRooms, rooms, queryClient, roomType, chatIntent]);

  // Reset the init guard when targetUserId changes
  useEffect(() => {
    initDoneRef.current = null;
  }, [targetUserId]);

  // ─── Fetch message history for the active room ───
  const { data: historyData, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['chat-history', activeRoomId],
    queryFn: () => activeRoomId ? chatService.getMessageHistory(activeRoomId) : null,
    enabled: !!activeRoomId,
  });

  // When history arrives, set it as the baseline
  useEffect(() => {
    if (Array.isArray(historyData)) {
      setDisplayMessages(historyData);
    }
  }, [historyData]);

  // ─── WebSocket: handle incoming live messages ───
  const handleIncomingMessage = useCallback((wsMsg: WsMessage) => {
    // Convert WsMessage shape → Message shape for display
    const newMsg: Message = {
      id: wsMsg.id,
      room: activeRoomId || '',
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

    // Deduplicate: only add if this ID doesn't exist yet
    setDisplayMessages(prev => {
      if (prev.some(m => m.id === newMsg.id)) return prev;
      return [...prev, newMsg];
    });

    // Also refresh the room list so sidebar shows the latest message
    queryClient.invalidateQueries({ queryKey: ['chat-rooms', roomType] });
  }, [activeRoomId, queryClient, roomType]);

  const { isConnected, sendMessage } = useChat(activeRoomId, handleIncomingMessage);

  // ─── Auto-scroll to bottom ───
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages]);

  // ─── Auto-clear chat if room is no longer active (e.g. disconnected) ───
  useEffect(() => {
    if (activeRoomId && rooms.length > 0) {
      const roomExists = rooms.some(r => r.id === activeRoomId);
      if (!roomExists && !isLoadingRooms) {
        setActiveRoomId(null);
        setDisplayMessages([]);
      }
    }
  }, [rooms, activeRoomId, isLoadingRooms]);

  // ─── Derived data ───
  const activeRoom = rooms.find((r: ChatRoom) => String(r.id) === String(activeRoomId));
  const otherParticipant = activeRoom?.participants_data?.find((p: any) => String(p.id) !== String(currentUser?.id));

  // ─── Handlers ───
  const handleRoomSwitch = (id: string) => {
    if (id === activeRoomId) return;
    setIsSwitching(true);
    setDisplayMessages([]); // Clear messages immediately
    setActiveRoomId(id);
    setTimeout(() => setIsSwitching(false), 400);
  };

  const handleBackToList = () => {
    setActiveRoomId(null);
    setDisplayMessages([]);
  };

  const handleSend = () => {
    if (!messageInput.trim() || !activeRoomId) return;
    sendMessage(messageInput.trim());
    setMessageInput('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const onEmojiClick = (emojiData: EmojiClickData) => {
    setMessageInput(prev => prev + emojiData.emoji);
  };

  // Close emoji picker when clicking outside
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
      toast.success('Message terminated.');
    } catch (error) {
      toast.error('Termination failed.');
    }
  };

  // ─── Loading state ───
  if (isLoadingRooms) {
    return (
      <div className="flex-1 h-[calc(100vh-64px)] bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className={cn(
      "flex-1 h-[calc(100vh-64px)] bg-background flex transition-all duration-300 ease-in-out"
    )}>
      {/* Conversations Sidebar */}
      <RoomSidebar
        rooms={rooms}
        activeRoomId={activeRoomId}
        currentUser={currentUser}
        handleRoomSwitch={handleRoomSwitch}
      />

      {/* Main Chat Panel */}
      <div className={cn(
        "flex-1 flex flex-col bg-background relative overflow-hidden",
        activeRoomId && activeRoom ? "flex" : "hidden md:flex"
      )}>
        {activeRoomId && activeRoom ? (
          <>
            <ChatHeader
              activeRoom={activeRoom}
              otherParticipant={otherParticipant}
              isConnected={isConnected}
              handleBackToList={handleBackToList}
            />

            <ChatThread
              isSwitching={isSwitching}
              isLoadingHistory={isLoadingHistory}
              displayMessages={displayMessages}
              currentUser={currentUser}
              handleDeleteMessage={handleDeleteMessage}
              messagesEndRef={messagesEndRef}
            />

            <ChatInput
              messageInput={messageInput}
              setMessageInput={setMessageInput}
              handleKeyPress={handleKeyPress}
              handleSend={handleSend}
              showEmojiPicker={showEmojiPicker}
              setShowEmojiPicker={setShowEmojiPicker}
              onEmojiClick={onEmojiClick}
              isDark={isDark}
              emojiPickerRef={emojiPickerRef}
            />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary mb-6 shadow-sm">
              <MessageSquare className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2 tracking-tight">Your Messages</h3>
            <p className="text-sm text-muted-foreground max-w-[240px] leading-relaxed">Select a conversation from the list to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
}
