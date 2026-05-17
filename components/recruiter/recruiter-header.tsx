'use client';

import { useState } from 'react';
import { Menu, Bell, Building2, MessageSquare, ChevronDown, ExternalLink, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/dashboard/theme-toggle';
import Link from 'next/link';
import { RecruiterSection } from './recruiter-sidebar';
import { NotificationPopover } from '@/components/dashboard/notifications/notification-popover';
import { AgentUIController } from '@/agent/ui/AgentUIController';

interface RecruiterHeaderProps {
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
  companyName,
  isApproved,
  isGenuine,
  activeTab,
  onTabChange,
  onMobileMenuToggle
}: RecruiterHeaderProps) {
  const [showMore, setShowMore] = useState(false);

  return (
    <header className={cn(
      "fixed top-0 transition-all duration-300 ease-in-out flex items-center justify-between px-4 sm:px-6 lg:px-8 z-40",
      "h-16 bg-background/80 backdrop-blur-md border-b border-border",
      "left-0 right-0 lg:left-0",
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
          <div className="w-7 h-7 rounded-sm bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center lg:hidden">
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
      <div className="flex items-center gap-1 h-full min-w-0 flex-1 justify-center">
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar mask-fade-edges h-full">
          {NAVIGATION_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              data-agent={`nav-tab-${item.id}`}
              className={cn(
                "relative px-4 h-full text-[13px] font-medium transition-all hover:text-blue-500 shrink-0 flex items-center justify-center",
                activeTab === item.id
                  ? "text-blue-500 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-500"
                  : "text-muted-foreground",
                item.id === 'company' && "hidden lg:inline-flex"
              )}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* More Dropdown (Moved outside nav to avoid clipping by overflow-x-auto) */}
        <div className="relative h-full flex items-center shrink-0">
          <button
            onClick={() => setShowMore(!showMore)}
            data-agent="nav-more-button"
            className={cn(
              "flex items-center gap-1.5 px-4 h-full text-[13px] font-medium transition-all hover:text-blue-500 shrink-0 text-muted-foreground",
              showMore && "text-blue-500"
            )}
          >
            More
            <ChevronDown className={cn("w-4 h-4 transition-transform duration-200", showMore && "rotate-180")} />
          </button>

          {showMore && (
            <div className="absolute top-[calc(100%-4px)] right-0 w-56 p-2 bg-card border border-border rounded-sm shadow-xl z-50 animate-in fade-in slide-in-from-top-2">
              {/* Company Profile - Mobile Only */}
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { onTabChange('company'); setShowMore(false); }}
                className="flex lg:hidden items-center justify-between w-full px-3 py-2.5 rounded-sm hover:bg-muted group transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-muted-foreground group-hover:text-blue-500" />
                  <span className="text-[13px] font-medium text-foreground">Company Profile</span>
                </div>
              </button>
              <a
                href="/recruiter/AIInterviews"
                target="_blank"
                rel="noopener noreferrer"
                onMouseDown={(e) => e.preventDefault()} // Prevent blur before click
                data-agent="nav-link-interview-pipeline"
                className="flex items-center justify-between px-3 py-2.5 rounded-sm hover:bg-muted group transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <LayoutGrid className="w-4 h-4 text-muted-foreground group-hover:text-blue-500" />
                  <span className="text-[13px] font-medium">Interview Pipeline</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>

              <a
                href="/Hrtools"
                target="_blank"
                rel="noopener noreferrer"
                onMouseDown={(e) => e.preventDefault()}
                className="flex items-center justify-between px-3 py-2.5 rounded-sm hover:bg-muted group transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-muted-foreground group-hover:text-emerald-500" />
                  <span className="text-[13px] font-medium">HR Tool</span>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 sm:gap-5">
        <ThemeToggle />

        <div className="flex items-center gap-2 sm:gap-4">
          <button onClick={() => onTabChange('messages')} className="relative text-muted-foreground hover:text-foreground transition-all hover:scale-105 active:scale-95" title="Messages">
            <MessageSquare className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-blue-500 rounded-full border border-background"></span>
          </button>

          <NotificationPopover currentDashboard="RECRUITER" />
        </div>

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
          href="/dashboard"
          className="hidden xl:flex items-center gap-2 px-4 py-2 rounded-sm bg-muted/50 border border-border text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          ← User Dashboard
        </Link>
      </div>
    </header>
  );
}
