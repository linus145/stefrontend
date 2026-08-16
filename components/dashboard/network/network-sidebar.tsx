'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { NetworkCategory, SIDEBAR_ITEMS } from './types';
import { NetworkPerson } from '@/services/network.service';
import { CompanyFollowEntry } from '@/services/follow.service';

interface NetworkSidebarProps {
  activeTab: NetworkCategory;
  onSelectTab: (tab: NetworkCategory) => void;
  myConnections?: NetworkPerson[];
  followedCompanies?: CompanyFollowEntry[];
}

export function NetworkSidebar({
  activeTab,
  onSelectTab,
  myConnections,
  followedCompanies,
}: NetworkSidebarProps) {
  return (
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
            } else if (item.id === 'PAGES') {
              countDisplay = followedCompanies?.length || 0;
            }

            return (
              <button
                key={item.id}
                onClick={() => onSelectTab(item.id)}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 text-xs sm:text-sm font-medium transition-all duration-150 group cursor-pointer",
                  isActive
                    ? "bg-accent/80 text-foreground font-bold border-l-4 border-[#0a66c2] pl-3"
                    : "text-foreground/75 hover:bg-muted/50 hover:text-foreground border-l-4 border-transparent"
                )}
              >
                <div className="flex items-center gap-3.5">
                  <Icon
                    className={cn(
                      "w-4 h-4 transition-colors shrink-0",
                      isActive ? "text-[#0a66c2]" : "text-foreground/60 group-hover:text-foreground"
                    )}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {countDisplay !== undefined && countDisplay > 0 && (
                  <span
                    className={cn(
                      "text-xs tabular-nums font-semibold ml-2",
                      isActive ? "text-[#0a66c2]" : "text-muted-foreground group-hover:text-foreground"
                    )}
                  >
                    {countDisplay}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
