'use client';

import {
  LayoutDashboard, Briefcase, Users, Building2, ChevronLeft,
  Menu, X, ArrowLeftRight, LogOut
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import Link from 'next/link';

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

export function RecruiterSidebar({
  isCollapsed, onToggle, activeTab, onTabChange,
  isMobileOpen, onMobileClose, companyName, companyLogo
}: RecruiterSidebarProps) {
  const { logout } = useAuth();

  return (
    <aside
      className={cn(
        "h-screen fixed left-0 top-0 bg-sidebar border-r border-border flex flex-col justify-between py-6 z-50 transition-all duration-300 ease-in-out",
        "hidden lg:flex",
        isCollapsed ? "lg:w-20" : "lg:w-64",
        isMobileOpen && "!flex w-72 shadow-2xl"
      )}
    >
      {/* Mobile Close */}
      <button
        onClick={onMobileClose}
        className="absolute top-4 right-4 lg:hidden w-8 h-8 rounded-md bg-muted/50 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Desktop Collapse Toggle */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 hidden lg:flex h-6 w-6 items-center justify-center rounded-full bg-surface border border-border text-muted-foreground hover:text-blue-500 transition-all z-50 shadow-sm hover:scale-110 active:scale-95"
      >
        {isCollapsed ? <Menu className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      {/* Top Section */}
      <div className="space-y-6 flex-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
        {/* Brand */}
        <div className={cn("px-6 flex items-center gap-3 transition-all", isCollapsed && !isMobileOpen ? "px-5" : "px-6")}>
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-sm hover:scale-105 transition-transform cursor-pointer">
            {companyLogo ? (
              <img src={companyLogo} alt="" className="w-full h-full object-cover rounded-md" />
            ) : (
              <Building2 className="h-4 w-4" />
            )}
          </div>
          {(!isCollapsed || isMobileOpen) && (
            <div className="animate-in fade-in slide-in-from-left-2 duration-300 min-w-0">
              <h1 className="text-foreground font-semibold text-sm leading-tight tracking-tight truncate">{companyName}</h1>
              <p className="text-[9px] text-blue-500 font-bold uppercase tracking-[0.2em] opacity-80">Recruiter</p>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Section */}
      <div className={cn("px-4 space-y-3 transition-all", (isCollapsed && !isMobileOpen) ? "px-4" : "px-4")}>
        {/* Switch to user dashboard */}
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center justify-center gap-2 w-full transition-all rounded-md bg-muted/50 border border-border text-muted-foreground py-2 text-xs font-semibold hover:bg-muted hover:text-foreground active:scale-95",
            (isCollapsed && !isMobileOpen) ? "px-0" : "px-2"
          )}
        >
          <ArrowLeftRight className="h-3.5 w-3.5" />
          {(!isCollapsed || isMobileOpen) && <span className="animate-in fade-in duration-300">Switch to User</span>}
        </Link>

        {(!isCollapsed || isMobileOpen) && (
          <div className="flex flex-col gap-1 pt-2 border-t border-border">
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
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-sm transition-all group relative overflow-hidden",
        active
          ? "bg-blue-500/10 text-blue-600 dark:text-blue-400 shadow-sm"
          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
        isCollapsed && "justify-center px-0"
      )}
    >
      <div className={cn(
        "transition-all duration-300 shrink-0",
        active ? "text-blue-600 dark:text-blue-400" : "group-hover:text-blue-500"
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
