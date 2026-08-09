'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
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
  CreditCard,
  UserCheck,
  ChevronDown,
  Files,
  Clock,
  Settings,
  Lock,
  Search,
  User,
  LogOut
} from 'lucide-react';
import { HRSection } from './hr-header';
import { useAuth } from '@/hooks/useAuth';

interface HRSidebarProps {
  activeTab: HRSection;
  onTabChange: (tab: HRSection) => void;
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
}

interface NavItem {
  id: HRSection;
  label: string;
  icon: any;
  subItems?: { id: HRSection; label: string }[];
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const NAVIGATION_SECTIONS: NavSection[] = [
  {
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'onboarding', label: 'Onboarding', icon: UserCheck },
    ]
  },
  {
    title: 'Core HR',
    items: [
      {
        id: 'employees',
        label: 'Employees',
        icon: Users,
        subItems: [
          { id: 'employees-managers', label: 'Managers' },
          { id: 'employees', label: 'Employees' },
        ]
      },
      {
        id: 'attendance',
        label: 'Attendance',
        icon: Calendar,
        subItems: [
          { id: 'attendance-activity', label: 'Attendance Activity' },
          { id: 'attendance-requests', label: 'Attendance Requests' },
          { id: 'attendance-hour-account', label: 'Hour Account' },
          { id: 'attendance-work-records', label: 'Work Records' },
          { id: 'attendance-late-early', label: 'Late Come Early Out' },
          { id: 'attendance-settings', label: 'Attendance Settings' }
        ]
      },
      {
        id: 'leave',
        label: 'Leave',
        icon: FileText,
        subItems: [
          { id: 'leave-company', label: 'Company Leaves' },
          { id: 'leave-requests', label: 'Leave Requests' },
          { id: 'leave-pending', label: 'Pending' },
          { id: 'leave-approved', label: 'Approved' }
        ]
      },
    ]
  },
  {
    title: 'Finance & Tools',
    items: [
      {
        id: 'payroll',
        label: 'Payroll',
        icon: CreditCard,
        subItems: [
          { id: 'payroll-dashboard', label: 'Dashboard' },
          { id: 'payroll-salary-structures', label: 'Salary Structures' },
          { id: 'payroll-runs', label: 'Payroll Runs' },
          { id: 'payroll-approvals', label: 'Payroll Approvals' },
          { id: 'payroll-payslips', label: 'Payslips' },
          { id: 'payroll-tax-configurations', label: 'Tax Configuration' },
          { id: 'payroll-adjustments', label: 'Bonuses & Adjustments' },
          { id: 'payroll-reimbursements', label: 'Reimbursements' },
          { id: 'payroll-reports', label: 'Reports & Analytics' },
          { id: 'payroll-settings', label: 'Settings' }
        ]
      },
      { id: 'templates', label: 'Templates', icon: Files },
      {
        id: 'performance',
        label: 'Performance',
        icon: BarChart3,
        subItems: [
          { id: 'performance-dashboard', label: 'Overview' },
          { id: 'performance-kpi', label: 'Create goal' },
          { id: 'performance-goals', label: 'assign goal' },
          { id: 'performance-appraisal', label: 'Reviews' },
          { id: 'performance-logs', label: 'Daily Activity' },
          { id: 'performance-analytics', label: 'Insights' },
          { id: 'performance-ai-insights', label: 'Agent analysis' },
        ]
      },
    ]
  },
  {
    title: 'System',
    items: [
      {
        id: 'scheduling' as any,
        label: 'Scheduling',
        icon: Clock,
        subItems: [
          { id: 'agent-scheduling', label: 'Agent Scheduling' }
        ]
      },
      {
        id: 'settings' as any,
        label: 'Settings',
        icon: Settings,
        subItems: [
          { id: 'agent-settings', label: 'Agent Settings' }
        ]
      },
      { id: 'organization', label: 'Organization', icon: Building2 },
    ]
  }
];

