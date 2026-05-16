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

// Lazy load tabs to keep main bundle small
const DashboardTab = React.lazy(() => import('@/components/hrtool/tabs/dashboard/dashboard-tab').then(m => ({ default: m.DashboardTab })));
const EmployeesTab = React.lazy(() => import('@/components/hrtool/tabs/employees/employees-tab').then(m => ({ default: m.EmployeesTab })));
const OnboardingTab = React.lazy(() => import('@/components/hrtool/tabs/onboarding/onboarding-tab').then(m => ({ default: m.OnboardingTab })));
const AttendanceTab = React.lazy(() => import('@/components/hrtool/tabs/attendence/attendance-tab').then(m => ({ default: m.AttendanceTab })));
const LeaveTab = React.lazy(() => import('@/components/hrtool/tabs/leaves/leave-tab').then(m => ({ default: m.LeaveTab })));
const PayrollTab = React.lazy(() => import('@/components/hrtool/tabs/payroll/payroll-tab').then(m => ({ default: m.PayrollTab })));
const PerformanceTab = React.lazy(() => import('@/components/hrtool/tabs/performance/performance-tab').then(m => ({ default: m.PerformanceTab })));
const OrgTab = React.lazy(() => import('@/components/hrtool/tabs/organisation/org-tab').then(m => ({ default: m.OrgTab })));

export function HRShell() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<HRSection>('dashboard');

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

    return (
      <React.Suspense fallback={<LocalLoader />}>
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'onboarding' && <OnboardingTab />}
        {activeTab === 'employees' && <EmployeesTab />}
        {activeTab === 'attendance' && <AttendanceTab />}
        {activeTab === 'leave' && <LeaveTab />}
        {activeTab === 'payroll' && <PayrollTab />}
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
      />

      <main className="flex-1 pt-16 min-w-0 flex flex-col lg:pl-64 transition-all duration-300">
        <div className="container mx-auto p-4 lg:p-8 flex-1 flex flex-col">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
