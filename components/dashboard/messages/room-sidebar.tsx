'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Plus, Search, MessageSquare } from 'lucide-react';
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
  return (
    <div className={cn(
      "w-full md:w-72 border-r border-border flex flex-col pt-6 bg-sidebar/50 shrink-0",
      activeRoomId ? "hidden md:flex" : "flex"
    )}>
      <div className="pl-4 sm:pl-5 pr-4 sm:pr-6 mb-6 flex items-center justify-between">
        <h2 className="text-lg sm:text-xl font-semibold text-foreground tracking-tight">Messages</h2>
        <button className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/20 transition-all shadow-sm">
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Search */}
      <div className="pl-4 sm:pl-5 pr-4 sm:pr-6 mb-6">
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
            const partner = room.participants_data?.find((p: any) => String(p.id) !== String(currentUser?.id));
            const displayName = getDisplayName(room, partner);

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
                    src={partner?.profile?.profile_image_url || `https://ui-avatars.com/api/?name=${displayName}&background=818CF8&color=fff`}
                    alt={displayName}
                    className="w-10 h-10 rounded-xl object-cover border border-border"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h4 className={cn(
                      "text-[13px] font-semibold truncate tracking-tight",
                      activeRoomId === room.id ? "text-primary" : "text-foreground"
                    )}>
                      {displayName}
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
  );
}
