'use client';

import { useState } from 'react';
import { Menu, Bell, Building2, MessageSquare, ChevronDown, LayoutGrid, Users, Calendar, FileText, BarChart3, Settings, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/dashboard/theme-toggle';
import Link from 'next/link';
import { NotificationPopover } from '@/components/dashboard/notifications/notification-popover';
import { AgentUIController } from '@/agent/ui/AgentUIController';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { creditsService } from '@/services/credits.service';

export type HRSection =
  | 'dashboard'
  | 'employees'
  | 'employees-managers'
  | 'onboarding'
  | 'attendance'
  | 'attendance-requests'
  | 'attendance-hour-account'
  | 'attendance-work-records'
  | 'attendance-activity'
  | 'attendance-late-early'
  | 'attendance-settings'
  | 'leave'
  | 'leave-requests'
  | 'leave-pending'
  | 'leave-approved'
  | 'leave-company'
  | 'payroll'
  | 'payroll-dashboard'
  | 'payroll-runs'
  | 'payroll-salary-structures'
  | 'payroll-payslips'
  | 'payroll-reimbursements'
  | 'payroll-tax-configurations'
  | 'payroll-adjustments'
  | 'payroll-approvals'
  | 'payroll-reports'
  | 'payroll-settings'
  | 'agent-settings'
  | 'agent-scheduling'
  | 'scheduling'
  | 'settings'
  | 'performance'
  | 'performance-dashboard'
  | 'performance-kpi'
  | 'performance-goals'
  | 'performance-appraisal'
  | 'performance-analytics'
  | 'performance-ai-insights'
  | 'performance-logs'
  | 'organization'
  | 'templates';

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
  const { userSubscription } = useAuth();
  const hasPremium = userSubscription && Number(userSubscription.plan_details?.price) >= 12000 && userSubscription.status === 'active';

  const { data: creditsData } = useQuery({
    queryKey: ['userCredits'],
    queryFn: () => creditsService.getBalance(),
    refetchInterval: 30000,
  });
  const creditBalance = creditsData?.data?.balance ?? 0;

  const handleAgentClick = () => {
    if (!hasPremium) {
      toast.error("Premium feature locked", {
        description: "Please activate your premium subscription to unlock AI Recruiting Agent and agentic flows."
      });
      return;
    }
    AgentUIController.getInstance().toggleSidebar();
  };

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
        <div
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 text-xs font-bold shadow-sm shrink-0"
          title="AI Credits Balance"
        >
          <Coins className="w-4 h-4 text-amber-500 shrink-0" />
          <span>{creditBalance} Credits</span>
        </div>
        <NotificationPopover currentDashboard="HR" dotColorClass="bg-[#0a66c2]" />

        {/* AI Agent Header Button */}
        <button
          onClick={handleAgentClick}
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
            className={cn(
              "w-5 h-5 group-hover:rotate-12 transition-transform text-blue-500 dark:text-blue-400",
              hasPremium && "high-glow-pulse"
            )}
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
