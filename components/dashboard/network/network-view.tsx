'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { networkService, NetworkPerson } from '@/services/network.service';
import { followService, CompanyFollowEntry } from '@/services/follow.service';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

import { NetworkCategory, TAB_LABELS, NetworkViewProps } from './types';
import { NetworkSidebar } from './network-sidebar';
import { NetworkPillFilters } from './network-pill-filters';
import { NetworkPersonCard } from './network-person-card';
import { NetworkCompanyCard } from './network-company-card';
import { CompanyDetailModal } from './company-detail-modal';
import { NetworkEmptyState } from './network-empty-state';

export function NetworkView({
  isCollapsed,
  onSectionChange,
}: NetworkViewProps) {
  const [activeTab, setActiveTab] = useState<NetworkCategory>('CONNECTIONS');
  const [suggestionSubTab, setSuggestionSubTab] = useState<'ALL' | 'PENDING'>('ALL');
  const [followSubTab, setFollowSubTab] = useState<'FOLLOWING' | 'FOLLOWERS' | 'COMPANIES'>('FOLLOWING');
  const [selectedCompanyForModal, setSelectedCompanyForModal] = useState<CompanyFollowEntry | null>(null);
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

  // Dynamic followed companies query & count
  const { data: followedCompanies } = useQuery<CompanyFollowEntry[]>({
    queryKey: ['network', 'followed-companies'],
    queryFn: () => followService.getMyFollowedCompanies(),
  });

  // Active tab people / companies query
  const { data: people, isLoading } = useQuery<any[]>({
    queryKey: ['network', activeTab, suggestionSubTab, followSubTab],
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
        if (followSubTab === 'COMPANIES') {
          return followService.getMyFollowedCompanies();
        }
        return followSubTab === 'FOLLOWING'
          ? followService.getFollowing()
          : followService.getFollowers();
      }
      if (activeTab === 'PAGES') {
        return followService.getMyFollowedCompanies();
      }
      return networkService.getPeople('FOUNDER', false);
    },
  });

  const connectMutation = useMutation({
    mutationFn: (userId: string) => networkService.connect(userId),
    onSuccess: () => {
      toast.success('Connection Request Sent', {
        description: 'Once they accept, you can start messaging.',
      });
      queryClient.invalidateQueries({ queryKey: ['network'] });
      queryClient.refetchQueries({ queryKey: ['network'] });
    },
    onError: (error: any) => {
      toast.error('Failed to connect', {
        description: error.data?.error || error.message || 'Something went wrong.',
      });
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: (userId: string) => networkService.disconnect(userId),
    onSuccess: () => {
      toast.info('Connection Request Cancelled', {
        description: 'The connection request has been cancelled.',
      });
      queryClient.invalidateQueries({ queryKey: ['network'] });
      queryClient.refetchQueries({ queryKey: ['network'] });
      queryClient.invalidateQueries({ queryKey: ['chat-rooms'] });
    },
    onError: (error: any) => {
      toast.error('Failed to cancel request', {
        description: error.data?.error || error.message || 'Something went wrong.',
      });
    },
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'ACCEPTED' | 'REJECTED' }) =>
      networkService.respondToConnection(id, status),
    onSuccess: (_, variables) => {
      toast.success(variables.status === 'ACCEPTED' ? 'Request Accepted' : 'Request Rejected');
      queryClient.invalidateQueries({ queryKey: ['network'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: any) => {
      toast.error('Action failed', {
        description: error.data?.error || error.message || 'Something went wrong.',
      });
    },
  });

  const toggleFollowMutation = useMutation({
    mutationFn: (userId: string) => followService.toggleFollow(userId),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['network'] });
      toast.success(
        res.status === 'following'
          ? 'You are now following this person.'
          : 'Unfollowed.'
      );
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.error || 'Failed to update follow status');
    },
  });

  const handleUnfollowCompany = (companyId: string, companyName: string) => {
    followService.toggleCompanyFollow(companyId).then(() => {
      toast.info(`Unfollowed ${companyName}`);
      queryClient.invalidateQueries({ queryKey: ['network'] });
      if (selectedCompanyForModal?.company === companyId) {
        setSelectedCompanyForModal(null);
      }
    });
  };

  const { user: currentUser } = useAuth();

  const filteredPeople = people?.filter((person: any) => {
    if (person.id === currentUser?.id) return false;

    if (activeTab === 'SUGGESTIONS' && suggestionSubTab === 'ALL') {
      if (person.connection_info?.status === 'ACCEPTED' || person.connection_info?.status === 'PENDING') return false;
    } else if (['FOUNDER', 'INVESTOR', 'MENTOR'].includes(activeTab)) {
      if (person.connection_info?.status === 'ACCEPTED' || person.connection_info?.status === 'PENDING') return false;
    }

    const name = (person.company_name || `${person.first_name || ''} ${person.last_name || ''}`).toLowerCase();
    const headline = (person.industry || person.headline || person.profile?.headline || person.role || '').toLowerCase();
    const query = searchQuery.toLowerCase();

    return searchQuery === '' || name.includes(query) || headline.includes(query);
  });

  const isConnectionRelatedTab = ['CONNECTIONS', 'SUGGESTIONS', 'FOUNDER', 'INVESTOR', 'MENTOR', 'INVITATIONS'].includes(activeTab);
  const isSimpleStaticTab = ['GROUPS', 'EVENTS', 'NEWSLETTERS'].includes(activeTab) || (activeTab === 'PAGES' && (!people || people.length === 0));

  return (
    <div className="flex-1 min-h-screen bg-background px-4 sm:px-6 lg:px-8 py-6 sm:py-10 transition-all duration-300 ease-in-out">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar */}
          <NetworkSidebar
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            myConnections={myConnections}
            followedCompanies={followedCompanies}
          />

          {/* Right Main Content */}
          <div className="flex-1 min-w-0">
            {/* Top Sub-Filter Pills (shown only on Connections/Suggestions tabs) */}
            {isConnectionRelatedTab && (
              <NetworkPillFilters
                activeTab={activeTab}
                onSelectPill={(tab) => {
                  setActiveTab(tab);
                  if (tab === 'SUGGESTIONS') {
                    setSuggestionSubTab('ALL');
                  }
                }}
                invitationsCount={invitations?.length || 0}
              />
            )}

            {/* Pending Invitations Banner */}
            {isConnectionRelatedTab && invitations && invitations.length > 0 && activeTab !== 'INVITATIONS' && (
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
                <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-[0.3em] animate-pulse">
                  Syncing ecosystem...
                </p>
              </div>
            ) : isSimpleStaticTab ? (
              <NetworkEmptyState
                activeTab={activeTab}
                suggestionSubTab={suggestionSubTab}
                followSubTab={followSubTab}
                onDiscoverSuggestions={() => {
                  setActiveTab('SUGGESTIONS');
                  setSuggestionSubTab('ALL');
                }}
              />
            ) : activeTab === 'PAGES' ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-border/40">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                    Followed Pages ({(people as unknown as CompanyFollowEntry[]).length})
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(people as unknown as CompanyFollowEntry[]).map((entry) => (
                    <NetworkCompanyCard
                      key={entry.id}
                      entry={entry}
                      onClick={setSelectedCompanyForModal}
                      onUnfollow={handleUnfollowCompany}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div>
                {/* Header Sub-tabs */}
                <div className="mb-4">
                  {activeTab === 'SUGGESTIONS' ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h2 className="text-base font-bold text-foreground tracking-tight">
                          Suggestions
                        </h2>
                      </div>
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
                  ) : activeTab === 'FOLLOWING' ? (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h2 className="text-base font-bold text-foreground tracking-tight">
                          Following & Followers
                        </h2>
                      </div>
                      <div className="flex items-center gap-2 border-b border-border pb-2">
                        <button
                          onClick={() => setFollowSubTab('FOLLOWING')}
                          className={cn(
                            "px-3 py-1.5 text-xs font-bold transition-all border-b-2 cursor-pointer",
                            followSubTab === 'FOLLOWING'
                              ? "border-[#0a66c2] text-[#0a66c2]"
                              : "border-transparent text-muted-foreground hover:text-foreground"
                          )}
                        >
                          People
                        </button>
                        <button
                          onClick={() => setFollowSubTab('COMPANIES')}
                          className={cn(
                            "px-3 py-1.5 text-xs font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5",
                            followSubTab === 'COMPANIES'
                              ? "border-[#0a66c2] text-[#0a66c2]"
                              : "border-transparent text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <span>Companies & Pages</span>
                          {followedCompanies && followedCompanies.length > 0 && (
                            <Badge variant="secondary" className="rounded-sm text-[10px] px-1.5 py-0 h-4 font-bold bg-[#0a66c2]/10 text-[#0a66c2]">
                              {followedCompanies.length}
                            </Badge>
                          )}
                        </button>
                        <button
                          onClick={() => setFollowSubTab('FOLLOWERS')}
                          className={cn(
                            "px-3 py-1.5 text-xs font-bold transition-all border-b-2 cursor-pointer",
                            followSubTab === 'FOLLOWERS'
                              ? "border-[#0a66c2] text-[#0a66c2]"
                              : "border-transparent text-muted-foreground hover:text-foreground"
                          )}
                        >
                          Followers
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

                {/* Real API People / Companies Grid */}
                {activeTab === 'FOLLOWING' && followSubTab === 'COMPANIES' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {(filteredPeople as unknown as CompanyFollowEntry[])?.map((entry) => (
                      <NetworkCompanyCard
                        key={entry.id}
                        entry={entry}
                        onClick={setSelectedCompanyForModal}
                        onUnfollow={handleUnfollowCompany}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredPeople?.map((person: any) => (
                      <NetworkPersonCard
                        key={person.id}
                        person={person}
                        activeTab={activeTab}
                        followSubTab={followSubTab}
                        isConnectPending={connectMutation.isPending && connectMutation.variables === person.id}
                        isDisconnectPending={disconnectMutation.isPending && disconnectMutation.variables === person.id}
                        isFollowPending={toggleFollowMutation.isPending && toggleFollowMutation.variables === person.id}
                        onConnect={(id) => connectMutation.mutate(id)}
                        onDisconnect={(id) => disconnectMutation.mutate(id)}
                        onRespond={(id, st) => respondMutation.mutate({ id, status: st })}
                        onToggleFollow={(id) => toggleFollowMutation.mutate(id)}
                        onNavigateProfile={onSectionChange}
                      />
                    ))}
                  </div>
                )}

                {/* Empty State when no results */}
                {!isLoading && filteredPeople?.length === 0 && (
                  <NetworkEmptyState
                    activeTab={activeTab}
                    suggestionSubTab={suggestionSubTab}
                    followSubTab={followSubTab}
                    onDiscoverSuggestions={() => {
                      setActiveTab('SUGGESTIONS');
                      setSuggestionSubTab('ALL');
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Company Details Modal */}
      <CompanyDetailModal
        company={selectedCompanyForModal}
        onClose={() => setSelectedCompanyForModal(null)}
        onUnfollow={handleUnfollowCompany}
      />
    </div>
  );
}
