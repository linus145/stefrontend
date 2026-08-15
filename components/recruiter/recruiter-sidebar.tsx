'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard, Briefcase, Users, Building2, ChevronLeft,
  Menu, X, ArrowLeftRight, LogOut, MessageSquare, Search, User,
  BrainCircuit, Coins, Sun, Moon
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { useDashboardTheme } from '@/context/DashboardThemeContext';
import { useQuery } from '@tanstack/react-query';
import { creditsService } from '@/services/credits.service';

export type RecruiterSection = 'overview' | 'my-jobs' | 'applications' | 'candidates' | 'company' | 'messages';

interface RecruiterSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  activeTab: RecruiterSection;
  onTabChange: (tab: RecruiterSection) => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
  companyName: string;
  companyLogo?: string;
}

const NAVIGATION_ITEMS: { id: RecruiterSection; label: string; icon: any }[] = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'my-jobs', label: 'Jobs', icon: Briefcase },
  { id: 'applications', label: 'Applications', icon: Users },
  { id: 'company', label: 'Company Profile', icon: Building2 },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
];

export function RecruiterSidebar({
  isCollapsed, onToggle, activeTab, onTabChange,
  isMobileOpen, onMobileClose, companyName, companyLogo
}: RecruiterSidebarProps) {
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
        isCollapsed ? "lg:w-20" : "lg:w-60",
        isMobileOpen && "!flex w-72 shadow-2xl bg-card"
      )}
    >
      {/* Mobile Close */}
      <button
        onClick={onMobileClose}
        className="absolute top-4 right-4 lg:hidden w-8 h-8 rounded-[4px] bg-muted/50 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Desktop Collapse Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 hidden lg:flex h-6 w-6 items-center justify-center rounded-full bg-background border border-border text-muted-foreground hover:text-foreground transition-all z-50 shadow-sm hover:scale-110 active:scale-95 cursor-pointer"
      >
        {isCollapsed ? <Menu className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      {/* Fixed Profile Section */}
      <div className="shrink-0 pb-3 border-b border-border/60">
        {/* User profile info */}
        {(!isCollapsed || isMobileOpen) && user?.email ? (
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
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onTabChange(item.id);
                  if (onMobileClose) onMobileClose();
                }}
                data-agent={`nav-tab-recruiter-${item.id}`}
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
                {(!isCollapsed || isMobileOpen) && <span className="truncate">{item.label}</span>}
                {isCollapsed && !isMobileOpen && isActive && (
                  <div className="absolute left-0 w-1 h-5 bg-foreground/80 rounded-[2px]" />
                )}
              </button>
            );
          })}

          {/* Workspace Tools Divider */}
          <div className="h-[1px] bg-border/60 my-3 mx-2" />

          {/* Heading */}
          {(!isCollapsed || isMobileOpen) && (
            <div className="px-3 pb-1.5 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider select-none">
              Workspace Tools
            </div>
          )}

          {/* External Links */}
          <Link
            href="/recruiter/AIInterviews"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[13px] font-medium transition-all group rounded-[4px] text-muted-foreground hover:bg-muted/50 hover:text-foreground cursor-pointer"
          >
            <BrainCircuit className="w-4 h-4 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
            {(!isCollapsed || isMobileOpen) && <span className="truncate">Interview Pipeline</span>}
          </Link>

          <Link
            href="/Hrtools"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[13px] font-medium transition-all group rounded-[4px] text-muted-foreground hover:bg-muted/50 hover:text-foreground cursor-pointer"
          >
            <Building2 className="w-4 h-4 shrink-0 text-muted-foreground group-hover:text-foreground transition-colors" />
            {(!isCollapsed || isMobileOpen) && <span className="truncate">HR Tool</span>}
          </Link>
        </nav>
      </div>

      {/* Bottom Section */}
      <div className={cn("px-3 space-y-2 transition-all mt-auto", (isCollapsed && !isMobileOpen) ? "px-2" : "px-3")}>

        {/* Credits */}
        {(!isCollapsed || isMobileOpen) ? (
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
            (isCollapsed && !isMobileOpen) ? "justify-center px-0" : "px-2"
          )}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {isDark
            ? <Sun className="h-3.5 w-3.5 text-amber-500 shrink-0" />
            : <Moon className="h-3.5 w-3.5 text-primary shrink-0" />
          }
          {(!isCollapsed || isMobileOpen) && (
            <span className="animate-in fade-in duration-300">
              {isDark ? 'Light Mode' : 'Dark Mode'}
            </span>
          )}
        </button>

        {/* Exit App */}
        <Link
          href="/recruiter/login?redirect=/recruiter"
          className={cn(
            "flex items-center justify-center gap-2 w-full transition-all rounded-[4px] bg-muted/50 border border-border text-rose-500 py-2 text-xs font-bold hover:bg-rose-500/10 active:scale-95",
            (isCollapsed && !isMobileOpen) ? "px-0" : "px-2"
          )}
        >
          <LogOut className="h-3.5 w-3.5 text-rose-500" />
          {(!isCollapsed || isMobileOpen) && <span className="animate-in fade-in duration-300">Exit App</span>}
        </Link>


      </div>
    </aside>
  );
}
