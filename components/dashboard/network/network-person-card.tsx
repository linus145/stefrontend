'use client';

import React from 'react';
import { 
  X, MessageSquare, UserX, UserPlus, Check, Plus, Loader2 
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DashboardSection } from '@/components/dashboard/dashboard-header';

interface NetworkPersonCardProps {
  person: any;
  activeTab: string;
  followSubTab: string;
  isConnectPending: boolean;
  isDisconnectPending: boolean;
  isFollowPending: boolean;
  onConnect: (userId: string) => void;
  onDisconnect: (userId: string) => void;
  onRespond: (id: string, status: 'ACCEPTED' | 'REJECTED') => void;
  onToggleFollow: (userId: string) => void;
  onNavigateProfile: (section: DashboardSection, userId?: string | null, intent?: 'connection' | 'direct') => void;
}

export function NetworkPersonCard({
  person,
  activeTab,
  followSubTab,
  isConnectPending,
  isDisconnectPending,
  isFollowPending,
  onConnect,
  onDisconnect,
  onRespond,
  onToggleFollow,
  onNavigateProfile,
}: NetworkPersonCardProps) {
  const status = person.connection_info?.status;
  const isIncoming = person.connection_info?.is_incoming;
  const connectionId = person.connection_info?.id;
  const avatarUrl = person.profile_image_url || person.profile?.profile_image_url;
  const headline = person.headline || person.profile?.headline || person.role || 'Member';

  return (
    <div className="bg-card border border-border rounded-sm flex flex-col items-center relative overflow-hidden p-3.5 pt-0 shadow-xs transition-all hover:shadow-md h-full">
      {/* Banner background header */}
      <div className="w-full h-14 bg-muted/70 dark:bg-[#1f2937] absolute top-0 left-0 shrink-0" />

      {/* Dismiss Button X */}
      <button className="absolute top-1.5 right-1.5 z-20 w-5 h-5 flex items-center justify-center rounded-sm bg-black/20 hover:bg-black/45 text-white transition-all cursor-pointer">
        <X className="w-3 h-3" />
      </button>

      {/* Overlapping profile photo */}
      <div
        className="relative mt-6 z-10 shrink-0 cursor-pointer"
        onClick={() => onNavigateProfile('Profile', person.id)}
      >
        <Avatar className="w-16 h-16 border-2 border-background rounded-sm shadow-xs">
          <AvatarImage src={avatarUrl} className="object-cover rounded-sm" />
          <AvatarFallback className="text-lg font-bold bg-muted/20 rounded-sm">
            {person.first_name?.[0] || 'U'}
          </AvatarFallback>
        </Avatar>
      </div>

      {/* Contact Details */}
      <h3
        className="text-[13px] font-semibold text-foreground hover:text-primary hover:underline leading-tight line-clamp-1 w-full text-center mt-3 cursor-pointer"
        onClick={() => onNavigateProfile('Profile', person.id)}
      >
        {person.first_name} {person.last_name}
      </h3>

      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 h-8 leading-snug w-full text-center px-0.5 font-normal opacity-85 mb-5">
        {headline}
      </p>

      {/* Real Action Buttons */}
      <div className="w-full mt-auto">
        {activeTab === 'FOLLOWING' ? (
          followSubTab === 'FOLLOWING' || person.is_following ? (
            <Button
              variant="outline"
              onClick={() => onToggleFollow(person.id)}
              disabled={isFollowPending}
              className="w-full rounded-sm border border-border text-foreground hover:border-red-400 hover:text-red-500 hover:bg-muted/80 font-bold text-xs h-8 flex items-center justify-center gap-1 transition-all cursor-pointer"
            >
              {isFollowPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Following</span>
                </>
              )}
            </Button>
          ) : (
            <Button
              onClick={() => onToggleFollow(person.id)}
              disabled={isFollowPending}
              className="w-full rounded-sm bg-[#0a66c2] text-white hover:bg-[#004182] font-bold text-xs h-8 transition-all flex items-center justify-center gap-1 cursor-pointer border-none"
            >
              {isFollowPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Follow</span>
                </>
              )}
            </Button>
          )
        ) : status === 'ACCEPTED' ? (
          <Button
            variant="outline"
            onClick={() => onNavigateProfile('messages', person.id, 'connection')}
            className="w-full rounded-sm border border-[#0a66c2] hover:bg-[#0a66c2]/10 text-[#0a66c2] dark:border-primary dark:text-primary dark:hover:bg-primary/10 font-bold text-xs h-8 flex items-center justify-center gap-1 transition-all cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            Message
          </Button>
        ) : status === 'PENDING' ? (
          isIncoming ? (
            <div className="flex flex-col gap-1.5 w-full">
              <Button
                onClick={() => onRespond(connectionId!, 'ACCEPTED')}
                className="w-full rounded-sm bg-[#0a66c2] hover:bg-[#004182] text-white font-bold text-xs h-8 cursor-pointer"
              >
                Accept
              </Button>
              <Button
                variant="outline"
                onClick={() => onRespond(connectionId!, 'REJECTED')}
                className="w-full rounded-sm border border-border text-muted-foreground hover:bg-muted font-bold text-xs h-8 cursor-pointer"
              >
                Ignore
              </Button>
            </div>
          ) : (
            <Button
              variant="outline"
              onClick={() => onDisconnect(person.id)}
              disabled={isDisconnectPending}
              className="w-full rounded-sm border border-red-500/40 text-red-600 hover:bg-red-500/10 dark:text-red-400 font-bold text-xs h-8 cursor-pointer flex items-center justify-center gap-1 transition-all"
            >
              {isDisconnectPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <UserX className="w-3.5 h-3.5" />
              )}
              Cancel Request
            </Button>
          )
        ) : (
          <Button
            onClick={() => onConnect(person.id)}
            disabled={isConnectPending}
            className="w-full rounded-sm bg-[#0a66c2] text-white hover:bg-[#004182] font-bold text-xs h-8 transition-all flex items-center justify-center gap-1 cursor-pointer border-none"
          >
            {isConnectPending ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <UserPlus className="w-3.5 h-3.5" />
            )}
            Connect
          </Button>
        )}
      </div>
    </div>
  );
}
