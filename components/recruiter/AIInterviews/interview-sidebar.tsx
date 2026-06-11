'use client';

import React, { useState } from 'react';
import {
  BrainCircuit, Users2, ClipboardCheck, Calendar, PieChart,
  Settings2, ChevronLeft, Menu, User, Search
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';

interface AIInterviewsSidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
  activeSection: string;
  onSectionChange: (section: string) => void;
  companyName: string;
}

const NAVIGATION_ITEMS = [
  { id: 'pipeline', label: 'Pipeline', icon: Users2 },
  { id: 'configuration', label: 'Configuration', icon: BrainCircuit },
  { id: 'evaluation', label: 'Evaluation', icon: ClipboardCheck },
  { id: 'scheduling', label: 'Scheduling', icon: Calendar },
  { id: 'analytics', label: 'Insights', icon: PieChart },
  { id: 'settings', label: 'Settings', icon: Settings2 },
];

export function AIInterviewsSidebar({
  isCollapsed, onToggle, activeSection, onSectionChange, companyName
}: AIInterviewsSidebarProps) {
  const { user } = useAuth();

  return (
    <aside
      className={cn(
        "fixed left-0 top-16 bottom-0 bg-card border-r border-border flex flex-col justify-between py-6 z-30 transition-all duration-300 ease-in-out",
        "hidden lg:flex",
        isCollapsed ? "lg:w-20" : "lg:w-64"
      )}
    >
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
        {!isCollapsed && user?.email ? (
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
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
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
                {!isCollapsed && <span className="truncate">{item.label}</span>}
                {isCollapsed && isActive && (
                  <div className="absolute left-0 w-1 h-5 bg-foreground/80 rounded-[2px]" />
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
