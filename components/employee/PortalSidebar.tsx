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
  ChevronDown,
  Menu,
  ArrowLeftRight,
  LogOut,
  User,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import Link from 'next/link';


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
  const { logout, user } = useAuth();
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
        "fixed left-0 top-16 bottom-0 bg-card border-r border-border flex flex-col justify-between py-6 z-30 transition-all duration-300 ease-in-out",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Desktop Collapse Toggle */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
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

      {/* Navigation */}
      <div className="flex-1 py-4 overflow-y-auto no-scrollbar overflow-x-hidden space-y-4">
        <nav className="px-3 space-y-1">
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
                    <div className="border-t border-border/60" />
                    {!isCollapsed && (
                      <span className="block mt-2 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider select-none">
                        Manager Tools
                      </span>
                    )}
                  </div>
                )}

                {hasSubItems ? (
                  <div className="space-y-1">
                    <button
                      onClick={() => toggleExpand(item.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-1.5 text-[13px] font-medium transition-all group rounded-[4px] cursor-pointer",
                        isNavActive
                          ? "bg-secondary text-foreground font-semibold"
                          : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                      )}
                    >
                      <div className="flex items-center gap-2.5">
                        <item.icon
                          className={cn(
                            "w-4 h-4 shrink-0 transition-colors",
                            isNavActive
                              ? "text-foreground"
                              : "text-muted-foreground group-hover:text-foreground"
                          )}
                        />
                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                      </div>
                      {!isCollapsed && (
                        <ChevronDown
                          className={cn(
                            "w-3.5 h-3.5 transition-transform duration-200",
                            isExpanded && "rotate-180",
                            isNavActive
                              ? "text-foreground"
                              : "text-muted-foreground/60 group-hover:text-foreground"
                          )}
                        />
                      )}
                    </button>

                    {!isCollapsed && isExpanded && (
                      <div className="pl-[26px] space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                        {item.subItems?.map((sub) => {
                          const isActive = activeSection === sub.id;
                          return (
                            <button
                              key={sub.id}
                              onClick={() => onSectionChange(sub.id)}
                              className={cn(
                                "w-full flex items-center px-3 py-1 text-[12.5px] font-medium rounded-[4px] transition-all cursor-pointer",
                                isActive
                                  ? "text-foreground bg-secondary/70 font-semibold"
                                  : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
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
                      "w-full flex items-center gap-2.5 px-3 py-1.5 text-[13px] font-medium transition-all group relative rounded-[4px] cursor-pointer",
                      activeSection === item.id
                        ? "bg-secondary text-foreground font-semibold"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <item.icon
                      className={cn(
                        "w-4 h-4 shrink-0 transition-colors",
                        activeSection === item.id
                          ? "text-foreground"
                          : "text-muted-foreground group-hover:text-foreground"
                      )}
                    />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                    {isCollapsed && activeSection === item.id && (
                      <div className="absolute left-0 w-1 h-5 bg-foreground/80 rounded-[2px]" />
                    )}
                  </button>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className={cn("px-4 space-y-3 transition-all mt-auto", isCollapsed ? "px-2" : "px-4")}>
        {/* Switch to user dashboard */}
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center justify-center gap-2 w-full transition-all rounded-[4px] bg-muted/50 border border-border text-muted-foreground py-2 text-xs font-semibold hover:bg-muted hover:text-foreground active:scale-95",
            isCollapsed ? "px-0" : "px-2"
          )}
        >
          <ArrowLeftRight className="h-3.5 w-3.5" />
          {!isCollapsed && <span className="animate-in fade-in duration-300">Switch to User</span>}
        </Link>

        {!isCollapsed && (
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
