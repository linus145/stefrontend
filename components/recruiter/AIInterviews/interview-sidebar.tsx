'use client';

import React from 'react';
import {
  BrainCircuit, Users2, ClipboardCheck, Calendar, PieChart,
  Settings2, ChevronLeft, Menu, User, Coins, Sun, Moon, LogOut
} from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { useDashboardTheme } from '@/context/DashboardThemeContext';
import { useQuery } from '@tanstack/react-query';
import { creditsService } from '@/services/credits.service';

interface AIInterviewsSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
  companyName: string;
}

const NAVIGATION_ITEMS = [
  { id: 'pipeline', label: 'Pipeline', icon: Users2 },
  { id: 'configuration', label: 'Configuration', icon: BrainCircuit },
  { id: 'scheduling', label: 'Scheduling', icon: Calendar },
  { id: 'evaluation', label: 'Evaluation', icon: ClipboardCheck },
  { id: 'analytics', label: 'Insights', icon: PieChart },
  { id: 'settings', label: 'Settings', icon: Settings2 },
];

export function AIInterviewsSidebar({
  isCollapsed, onToggle, activeSection, onSectionChange, companyName
}: AIInterviewsSidebarProps) {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useDashboardTheme();

  const { data: creditsData } = useQuery({
    queryKey: ['userCredits'],
    queryFn: () => creditsService.getBalance(),
    staleTime: 0,
    refetchInterval: 5000,
  });
  const creditBalance = creditsData?.data?.balance ?? 0;

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 bottom-0 bg-card border-r border-border flex flex-col justify-between py-6 z-30 transition-all duration-300 ease-in-out",
        "hidden lg:flex",
        isCollapsed ? "lg:w-20" : "lg:w-60"
      )}
    >
      {/* Desktop Collapse Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 hidden lg:flex h-6 w-6 items-center justify-center rounded-full bg-background border border-border text-muted-foreground hover:text-foreground transition-all z-50 shadow-sm hover:scale-110 active:scale-95 cursor-pointer"
      >
        {isCollapsed ? <Menu className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      {/* Fixed Profile Section */}
      <div className="shrink-0 pb-3 border-b border-border/60">
        {!isCollapsed && user?.email ? (
          <div className="px-5 flex items-center gap-2.5 min-w-0">
            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0 border border-border">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <span className="text-[11.5px] font-medium text-foreground/80 truncate select-none leading-none">
              {user.email}
            </span>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center border border-border">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      {/* Scrollable Navigation Area */}
      <div className="flex-1 py-4 overflow-y-auto no-scrollbar overflow-x-hidden space-y-4">
        {/* Navigation Items */}
        <nav className="px-3 space-y-1">
          {NAVIGATION_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-2.5 px-3 py-1.5 text-[13px] font-medium transition-all group relative rounded-[4px] cursor-pointer",
                  isActive
                    ? "bg-secondary text-foreground font-semibold"
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                )}
              >
                <item.icon className={cn(
                  "w-4 h-4 shrink-0 transition-colors",
                  isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                )} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
                {isCollapsed && isActive && (
                  <div className="absolute left-0 w-1 h-5 bg-foreground/80 rounded-[2px]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className={cn("px-3 space-y-2 transition-all mt-auto", isCollapsed ? "px-2" : "px-3")}>
        {/* Credits */}
        {!isCollapsed ? (
          <div
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[4px] bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-[11px] font-bold w-full"
            title="AI Credits Balance"
          >
            <Coins className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>{creditBalance} Credits</span>
          </div>
        ) : (
          <div className="flex justify-center" title={`${creditBalance} Credits`}>
            <div className="w-8 h-8 rounded-[4px] bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
              <Coins className="w-3.5 h-3.5 text-amber-500" />
            </div>
          </div>
        )}

        {/* Theme Toggle — text when expanded, icon when collapsed */}
        <button
          onClick={toggleTheme}
          className={cn(
            "flex items-center gap-2 w-full transition-all rounded-[4px] text-muted-foreground hover:text-foreground text-xs font-semibold active:scale-95 py-1.5",
            isCollapsed ? "justify-center px-0" : "px-2"
          )}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark
            ? <Sun className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            : <Moon className="h-3.5 w-3.5 text-primary shrink-0" />
          }
          {!isCollapsed && (
            <span className="animate-in fade-in duration-300">
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </span>
          )}
        </button>

        {/* Exit App button */}
        <Link
          href="/recruiter/login?redirect=/recruiter/AIInterviews"
          className={cn(
            "flex items-center justify-center gap-2 w-full transition-all rounded-[4px] bg-muted/50 border border-border text-rose-500 py-1.5 text-xs font-bold hover:bg-rose-500/10 active:scale-95 cursor-pointer mt-1",
            isCollapsed ? "justify-center px-0" : "px-2"
          )}
        >
          <LogOut className="h-3.5 w-3.5 text-rose-500" />
          {!isCollapsed && <span className="animate-in fade-in duration-300">Exit App</span>}
        </Link>
      </div>
    </aside>
  );
}
