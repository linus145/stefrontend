import React, { useState } from 'react';
import { Search, UserPlus, Star, MapPin, Briefcase, Filter, MessageSquare, Loader2, Check, X, ChevronDown, MoreHorizontal, UserX, User, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { networkService, NetworkPerson } from '@/services/network.service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { DashboardSection } from '@/components/dashboard/dashboard-header';

import { Tabs, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NetworkCategory = 'FOUNDER' | 'INVESTOR' | 'MENTOR' | 'CONNECTIONS' | 'INVITATIONS';

const TAB_MAP: Record<NetworkCategory, string> = {
  FOUNDER: 'Cofounders',
  INVESTOR: 'Investors',
  MENTOR: 'Mentors',
  CONNECTIONS: 'My Connections',
  INVITATIONS: 'Invitations'
};

export function NetworkView({
  isCollapsed,
  onSectionChange
}: {
  isCollapsed?: boolean,
  onSectionChange: (section: DashboardSection, userId?: string | null, intent?: 'connection' | 'direct') => void
}) {
  const [activeTab, setActiveTab] = useState<NetworkCategory>('FOUNDER');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  const { data: people, isLoading } = useQuery<NetworkPerson[]>({
    queryKey: ['network', activeTab],
    queryFn: () => {
      if (activeTab === 'CONNECTIONS') {
        return networkService.getMyConnections().then(res => res);
      }
      if (activeTab === 'INVITATIONS') {
        return networkService.getInvitations().then(res => res);
      }
      // Use true to exclude existing connections in discovery tabs
      return networkService.getPeople(activeTab, true);
    },
  });

  const connectMutation = useMutation({
    mutationFn: (userId: string) => networkService.connect(userId),
    onSuccess: () => {
      toast.success('Connection Request Sent', {
        description: 'Once they accept, you can start messaging.'
      });
      queryClient.invalidateQueries({ queryKey: ['network'] });
    },
    onError: (error: any) => {
      toast.error('Failed to connect', {
        description: error.data?.error || error.message || 'Something went wrong.'
      });
    }
  });

  const disconnectMutation = useMutation({
    mutationFn: (userId: string) => networkService.disconnect(userId),
    onSuccess: () => {
      toast.info('Disconnected', {
        description: 'Connection removed successfully.'
      });
      queryClient.invalidateQueries({ queryKey: ['network'] });
      queryClient.invalidateQueries({ queryKey: ['chat-rooms'] });
    },
    onError: (error: any) => {
      toast.error('Failed to disconnect', {
        description: error.data?.error || error.message || 'Something went wrong.'
      });
    }
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, status }: { id: string, status: 'ACCEPTED' | 'REJECTED' }) =>
      networkService.respondToConnection(id, status),
    onSuccess: (_, variables) => {
      toast.success(variables.status === 'ACCEPTED' ? 'Request Accepted' : 'Request Rejected');
      queryClient.invalidateQueries({ queryKey: ['network'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: any) => {
      toast.error('Action failed', {
        description: error.data?.error || error.message || 'Something went wrong.'
      });
    }
  });

  const { user: currentUser } = useAuth();

  const filteredPeople = people?.filter((person: NetworkPerson) => {
    if (person.id === currentUser?.id) return false;

    // Fix: If we are in a discovery tab (FOUNDER, INVESTOR, MENTOR), 
    // hide anyone we are already connected to (ACCEPTED).
    // They should only show up in the CONNECTIONS tab.
    if (['FOUNDER', 'INVESTOR', 'MENTOR'].includes(activeTab)) {
      if (person.connection_info?.status === 'ACCEPTED') return false;
    }

    const matchesSearch = searchQuery === '' ||
      `${person.first_name} ${person.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (person.profile?.headline?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className={cn(
      "flex-1 min-h-screen bg-background px-4 sm:px-6 lg:px-8 py-6 sm:py-10 transition-all duration-300 ease-in-out"
    )}>
      <div className="max-w-6xl mx-auto">

        {/* Layout: Sidebar Tabs + Content */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as NetworkCategory)} className="w-full">
          {/* Mobile Tab Scroller (Attached LinkedIn Style) */}
          <div className="lg:hidden flex overflow-x-auto scrollbar-none bg-border border-x border-t border-border">
            {(Object.keys(TAB_MAP) as NetworkCategory[]).map((tab) => {
              const isActive = activeTab === tab;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-6 py-3.5 text-[13px] font-medium whitespace-nowrap transition-all flex-1 text-center border-r border-border last:border-r-0",
                    isActive
                      ? "bg-[#0a66c2] text-white"
                      : "bg-card text-muted-foreground hover:bg-muted"
                  )}
                >
                  {TAB_MAP[tab]}
                </button>
              );
            })}
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Sidebar: Tab Selection (Hidden on Mobile) */}
            <div className="hidden lg:block lg:w-72 shrink-0">
              <div className="bg-card border border-border/40 rounded-sm overflow-hidden shadow-sm sticky top-24">
                <div className="px-5 py-4 border-b border-border/40 flex items-center justify-between">
                  <h2 className="text-sm font-semibold text-foreground tracking-tight">Manage my network</h2>
                </div>
                <nav className="flex flex-col py-1">
                  {(Object.keys(TAB_MAP) as NetworkCategory[]).map((tab) => {
                    const Icon = tab === 'CONNECTIONS' ? Users :
                      tab === 'FOUNDER' ? User :
                        tab === 'INVESTOR' ? Briefcase :
                          tab === 'MENTOR' ? Star :
                            tab === 'INVITATIONS' ? UserPlus : Users;
                    const isActive = activeTab === tab;

                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={cn(
                          "w-full flex items-center justify-between px-5 py-3 text-sm transition-all duration-200 group border-l-2 cursor-pointer",
                          isActive
                            ? "bg-primary/5 text-foreground font-medium border-l-primary"
                            : "text-foreground/65 hover:bg-muted/40 hover:text-foreground border-l-transparent"
                        )}
                      >
                        <div className="flex items-center gap-3.5">
                          <Icon className={cn(
                            "w-[18px] h-[18px] transition-colors duration-200 shrink-0",
                            isActive ? "text-primary" : "text-foreground/45 group-hover:text-foreground/70"
                          )} />
                          <span className="truncate">{TAB_MAP[tab]}</span>
                        </div>
                        {isActive && (
                          <span className="text-xs tabular-nums min-w-[20px] text-right text-primary/70 font-medium">
                            {filteredPeople?.length || 0}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>

            {/* Right Side: Content List */}
            <div className="flex-1 min-w-0">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-24 gap-6 animate-in fade-in duration-500 bg-card border border-border/50 rounded-sm shadow-sm">
                  <div className="relative">
                    <div className="w-12 h-12 border-2 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
                    <div className="absolute inset-0 bg-sky-500/5 blur-2xl rounded-full" />
                  </div>
                  <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.3em] animate-pulse">Syncing ecosystem...</p>
                </div>
              ) : (
                <TabsContent value={activeTab} className="mt-0 outline-none">
                  {/* Mobile Header */}
                  <div className="mb-3 flex items-center justify-between lg:hidden">
                    <h2 className="text-sm font-semibold text-foreground tracking-tight">
                      {activeTab === 'CONNECTIONS' ? `My Connections (${filteredPeople?.length || 0})` :
                        activeTab === 'INVITATIONS' ? `Invitations (${filteredPeople?.length || 0})` :
                          `${TAB_MAP[activeTab]} Network (${filteredPeople?.length || 0})`}
                    </h2>
                  </div>

                  {/* Desktop Header */}
                  <div className="hidden lg:flex mb-4 items-center justify-between">
                    <h2 className="text-lg font-bold text-foreground tracking-tight">
                      {activeTab === 'CONNECTIONS' ? `My Connections (${filteredPeople?.length || 0})` :
                        activeTab === 'INVITATIONS' ? `Invitations (${filteredPeople?.length || 0})` :
                          `${TAB_MAP[activeTab]} Network (${filteredPeople?.length || 0})`}
                    </h2>
                  </div>

                  {/* ── LinkedIn-Style Connection Cards Grid ── */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredPeople?.map((person: NetworkPerson) => {
                      const status = person.connection_info?.status;
                      const isIncoming = person.connection_info?.is_incoming;
                      const connectionId = person.connection_info?.id;
                      return (
                        <div key={person.id} className="bg-card border border-border rounded-sm flex flex-col items-center relative overflow-hidden p-3.5 pt-0 shadow-sm transition-all hover:shadow-md h-full">
                          {/* Banner background header */}
                          <div className="w-full h-14 bg-muted/70 dark:bg-[#1f2937] absolute top-0 left-0 shrink-0" />
                          
                          {/* Dismiss Button X */}
                          <button className="absolute top-1.5 right-1.5 z-20 w-5 h-5 flex items-center justify-center rounded-full bg-black/20 hover:bg-black/45 text-white transition-all cursor-pointer">
                            <X className="w-3 h-3" />
                          </button>
                          
                          {/* Overlapping profile photo */}
                          <div className="relative mt-6 z-10 shrink-0 cursor-pointer" onClick={() => onSectionChange('Profile', person.id)}>
                            <Avatar className="w-16 h-16 border-2 border-background shadow-sm">
                              <AvatarImage src={person.profile?.profile_image_url} className="object-cover" />
                              <AvatarFallback className="text-lg font-bold bg-muted/20">{person.first_name[0]}</AvatarFallback>
                            </Avatar>
                          </div>
                          
                          {/* Contact Details */}
                          <h3 
                            className="text-[13px] font-semibold text-foreground hover:text-primary hover:underline leading-tight line-clamp-1 w-full text-center mt-3 cursor-pointer" 
                            onClick={() => onSectionChange('Profile', person.id)}
                          >
                            {person.first_name} {person.last_name}
                          </h3>
                          
                          <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 h-8 leading-snug w-full text-center px-0.5 font-normal opacity-85 mb-5">
                            {person.profile?.headline || person.role}
                          </p>
                          
                          {/* Action Button at bottom */}
                          <div className="w-full mt-auto">
                            {status === 'ACCEPTED' ? (
                              <Button
                                variant="outline"
                                onClick={() => onSectionChange('messages', person.id, 'connection')}
                                className="w-full rounded-full border border-[#0a66c2] hover:bg-[#0a66c2]/10 text-[#0a66c2] dark:border-primary dark:text-primary dark:hover:bg-primary/10 font-bold text-xs h-8 flex items-center justify-center gap-1 transition-all cursor-pointer"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                Message
                              </Button>
                            ) : status === 'PENDING' ? (
                              isIncoming ? (
                                <div className="flex flex-col gap-1.5 w-full">
                                  <Button
                                    onClick={() => respondMutation.mutate({ id: connectionId!, status: 'ACCEPTED' })}
                                    className="w-full rounded-full bg-[#0a66c2] hover:bg-[#004182] text-white font-bold text-xs h-8 cursor-pointer"
                                  >
                                    Accept
                                  </Button>
                                  <Button
                                    variant="outline"
                                    onClick={() => respondMutation.mutate({ id: connectionId!, status: 'REJECTED' })}
                                    className="w-full rounded-full border border-border text-muted-foreground hover:bg-muted font-bold text-xs h-8 cursor-pointer"
                                  >
                                    Ignore
                                  </Button>
                                </div>
                              ) : (
                                <Button
                                  disabled
                                  className="w-full rounded-full border border-border text-muted-foreground font-bold text-xs h-8 bg-transparent"
                                >
                                  Pending
                                </Button>
                              )
                            ) : (
                              <Button
                                onClick={() => connectMutation.mutate(person.id)}
                                disabled={connectMutation.isPending}
                                className="w-full rounded-full bg-[#0a66c2] text-white hover:bg-[#004182] font-bold text-xs h-8 transition-all flex items-center justify-center gap-1 cursor-pointer border-none"
                              >
                                {connectMutation.isPending ? (
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
                    })}
                  </div>

                      {!isLoading && filteredPeople?.length === 0 && (
                        <div className="p-20 text-center animate-in fade-in zoom-in-95 duration-300">
                          <div className="w-20 h-20 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-6">
                            <Users className="w-10 h-10 text-muted-foreground opacity-30" />
                          </div>
                          <h3 className="text-lg font-bold text-foreground mb-2">
                            {activeTab === 'CONNECTIONS' ? "No connections made yet" :
                              activeTab === 'INVITATIONS' ? "No pending invitations" :
                                "No results found"}
                          </h3>
                          <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-8">
                            {activeTab === 'CONNECTIONS'
                              ? "Start building your network by connecting with founders, investors, and mentors in the ecosystem."
                              : "Explore the community to find people you may know or want to collaborate with."}
                          </p>
                          {activeTab === 'CONNECTIONS' && (
                            <Button
                              onClick={() => setActiveTab('FOUNDER')}
                              className="rounded-full bg-primary text-primary-foreground font-bold px-8"
                            >
                              Discover People
                            </Button>
                          )}
                        </div>
                      )}
                  </TabsContent>
                )}
            </div>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
