'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Calendar,
  FileText,
  Target,
  Key,
  Users,
  BarChart3,
  BanknoteIcon,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ClipboardCheck,
} from 'lucide-react';

export type PortalSection =
  | 'dashboard'
  | 'attendance'
  | 'leaves'
  | 'leave-balances'
  | 'leave-requests'
  | 'goals'
  | 'credentials'
  // Manager-only
  | 'team'
  | 'team-reports'
  | 'team-approvals'
  | 'team-goals'
  | 'payroll-approvals';

interface NavItem {
  id: PortalSection;
  label: string;
  icon: any;
  subItems?: { id: PortalSection; label: string }[];
  managerOnly?: boolean;
}

const EMPLOYEE_NAV: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'attendance', label: 'Attendance', icon: Calendar },
  {
    id: 'leaves',
    label: 'Leaves',
    icon: FileText,
    subItems: [
      { id: 'leave-balances', label: 'Leave balances' },
      { id: 'leave-requests', label: 'Leave requests' },
    ],
  },
  { id: 'goals', label: 'Goals', icon: Target },
  { id: 'credentials', label: 'Credentials', icon: Key },
];

const MANAGER_EXTRA_NAV: NavItem[] = [
  {
    id: 'team',
    label: 'Team',
    icon: Users,
    subItems: [
      { id: 'team-reports', label: 'Direct reports' },
      { id: 'team-approvals', label: 'Team approvals' },
    ],
  },
  { id: 'team-goals', label: 'Team goals', icon: BarChart3 },
  { id: 'payroll-approvals', label: 'Payroll approvals', icon: BanknoteIcon },
];

interface PortalSidebarProps {
  activeSection: PortalSection;
  onSectionChange: (section: PortalSection) => void;
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
  isManager?: boolean;
}

export function PortalSidebar({
  activeSection,
  onSectionChange,
  isCollapsed,
  setIsCollapsed,
  isManager = false,
}: PortalSidebarProps) {
  const navItems = isManager ? [...EMPLOYEE_NAV, ...MANAGER_EXTRA_NAV] : EMPLOYEE_NAV;

  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const toggleExpand = (itemId: string) => {
    setExpandedItems((prev) => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  // Auto-expand parent if active section is a sub-item
  useEffect(() => {
    if (activeSection.startsWith('leave')) {
      setExpandedItems((prev) => ({ ...prev, leaves: true }));
    }
    if (activeSection.startsWith('team') && activeSection !== 'team-goals') {
      setExpandedItems((prev) => ({ ...prev, team: true }));
    }
  }, [activeSection]);

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 bottom-0 z-30 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-r border-slate-200/80 dark:border-slate-800/80 transition-all duration-300 flex flex-col pt-[65px]',
        isCollapsed ? 'w-[60px]' : 'w-[220px]'
      )}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-[78px] h-6 w-6 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-md hover:text-[#0a66c2] hover:border-[#0a66c2] transition-all z-40 cursor-pointer"
      >
        {isCollapsed ? (
          <ChevronRight className="w-3 h-3" />
        ) : (
          <ChevronLeft className="w-3 h-3" />
        )}
      </button>

      {/* Navigation */}
      <div className="flex-1 py-4 overflow-y-auto scrollbar-thin">
        <nav className="px-2 space-y-0.5">
          {/* Section divider for manager items */}
          {navItems.map((item, idx) => {
            const hasSubItems = !!item.subItems;
            const isExpanded = expandedItems[item.id] || false;
            const isAnySubActive =
              hasSubItems && item.subItems?.some((sub) => activeSection === sub.id);
            const isParentActive = activeSection === item.id;
            const isNavActive = isParentActive || isAnySubActive;

            // Show a section divider before the first manager-only item
            const showDivider = item.managerOnly && idx > 0 && !navItems[idx - 1]?.managerOnly;

            return (
              <React.Fragment key={item.id}>
                {showDivider && (
                  <div className="py-2 px-3">
                    <div className="border-t border-slate-200/60 dark:border-slate-800/60" />
                    {!isCollapsed && (
                      <span className="block mt-2 text-[8px] font-extrabold uppercase tracking-[0.2em] text-slate-400/80 dark:text-slate-500/80">
                        Manager
                      </span>
                    )}
                  </div>
                )}

                {hasSubItems ? (
                  <div className="space-y-0.5">
                    <button
                      onClick={() => toggleExpand(item.id)}
                      className={cn(
                        'w-full flex items-center justify-between px-3 py-2 text-[13px] font-semibold transition-all group rounded-sm cursor-pointer',
                        isNavActive
                          ? 'text-[#0a66c2] font-bold'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200'
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <item.icon
                          className={cn(
                            'w-[18px] h-[18px] shrink-0 transition-colors',
                            isNavActive
                              ? 'text-[#0a66c2]'
                              : 'text-slate-400 dark:text-slate-500 group-hover:text-[#0a66c2]'
                          )}
                        />
                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                      </div>
                      {!isCollapsed && (
                        <ChevronDown
                          className={cn(
                            'w-3.5 h-3.5 transition-transform duration-200',
                            isExpanded && 'rotate-180',
                            isNavActive
                              ? 'text-[#0a66c2]'
                              : 'text-slate-400/70 dark:text-slate-500/70'
                          )}
                        />
                      )}
                    </button>

                    {!isCollapsed && isExpanded && (
                      <div className="pl-[30px] space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
                        {item.subItems?.map((sub) => {
                          const isActive = activeSection === sub.id;
                          return (
                            <button
                              key={sub.id}
                              onClick={() => onSectionChange(sub.id)}
                              className={cn(
                                'w-full flex items-center px-3 py-1.5 text-[12px] font-semibold rounded-sm transition-all cursor-pointer',
                                isActive
                                  ? 'text-[#0a66c2] bg-[#0a66c2]/5 font-bold'
                                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100/60 dark:hover:bg-slate-800/30'
                              )}
                            >
                              {sub.label}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => onSectionChange(item.id)}
                    className={cn(
                      'w-full flex items-center gap-2.5 px-3 py-2 text-[13px] font-semibold transition-all group relative rounded-sm cursor-pointer',
                      activeSection === item.id
                        ? 'bg-[#0a66c2] text-white shadow-lg shadow-blue-500/15'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/40 hover:text-slate-900 dark:hover:text-slate-200'
                    )}
                  >
                    <item.icon
                      className={cn(
                        'w-[18px] h-[18px] shrink-0',
                        activeSection === item.id
                          ? 'text-white'
                          : 'text-slate-400 dark:text-slate-500 group-hover:text-[#0a66c2] transition-colors'
                      )}
                    />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                    {isCollapsed && activeSection === item.id && (
                      <div className="absolute left-0 w-[3px] h-5 bg-white rounded-r-sm" />
                    )}
                  </button>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Footer branding */}
      {!isCollapsed && (
        <div className="px-4 py-3 border-t border-slate-200/60 dark:border-slate-800/60">
          <p className="text-[8px] font-bold uppercase tracking-[0.2em] text-slate-400/70 dark:text-slate-500/60 text-center">
            Powered by B2linq
          </p>
        </div>
      )}
    </aside>
  );
}
