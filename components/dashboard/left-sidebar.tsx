'use client';

import Link from 'next/link';
import {
  Rocket, Grid, Globe, MessageSquare, Network, Settings,
  ArrowUpCircle, HelpCircle, Archive, LogOut, User as UserIcon,
  ChevronLeft, Menu, Briefcase, X, Home, Newspaper
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

export type DashboardSection = 'dashboard' | 'Profile' | 'messages' | 'network' | 'settings' | 'jobs' | 'news';

interface LeftSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  activeSection: DashboardSection;
  onSectionChange: (section: DashboardSection, userId?: string | null) => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function LeftSidebar({ isCollapsed, onToggle, activeSection, onSectionChange, isMobileOpen, onMobileClose }: LeftSidebarProps) {
  const { user, logout } = useAuth();

  return (
    <aside
      className={cn(
        "h-screen fixed left-0 top-0 bg-sidebar border-r border-border flex flex-col justify-between py-6 z-50 transition-all duration-300 ease-in-out",
        // Desktop: normal sidebar behavior
        "hidden lg:flex",
        isCollapsed ? "lg:w-20" : "lg:w-60",
        // Mobile: overlay sidebar
        isMobileOpen && "!flex w-72 shadow-2xl"
      )}
    >
      {/* Mobile Close Button */}
      <button
        onClick={onMobileClose}
        className="absolute top-4 right-4 lg:hidden w-8 h-8 rounded-lg bg-muted/50 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Collapse Toggle Button (Desktop only) */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 hidden lg:flex h-6 w-6 items-center justify-center rounded-full bg-surface border border-border text-muted-foreground hover:text-primary transition-all z-50 shadow-sm hover:scale-110 active:scale-95"
      >
        {isCollapsed ? <Menu className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      {/* Top Section */}
      <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
        {/* Brand */}
        <div className={cn("px-6 flex items-center gap-3 transition-all", isCollapsed && !isMobileOpen ? "px-5" : "px-6")}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm hover:scale-105 transition-transform cursor-pointer">
            <Rocket className="h-4 w-4" />
          </div>
          {(!isCollapsed || isMobileOpen) && (
            <div className="animate-in fade-in slide-in-from-left-2 duration-300">
              <h1 className="text-foreground font-semibold text-base leading-tight tracking-tight uppercase">STE</h1>
              <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-[0.2em] opacity-80">Architect</p>
            </div>
          )}
        </div>

        {/* Mobile-only: Quick Navigation */}
        {isMobileOpen && (
          <nav className="space-y-1.5 px-3 lg:hidden">
            <div className="px-3 mb-2">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-muted-foreground">Navigate</p>
            </div>
            <SidebarLink
              onClick={() => onSectionChange('dashboard')}
              icon={<Home className="h-4 w-4" />}
              label="Home"
              isCollapsed={false}
              active={activeSection === 'dashboard'}
            />
            <SidebarLink
              onClick={() => onSectionChange('network')}
              icon={<Network className="h-4 w-4" />}
              label="Network"
              isCollapsed={false}
              active={activeSection === 'network'}
            />
            <SidebarLink
              onClick={() => onSectionChange('jobs')}
              icon={<Briefcase className="h-4 w-4" />}
              label="Jobs"
              isCollapsed={false}
              active={activeSection === 'jobs'}
            />
            <SidebarLink
              onClick={() => onSectionChange('news')}
              icon={<Newspaper className="h-4 w-4" />}
              label="News"
              isCollapsed={false}
              active={activeSection === 'news'}
            />
            <div className="border-b border-border my-3" />
          </nav>
        )}

        {/* Navigation */}
        <nav className="space-y-1.5 px-3">
          <SidebarLink
            onClick={() => onSectionChange('messages')}
            icon={<MessageSquare className="h-4 w-4" />}
            label="Messages"
            isCollapsed={isCollapsed && !isMobileOpen}
            active={activeSection === 'messages'}
          />
          <SidebarLink
            onClick={() => onSectionChange('settings')}
            icon={<Settings className="h-4 w-4" />}
            label="Settings"
            isCollapsed={isCollapsed && !isMobileOpen}
            active={activeSection === 'settings'}
          />
        </nav>
      </div>

      {/* Bottom Section */}
      <div className={cn("px-4 space-y-6 transition-all", (isCollapsed && !isMobileOpen) ? "px-4" : "px-4")}>
        <div className="space-y-3 pb-2">
          <button className={cn(
            "flex items-center justify-center gap-2 w-full transition-all rounded-xl bg-primary text-primary-foreground py-2 text-xs font-semibold shadow-sm hover:opacity-90 active:scale-95",
            (isCollapsed && !isMobileOpen) ? "px-0" : "px-2"
          )}>
            <ArrowUpCircle className="h-3.5 w-3.5" />
            {(!isCollapsed || isMobileOpen) && <span className="animate-in fade-in duration-300">Raise Capital</span>}
          </button>

          {(!isCollapsed || isMobileOpen) && (
            <div className="flex flex-col gap-1 pt-3 border-t border-border">
              <Link href="#support" className="flex items-center gap-2.5 px-2 py-1.5 text-muted-foreground hover:text-foreground transition-all text-xs font-medium group">
                <HelpCircle className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 group-hover:text-primary transition-all" />
                <span className="animate-in fade-in duration-300">Support</span>
              </Link>
              <button
                onClick={() => logout()}
                className="flex items-center gap-2.5 px-2 py-1.5 text-muted-foreground hover:text-destructive transition-all text-xs font-medium group"
              >
                <LogOut className="h-3.5 w-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
                <span className="animate-in fade-in duration-300">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

function SidebarLink({ onClick, icon, label, isCollapsed, active = false }: {
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  isCollapsed: boolean;
  active?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-xl transition-all group relative overflow-hidden",
        active
          ? "bg-primary/10 text-primary shadow-sm"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
        isCollapsed && "justify-center px-0"
      )}
    >
      <div className={cn(
        "transition-all duration-300 shrink-0",
        active ? "text-primary" : "group-hover:text-primary"
      )}>
        {icon}
      </div>
      {!isCollapsed && (
        <span className="text-[13px] font-medium tracking-tight">
          {label}
        </span>
      )}
    </button>
  );
}
