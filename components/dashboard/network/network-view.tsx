import React, { useState } from 'react';
import { 
  Search, UserPlus, Star, MapPin, Briefcase, Filter, MessageSquare, Loader2, 
  Check, X, ChevronDown, MoreHorizontal, UserX, User, Users, Calendar, 
  Building2, Newspaper, UserCheck, Bell, ChevronRight, Bookmark, Rss, ExternalLink 
} from 'lucide-react';
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

type NetworkCategory = 'CONNECTIONS' | 'SUGGESTIONS' | 'FOLLOWING' | 'GROUPS' | 'EVENTS' | 'PAGES' | 'NEWSLETTERS' | 'FOUNDER' | 'INVESTOR' | 'MENTOR' | 'INVITATIONS';

const SIDEBAR_ITEMS: { id: NetworkCategory; label: string; icon: any }[] = [
  { id: 'CONNECTIONS', label: 'Connections', icon: Users },
  { id: 'FOLLOWING', label: 'Following & followers', icon: User },
  { id: 'GROUPS', label: 'Groups', icon: Users },
  { id: 'EVENTS', label: 'Events', icon: Calendar },
  { id: 'PAGES', label: 'Pages', icon: Building2 },
  { id: 'NEWSLETTERS', label: 'Newsletters', icon: Newspaper },
];

const TAB_LABELS: Record<string, string> = {
  CONNECTIONS: 'My Connections',
  SUGGESTIONS: 'Suggestions',
  FOLLOWING: 'Following & Followers',
  GROUPS: 'Groups',
  EVENTS: 'Events',
  PAGES: 'Pages',
  NEWSLETTERS: 'Newsletters',
  FOUNDER: 'Cofounders',
  INVESTOR: 'Investors',
  MENTOR: 'Mentors',
  INVITATIONS: 'Invitations'
};

