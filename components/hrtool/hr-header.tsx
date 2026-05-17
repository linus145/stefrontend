'use client';

import { useState } from 'react';
import { Menu, Bell, Building2, MessageSquare, ChevronDown, LayoutGrid, Users, Calendar, FileText, BarChart3, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/dashboard/theme-toggle';
import Link from 'next/link';
import { NotificationPopover } from '@/components/dashboard/notifications/notification-popover';
import { AgentUIController } from '@/agent/ui/AgentUIController';

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
        <NotificationPopover currentDashboard="HR" dotColorClass="bg-[#0a66c2]" />
        
        {/* AI Agent Header Button */}
        <button
          onClick={() => AgentUIController.getInstance().toggleSidebar()}
          className="p-2 hover:bg-muted text-muted-foreground hover:text-blue-500 rounded-sm transition-all hover:scale-110 active:scale-95 border border-border shadow-sm flex items-center justify-center shrink-0 group relative"
          title="AI Recruiting Agent"
        >
          <style>{`
            @keyframes highGlowPulse {
              0%, 100% {
                filter: drop-shadow(0 0 3px rgba(59, 130, 246, 0.7)) drop-shadow(0 0 8px rgba(59, 130, 246, 0.4));
              }
              50% {
                filter: drop-shadow(0 0 6px rgba(59, 130, 246, 1)) drop-shadow(0 0 16px rgba(59, 130, 246, 0.8));
              }
            }
            .high-glow-pulse {
              animation: highGlowPulse 1.5s infinite ease-in-out;
            }
          `}</style>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-5 h-5 group-hover:rotate-12 transition-transform text-blue-500 dark:text-blue-400 high-glow-pulse"
          >
            <path d="M12 8V4H8" />
            <rect width="16" height="12" x="4" y="8" rx="2" />
            <path d="M2 14h2" />
            <path d="M20 14h2" />
            <path d="M15 13v2" />
            <path d="M9 13v2" />
          </svg>
        </button>
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
