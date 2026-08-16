'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { NetworkCategory } from './types';

interface NetworkPillFiltersProps {
  activeTab: NetworkCategory;
  onSelectPill: (tab: NetworkCategory) => void;
  invitationsCount?: number;
}

export function NetworkPillFilters({
  activeTab,
  onSelectPill,
  invitationsCount = 0,
}: NetworkPillFiltersProps) {
  const pills = [
    { id: 'CONNECTIONS', label: 'My Connections' },
    { id: 'SUGGESTIONS', label: 'Suggestions' },
    { id: 'FOUNDER', label: 'Cofounders' },
    { id: 'INVESTOR', label: 'Investors' },
    { id: 'MENTOR', label: 'Mentors' },
    { id: 'INVITATIONS', label: `Invitations (${invitationsCount})` },
  ];

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
      {pills.map((pill) => {
        const isPillActive = activeTab === pill.id;
        return (
          <button
            key={pill.id}
            onClick={() => onSelectPill(pill.id as NetworkCategory)}
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
  );
}