export function NetworkView({
  isCollapsed,
  onSectionChange
}: {
  isCollapsed?: boolean,
  onSectionChange: (section: DashboardSection, userId?: string | null, intent?: 'connection' | 'direct') => void
}) {
  const [activeTab, setActiveTab] = useState<NetworkCategory>('CONNECTIONS');
  const [suggestionSubTab, setSuggestionSubTab] = useState<'ALL' | 'PENDING'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();

  // Dynamic connection query & count
  const { data: myConnections } = useQuery<NetworkPerson[]>({
    queryKey: ['network', 'my-connections'],
    queryFn: () => networkService.getMyConnections(),
  });

  // Dynamic invitations query & count
  const { data: invitations } = useQuery<NetworkPerson[]>({
    queryKey: ['network', 'invitations'],
    queryFn: () => networkService.getInvitations(),
  });

  // Dynamic pending sent requests query & count
  const { data: pendingSent } = useQuery<NetworkPerson[]>({
    queryKey: ['network', 'pending-sent'],
    queryFn: () => networkService.getPendingSent(),
  });

  // Active tab people query
  const { data: people, isLoading } = useQuery<NetworkPerson[]>({
    queryKey: ['network', activeTab, suggestionSubTab],
    queryFn: () => {
      if (activeTab === 'CONNECTIONS') {
        return networkService.getMyConnections();
      }
      if (activeTab === 'INVITATIONS') {
        return networkService.getInvitations();
      }
      if (activeTab === 'SUGGESTIONS') {
        if (suggestionSubTab === 'PENDING') {
          return networkService.getPendingSent();
        }
        return networkService.getPeople('FOUNDER', true);
      }
      if (activeTab === 'FOUNDER' || activeTab === 'INVESTOR' || activeTab === 'MENTOR') {
        return networkService.getPeople(activeTab, true);
      }
      if (activeTab === 'FOLLOWING') {
        return Promise.resolve([]);
      }
      return networkService.getPeople('FOUNDER', false);
    },
  });

  const connectMutation = useMutation({
    mutationFn: (userId: string) => networkService.connect(userId),
    onSuccess: () => {
      toast.success('Connection Request Sent', {
        description: 'Once they accept, you can start messaging.'
      });
      queryClient.invalidateQueries({ queryKey: ['network'] });
      queryClient.refetchQueries({ queryKey: ['network'] });
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
      toast.info('Connection Request Cancelled', {
        description: 'The connection request has been cancelled.'
      });
      queryClient.invalidateQueries({ queryKey: ['network'] });
      queryClient.refetchQueries({ queryKey: ['network'] });
      queryClient.invalidateQueries({ queryKey: ['chat-rooms'] });
    },
    onError: (error: any) => {
      toast.error('Failed to cancel request', {
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

    if (activeTab === 'SUGGESTIONS' && suggestionSubTab === 'ALL') {
      if (person.connection_info?.status === 'ACCEPTED' || person.connection_info?.status === 'PENDING') return false;
    } else if (['FOUNDER', 'INVESTOR', 'MENTOR'].includes(activeTab)) {
      if (person.connection_info?.status === 'ACCEPTED' || person.connection_info?.status === 'PENDING') return false;
    }

    const matchesSearch = searchQuery === '' ||
      `${person.first_name} ${person.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (person.profile?.headline?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="flex-1 min-h-screen bg-background px-4 sm:px-6 lg:px-8 py-6 sm:py-10 transition-all duration-300 ease-in-out">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* Left Sidebar: Manage my network (LinkedIn Style Card with soft rectangular corners) */}
          <div className="w-full lg:w-72 shrink-0">
            <div className="bg-card border border-border/50 rounded-sm overflow-hidden shadow-sm sticky top-24">
              <div className="px-4 py-3.5 border-b border-border/40">
                <h2 className="text-sm font-bold text-foreground tracking-tight">Manage my network</h2>
              </div>
              <nav className="flex flex-col py-1">
                {SIDEBAR_ITEMS.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  let countDisplay: number | undefined = undefined;
                  if (item.id === 'CONNECTIONS') {
                    countDisplay = myConnections?.length || 0;
                  }

                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveTab(item.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 text-xs sm:text-sm font-medium transition-all duration-150 group cursor-pointer",
                        isActive
                          ? "bg-accent/80 text-foreground font-bold border-l-4 border-[#0a66c2] pl-3"
                          : "text-foreground/75 hover:bg-muted/50 hover:text-foreground border-l-4 border-transparent"
                      )}
                    >
                      <div className="flex items-center gap-3.5">
                        <Icon className={cn(
                          "w-4 h-4 transition-colors shrink-0",
                          isActive ? "text-[#0a66c2]" : "text-foreground/60 group-hover:text-foreground"
                        )} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {countDisplay !== undefined && countDisplay > 0 && (
                        <span className={cn(
                          "text-xs tabular-nums font-semibold ml-2",
                          isActive ? "text-[#0a66c2]" : "text-muted-foreground group-hover:text-foreground"
                        )}>
                          {countDisplay}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Right Side: Main Content */}
          <div className="flex-1 min-w-0">
            
            {/* Top Sub-Filter Pills (Matching Connect Button LinkedIn Blue) */}
            <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
              {[
                { id: 'CONNECTIONS', label: 'My Connections' },
                { id: 'SUGGESTIONS', label: 'Suggestions' },
                { id: 'FOUNDER', label: 'Cofounders' },
                { id: 'INVESTOR', label: 'Investors' },
                { id: 'MENTOR', label: 'Mentors' },
                { id: 'INVITATIONS', label: `Invitations (${invitations?.length || 0})` },
              ].map((pill) => {
                const isPillActive = activeTab === pill.id;
                return (
                  <button
                    key={pill.id}
                    onClick={() => {
                      setActiveTab(pill.id as NetworkCategory);
                      if (pill.id === 'SUGGESTIONS') {
                        setSuggestionSubTab('ALL');
                      }
                    }}
                    className={cn(
                      "px-3.5 py-1.5 rounded-sm text-xs font-semibold whitespace-nowrap transition-all border cursor-pointer",
                      isPillActive
                        ? "bg-[#0a66c2] text-white border-[#0a66c2] hover:bg-[#004182] shadow-xs"
                        : "bg-card border-border/80 text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>

            {/* Pending Invitations Top Banner (if any) */}
            {invitations && invitations.length > 0 && activeTab !== 'INVITATIONS' && (
              <div className="bg-card border border-border rounded-sm p-4 mb-5 shadow-xs flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-foreground">
                    Pending Invitations ({invitations.length})
                  </h3>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    {invitations[0].first_name} {invitations[0].last_name} sent you a connection request.
                  </p>
                </div>
                <Button
                  onClick={() => setActiveTab('INVITATIONS')}
                  variant="outline"
                  className="rounded-sm text-xs font-bold border-[#0a66c2] text-[#0a66c2] hover:bg-[#0a66c2]/10 h-8 cursor-pointer"
                >
                  Manage
                </Button>
              </div>
            )}

            {/* Content Views */}
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-24 gap-6 bg-card border border-border/50 rounded-sm shadow-sm">
                <div className="relative">
                  <div className="w-12 h-12 border-2 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
                  <div className="absolute inset-0 bg-sky-500/5 blur-2xl rounded-full" />
                </div>
                <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.3em] animate-pulse">Syncing ecosystem...</p>
              </div>
            ) : activeTab === 'FOLLOWING' ? (
              <div className="p-16 text-center bg-card border border-border rounded-sm">
                <UserCheck className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <h3 className="text-base font-bold text-foreground mb-1">No followers or following yet</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-5">
                  Accounts you follow or people following you in the ecosystem will be displayed here.
                </p>
                <Button onClick={() => setActiveTab('SUGGESTIONS')} className="rounded-sm bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-bold px-6 cursor-pointer">
                  Discover Suggestions
                </Button>
              </div>
            ) : activeTab === 'GROUPS' ? (
              <div className="p-16 text-center bg-card border border-border rounded-sm">
                <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <h3 className="text-base font-bold text-foreground mb-1">No groups joined yet</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-5">
                  Join groups to connect with peers, participate in discussions, and share industry insights.
                </p>
                <Button onClick={() => setActiveTab('SUGGESTIONS')} className="rounded-sm bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-bold px-6 cursor-pointer">
                  Discover Suggestions
                </Button>
              </div>
            ) : activeTab === 'EVENTS' ? (
              <div className="p-16 text-center bg-card border border-border rounded-sm">
                <Calendar className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <h3 className="text-base font-bold text-foreground mb-1">No upcoming events</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-5">
                  Stay tuned for upcoming webinars, startup meetups, and ecosystem events.
                </p>
                <Button onClick={() => setActiveTab('SUGGESTIONS')} className="rounded-sm bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-bold px-6 cursor-pointer">
                  Discover Suggestions
                </Button>
              </div>
            ) : activeTab === 'PAGES' ? (
              <div className="p-16 text-center bg-card border border-border rounded-sm">
                <Building2 className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <h3 className="text-base font-bold text-foreground mb-1">No pages followed yet</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-5">
                  Follow company and startup pages to get the latest updates and announcements in your feed.
                </p>
                <Button onClick={() => setActiveTab('SUGGESTIONS')} className="rounded-sm bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-bold px-6 cursor-pointer">
                  Discover Suggestions
                </Button>
              </div>
            ) : activeTab === 'NEWSLETTERS' ? (
              <div className="p-16 text-center bg-card border border-border rounded-sm">
                <Newspaper className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
                <h3 className="text-base font-bold text-foreground mb-1">No newsletter subscriptions</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-5">
                  Subscribe to newsletters to receive curated industry news and tech insights.
                </p>
                <Button onClick={() => setActiveTab('SUGGESTIONS')} className="rounded-sm bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-bold px-6 cursor-pointer">
                  Discover Suggestions
                </Button>
              </div>
            ) : (
              <div>
                {/* Header */}
                <div className="mb-4">
                  {activeTab === 'SUGGESTIONS' ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h2 className="text-base font-bold text-foreground tracking-tight">
                          Suggestions
                        </h2>
                      </div>
                      {/* Nested sub-tabs inside Suggestions */}
                      <div className="flex items-center gap-2 border-b border-border pb-2">
                        <button
                          onClick={() => setSuggestionSubTab('ALL')}
                          className={cn(
                            "px-3 py-1.5 text-xs font-bold transition-all border-b-2 cursor-pointer",
                            suggestionSubTab === 'ALL'
                              ? "border-[#0a66c2] text-[#0a66c2]"
                              : "border-transparent text-muted-foreground hover:text-foreground"
                          )}
                        >
                          Discover Suggestions
                        </button>
                        <button
                          onClick={() => setSuggestionSubTab('PENDING')}
                          className={cn(
                            "px-3 py-1.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5",
                            suggestionSubTab === 'PENDING'
                              ? "border-[#0a66c2] text-[#0a66c2]"
                              : "border-transparent text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <span>Pending Requests</span>
                          {pendingSent && pendingSent.length > 0 && (
                            <Badge variant="secondary" className="rounded-sm text-[10px] px-1.5 py-0 h-4 font-bold bg-[#0a66c2]/10 text-[#0a66c2]">
                              {pendingSent.length}
                            </Badge>
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <h2 className="text-base font-bold text-foreground tracking-tight">
                        {activeTab === 'CONNECTIONS' ? `My Connections (${filteredPeople?.length || 0})` :
                          activeTab === 'INVITATIONS' ? `Invitations (${filteredPeople?.length || 0})` :
                            `${TAB_LABELS[activeTab] || activeTab} Network (${filteredPeople?.length || 0})`}
                      </h2>
                    </div>
                  )}
                </div>

                {/* ── Real API People Grid ── */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredPeople?.map((person: NetworkPerson) => {
                    const status = person.connection_info?.status;
                    const isIncoming = person.connection_info?.is_incoming;
                    const connectionId = person.connection_info?.id;
                    const isConnecting = connectMutation.isPending && connectMutation.variables === person.id;
                    const isDisconnecting = disconnectMutation.isPending && disconnectMutation.variables === person.id;
                    return (
                      <div key={person.id} className="bg-card border border-border rounded-sm flex flex-col items-center relative overflow-hidden p-3.5 pt-0 shadow-xs transition-all hover:shadow-md h-full">
                        {/* Banner background header */}
                        <div className="w-full h-14 bg-muted/70 dark:bg-[#1f2937] absolute top-0 left-0 shrink-0" />
                        
                        {/* Dismiss Button X */}
                        <button className="absolute top-1.5 right-1.5 z-20 w-5 h-5 flex items-center justify-center rounded-sm bg-black/20 hover:bg-black/45 text-white transition-all cursor-pointer">
                          <X className="w-3 h-3" />
                        </button>
                        
                        {/* Overlapping profile photo */}
                        <div className="relative mt-6 z-10 shrink-0 cursor-pointer" onClick={() => onSectionChange('Profile', person.id)}>
                          <Avatar className="w-16 h-16 border-2 border-background rounded-sm shadow-xs">
                            <AvatarImage src={person.profile?.profile_image_url} className="object-cover rounded-sm" />
                            <AvatarFallback className="text-lg font-bold bg-muted/20 rounded-sm">{person.first_name[0]}</AvatarFallback>
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
                        
                        {/* Real Action Buttons */}
                        <div className="w-full mt-auto">
                          {status === 'ACCEPTED' ? (
                            <Button
                              variant="outline"
                              onClick={() => onSectionChange('messages', person.id, 'connection')}
                              className="w-full rounded-sm border border-[#0a66c2] hover:bg-[#0a66c2]/10 text-[#0a66c2] dark:border-primary dark:text-primary dark:hover:bg-primary/10 font-bold text-xs h-8 flex items-center justify-center gap-1 transition-all cursor-pointer"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              Message
                            </Button>
                          ) : status === 'PENDING' ? (
                            isIncoming ? (
                              <div className="flex flex-col gap-1.5 w-full">
                                <Button
                                  onClick={() => respondMutation.mutate({ id: connectionId!, status: 'ACCEPTED' })}
                                  className="w-full rounded-sm bg-[#0a66c2] hover:bg-[#004182] text-white font-bold text-xs h-8 cursor-pointer"
                                >
                                  Accept
                                </Button>
                                <Button
                                  variant="outline"
                                  onClick={() => respondMutation.mutate({ id: connectionId!, status: 'REJECTED' })}
                                  className="w-full rounded-sm border border-border text-muted-foreground hover:bg-muted font-bold text-xs h-8 cursor-pointer"
                                >
                                  Ignore
                                </Button>
                              </div>
                            ) : (
                              <Button
                                variant="outline"
                                onClick={() => disconnectMutation.mutate(person.id)}
                                disabled={isDisconnecting}
                                className="w-full rounded-sm border border-red-500/40 text-red-600 hover:bg-red-500/10 dark:text-red-400 font-bold text-xs h-8 cursor-pointer flex items-center justify-center gap-1 transition-all"
                              >
                                {isDisconnecting ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <UserX className="w-3.5 h-3.5" />
                                )}
                                Cancel Request
                              </Button>
                            )
                          ) : (
                            <Button
                              onClick={() => connectMutation.mutate(person.id)}
                              disabled={isConnecting}
                              className="w-full rounded-sm bg-[#0a66c2] text-white hover:bg-[#004182] font-bold text-xs h-8 transition-all flex items-center justify-center gap-1 cursor-pointer border-none"
                            >
                              {isConnecting ? (
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
                    <div className="w-20 h-20 rounded-sm bg-muted/20 flex items-center justify-center mx-auto mb-6">
                      <Users className="w-10 h-10 text-muted-foreground opacity-30" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">
                      {activeTab === 'CONNECTIONS' ? "No connections made yet" :
                        activeTab === 'INVITATIONS' ? "No pending invitations" :
                          activeTab === 'SUGGESTIONS' && suggestionSubTab === 'PENDING' ? "No pending sent requests" :
                            "No results found"}
                    </h3>
                    <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-8">
                      {activeTab === 'CONNECTIONS' || (activeTab === 'SUGGESTIONS' && suggestionSubTab === 'PENDING')
                        ? "Start building your network by connecting with founders, investors, and mentors in the ecosystem."
                        : "Explore the community to find people you may know or want to collaborate with."}
                    </p>
                    {activeTab === 'CONNECTIONS' && (
                      <Button
                        onClick={() => {
                          setActiveTab('SUGGESTIONS');
                          setSuggestionSubTab('ALL');
                        }}
                        className="rounded-sm bg-[#0a66c2] hover:bg-[#004182] text-white font-bold px-8 cursor-pointer"
                      >
                        Discover Suggestions
                      </Button>
                    )}
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
