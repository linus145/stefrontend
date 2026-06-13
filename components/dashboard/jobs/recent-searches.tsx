'use client';

import React from 'react';

interface RecentSearchesProps {
  onSearchClick: (query: string) => void;
}

const SEARCH_SUGGESTIONS = ['Architect', 'Structural', 'UI Designer', 'PM'];

export function RecentSearches({ onSearchClick }: RecentSearchesProps) {
  return (
    <div className="p-6 bg-muted/10 border-y border-border/50 my-2 select-none">
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">
        Recent Searches
      </p>
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {SEARCH_SUGGESTIONS.map((query) => (
          <button
            key={query}
            onClick={() => onSearchClick(query)}
            className="px-4 py-2 rounded-sm bg-card border border-border text-[11px] font-bold text-muted-foreground hover:text-foreground transition-all whitespace-nowrap shadow-sm cursor-pointer"
          >
            {query}
          </button>
        ))}
      </div>
    </div>
  );
}
