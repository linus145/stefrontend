'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Plus, Send, Paperclip, Smile, Phone, Video, Info, Loader2, MessageSquare, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { chatService, ChatRoom, Message } from '@/services/chat.service';
import { useAuth } from '@/hooks/useAuth';
import { useChat, WsMessage } from '@/hooks/useChat';
import { format } from 'date-fns';

export function MessagesView({ 
  isCollapsed,
  targetUserId 
}: { 
  isCollapsed: boolean,
  targetUserId?: string | null 
}) {
  const { user: currentUser } = useAuth();
  const queryClient = useQueryClient();
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);
  const [isSwitching, setIsSwitching] = useState(false);
  const [messageInput, setMessageInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // ─── Initialize chat with target user if provided ───
  useEffect(() => {
    if (targetUserId) {
      chatService.initialize1to1(targetUserId)
        .then(room => {
          setActiveRoomId(room.id);
          queryClient.invalidateQueries({ queryKey: ['chat-rooms'] });
        })
        .catch(err => {
          console.error("Failed to initialize chat:", err);
          toast.error("Could not open chat with this user.");
        });
    }
  }, [targetUserId, queryClient]);

  // ─── Single source-of-truth for displayed messages ───
  const [displayMessages, setDisplayMessages] = useState<Message[]>([]);

  // ─── Fetch chat rooms ───
  const { data: roomsData, isLoading: isLoadingRooms } = useQuery({
    queryKey: ['chat-rooms'],
    queryFn: () => chatService.getRooms(),
    refetchInterval: 30000, // Refresh room list every 30s for latest-message previews
  });

  const rooms: ChatRoom[] = (roomsData as any)?.results ?? (Array.isArray(roomsData) ? roomsData : []);

  // ─── Fetch message history for the active room ───
  const { data: historyData, isLoading: isLoadingHistory } = useQuery({
    queryKey: ['chat-history', activeRoomId],
    queryFn: () => activeRoomId ? chatService.getMessageHistory(activeRoomId) : null,
    enabled: !!activeRoomId,
  });

  // When history arrives, set it as the baseline
  useEffect(() => {
    const results = (historyData as any)?.results ?? (Array.isArray(historyData) ? historyData : null);
    if (results) {
      setDisplayMessages(results);
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
    queryClient.invalidateQueries({ queryKey: ['chat-rooms'] });
  }, [activeRoomId, queryClient]);

  const { isConnected, sendMessage } = useChat(activeRoomId, handleIncomingMessage);

  // ─── Auto-scroll to bottom ───
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [displayMessages]);

  // ─── Derived data ───
  const activeRoom = rooms.find((r: ChatRoom) => r.id === activeRoomId);
  const otherParticipant = activeRoom?.participants_data?.find((p: any) => p.id !== currentUser?.id);

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
      "flex-1 h-[calc(100vh-64px)] bg-background flex transition-all duration-300 ease-in-out",
      isCollapsed ? "lg:ml-20" : "lg:ml-60"
    )}>
      {/* Conversations Sidebar - hidden on mobile when a chat is active */}
      <div className={cn(
        "w-full md:w-72 border-r border-border flex flex-col pt-6 bg-sidebar/50 shrink-0",
        activeRoomId ? "hidden md:flex" : "flex"
      )}>
        <div className="px-4 sm:px-6 mb-6 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">Messages</h2>
          <button className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/20 transition-all shadow-sm">
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 sm:px-6 mb-6">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-muted/40 border border-border rounded-xl py-2 pl-9 pr-4 text-xs text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all"
            />
          </div>
        </div>

        {/* Room List */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-3 space-y-1">
          {rooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <MessageSquare className="w-8 h-8 text-muted-foreground mb-3 opacity-20" />
              <p className="text-xs text-muted-foreground max-w-[160px] font-medium leading-relaxed">No conversations yet.</p>
            </div>
          ) : (
            rooms.map((room: ChatRoom) => {
              const partner = room.participants_data?.find((p: any) => p.id !== currentUser?.id);
              return (
                <div
                  key={room.id}
                  onClick={() => handleRoomSwitch(room.id)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border border-transparent",
                    activeRoomId === room.id
                      ? "bg-primary/10 shadow-sm"
                      : "hover:bg-muted/40"
                  )}
                >
                  <div className="relative shrink-0">
                    <img
                      src={partner?.profile?.profile_image_url || `https://ui-avatars.com/api/?name=${partner?.first_name || 'U'}&background=818CF8&color=fff`}
                      alt={partner?.first_name}
                      className="w-10 h-10 rounded-xl object-cover border border-border"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <h4 className={cn(
                        "text-[13px] font-semibold truncate tracking-tight",
                        activeRoomId === room.id ? "text-primary" : "text-foreground"
                      )}>
                        {room.is_group ? room.name : `${partner?.first_name || ''} ${partner?.last_name || ''}`.trim() || 'User'}
                      </h4>
                      <span className="text-[10px] text-muted-foreground font-medium shrink-0 ml-2">
                        {room.latest_message ? format(new Date(room.latest_message.created_at), 'HH:mm') : ''}
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate line-clamp-1 font-normal opacity-80">
                      {room.latest_message?.text || 'No messages yet'}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Panel */}
      <div className={cn(
        "flex-1 flex flex-col bg-background relative overflow-hidden",
        activeRoomId ? "flex" : "hidden md:flex"
      )}>
        {activeRoomId ? (
          <>
            {/* Chat Header */}
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
                    src={otherParticipant?.profile?.profile_image_url || `https://ui-avatars.com/api/?name=${otherParticipant?.first_name || 'U'}&background=818CF8&color=fff`}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground tracking-tight">
                    {activeRoom?.is_group ? activeRoom.name : `${otherParticipant?.first_name || ''} ${otherParticipant?.last_name || ''}`.trim() || 'User'}
                  </h3>
                  <div className="flex items-center gap-1.5">
                    <span className={cn(
                      "w-1.5 h-1.5 rounded-full",
                      isConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-400"
                    )} />
                    <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                      {isConnected ? 'Online' : 'Reconnecting...'}
                    </p>
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

            {/* Messages Thread */}
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
                      isMine={msg.sender === currentUser?.id || msg.sender_data?.id === currentUser?.id}
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

            {/* Chat Input */}
            <div className="p-3 sm:p-6 bg-gradient-to-t from-background via-background to-transparent relative z-10">
              <div className="max-w-4xl mx-auto flex items-end gap-2 bg-muted/40 border border-border rounded-2xl p-2 sm:p-3 shadow-lg backdrop-blur-xl group-focus-within:border-primary/30 transition-all">
                <button className="p-2 text-muted-foreground hover:text-primary transition-colors hidden sm:block">
                  <Paperclip className="w-5 h-5 opacity-60" />
                </button>
                <textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={handleKeyPress}
                  placeholder="Type a message..."
                  className="flex-1 bg-transparent border-none outline-none py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none max-h-32 font-normal"
                  rows={1}
                />
                <button className="p-2 text-muted-foreground hover:text-primary transition-colors hidden sm:block">
                  <Smile className="w-5 h-5 opacity-60" />
                </button>
                <button
                  onClick={handleSend}
                  disabled={!messageInput.trim()}
                  className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-sm hover:opacity-90 active:scale-95 transition-all disabled:opacity-30 shrink-0"
                >
                  <Send className="w-4.5 h-4.5" />
                </button>
              </div>
            </div>
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

import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

function MessageItem({ 
  msgId,
  isMine, 
  text, 
  time, 
  avatar,
  onDelete 
}: { 
  msgId: string;
  isMine: boolean; 
  text: string; 
  time: string; 
  avatar?: string;
  onDelete: () => void;
}) {
  return (
    <div className={cn("flex gap-3 max-w-[90%] sm:max-w-[85%] items-end group/item", isMine ? "ml-auto flex-row-reverse" : "")}>
      {!isMine && (
        <img src={avatar} className="w-8 h-8 rounded-lg object-cover shrink-0 border border-border shadow-sm" alt="" />
      )}
      <div className={cn("flex flex-col relative", isMine ? "items-end" : "items-start")}>
        <div className={cn(
          "px-3 sm:px-4 py-2.5 sm:py-3 rounded-2xl text-[13px] leading-relaxed shadow-sm font-normal",
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