export function HRSidebar({
  activeTab,
  onTabChange,
  isCollapsed: controlledIsCollapsed,
  setIsCollapsed: controlledSetIsCollapsed
}: HRSidebarProps) {
  const router = useRouter();
  const { user, userSubscription } = useAuth();
  const planPrice = (userSubscription?.status === 'active' && userSubscription?.plan_details)
    ? Number(userSubscription.plan_details.price) : 0;
  const isAgentLocked = planPrice < 18000;

  const [localIsCollapsed, setLocalIsCollapsed] = useState(false);

  const isCollapsed = controlledIsCollapsed !== undefined ? controlledIsCollapsed : localIsCollapsed;
  const setIsCollapsed = controlledSetIsCollapsed !== undefined ? controlledSetIsCollapsed : setLocalIsCollapsed;

  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    employees: false,
    leave: false,
    attendance: false,
    payroll: false,
    scheduling: false,
    settings: false,
    performance: false,
  });

  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  // Auto-expand if active tab is a sub-item
  React.useEffect(() => {
    if (activeTab === 'employees' || activeTab === 'employees-managers') {
      setExpandedItems(prev => ({ ...prev, employees: true }));
    }
    if (activeTab.startsWith('leave')) {
      setExpandedItems(prev => ({ ...prev, leave: true }));
    }
    if (activeTab.startsWith('attendance')) {
      setExpandedItems(prev => ({ ...prev, attendance: true }));
    }
    if (activeTab.startsWith('payroll-')) {
      setExpandedItems(prev => ({ ...prev, payroll: true }));
    }
    if (activeTab === 'agent-settings') {
      setExpandedItems(prev => ({ ...prev, settings: true }));
    }
    if (activeTab === 'agent-scheduling') {
      setExpandedItems(prev => ({ ...prev, scheduling: true }));
    }
    if (activeTab.startsWith('performance-')) {
      setExpandedItems(prev => ({ ...prev, performance: true }));
    }
  }, [activeTab]);

  const handleNavigation = (tabId: HRSection) => {
    if (tabId.startsWith('payroll-')) {
      const subRoute = tabId.replace('payroll-', '');
      router.push(`/Hrtools/payroll/${subRoute}`);
    } else if (tabId === 'agent-settings') {
      router.push('/Hrtools/agentsettings');
    } else if (tabId === 'agent-scheduling') {
      router.push('/Hrtools/scheduling');
    } else {
      router.push(`/Hrtools?tab=${tabId}`);
    }
    onTabChange(tabId);
  };

  return (
    <aside className={cn(
      "fixed left-0 top-16 bottom-0 z-30 bg-card border-r border-border transition-all duration-300 flex flex-col",
      isCollapsed ? "w-16" : "w-56"
    )}>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-4 h-6 w-6 rounded-sm bg-background border border-border flex items-center justify-center shadow-sm hover:text-foreground hover:border-muted-foreground/60 transition-all z-40 cursor-pointer"
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Profile Header section similar to mockup */}
      <div className="border-b border-border shrink-0">
        {!isCollapsed && user?.email ? (
          <div className="px-5 py-4 flex items-center gap-2.5 min-w-0">
            <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center shrink-0 border border-border">
              <User className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
            <span className="text-xs font-medium text-foreground/80 truncate select-none leading-none">
              {user.email}
            </span>
          </div>
        ) : (
          <div className="py-4 flex justify-center">
            <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center border border-border">
              <User className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 py-4 overflow-y-auto no-scrollbar">
        {/* Quick Search Element */}
        {/* {!isCollapsed && (
          <div className="px-3 mb-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-muted/40 border border-border rounded-[4px] text-xs text-muted-foreground hover:bg-muted/60 transition-all cursor-pointer">
              <Search className="w-3.5 h-3.5 shrink-0 opacity-60" />
              <span className="truncate">Quick search...</span>
              <span className="ml-auto text-[9px] font-mono opacity-50 px-1 py-0.5 bg-background border border-border rounded-[2px]">Ctrl K</span>
            </div>
          </div>
        )} */}

        <nav className="px-3 space-y-1">
          {NAVIGATION_SECTIONS.map((section, sectionIdx) => (
            <div key={sectionIdx} className="space-y-0.5">
              {section.title && !isCollapsed && (
                <div className="px-3 pt-4 pb-1 text-[10px] font-bold text-muted-foreground/60 uppercase tracking-wider select-none">
                  {section.title}
                </div>
              )}
              {section.items.map((item) => {
                const hasSubItems = !!item.subItems;
                const isExpanded = expandedItems[item.id] || false;

                // Check active sub items
                const isAnySubActive = hasSubItems && item.subItems?.some((sub) => activeTab === sub.id);
                const isParentDirectlyActive = activeTab === item.id;
                const isNavParentActive = isParentDirectlyActive || isAnySubActive;

                if (hasSubItems) {
                  return (
                    <div key={item.id} className="space-y-0.5">
                      <button
                        onClick={() => toggleExpand(item.id)}
                        data-agent={`nav-parent-${item.id}`}
                        className={cn(
                          "w-full flex items-center justify-between px-3 py-1.5 text-[13px] font-medium transition-all group rounded-[4px] cursor-pointer",
                          isNavParentActive
                            ? "bg-secondary text-foreground font-semibold"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                        )}
                      >
                        <div className="flex items-center gap-2.5">
                          <item.icon className={cn(
                            "w-4 h-4 shrink-0 transition-colors",
                            isNavParentActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                          )} />
                          {!isCollapsed && <span className="truncate">{item.label}</span>}
                        </div>
                        {!isCollapsed && (
                          <ChevronRight className={cn(
                            "w-3.5 h-3.5 transition-transform duration-200 opacity-60",
                            isExpanded && "rotate-90",
                            isNavParentActive ? "text-foreground" : "text-muted-foreground/70 group-hover:text-foreground"
                          )} />
                        )}
                      </button>

                      {!isCollapsed && isExpanded && (
                        <div className="ml-5 pl-4 border-l border-border/60 space-y-0.5 animate-in fade-in slide-in-from-top-1 duration-200">
                          {item.subItems?.map((sub) => {
                            const isActive = activeTab === sub.id;
                            const isSubLocked = (sub.id === 'agent-scheduling' || sub.id === 'agent-settings') && isAgentLocked;
                            return (
                              <button
                                key={sub.id}
                                onClick={() => handleNavigation(sub.id)}
                                data-agent={`nav-tab-hr-sub-${sub.id}`}
                                className={cn(
                                  "w-full flex items-center justify-between px-2.5 py-1 text-xs font-medium rounded-[4px] transition-all cursor-pointer",
                                  isActive
                                    ? "bg-secondary text-foreground font-semibold"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted/30"
                                )}
                              >
                                <span className="truncate">{sub.label}</span>
                                {isSubLocked && <Lock className="w-3 h-3 text-amber-500 shrink-0 ml-1" />}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavigation(item.id)}
                    data-agent={`nav-tab-hr-${item.id}`}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-1.5 text-[13px] font-medium transition-all group relative rounded-[4px] cursor-pointer",
                      activeTab === item.id
                        ? "bg-secondary text-foreground font-semibold"
                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                    )}
                  >
                    <item.icon className={cn(
                      "w-4 h-4 shrink-0 transition-colors",
                      activeTab === item.id ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                    )} />
                    {!isCollapsed && <span className="truncate">{item.label}</span>}
                    {isCollapsed && activeTab === item.id && (
                      <div className="absolute left-0 w-1 h-5 bg-foreground/80 rounded-[2px]" />
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
      </div>

      {/* Bottom Section */}
      <div className={cn("px-3 py-4 space-y-2 mt-auto border-t border-border shrink-0", isCollapsed ? "px-2" : "px-3")}>
        <Link
          href="/recruiter/login?redirect=/Hrtools"
          className={cn(
            "flex items-center justify-center gap-2 w-full transition-all rounded-[4px] bg-muted/50 border border-border text-rose-500 py-2 text-xs font-bold hover:bg-rose-500/10 active:scale-95 cursor-pointer",
            isCollapsed ? "px-0" : "px-2"
          )}
        >
          <LogOut className="h-3.5 w-3.5 text-rose-500" />
          {!isCollapsed && <span className="animate-in fade-in duration-300">Exit App</span>}
        </Link>
      </div>
    </aside>
  );
}
