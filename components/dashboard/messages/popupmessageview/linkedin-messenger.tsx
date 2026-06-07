'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useQuery } from '@tanstack/react-query';
import { chatService, ChatRoom } from '@/services/chat.service';
import { getDisplayName } from '../utils';
import { FloatingChatBox } from './floating-chat-box';
import {
  ChevronUp,
  ChevronDown,
  MessageSquare,
  Search,
  SlidersHorizontal,
  SquarePen,
  MoreHorizontal,
  Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useDashboardTheme } from '@/context/DashboardThemeContext';

export function LinkedInMessenger() {
  const { user, isAuthenticated } = useAuth();
  const { isDark } = useDashboardTheme();

  const [isOpen, setIsOpen] = useState(false);
  const [width, setWidth] = useState(320); // standard width
  const [height, setHeight] = useState(450); // standard height
  const [isResizing, setIsResizing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'focused' | 'other'>('focused');
  const [activeRoomId, setActiveRoomId] = useState<string | null>(null);

  // Fetch personal chat rooms
  const { data: roomsData, isLoading: isLoadingRooms } = useQuery({
    queryKey: ['chat-rooms', 'personal'],
    queryFn: () => chatService.getRooms('personal'),
    enabled: isAuthenticated && !!user,
    refetchInterval: 30000,
  });

  const rooms: ChatRoom[] = Array.isArray(roomsData) ? roomsData : [];

  // Filter and sort rooms based on Tab and Search Query
  const filteredRooms = rooms.filter(room => {
    const partner = room.participants_data?.find((p: any) => String(p.id) !== String(user?.id));
    const displayName = getDisplayName(room, partner);
    return displayName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const tabRooms = filteredRooms.filter(room => {
    if (activeTab === 'focused') {
      // Focused: connections or custom group rooms
      return room.room_type !== 'direct';
    } else {
      // Other: Direct messages or marketing
      return room.room_type === 'direct';
    }
  });

  // Drag Resizing Handlers for Main Drawer
  const startResize = (e: React.MouseEvent, direction: 'top' | 'left' | 'top-left') => {
    e.preventDefault();
    e.stopPropagation();
    setIsResizing(true);

    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = width;
    const startHeight = height;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      if (direction === 'top' || direction === 'top-left') {
        const deltaY = startY - moveEvent.clientY;
        const newHeight = Math.max(300, Math.min(800, startHeight + deltaY));
        setHeight(newHeight);
      }
      if (direction === 'left' || direction === 'top-left') {
        const deltaX = startX - moveEvent.clientX;
        const newWidth = Math.max(280, Math.min(800, startWidth + deltaX));
        setWidth(newWidth);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  if (!isAuthenticated || !user) return null;

  const userAvatar = user?.profile?.profile_image_url || `https://ui-avatars.com/api/?name=${user.first_name || 'Me'}&background=0a66c2&color=fff`;

  return (
    <>
      {/* Active Room Side-By-Side Window */}
      {activeRoomId && (
        <FloatingChatBox
          roomId={activeRoomId}
          onClose={() => setActiveRoomId(null)}
          currentUser={user}
          isDark={isDark}
          rightOffset={32 + width + 16}
        />
      )}

      {/* Main Collapsible Messenger Card */}
      <div
        style={{
          width: `${width}px`,
          height: isOpen ? `${height}px` : '48px',
        }}
        className={cn(
          "fixed bottom-0 right-8 z-50 bg-background border border-border rounded-t-md shadow-[0_-4px_24px_rgba(0,0,0,0.12)] flex flex-col select-none",
          isResizing ? "select-none" : "transition-all duration-300 ease-in-out"
        )}
      >
        {/* Drag Resize Handles */}
        {isOpen && (
          <>
            {/* Top Edge */}
            <div
              onMouseDown={(e) => startResize(e, 'top')}
              className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize hover:bg-[#0a66c2]/20 z-50 transition-colors"
              title="Drag to resize height"
            />
            {/* Left Edge */}
            <div
              onMouseDown={(e) => startResize(e, 'left')}
              className="absolute top-0 bottom-0 left-0 w-1 cursor-ew-resize hover:bg-[#0a66c2]/20 z-50 transition-colors"
              title="Drag to resize width"
            />
            {/* Top-Left Corner */}
            <div
              onMouseDown={(e) => startResize(e, 'top-left')}
              className="absolute top-0 left-0 w-3 h-3 cursor-nwse-resize hover:bg-[#0a66c2]/20 z-[60] rounded-tl-md transition-colors"
              title="Drag to resize width and height"
            />
          </>
        )}

        {/* Header */}
        <div
          onClick={() => setIsOpen(!isOpen)}
          className="h-12 border-b border-border flex items-center justify-between px-3 cursor-pointer bg-card/60 rounded-t-md hover:bg-muted/30 shrink-0"
        >
          <div className="flex items-center gap-2">
            <div className="relative w-7 h-7">
              <img
                src={userAvatar}
                alt="Messaging Profile"
                className="w-7 h-7 rounded-full object-cover border border-border"
              />
              <span className="w-2 h-2 bg-emerald-500 rounded-full border border-background absolute bottom-0 right-0" />
            </div>
            <span className="text-[13px] font-semibold text-foreground tracking-tight">Messaging</span>
          </div>

          <div className="flex items-center gap-1">
            <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
              <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-all">
                <MoreHorizontal className="w-3.5 h-3.5" />
              </button>
              <button className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-all">
                <SquarePen className="w-3.5 h-3.5" />
              </button>
            </div>
            <button
              className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground transition-all"
            >
              {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Content Body */}
        {isOpen && (
          <div className="flex-1 flex flex-col min-h-0 bg-background">
            {/* Search messages */}
            <div className="p-2 border-b border-border">
              <div className="relative group">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-[#0a66c2] transition-colors" />
                <input
                  type="text"
                  placeholder="Search messages"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-muted/40 border border-border rounded-md py-1.5 pl-8 pr-8 text-xs text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-[#0a66c2]/20 focus:border-[#0a66c2]/30 outline-none transition-all"
                />
                <button className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  <SlidersHorizontal className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border text-xs shrink-0 font-medium">
              <button
                onClick={() => setActiveTab('focused')}
                className={cn(
                  "flex-1 py-2.5 text-center transition-all border-b-2",
                  activeTab === 'focused'
                    ? "text-[#0a66c2] border-[#0a66c2]"
                    : "text-muted-foreground border-transparent hover:bg-muted/30"
                )}
              >
                Focused
              </button>
              <button
                onClick={() => setActiveTab('other')}
                className={cn(
                  "flex-1 py-2.5 text-center transition-all border-b-2",
                  activeTab === 'other'
                    ? "text-[#0a66c2] border-[#0a66c2]"
                    : "text-muted-foreground border-transparent hover:bg-muted/30"
                )}
              >
                Other
              </button>
            </div>

            {/* Room list container */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-1.5 space-y-1 min-h-0">
              {isLoadingRooms ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-5 h-5 text-[#0a66c2] animate-spin" />
                </div>
              ) : tabRooms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <MessageSquare className="w-6 h-6 text-muted-foreground mb-2 opacity-20" />
                  <p className="text-[11px] text-muted-foreground font-medium max-w-[150px]">No conversations found.</p>
                </div>
              ) : (
                tabRooms.map((room) => {
                  const partner = room.participants_data?.find((p: any) => String(p.id) !== String(user?.id));
                  const displayName = getDisplayName(room, partner);
                  const isRoomActive = activeRoomId === room.id;

                  return (
                    <div
                      key={room.id}
                      onClick={() => setActiveRoomId(room.id)}
                      className={cn(
                        "flex items-center gap-2.5 p-2 rounded-lg cursor-pointer transition-all border border-transparent select-none",
                        isRoomActive
                          ? "bg-[#0a66c2]/10 border-[#0a66c2]/20"
                          : "hover:bg-muted/40"
                      )}
                    >
                      <div className="relative shrink-0">
                        <img
                          src={partner?.profile?.profile_image_url || `https://ui-avatars.com/api/?name=${displayName}&background=0a66c2&color=fff`}
                          alt={displayName}
                          className="w-9 h-9 rounded-full object-cover border border-border"
                        />
                        <span className="w-2 h-2 bg-emerald-500 rounded-full border border-background absolute bottom-0 right-0" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-0.5">
                          <h4 className={cn(
                            "text-xs font-semibold truncate leading-tight",
                            isRoomActive ? "text-[#0a66c2]" : "text-foreground"
                          )}>
                            {displayName}
                          </h4>
                          <span className="text-[9px] text-muted-foreground font-medium shrink-0 ml-1">
                            {room.latest_message ? format(new Date(room.latest_message.created_at), 'HH:mm') : ''}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate line-clamp-1 opacity-80 leading-normal">
                          {room.latest_message?.text || 'No messages yet'}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
