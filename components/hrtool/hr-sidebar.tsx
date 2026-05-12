'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Users,
  Calendar,
  FileText,
  LayoutGrid,
  BarChart3,
  Building2,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  CreditCard
} from 'lucide-react';
import { HRSection } from './hr-header';

interface HRSidebarProps {
  activeTab: HRSection;
  onTabChange: (tab: HRSection) => void;
}

const NAVIGATION_ITEMS: { id: HRSection; label: string; icon: any }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'employees', label: 'Employees', icon: Users },
  { id: 'attendance', label: 'Attendance', icon: Calendar },
  { id: 'leave', label: 'Leave', icon: FileText },
  { id: 'payroll', label: 'Payroll', icon: CreditCard },
  { id: 'performance', label: 'Performance', icon: BarChart3 },
  { id: 'organization', label: 'Organization', icon: Building2 },
];

export function HRSidebar({ activeTab, onTabChange }: HRSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <aside className={cn(
      "fixed left-0 top-16 bottom-0 z-30 bg-card border-r border-border transition-all duration-300 flex flex-col",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-4 h-6 w-6 rounded-sm bg-background border border-border flex items-center justify-center shadow-sm hover:text-[#0a66c2] hover:border-[#0a66c2] transition-all z-40"
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      <div className="flex-1 py-8 overflow-y-auto no-scrollbar">
        <nav className="px-3 space-y-1">
          {NAVIGATION_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium transition-all group relative rounded-sm",
                activeTab === item.id
                  ? "bg-[#0a66c2] text-white shadow-lg shadow-blue-500/20"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 shrink-0",
                activeTab === item.id ? "text-white" : "text-muted-foreground group-hover:text-[#0a66c2] transition-colors"
              )} />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
              {isCollapsed && activeTab === item.id && (
                <div className="absolute left-0 w-1 h-6 bg-white rounded-sm" />
              )}
            </button>
          ))}
        </nav>
      </div>

    </aside>
  );
}
