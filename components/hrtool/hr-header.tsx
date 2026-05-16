'use client';

import { useState } from 'react';
import { Menu, Bell, Building2, MessageSquare, ChevronDown, LayoutGrid, Users, Calendar, FileText, BarChart3, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/dashboard/theme-toggle';
import Link from 'next/link';

export type HRSection = 'dashboard' | 'employees' | 'onboarding' | 'attendance' | 'leave' | 'payroll' | 'performance' | 'organization';

interface HRHeaderProps {
  companyName: string;
  activeTab: HRSection;
  onTabChange: (tab: HRSection) => void;
}

export function HRHeader({
  companyName,
  activeTab,
  onTabChange,
}: HRHeaderProps) {
  return (
    <header className={cn(
      "fixed top-0 flex items-center justify-between px-4 sm:px-6 lg:px-8 z-40",
      "h-16 bg-background/80 backdrop-blur-md border-b border-border",
      "left-0 right-0",
    )}>
      <div className="flex items-center gap-3 min-w-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-sm bg-gradient-to-br from-[#0a66c2] to-[#004182] flex items-center justify-center">
            <Settings className="w-4 h-4 text-white" />
          </div>
          <div className="hidden sm:block">
            <h2 className="text-sm font-semibold text-foreground truncate max-w-[150px]">{companyName}</h2>
            <p className="text-[10px] text-blue-600 font-bold uppercase tracking-wider">HR Suite</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3 sm:gap-5">
        <ThemeToggle />
        <div className="flex items-center gap-4">
          <button className="relative text-muted-foreground hover:text-foreground transition-all">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-[#0a66c2] rounded-sm border border-background"></span>
          </button>
        </div>
        <Link
          href="/recruiter"
          className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-sm bg-muted/50 border border-border text-[11px] font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          Recruiter Panel →
        </Link>
      </div>
    </header>
  );
}
