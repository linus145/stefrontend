'use client';

import { Menu, Bell, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/dashboard/theme-toggle';
import Link from 'next/link';
import { RecruiterSection } from './recruiter-sidebar';

interface RecruiterHeaderProps {
  isCollapsed: boolean;
  companyName: string;
  isApproved: boolean;
  isGenuine: boolean;
  activeTab: RecruiterSection;
  onTabChange: (tab: RecruiterSection) => void;
  onMobileMenuToggle?: () => void;
}

const NAVIGATION_ITEMS: { id: RecruiterSection; label: string }[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'candidates', label: 'Talents' },
  { id: 'my-jobs', label: 'Jobs' },
  { id: 'applications', label: 'Applications' },
  { id: 'company', label: 'Company Profile' },
];

export function RecruiterHeader({
  isCollapsed,
  companyName,
  isApproved,
  isGenuine,
  activeTab,
  onTabChange,
  onMobileMenuToggle
}: RecruiterHeaderProps) {
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
          <div className="hidden sm:flex items-center gap-2">
            <h2 className="text-sm font-semibold text-foreground tracking-tight truncate max-w-[120px]">{companyName}</h2>
            <div className="flex items-center gap-1.5">
              {isGenuine && (
                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-500/10 text-blue-500 border border-blue-500/20 uppercase tracking-wider flex items-center gap-1" title="Genuine Company">
                  <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
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
          </div>
        </div>
      </div>

      {/* Middle: Navigation Tabs (LinkedIn Style) */}
      <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar mask-fade-edges">
        {NAVIGATION_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "relative px-4 py-5 text-[13px] font-medium transition-all hover:text-teal-500 shrink-0",
              activeTab === item.id
                ? "text-teal-500 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-teal-500"
                : "text-muted-foreground"
            )}
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 sm:gap-5">
        <ThemeToggle />

        <button className="relative text-muted-foreground hover:text-foreground transition-all hover:scale-105 active:scale-95">
          <Bell className="w-5 h-5" />
        </button>

        <Link
          href="/dashboard"
          className="hidden xl:flex items-center gap-2 px-4 py-2 rounded-sm bg-muted/50 border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          ← User Dashboard
        </Link>
      </div>
    </header>
  );
}
