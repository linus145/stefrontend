import React, { useState } from 'react';
import { Search, UserPlus, Star, MapPin, Briefcase, Filter, MessageSquare, Loader2, Check, X, ChevronDown, MoreHorizontal, UserX, User, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { networkService, NetworkPerson } from '@/services/network.service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { DashboardSection } from '@/components/dashboard/left-sidebar';

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

type NetworkCategory = 'FOUNDER' | 'INVESTOR' | 'MENTOR' | 'CONNECTIONS';

const TAB_MAP: Record<NetworkCategory, string> = {
  FOUNDER: 'Cofounders',
  INVESTOR: 'Investors',
  MENTOR: 'Mentors',
  CONNECTIONS: 'My Connections'
};

export function NetworkView({
  isCollapsed,
  onSectionChange
}: {
  isCollapsed: boolean,
  onSectionChange: (section: DashboardSection, userId?: string | null) => void
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
    const matchesSearch = searchQuery === '' ||
      `${person.first_name} ${person.last_name}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (person.profile?.headline?.toLowerCase() || '').includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className={cn(
      "flex-1 min-h-screen bg-background px-4 sm:px-6 lg:px-8 py-6 sm:py-10 transition-all duration-300 ease-in-out",
      isCollapsed ? "lg:ml-20" : "lg:ml-60"
    )}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col gap-4 sm:gap-6 mb-8 sm:mb-12">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-foreground tracking-tight mb-1">Network</h1>
            <p className="text-muted-foreground text-xs sm:text-sm font-medium">Connect with the top 1% of the startup ecosystem.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search individuals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-muted/40 border border-border rounded-xl py-2.5 pl-10 pr-4 text-[13px] text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all w-full sm:w-64 shadow-sm"
              />
            </div>
            <Button variant="ghost" size="icon" className="rounded-xl border border-border bg-muted/40 text-muted-foreground hover:text-foreground shadow-sm shrink-0">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Layout: Sidebar Tabs + Content */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as NetworkCategory)} className="w-full">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left Sidebar: Tab Selection */}
            <div className="lg:w-72 shrink-0">
              <div className="bg-card border border-border/40 rounded-sm overflow-hidden shadow-sm sticky top-24">
                <div className="px-5 py-4 border-b border-border/40">
                  <h2 className="text-sm font-semibold text-foreground tracking-tight">Manage my network</h2>
                </div>
                <nav className="flex flex-col py-1">
                  {(Object.keys(TAB_MAP) as NetworkCategory[]).map((tab) => {
                    const Icon = tab === 'CONNECTIONS' ? Users :
                      tab === 'FOUNDER' ? User :
                        tab === 'INVESTOR' ? Briefcase :
                          tab === 'MENTOR' ? Star : Users;
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
                        <span className={cn(
                          "text-xs tabular-nums min-w-[20px] text-right transition-opacity duration-200",
                          isActive
                            ? "text-primary/70 font-medium"
                            : "text-foreground/35 group-hover:text-foreground/50"
                        )}>
                          {tab === 'CONNECTIONS' ? (filteredPeople?.length || 0) : ''}
                        </span>
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
                <TabsContent value={activeTab} className="mt-0">
                  <div className="bg-card border border-border/50 rounded-sm overflow-hidden shadow-sm">
                    {/* Header */}
                    <div className="p-4 sm:p-6 border-b border-border/50">
                      <h2 className="text-xl font-normal text-foreground mb-4">
                        {activeTab === 'CONNECTIONS' ? `${filteredPeople?.length || 0} connections` : `${TAB_MAP[activeTab]}`}
                      </h2>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          Sort by:
                          <button className="font-medium text-foreground hover:underline flex items-center gap-1">
                            Recently added
                            <ChevronDown className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                              type="text"
                              placeholder="Search by name"
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              className="pl-10 pr-4 py-1.5 bg-card border border-border rounded-md text-sm w-full sm:w-64 focus:ring-1 focus:ring-primary outline-none"
                            />
                          </div>
                          <button className="text-sm font-bold text-[#0a66c2] hover:underline whitespace-nowrap hidden sm:block">
                            Search with filters
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Unified List */}
                    <div className="divide-y divide-border/50">
                      {filteredPeople?.map((person: NetworkPerson) => (
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
                                {activeTab === 'CONNECTIONS' ? (
                                  <p className="text-[11px] text-muted-foreground mt-1.5">
                                    Connected on {person.connection_info?.connected_at ? new Date(person.connection_info.connected_at).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'recently'}
                                  </p>
                                ) : (
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
                                )}
                              </div>

                              <div className="flex items-center gap-3">
                                {activeTab === 'CONNECTIONS' ? (
                                  <>
                                    <Button
                                      variant="outline"
                                      onClick={() => onSectionChange('messages')}
                                      className="rounded-full border-[#0a66c2] text-[#0a66c2] font-bold text-sm hover:bg-[#0a66c2]/5 h-9 px-6"
                                    >
                                      Message
                                    </Button>
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
                                ) : (
                                  <Button
                                    onClick={() => connectMutation.mutate(person.id)}
                                    disabled={connectMutation.isPending}
                                    className="rounded-full border-[#0a66c2] text-[#0a66c2] border-2 font-bold text-sm hover:bg-[#0a66c2]/5 h-9 px-8 transition-all"
                                  >
                                    {connectMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />}
                                    Connect
                                  </Button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}

                      {!isLoading && filteredPeople?.length === 0 && (
                        <div className="p-20 text-center">
                          <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
                          <h3 className="text-foreground font-semibold">No results found</h3>
                          <p className="text-muted-foreground text-sm">Try adjusting your filters or search query.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </TabsContent>
              )}
            </div>
          </div>
        </Tabs>

        {!isLoading && filteredPeople?.length === 0 && (
          <div className="text-center py-24 bg-muted/20 rounded-sm border border-dashed border-border animate-in fade-in duration-700">
            <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
            <h3 className="text-foreground font-semibold tracking-tight mb-2">No results detected</h3>
            <p className="text-muted-foreground text-sm">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>
    </div>
  );
}
