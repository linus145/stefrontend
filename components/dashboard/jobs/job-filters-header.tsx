'use client';

import React from 'react';
import { Search, Zap, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JobFiltersHeaderProps {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  selectedCategory: string | null;
  setSelectedCategory: React.Dispatch<React.SetStateAction<string | null>>;
  showMobileMore: boolean;
  setShowMobileMore: (v: boolean) => void;
  setActiveSearchQuery: (v: string) => void;
  onSectionChange?: (section: any, id?: string | null) => void;
}

const desktopFilters = [
  'IT',
  'Non-IT',
  'Remote',
  'Hybrid',
  'Full-time',
  'Part-time',
  'Contract',
  'Internship',
  'Freelance',
  'Entry Level',
  'Mid Level',
  'Senior Level'
];

const mobilePrimaryFilters = ['IT', 'Freelance', 'Remote'];
const mobileSecondaryFilters = ['Full-time', 'Contract', 'Internship', 'Non-IT', 'Hybrid', 'Part-time', 'Entry Level', 'Mid Level', 'Senior Level'];

export function JobFiltersHeader({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  showMobileMore,
  setShowMobileMore,
  setActiveSearchQuery,
  onSectionChange
}: JobFiltersHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4">
      <div className="relative w-full group">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
        <input
          type="text"
          placeholder="Search jobs, posts, companies..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              if (onSectionChange && searchQuery.trim()) {
                onSectionChange('search', searchQuery.trim());
              } else {
                setActiveSearchQuery(searchQuery);
              }
            }
          }}
          className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-sm text-[13px] font-medium focus:ring-1 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all shadow-sm"
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          <button
            onClick={() => setSelectedCategory(prev => prev === 'B2_APPLY' ? null : 'B2_APPLY')}
            className={cn(
              "flex items-center gap-2 px-3 md:px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shadow-sm transition-all duration-300 border shrink-0",
              selectedCategory === 'B2_APPLY'
                ? "bg-[#0a66c2] text-white border-[#0a66c2] shadow-md shadow-[#0a66c2]/20"
                : "bg-card border-border text-[#0a66c2] hover:bg-[#0a66c2]/5"
            )}
          >
            <Zap className="w-3 h-3 fill-current" />
            B2 Apply
          </button>

          {/* Desktop Filters (visible only on md and up) */}
          {desktopFilters.map((filter) => (
            <button
              key={`desktop-${filter}`}
              onClick={() => setSelectedCategory(prev => prev === filter ? null : filter)}
              className={cn(
                "hidden md:inline-flex px-3 md:px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-all duration-300 whitespace-nowrap shadow-sm border shrink-0",
                selectedCategory === filter
                  ? "bg-[#0a66c2] text-white border-[#0a66c2] shadow-md shadow-[#0a66c2]/20"
                  : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:border-[#0a66c2]/30"
              )}
            >
              {filter}
            </button>
          ))}

          {/* Mobile Primary Filters (visible only on mobile) */}
          {mobilePrimaryFilters.map((filter) => (
            <button
              key={`mobile-primary-${filter}`}
              onClick={() => setSelectedCategory(prev => prev === filter ? null : filter)}
              className={cn(
                "md:hidden px-3 py-2 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-all duration-300 whitespace-nowrap shadow-sm border shrink-0",
                selectedCategory === filter
                  ? "bg-[#0a66c2] text-white border-[#0a66c2] shadow-md shadow-[#0a66c2]/20"
                  : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:border-[#0a66c2]/30"
              )}
            >
              {filter}
            </button>
          ))}

          <button
            onClick={() => setShowMobileMore(!showMobileMore)}
            className="md:hidden p-2 bg-card border border-border text-muted-foreground rounded-sm hover:text-foreground hover:bg-muted/50 transition-all shadow-sm flex items-center justify-center outline-none shrink-0"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>
        {showMobileMore && (
          <div className="md:hidden flex items-center gap-2 overflow-x-auto pb-1 animate-in slide-in-from-top-1 duration-200 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {mobileSecondaryFilters.map((filter) => (
              <button
                key={`mobile-extra-${filter}`}
                onClick={() => setSelectedCategory(prev => prev === filter ? null : filter)}
                className={cn(
                  "px-3 py-2 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-all duration-300 whitespace-nowrap shadow-sm border shrink-0",
                  selectedCategory === filter
                    ? "bg-[#0a66c2] text-white border-[#0a66c2] shadow-md shadow-[#0a66c2]/20"
                    : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:border-[#0a66c2]/30"
                )}
              >
                {filter}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
