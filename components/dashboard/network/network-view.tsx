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

                  {/* ── Mobile: 2-Column Card Grid ── */}
                  <div className="grid grid-cols-2 gap-3 lg:hidden">
                    {filteredPeople?.map((person: NetworkPerson) => {
                      const status = person.connection_info?.status;
                      const isIncoming = person.connection_info?.is_incoming;
                      const connectionId = person.connection_info?.id;
                      return (
                        <div key={person.id} className="bg-card flex flex-col items-center p-4 relative group hover:bg-muted/5 transition-all duration-300 border border-border/50 rounded-sm">
                          <div className="relative mb-3">
                            <Avatar 
                              className="w-16 h-16 border-2 border-background shadow-sm cursor-pointer" 
                              onClick={() => onSectionChange('Profile', person.id)}
                            >
                              <AvatarImage src={person.profile?.profile_image_url} className="object-cover" />
                              <AvatarFallback className="text-xl font-bold bg-muted/20">{person.first_name[0]}</AvatarFallback>
                            </Avatar>
                          </div>
                          <div className="min-w-0 mb-4 text-center">
                            <h3 
                              className="text-sm font-bold text-foreground hover:text-[#0a66c2] cursor-pointer transition-colors leading-tight line-clamp-1" 
                              onClick={() => onSectionChange('Profile', person.id)}
                            >
                              {person.first_name} {person.last_name}
                            </h3>
                            <p className="text-[11px] text-muted-foreground mt-1 line-clamp-2 h-8 leading-tight">
                              {person.profile?.headline || person.role}
                            </p>
                          </div>
                          <div className="w-full mt-auto">
                            {status === 'ACCEPTED' ? (
                              <Button onClick={() => onSectionChange('messages', person.id, 'connection')} className="w-full rounded-full bg-[#0a66c2] text-white font-bold text-xs hover:bg-[#004182] h-8">Message</Button>
                            ) : status === 'PENDING' ? (
                              isIncoming ? (
                                <div className="flex flex-col gap-1.5">
                                  <Button onClick={() => respondMutation.mutate({ id: connectionId!, status: 'ACCEPTED' })} className="w-full rounded-full bg-[#0a66c2] text-white font-bold text-xs h-8">Accept</Button>
                                  <Button variant="outline" onClick={() => respondMutation.mutate({ id: connectionId!, status: 'REJECTED' })} className="w-full rounded-full border-muted-foreground text-muted-foreground font-bold text-xs h-8">Ignore</Button>
                                </div>
                              ) : (
                                <Button disabled className="w-full rounded-full border-muted border text-muted-foreground font-bold text-xs h-8 bg-transparent">Pending</Button>
                              )
                            ) : (
                              <Button onClick={() => connectMutation.mutate(person.id)} disabled={connectMutation.isPending} className="w-full rounded-full bg-[#0a66c2] text-white font-bold text-xs hover:bg-[#004182] h-8 transition-all flex items-center justify-center gap-2 group/btn">
                                {connectMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-4 h-4 transition-transform group-hover/btn:scale-110" />}
                                Connect
                              </Button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* ── Desktop: Original List Layout ── */}
                  <div className="hidden lg:block bg-card border border-border/50 rounded-sm overflow-hidden shadow-sm">
                    <div className="divide-y divide-border/50">
                      {filteredPeople?.map((person: NetworkPerson) => {
                        const status = person.connection_info?.status;
                        const isIncoming = person.connection_info?.is_incoming;
                        const connectionId = person.connection_info?.id;
                        return (
                          <div key={person.id} className="p-4 sm:p-6 flex items-start gap-4 hover:bg-muted/5 transition-colors group">
                            <div className="relative cursor-pointer" onClick={() => onSectionChange('Profile', person.id)}>
                              <Avatar className="w-16 h-16 sm:w-20 sm:h-20 border-2 border-background shadow-sm">
                                <AvatarImage src={person.profile?.profile_image_url} className="object-cover" />
                                <AvatarFallback className="text-lg">{person.first_name[0]}</AvatarFallback>
                              </Avatar>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div className="min-w-0 cursor-pointer" onClick={() => onSectionChange('Profile', person.id)}>
                                  <h3 className="text-base font-bold text-foreground hover:underline leading-tight">
                                    {person.first_name} {person.last_name}
                                  </h3>
                                  <p className="text-[13px] text-foreground/90 mt-1 line-clamp-2 leading-snug">
                                    {person.profile?.headline || person.role}
                                  </p>
                                  <div className="flex items-center gap-2 mt-2">
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-muted/50 px-2 py-0.5 rounded">
                                      <MapPin className="w-2.5 h-2.5 text-sky-500 opacity-60" />
                                      {person.profile?.location?.split(',')[0] || 'Remote'}
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase tracking-wider bg-muted/50 px-2 py-0.5 rounded">
                                      <Briefcase className="w-2.5 h-2.5 text-sky-500 opacity-60" />
                                      {(person.profile?.expertise?.[0] || 'Member')}
                                    </div>
                                  </div>
                                </div>
                                <div className="flex items-center gap-3">
                                  {status === 'ACCEPTED' ? (
                                    <>
                                      <Button variant="default" onClick={() => onSectionChange('messages', person.id, 'connection')} className="rounded-full bg-[#0a66c2] text-white font-bold text-sm hover:bg-[#004182] h-9 px-6">Message</Button>
                                      <DropdownMenu>
                                        <DropdownMenuTrigger className="flex items-center justify-center size-9 text-muted-foreground rounded-full hover:bg-muted transition-colors outline-none">
                                          <MoreHorizontal className="w-5 h-5" />
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="rounded-lg shadow-xl border-border/50">
                                          <DropdownMenuItem onClick={() => onSectionChange('Profile', person.id)} className="gap-2 cursor-pointer py-2">
                                            <User className="w-4 h-4 text-muted-foreground" /> View Profile
                                          </DropdownMenuItem>
                                          <DropdownMenuItem onClick={() => disconnectMutation.mutate(person.id)} className="gap-2 cursor-pointer py-2 text-destructive">
                                            <UserX className="w-4 h-4" /> Remove Connection
                                          </DropdownMenuItem>
                                        </DropdownMenuContent>
                                      </DropdownMenu>
                                    </>
                                  ) : status === 'PENDING' ? (
                                    isIncoming ? (
                                      <div className="flex items-center gap-2">
                                        <Button onClick={() => respondMutation.mutate({ id: connectionId!, status: 'ACCEPTED' })} className="rounded-full bg-[#0a66c2] text-white font-bold text-sm h-9 px-6">Accept</Button>
                                        <Button variant="outline" onClick={() => respondMutation.mutate({ id: connectionId!, status: 'REJECTED' })} className="rounded-full border-muted-foreground text-muted-foreground font-bold text-sm h-9 px-6">Ignore</Button>
                                      </div>
                                    ) : (
                                      <Button disabled className="rounded-full border-muted border text-muted-foreground font-bold text-sm h-9 px-6 bg-transparent">Pending</Button>
                                    )
                                  ) : (
                                    <Button onClick={() => connectMutation.mutate(person.id)} disabled={connectMutation.isPending} className="rounded-full bg-[#0a66c2] text-white font-bold text-sm hover:bg-[#004182] hover:shadow-lg shadow-md shadow-[#0a66c2]/20 h-9 px-8 transition-all flex items-center justify-center gap-2 group">
                                      {connectMutation.isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserPlus className="w-4 h-4 transition-transform group-hover:scale-110" />}
                                      Connect
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
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
