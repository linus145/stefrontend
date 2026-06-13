'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Home, Network as NetworkIcon, MessageSquare, Briefcase, Newspaper, Bell, Settings,
  ChevronLeft, Menu, X, ArrowLeftRight, LogOut, User, Coins, Sun, Moon, Sparkles, Building2,
  BookOpen
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import { useDashboardTheme } from '@/context/DashboardThemeContext';
import { useQuery } from '@tanstack/react-query';
import { creditsService } from '@/services/credits.service';
import { notificationService } from '@/services/notification.service';
import { toast } from 'sonner';

export type DashboardSection = 'dashboard' | 'Profile' | 'messages' | 'network' | 'settings' | 'jobs' | 'news' | 'hire' | 'create-post' | 'notifications' | 'premium' | 'credits' | 'userblogs';

interface LeftSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  activeSection: DashboardSection;
  onSectionChange: (section: DashboardSection, userId?: string | null) => void;
  isMobileOpen?: boolean;
  onMobileClose?: () => void;
}

const NAVIGATION_ITEMS: { id: DashboardSection; label: string; icon: any }[] = [
  { id: 'dashboard', label: 'Home', icon: Home },
  { id: 'jobs', label: 'Jobs', icon: Briefcase },
  { id: 'news', label: 'News', icon: Newspaper },
  { id: 'network', label: 'Network', icon: NetworkIcon },
  // { id: 'userblogs', label: 'Blogs', icon: BookOpen },
  { id: 'messages', label: 'Messages', icon: MessageSquare },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'settings', label: 'Settings', icon: Settings },
];

export function LeftSidebar({
  isCollapsed,
  onToggle,
  activeSection,
  onSectionChange,
  isMobileOpen,
  onMobileClose
}: LeftSidebarProps) {
  const { logout, user, userSubscription } = useAuth();
  const { isDark, toggleTheme } = useDashboardTheme();
  const router = useRouter();

  const isPremium = !!(userSubscription &&
    userSubscription.status === 'active' &&
    userSubscription.plan_details &&
    Number(userSubscription.plan_details.price) > 0);

  const { data: creditsData } = useQuery({
    queryKey: ['userCredits'],
    queryFn: () => creditsService.getBalance(),
    refetchInterval: 30000,
  });
  const creditBalance = creditsData?.data?.balance ?? 0;

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationService.getNotifications('USER'),
    refetchInterval: 30000,
  });
  const unreadCount = notifications?.filter((n: any) => !n.is_read).length || 0;

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 bottom-0 bg-card border-r border-border flex flex-col py-4 z-30 transition-all duration-300 ease-in-out",
        "hidden lg:flex",
        isCollapsed ? "lg:w-20" : "lg:w-60",
        isMobileOpen && "!flex w-72 shadow-2xl bg-card"
      )}
    >
      {/* Mobile Close Button */}
      <button
        onClick={onMobileClose}
        className="absolute top-4 right-4 lg:hidden w-8 h-8 rounded-[4px] bg-muted/50 border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all"
      >
        <X className="h-4 w-4" />
      </button>

      {/* Collapse Toggle Button (Desktop only) */}
      <button
        onClick={onToggle}
        className="absolute -right-3 top-20 hidden lg:flex h-6 w-6 items-center justify-center rounded-full bg-background border border-border text-muted-foreground hover:text-foreground transition-all z-50 shadow-sm hover:scale-110 active:scale-95 cursor-pointer"
      >
        {isCollapsed ? <Menu className="h-3 w-3" /> : <ChevronLeft className="h-3 w-3" />}
      </button>

      {/* User profile Section at top */}
      <div className="shrink-0 pb-3 border-b border-border/60">
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

      {/* Navigation Links Area */}
      <div className="flex-1 py-4 overflow-y-auto no-scrollbar overflow-x-hidden space-y-4 min-h-0">
        <nav className="px-3 space-y-1">
          {NAVIGATION_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSectionChange(item.id);
                  if (onMobileClose) onMobileClose();
                }}
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

                {/* Notification Badge */}
                {item.id === 'notifications' && unreadCount > 0 && (
                  <span className={cn(
                    "bg-rose-500 text-white rounded-full flex items-center justify-center font-bold",
                    isCollapsed && !isMobileOpen
                      ? "absolute top-1 right-2 w-3.5 h-3.5 text-[8px]"
                      : "ml-auto px-1.5 py-0.5 min-w-[18px] h-4 text-[9px] text-center"
                  )}>
                    {unreadCount}
                  </span>
                )}

                {isCollapsed && !isMobileOpen && isActive && (
                  <div className="absolute left-0 w-1 h-5 bg-foreground/80 rounded-[2px]" />
                )}
              </button>
            );
          })}

          {/* Workspace Tools Divider */}
          <div className="h-[1px] bg-border/60 my-3 mx-2" />

          {/* Workspace Tools Heading */}
          {(!isCollapsed || isMobileOpen) && (
            <div className="px-3 pb-1.5 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider select-none">
              Workspace Tools
            </div>
          )}

          {/* External Links */}
          <a
            href="/recruiter"
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (!isPremium) {
                e.preventDefault();
                toast.error("Upgrade to Premium", {
                  description: "You need an active premium subscription to access the recruiter platform and AI hiring features."
                });
              }
            }}
            className="w-full flex items-center gap-2.5 px-3 py-1.5 text-[13px] font-medium transition-all group rounded-[4px] text-muted-foreground hover:bg-muted/50 hover:text-foreground cursor-pointer"
          >
            <Sparkles className="w-4 h-4 shrink-0 text-muted-foreground group-hover:text-[#0a66c2] transition-colors" />
            {(!isCollapsed || isMobileOpen) && <span className="truncate">Hire with AI</span>}
          </a>


        </nav>
      </div>

      {/* Bottom Section */}
      <div className={cn("px-3 space-y-2 transition-all mt-auto shrink-0", (isCollapsed && !isMobileOpen) ? "px-2" : "px-3")}>

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

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className={cn(
            "flex items-center gap-2 w-full transition-all rounded-[4px] text-muted-foreground hover:text-foreground text-xs font-semibold active:scale-95 py-1.5 cursor-pointer",
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

        {/* Switch to Recruiter */}
        <button
          onClick={() => {
            if (!isPremium) {
              toast.error("Upgrade to Premium", {
                description: "You need an active premium subscription to access the recruiter platform."
              });
            } else {
              router.push('/recruiter');
            }
          }}
          className={cn(
            "flex items-center justify-center gap-2 w-full transition-all rounded-[4px] bg-muted/50 border border-border text-muted-foreground py-2 text-xs font-semibold hover:bg-muted hover:text-foreground active:scale-95 cursor-pointer",
            (isCollapsed && !isMobileOpen) ? "px-0" : "px-2"
          )}
        >
          <ArrowLeftRight className="h-3.5 w-3.5" />
          {(!isCollapsed || isMobileOpen) && <span className="animate-in fade-in duration-300">Switch to Recruiter</span>}
        </button>

        {(!isCollapsed || isMobileOpen) && (
          <div className="flex flex-col gap-1 pt-2 border-t border-border">
            <button
              onClick={() => logout()}
              className="flex items-center gap-2.5 px-2 py-1.5 text-muted-foreground hover:text-destructive transition-all text-xs font-medium group cursor-pointer"
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
