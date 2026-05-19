'use client';

import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav 
      aria-label="Breadcrumb" 
      className={cn(
        "flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-muted/40 border border-border/40 w-fit text-[11px] font-semibold text-muted-foreground/80 shadow-sm animate-in fade-in duration-300 mb-4 select-none backdrop-blur-sm",
        className
      )}
    >
      <div className="flex items-center gap-1 text-muted-foreground/80">
        <Home className="h-3 w-3 text-[#0a66c2]" />
        <span className="hidden sm:inline">Home</span>
      </div>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        return (
          <React.Fragment key={index}>
            <ChevronRight className="h-3 w-3 text-muted-foreground/40 shrink-0" />
            <div 
              className={cn(
                "flex items-center gap-1 shrink-0 transition-colors duration-200",
                isLast 
                  ? "text-foreground font-bold" 
                  : "text-muted-foreground/80"
              )}
            >
              {item.icon && <item.icon className="h-3 w-3 text-[#0a66c2]/80" />}
              <span>{item.label}</span>
            </div>
          </React.Fragment>
        );
      })}
    </nav>
  );
}
