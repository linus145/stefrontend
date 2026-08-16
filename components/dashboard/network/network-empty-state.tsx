'use client';

import React from 'react';
import { Users, UserCheck, Calendar, Building2, Newspaper } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NetworkCategory } from './types';

interface NetworkEmptyStateProps {
  activeTab: NetworkCategory;
  suggestionSubTab: 'ALL' | 'PENDING';
  followSubTab: 'FOLLOWING' | 'FOLLOWERS' | 'COMPANIES';
  onDiscoverSuggestions: () => void;
}

export function NetworkEmptyState({
  activeTab,
  suggestionSubTab,
  followSubTab,
  onDiscoverSuggestions,
}: NetworkEmptyStateProps) {
  // Static sub-tab empty states for simple tabs
  if (activeTab === 'GROUPS') {
    return (
      <div className="p-16 text-center bg-card border border-border rounded-sm">
        <Users className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
        <h3 className="text-base font-bold text-foreground mb-1">No groups joined yet</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-5">
          Join groups to connect with peers, participate in discussions, and share industry insights.
        </p>
        <Button
          onClick={onDiscoverSuggestions}
          className="rounded-sm bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-bold px-6 cursor-pointer"
        >
          Discover Suggestions
        </Button>
      </div>
    );
  }

  if (activeTab === 'EVENTS') {
    return (
      <div className="p-16 text-center bg-card border border-border rounded-sm">
        <Calendar className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
        <h3 className="text-base font-bold text-foreground mb-1">No upcoming events</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-5">
          Stay tuned for upcoming webinars, startup meetups, and ecosystem events.
        </p>
        <Button
          onClick={onDiscoverSuggestions}
          className="rounded-sm bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-bold px-6 cursor-pointer"
        >
          Discover Suggestions
        </Button>
      </div>
    );
  }

  if (activeTab === 'PAGES') {
    return (
      <div className="p-16 text-center bg-card border border-border rounded-sm">
        <Building2 className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
        <h3 className="text-base font-bold text-foreground mb-1">No pages followed yet</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-5">
          Follow company and startup pages from job postings and search to get their latest announcements.
        </p>
        <Button
          onClick={onDiscoverSuggestions}
          className="rounded-sm bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-bold px-6 cursor-pointer"
        >
          Discover Suggestions
        </Button>
      </div>
    );
  }

  if (activeTab === 'NEWSLETTERS') {
    return (
      <div className="p-16 text-center bg-card border border-border rounded-sm">
        <Newspaper className="w-10 h-10 text-muted-foreground/40 mx-auto mb-3" />
        <h3 className="text-base font-bold text-foreground mb-1">No newsletter subscriptions</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto mb-5">
          Subscribe to newsletters to receive curated industry news and tech insights.
        </p>
        <Button
          onClick={onDiscoverSuggestions}
          className="rounded-sm bg-[#0a66c2] hover:bg-[#004182] text-white text-xs font-bold px-6 cursor-pointer"
        >
          Discover Suggestions
        </Button>
      </div>
    );
  }

  // Dynamic search/grid empty states
  let title = 'No results found';
  let desc = 'Explore the community to find people you may know or want to collaborate with.';

  if (activeTab === 'CONNECTIONS') {
    title = 'No connections made yet';
    desc = 'Start building your network by connecting with founders, investors, and mentors in the ecosystem.';
  } else if (activeTab === 'INVITATIONS') {
    title = 'No pending invitations';
    desc = 'When people send you a connection request, they will show up here.';
  } else if (activeTab === 'SUGGESTIONS' && suggestionSubTab === 'PENDING') {
    title = 'No pending sent requests';
    desc = 'Connection requests you send to others will appear here until they accept.';
  } else if (activeTab === 'FOLLOWING') {
    if (followSubTab === 'FOLLOWING') {
      title = 'Not following anyone yet';
      desc = 'Follow founders, investors, and mentors to see their latest updates in your network.';
    } else if (followSubTab === 'COMPANIES') {
      title = 'No companies or pages followed yet';
      desc = 'Follow company and startup pages from job postings and search to get their latest announcements.';
    } else {
      title = 'No followers yet';
      desc = 'People who follow your profile will appear here.';
    }
  }

  return (
    <div className="p-20 text-center animate-in fade-in zoom-in-95 duration-300">
      <div className="w-20 h-20 rounded-sm bg-muted/20 flex items-center justify-center mx-auto mb-6">
        <Users className="w-10 h-10 text-muted-foreground opacity-30" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-sm max-w-xs mx-auto mb-8">{desc}</p>
      {activeTab === 'CONNECTIONS' && (
        <Button
          onClick={onDiscoverSuggestions}
          className="rounded-sm bg-[#0a66c2] hover:bg-[#004182] text-white font-bold px-8 cursor-pointer"
        >
          Discover Suggestions
        </Button>
      )}
    </div>
  );
}
