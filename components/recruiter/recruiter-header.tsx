'use client';

import { Menu, Bell, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/dashboard/theme-toggle';
import Link from 'next/link';

interface RecruiterHeaderProps {
  isCollapsed: boolean;
  companyName: string;
  isApproved: boolean;
  isGenuine: boolean;
  onMobileMenuToggle?: () => void;
}

export function RecruiterHeader({ isCollapsed, companyName, isApproved, isGenuine, onMobileMenuToggle }: RecruiterHeaderProps) {
  return (
    <header className={cn(
      "fixed top-0 transition-all duration-300 ease-in-out flex items-center justify-between px-4 sm:px-6 lg:px-8 z-40",
      "h-16 bg-background/80 backdrop-blur-md border-b border-border",
      "left-0 right-0",
      isCollapsed ? "lg:left-20" : "lg:left-64",
    )}>
      {/* Left: Mobile menu + Branding */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMobileMenuToggle}
          className="w-9 h-9 flex lg:hidden items-center justify-center rounded-sm bg-muted/50 border border-border text-muted-foreground hover:text-foreground transition-all active:scale-95"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-sm bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center lg:hidden">
            <Building2 className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-sm font-semibold text-foreground tracking-tight">{companyName}</h2>
              {isGenuine && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20 uppercase tracking-wider flex items-center gap-1" title="Genuine Company">
                  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                </span>
              )}
              {isApproved ? (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 uppercase tracking-wider">
                  Approved
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 uppercase tracking-wider">
                  Pending
                </span>
              )}
            </div>
            <p className="text-[9px] text-teal-500 font-bold uppercase tracking-[0.15em] mt-0.5">Recruiter Dashboard</p>
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 sm:gap-5">
        <ThemeToggle />

        <button className="relative text-muted-foreground hover:text-foreground transition-all hover:scale-105 active:scale-95">
          <Bell className="w-5 h-5" />
        </button>

        <Link
          href="/dashboard"
          className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-sm bg-muted/50 border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          ← User Dashboard
        </Link>
      </div>
    </header>
  );
}
