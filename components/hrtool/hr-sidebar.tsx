'use client';

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
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
  Settings
} from 'lucide-react';
import { HRSection } from './hr-header';

interface HRSidebarProps {
  activeTab: HRSection;
  onTabChange: (tab: HRSection) => void;
  isCollapsed?: boolean;
  setIsCollapsed?: (collapsed: boolean) => void;
}

const NAVIGATION_ITEMS: { id: HRSection; label: string; icon: any; subItems?: { id: HRSection; label: string }[] }[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'onboarding', label: 'Onboarding', icon: UserCheck },
  { id: 'employees', label: 'Employees', icon: Users },
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
  {
    id: 'payroll',
    label: 'Payroll',
    icon: CreditCard,
    subItems: [
      { id: 'payroll-dashboard', label: 'Dashboard' },
      { id: 'payroll-salary-structures', label: 'Salary Structures' },
      { id: 'payroll-tax-configurations', label: 'Tax Configuration' },
      { id: 'payroll-adjustments', label: 'Bonuses & Adjustments' },
      { id: 'payroll-reimbursements', label: 'Reimbursements' },
      { id: 'payroll-runs', label: 'Payroll Runs' },
      { id: 'payroll-approvals', label: 'Payroll Approvals' },
      { id: 'payroll-payslips', label: 'Payslips' },
      { id: 'payroll-reports', label: 'Reports & Analytics' },
      { id: 'payroll-settings', label: 'Settings' }
    ]
  },
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
  { id: 'templates', label: 'Templates', icon: Files },
  { id: 'performance', label: 'Performance', icon: BarChart3 },
  { id: 'organization', label: 'Organization', icon: Building2 },
];

export function HRSidebar({ 
  activeTab, 
  onTabChange,
  isCollapsed: controlledIsCollapsed,
  setIsCollapsed: controlledSetIsCollapsed
}: HRSidebarProps) {
  const router = useRouter();
  const [localIsCollapsed, setLocalIsCollapsed] = useState(false);
  
  const isCollapsed = controlledIsCollapsed !== undefined ? controlledIsCollapsed : localIsCollapsed;
  const setIsCollapsed = controlledSetIsCollapsed !== undefined ? controlledSetIsCollapsed : setLocalIsCollapsed;
  
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({
    leave: false,
    attendance: false,
    payroll: false,
    scheduling: false,
    settings: false,
  });

  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId],
    }));
  };

  // Auto-expand if active tab is a sub-item
  React.useEffect(() => {
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
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-4 h-6 w-6 rounded-sm bg-background border border-border flex items-center justify-center shadow-sm hover:text-[#0a66c2] hover:border-[#0a66c2] transition-all z-40 cursor-pointer"
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      <div className="flex-1 py-8 overflow-y-auto no-scrollbar">
        <nav className="px-3 space-y-1">
          {NAVIGATION_ITEMS.map((item) => {
            const hasSubItems = !!item.subItems;
            const isExpanded = expandedItems[item.id] || false;
            
            // Check active sub items
            const isAnySubActive = hasSubItems && item.subItems?.some((sub) => activeTab === sub.id);
            const isParentDirectlyActive = activeTab === item.id;
            const isNavParentActive = isParentDirectlyActive || isAnySubActive;

            if (hasSubItems) {
              return (
                <div key={item.id} className="space-y-1">
                  <button
                    onClick={() => toggleExpand(item.id)}
                    data-agent={`nav-parent-${item.id}`}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 text-sm font-medium transition-all group rounded-sm cursor-pointer",
                      isNavParentActive
                        ? "bg-blue-50/5 text-[#0a66c2] font-semibold"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={cn(
                        "w-5 h-5 shrink-0 transition-colors",
                        isNavParentActive ? "text-[#0a66c2]" : "text-muted-foreground group-hover:text-[#0a66c2]"
                      )} />
                      {!isCollapsed && <span className="truncate">{item.label}</span>}
                    </div>
                    {!isCollapsed && (
                      <ChevronDown className={cn(
                        "w-4 h-4 transition-transform duration-200",
                        isExpanded && "rotate-180",
                        isParentDirectlyActive ? "text-white" : isAnySubActive ? "text-[#0a66c2]" : ""
                      )} />
                    )}
                  </button>

                  {!isCollapsed && isExpanded && (
                    <div className="pl-8 space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                      {item.subItems?.map((sub) => {
                        const isActive = activeTab === sub.id;
                        return (
                          <button
                            key={sub.id}
                            onClick={() => handleNavigation(sub.id)}
                            data-agent={`nav-tab-hr-sub-${sub.id}`}
                            className={cn(
                              "w-full flex items-center px-3 py-1.5 text-xs font-semibold rounded-sm transition-all cursor-pointer",
                              isActive
                                ? "text-[#0a66c2] bg-blue-50/5 font-bold"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            )}
                          >
                            {sub.label}
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
                  "w-full flex items-center gap-3 px-3 py-2 text-sm font-medium transition-all group relative rounded-sm cursor-pointer",
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
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
