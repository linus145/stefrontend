'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter, usePathname } from 'next/navigation';
import { HRHeader, HRSection } from '@/components/hrtool/hr-header';
import { HRSidebar } from '@/components/hrtool/hr-sidebar';
import { GlobalLoader } from '@/components/ui/global-loader';
import { LocalLoader } from '@/components/ui/local-loader';
import { useQuery } from '@tanstack/react-query';
import { jobsService } from '@/services/jobs.service';
import { DashboardThemeProvider } from '@/context/DashboardThemeContext';
import { AgentButton } from '@/components/agent/AgentButton';
import { AgentSidebar } from '@/components/agent/AgentSidebar';

export default function PayrollLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  // Calculate active tab dynamically based on current URL path
  const getActiveTab = (): HRSection => {
    const segment = pathname.split('/').pop() || 'dashboard';
    // Match segment to sections
    if (segment === 'salary-structures') return 'payroll-salary-structures';
    if (segment === 'tax-configurations') return 'payroll-tax-configurations';
    return `payroll-${segment}` as HRSection;
  };

  const activeTab = getActiveTab();

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

  if (authLoading || !isAuthenticated) {
    return <GlobalLoader />;
  }

  const company = companyCheck?.data?.company;

  return (
    <DashboardThemeProvider>
      <div className="flex min-h-screen bg-background selection:bg-blue-500/20">
        <HRHeader
          companyName={company?.company_name || 'Loading...'}
          activeTab={activeTab}
          onTabChange={() => {}}
        />
        
        <HRSidebar 
          activeTab={activeTab} 
          onTabChange={() => {}} 
        />

        <main className="flex-1 pt-16 min-w-0 flex flex-col lg:pl-64 transition-all duration-300">
          <div className="container mx-auto p-4 lg:p-8 flex-1 flex flex-col">
            {companyLoading ? <LocalLoader /> : children}
          </div>
        </main>
        
        <AgentSidebar />
      </div>
      <AgentButton />
    </DashboardThemeProvider>
  );
}
