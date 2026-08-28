import React from 'react';
import { cn } from '@/lib/utils';

interface HeroTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TABS = [
  { id: 'Home', label: 'Home' },
  { id: 'About', label: 'About' },
  { id: 'Posts', label: 'Posts' }
];

export function HeroTabs({ activeTab, onTabChange }: HeroTabsProps) {
  return (
    <div className="px-4 sm:px-8 border-t border-border bg-card overflow-x-auto">
      <div className="flex items-center gap-4 sm:gap-8 h-12">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={cn(
              "h-full border-b-2 text-[13px] font-bold transition-all active:opacity-80 px-1 cursor-pointer",
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
}
