'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Search, MessageSquare, MoreHorizontal, SquarePen, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import { ChatRoom } from '@/services/chat.service';
import { getDisplayName } from './utils';

interface RoomSidebarProps {
  rooms: ChatRoom[];
  activeRoomId: string | null;
  currentUser: any;
  handleRoomSwitch: (id: string) => void;
}

export function RoomSidebar({
  rooms,
  activeRoomId,
  currentUser,
  handleRoomSwitch
}: RoomSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  // Filter rooms based on the local search query
  const filteredRooms = rooms.filter(room => {
    const partner = room.participants_data?.find((p: any) => String(p.id) !== String(currentUser?.id));
    const displayName = getDisplayName(room, partner);
    return displayName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  return (
    <div className={cn(
      "w-full md:w-[320px] lg:w-[340px] border-r border-border flex flex-col bg-card shrink-0 h-full",
      activeRoomId ? "hidden md:flex" : "flex"
    )}>
      {/* LinkedIn-style Messaging Header Row */}
      <div className="px-4 py-3 border-b border-border flex items-center justify-between gap-2.5 shrink-0 bg-card">
        <span className="text-[15px] font-semibold text-foreground tracking-tight whitespace-nowrap">Messaging</span>
        
        {/* Compact Search Box */}
        <div className="flex-1 min-w-[120px] max-w-[180px] relative group">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
          <input
            type="text"
            placeholder="Search messages"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-muted/40 border border-border rounded-md py-1.5 pl-8 pr-2 text-xs text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all"
          />
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-0.5">
          <button className="w-7 h-7 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-all cursor-pointer">
            <MoreHorizontal className="w-4 h-4" />
          </button>
          <button className="w-7 h-7 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground flex items-center justify-center transition-all cursor-pointer">
            <SquarePen className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Filter Pills
      <div className="flex gap-1.5 px-4 py-2.5 border-b border-border overflow-x-auto scrollbar-none shrink-0 bg-card">
        <button className="bg-[#01754f] text-white px-2.5 py-1 rounded-full text-[11px] font-semibold flex items-center gap-0.5 shrink-0 cursor-pointer shadow-sm hover:opacity-95 transition-opacity">
          Focused
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
        {['Jobs', 'Unread', 'Connections', 'InMail', 'Starred'].map((pill) => (
          <button
            key={pill}
            className="border border-border text-muted-foreground hover:bg-muted/40 px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 cursor-pointer transition-all"
          >
            {pill}
          </button>
        ))}
      </div>
      */}

      {/* Room List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-card">
        {filteredRooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-4">
            <MessageSquare className="w-10 h-10 text-muted-foreground mb-3 opacity-20" />
            <p className="text-xs text-muted-foreground max-w-[180px] font-medium leading-relaxed">No conversations found.</p>
          </div>
        ) : (
          filteredRooms.map((room: ChatRoom) => {
            const partner = room.participants_data?.find((p: any) => String(p.id) !== String(currentUser?.id));
            const displayName = getDisplayName(room, partner);
            const isActive = activeRoomId === room.id;

            return (
              <div
                key={room.id}
                onClick={() => handleRoomSwitch(room.id)}
                className={cn(
                  "flex gap-3 px-4 py-3 cursor-pointer transition-all border-b border-border/30 select-none relative",
                  isActive
                    ? "bg-[#edf3f8] dark:bg-[#1a2636] border-l-[4px] border-[#01754f]"
                    : "hover:bg-muted/20 border-l-[4px] border-transparent"
                )}
              >
                {/* Circular Profile Image */}
                <div className="relative shrink-0">
                  <img
                    src={partner?.profile?.profile_image_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=818CF8&color=fff`}
                    alt={displayName}
                    className="w-11 h-11 rounded-full object-cover border border-border"
                  />
                  {/* Active Green Dot for Active Participant */}
                  <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full border border-background absolute bottom-0.5 right-0.5" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-0.5">
                    <h4 className={cn(
                      "text-[13px] font-semibold truncate tracking-tight",
                      isActive ? "text-[#004182] dark:text-primary" : "text-foreground"
                    )}>
                      {displayName}
                    </h4>
                    <span className="text-[10px] text-muted-foreground font-medium shrink-0 ml-2">
                      {room.latest_message ? format(new Date(room.latest_message.created_at), 'MMM d') : ''}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate line-clamp-1 font-normal opacity-85 leading-normal">
                    {room.latest_message?.text || 'No messages yet'}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

