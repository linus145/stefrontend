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
  ClipboardCheck
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { ThemeToggle } from '@/components/dashboard/theme-toggle';

interface InterviewHeaderProps {
  companyName: string;
  activeSection: string;
  onSectionChange: (section: string) => void;
}

export function AIInterviewsHeader({ companyName, activeSection, onSectionChange }: InterviewHeaderProps) {
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
          <div className="w-7 h-7 rounded-sm bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
            <BrainCircuit className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="hidden sm:block">
            <h2 className="text-sm font-semibold text-foreground tracking-tight truncate max-w-[150px]">{companyName}</h2>
            <p className="text-[10px] text-blue-500 font-semibold leading-none">Interview engine</p>
          </div>
        </div>
      </div>

      {/* Middle: Specialized Navigation (Matching Recruiter Style) */}
      <nav className="hidden md:flex items-center gap-1 h-full">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onSectionChange(item.id)}
            className={cn(
              "relative px-4 h-full text-[13px] font-medium transition-all hover:text-blue-500 shrink-0",
              activeSection === item.id
                ? "text-blue-500 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-500"
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
        <ThemeToggle />

        <div className="flex items-center gap-2 sm:gap-4">
          <button className="relative text-muted-foreground hover:text-foreground transition-all hover:scale-105 active:scale-95">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-rose-500 rounded-full border border-background" />
          </button>
        </div>

        <div className="w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center overflow-hidden">
          <Users2 className="w-4 h-4 text-muted-foreground opacity-50" />
        </div>
      </div>
    </header>
  );
}
