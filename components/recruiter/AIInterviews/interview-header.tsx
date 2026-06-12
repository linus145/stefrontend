'use client';

import React from 'react';
import {
  BrainCircuit,
  ArrowLeft,
  Bell,
  Calendar,
  Settings2,
  Users2,
  PieChart,
  ClipboardCheck,
  Coins,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/dashboard/theme-toggle';
import { NotificationPopover } from '@/components/dashboard/notifications/notification-popover';
import { AgentUIController } from '@/agent/ui/AgentUIController';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { useQuery } from '@tanstack/react-query';
import { creditsService } from '@/services/credits.service';

interface InterviewHeaderProps {
  companyName: string;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function AIInterviewsHeader({ companyName, activeSection, onSectionChange }: InterviewHeaderProps) {
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

  const navItems = [
    { id: 'pipeline', label: 'Pipeline', icon: Users2 },
    { id: 'configuration', label: 'Configuration', icon: BrainCircuit },
    { id: 'evaluation', label: 'Evaluation', icon: ClipboardCheck },
    { id: 'scheduling', label: 'Scheduling', icon: Calendar },
    { id: 'analytics', label: 'Insights', icon: PieChart },
    { id: 'settings', label: 'Settings', icon: Settings2 },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-background/80 backdrop-blur-md border-b border-border z-50 flex items-center justify-between px-4 sm:px-6 lg:px-8">
      {/* Left: Branding & Back */}
      <div className="flex items-center gap-3">
        <Link
          href="/recruiter"
          className="w-9 h-9 flex items-center justify-center rounded-sm bg-muted/50 border border-border text-muted-foreground hover:text-foreground transition-all active:scale-95 group"
          title="Back to Dashboard"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-0.5 transition-transform" />
        </Link>

        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-sm bg-gradient-to-br from-[#0a66c2] to-[#004182] flex items-center justify-center">
            <BrainCircuit className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="hidden sm:block">
            <h2 className="text-sm font-semibold text-foreground tracking-tight truncate max-w-[150px]">{companyName}</h2>
            <p className="text-[10px] text-[#0a66c2] font-semibold leading-none">Interview engine</p>
          </div>
        </div>
      </div>

      {/* Middle: Specialized Navigation (Matching Recruiter Style) - Hidden as we use the sidebar now */}
      <nav className="hidden">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={cn(
              "relative px-4 h-full text-[13px] font-medium transition-all hover:text-[#0a66c2] shrink-0",
              activeSection === item.id
                ? "text-[#0a66c2] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#0a66c2]"
                : "text-muted-foreground"
            )}
          >
            <div className="flex items-center gap-2">
              <item.icon className="w-4 h-4 opacity-70 group-hover:opacity-100" />
              {item.label}
            </div>
          </button>
        ))}
      </nav>

      {/* Right: Actions */}
      <div className="flex items-center gap-3 sm:gap-5">
        <NotificationPopover currentDashboard="INTERVIEW" />

        {/* AI Agent Header Button */}
        <button
          onClick={handleAgentClick}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted rounded-sm border border-border/80 shadow-sm transition-all active:scale-95 group shrink-0 cursor-pointer"
          title="AI Recruiting Agent"
        >
          <Sparkles className="w-3.5 h-3.5 text-muted-foreground group-hover:text-[#0a66c2] transition-colors" />
          <span className="text-[#0a66c2] font-bold">AI Agent</span>
        </button>
      </div>
    </header>
  );
}
