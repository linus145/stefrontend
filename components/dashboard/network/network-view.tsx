import React, { useState } from 'react';
import { Search, UserPlus, Star, MapPin, Briefcase, Filter, MessageSquare, Loader2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { networkService, NetworkPerson } from '@/services/network.service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { DashboardSection } from '@/components/dashboard/left-sidebar';

import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

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
  onSectionChange: (section: DashboardSection) => void 
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
      "flex-1 min-h-screen bg-background px-8 py-10 transition-all duration-300 ease-in-out",
      isCollapsed ? "ml-20" : "ml-60"
    )}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-semibold text-foreground tracking-tight mb-1">Network</h1>
            <p className="text-muted-foreground text-sm font-medium">Connect with the top 1% of the startup ecosystem.</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
              <input
                type="text"
                placeholder="Search individuals..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-muted/40 border border-border rounded-xl py-2.5 pl-10 pr-4 text-[13px] text-foreground placeholder:text-muted-foreground focus:ring-1 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all w-64 shadow-sm"
              />
            </div>
            <Button variant="ghost" size="icon" className="rounded-xl border border-border bg-muted/40 text-muted-foreground hover:text-foreground shadow-sm">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as NetworkCategory)} className="w-full">
          <TabsList className="bg-transparent border-b border-border rounded-none p-0 h-auto gap-8 mb-8">
            {(Object.keys(TAB_MAP) as NetworkCategory[]).map((tab) => (
              <TabsTrigger
                key={tab}
                value={tab}
                className="bg-transparent data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-sky-500 data-[state=active]:text-sky-500 rounded-none pb-4 text-xs font-bold uppercase tracking-widest transition-all relative"
              >
                {TAB_MAP[tab]}
              </TabsTrigger>
            ))}
          </TabsList>

          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-6 animate-in fade-in duration-500">
               <div className="relative">
                  <div className="w-16 h-16 border-2 border-sky-200 border-t-sky-500 rounded-full animate-spin" />
                  <div className="absolute inset-0 bg-sky-500/5 blur-2xl rounded-full" />
               </div>
               <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.3em] animate-pulse">Syncing Network...</p>
            </div>
          ) : (
            <TabsContent value={activeTab} className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredPeople?.map((person: NetworkPerson) => (
                  <Card
                    key={person.id}
                    className="bg-card border border-border/50 rounded-xl shadow-sm group hover:border-sky-500/30 hover:shadow-md transition-all duration-200 relative overflow-hidden h-fit"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-4">
                        {/* Avatar */}
                        <div className="relative shrink-0 mt-0.5">
                          <Avatar className="w-12 h-12 rounded-lg border border-border/50 bg-muted transition-transform group-hover:scale-105">
                            <AvatarImage 
                              src={person.profile?.profile_image_url || `https://ui-avatars.com/api/?name=${person.first_name}+${person.last_name}&background=e0f2fe&color=0ea5e9`} 
                              className="object-cover" 
                            />
                            <AvatarFallback className="rounded-lg text-xs">{person.first_name[0]}</AvatarFallback>
                          </Avatar>
                        </div>
                        
                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                             <div className="min-w-0">
                                <h3 className="text-[14px] font-bold text-foreground tracking-tight truncate leading-tight">
                                  {person.first_name} {person.last_name}
                                </h3>
                                <p className="text-[10px] font-bold text-sky-600 uppercase tracking-wider mt-0.5">
                                  {person.profile?.headline || person.role}
                                </p>
                             </div>
                             <button className="text-muted-foreground hover:text-sky-500 transition-colors shrink-0">
                                <Star className="w-3.5 h-3.5" />
                             </button>
                          </div>

                          <div className="flex items-center gap-2 mt-2">
                            <div className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground uppercase tracking-wider bg-muted/50 px-2 py-0.5 rounded-md">
                              <MapPin className="w-2.5 h-2.5 text-sky-500 opacity-60" />
                              {person.profile?.location?.split(',')[0] || 'Remote'}
                            </div>
                            <div className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground uppercase tracking-wider bg-muted/50 px-2 py-0.5 rounded-md">
                              <Briefcase className="w-2.5 h-2.5 text-sky-500 opacity-60" />
                              {(person.profile?.expertise?.[0] || 'Member')}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center gap-2">
                          {activeTab === 'CONNECTIONS' ? (
                            <>
                              {person.connection_info?.status === 'ACCEPTED' ? (
                                <>
                                  <Button 
                                    onClick={() => onSectionChange('messages')}
                                    className="flex-1 rounded-lg bg-sky-500 text-white font-bold text-[11px] shadow-sm hover:bg-sky-600 transition-all h-8"
                                  >
                                    <MessageSquare className="w-3.5 h-3.5 mr-2" />
                                    Message
                                  </Button>
                                  <Button 
                                    variant="ghost"
                                    onClick={() => disconnectMutation.mutate(person.id)}
                                    disabled={disconnectMutation.isPending}
                                    className="w-8 h-8 rounded-lg bg-destructive/5 text-destructive hover:bg-destructive hover:text-white transition-all border border-destructive/10"
                                  >
                                    {disconnectMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                                  </Button>
                                </>
                              ) : person.connection_info?.is_incoming ? (
                                <>
                                  <Button 
                                    onClick={() => respondMutation.mutate({ id: person.connection_info!.id, status: 'ACCEPTED' })}
                                    disabled={respondMutation.isPending}
                                    className="flex-1 rounded-lg bg-emerald-500 text-white shadow-sm hover:bg-emerald-600 font-bold text-[11px] h-8"
                                  >
                                    {respondMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3.5 h-3.5 mr-2" />}
                                    Accept
                                  </Button>
                                  <Button 
                                    variant="ghost"
                                    onClick={() => respondMutation.mutate({ id: person.connection_info!.id, status: 'REJECTED' })}
                                    disabled={respondMutation.isPending}
                                    className="w-8 h-8 rounded-lg bg-destructive/5 text-destructive hover:bg-destructive hover:text-white transition-all border border-destructive/10"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </Button>
                                </>
                              ) : (
                                <Button 
                                  disabled
                                  className="flex-1 rounded-lg bg-muted text-muted-foreground font-bold text-[11px] h-8 border border-border"
                                >
                                  <Loader2 className="w-3 h-3 animate-pulse mr-2" />
                                  Pending
                                </Button>
                              )}
                            </>
                          ) : (
                            <>
                              <Button 
                                onClick={() => connectMutation.mutate(person.id)}
                                disabled={connectMutation.isPending}
                                className="flex-1 rounded-lg bg-sky-500 text-white font-bold text-[11px] shadow-sm hover:bg-sky-600 transition-all h-8"
                              >
                                {connectMutation.isPending ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <UserPlus className="w-3.5 h-3.5 mr-2" />
                                )}
                                Connect
                              </Button>
                              <Button 
                                variant="ghost"
                                size="icon"
                                className="w-8 h-8 rounded-lg border border-border text-muted-foreground hover:text-sky-500 hover:bg-sky-50/50 transition-all"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                              </Button>
                            </>
                          )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          )}
        </Tabs>

        {!isLoading && filteredPeople?.length === 0 && (
          <div className="text-center py-24 bg-muted/20 rounded-3xl border border-dashed border-border animate-in fade-in duration-700">
             <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-20" />
             <h3 className="text-foreground font-semibold tracking-tight mb-2">No results detected</h3>
             <p className="text-muted-foreground text-sm">Try adjusting your filters or search query.</p>
          </div>
        )}
      </div>
    </div>
  );
}
