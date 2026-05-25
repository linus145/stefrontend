'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { HRHeader, HRSection } from './hr-header';
import { HRSidebar } from './hr-sidebar';
import { GlobalLoader } from '@/components/ui/global-loader';
import { LocalLoader } from '@/components/ui/local-loader';
import { useQuery } from '@tanstack/react-query';
import { jobsService } from '@/services/jobs.service';
import { PremiumLocker } from '@/components/ui/premium-locker';

// Lazy load tabs to keep main bundle small
const DashboardTab = React.lazy(() => import('@/components/hrtool/tabs/dashboard/dashboard-tab').then(m => ({ default: m.DashboardTab })));
const EmployeesTab = React.lazy(() => import('@/components/hrtool/tabs/employees/employees-tab').then(m => ({ default: m.EmployeesTab })));
const OnboardingTab = React.lazy(() => import('@/components/hrtool/tabs/onboarding/onboarding-tab').then(m => ({ default: m.OnboardingTab })));
const AttendanceTab = React.lazy(() => import('@/components/hrtool/tabs/attendence/attendance-tab').then(m => ({ default: m.AttendanceTab })));
const LeaveTab = React.lazy(() => import('@/components/hrtool/tabs/leaves/leave-tab').then(m => ({ default: m.LeaveTab })));
const PayrollTab = React.lazy(() => import('@/components/hrtool/tabs/payroll/payroll-tab').then(m => ({ default: m.PayrollTab })));
const PerformanceTab = React.lazy(() => import('@/components/hrtool/tabs/performance/performance-tab').then(m => ({ default: m.PerformanceTab })));
const OrgTab = React.lazy(() => import('@/components/hrtool/tabs/organisation/org-tab').then(m => ({ default: m.OrgTab })));
const TemplatesTab = React.lazy(() => import('@/components/hrtool/tabs/templates/templates-tab').then(m => ({ default: m.TemplatesTab })));
const AgentSettingsTab = React.lazy(() => import('@/components/hrtool/tabs/agentsetting/agent-settings-tab').then(m => ({ default: m.AgentSettingsTab })));
const AgentSchedulingTab = React.lazy(() => import('@/components/hrtool/tabs/scheduling/agent-scheduling-tab').then(m => ({ default: m.AgentSchedulingTab })));


export function HRShell() {
  const { user, isAuthenticated, isLoading: authLoading, userSubscription } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<HRSection>('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hr-sidebar-collapsed') === 'true';
    }
    return false;
  });

  // HR Tools require Growth (12000) or Enterprise (18000) plan
  const hasPremium = userSubscription && Number(userSubscription.plan_details?.price) >= 12000 && userSubscription.status === 'active';

  const handleSidebarCollapse = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
    if (typeof window !== 'undefined') {
      localStorage.setItem('hr-sidebar-collapsed', String(collapsed));
    }
  };

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab) {
        setActiveTab(tab as HRSection);
      }
    }
  }, []);

  const { data: companyCheck, isLoading: companyLoading } = useQuery({
    queryKey: ['company-check'],
    queryFn: jobsService.checkCompany,
    enabled: isAuthenticated,
  });

  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Don't block the whole page for company check, only for auth
  if (authLoading || !isAuthenticated) {
    return <GlobalLoader />;
  }

  const company = companyCheck?.data?.company;

  const renderContent = () => {
    if (companyLoading) return <LocalLoader />;
    if (!companyCheck?.data?.has_company) return <div className="flex-1 flex items-center justify-center">No company found</div>;

    if (!hasPremium) {
      return (
        <PremiumLocker
          title="HR Management Suite"
          description="Manage employee onboarding, automated document flows, attendance tracking, late/early summaries, leaves, and custom payslip structures."
          features={[
            "Automated Onboarding Workflows",
            "Leave Requests & Approvals",
            "Attendance Event Log & Late Tracking",
            "Payslips & Salary Structure Builder",
            "Organization Tree & Org Charts",
            "Role-based Team & Employee Portals"
          ]}
          backPath="/recruiter"
        />
      );
    }

    return (
      <React.Suspense fallback={<LocalLoader />}>
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'onboarding' && <OnboardingTab />}
        {activeTab === 'employees' && <EmployeesTab />}
        {activeTab.startsWith('attendance') && (
          <AttendanceTab 
            subTab={activeTab} 
          />
        )}
        {activeTab.startsWith('leave') && (
          <LeaveTab 
            subTab={activeTab}
            filterStatus={
              activeTab === 'leave-pending' ? 'pending' :
              activeTab === 'leave-approved' ? 'approved' :
              undefined
            }
          />
        )}
        {activeTab === 'payroll' && <PayrollTab />}
        {activeTab === 'agent-settings' && <AgentSettingsTab />}
        {activeTab === 'agent-scheduling' && <AgentSchedulingTab />}
        {activeTab === 'templates' && <TemplatesTab />}
        {activeTab === 'performance' && <PerformanceTab />}
        {activeTab === 'organization' && <OrgTab />}
      </React.Suspense>
    );
  };

  return (
    <div className="flex min-h-screen bg-background selection:bg-blue-500/20">
      <HRHeader
        companyName={company?.company_name || 'Loading...'}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      <HRSidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={handleSidebarCollapse}
      />

      <main className={`flex-1 pt-16 min-w-0 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64'}`}>
        <div className="container mx-auto p-4 lg:p-8 flex-1 flex flex-col">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
