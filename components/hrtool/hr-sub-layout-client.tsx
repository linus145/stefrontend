'use client';

import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { HRHeader, HRSection } from '@/components/hrtool/hr-header';
import { HRSidebar } from '@/components/hrtool/hr-sidebar';
import { GlobalLoader } from '@/components/ui/global-loader';
import { LocalLoader } from '@/components/ui/local-loader';
import { useQuery } from '@tanstack/react-query';
import { jobsService } from '@/services/jobs.service';
import { PremiumLocker } from '@/components/ui/premium-locker';

interface HRSubLayoutClientProps {
  children: React.ReactNode;
  activeTab: HRSection;
}

export function HRSubLayoutClient({ children, activeTab }: HRSubLayoutClientProps) {
  const { isAuthenticated, isLoading: authLoading, userSubscription } = useAuth();
  const router = useRouter();
  
  const planPrice = (userSubscription?.status === 'active' && userSubscription?.plan_details)
    ? Number(userSubscription.plan_details.price) : 0;
  
  const isAgentAccessible = planPrice >= 18000;
  const isAgentTab = activeTab === 'agent-settings' || activeTab === 'agent-scheduling';
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('hr-sidebar-collapsed') === 'true';
    }
    return false;
  });

  const handleSidebarCollapse = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
    if (typeof window !== 'undefined') {
      localStorage.setItem('hr-sidebar-collapsed', String(collapsed));
    }
  };

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

  const renderContent = () => {
    if (companyLoading) return <LocalLoader />;
    
    if (isAgentTab && !isAgentAccessible) {
      return (
        <PremiumLocker
          title={activeTab === 'agent-settings' ? "Autonomous AI Agent & Settings" : "Autonomous AI Agent & Scheduling"}
          description="Unlock single-prompt pipeline execution, custom voice training, automated shift scheduling, self-healing workflow execution, and direct workforce policy training."
          features={[
            "Autonomous Onboarding & Provisioning",
            "Single-Prompt Multi-System Execution",
            "Automatic Shift & Rostering Generator",
            "Conversational Leave Scheduler",
            "Dedicated Support Engine Integration"
          ]}
          backPath="/Hrtools?tab=dashboard"
        />
      );
    }
    
    return children;
  };

  return (
    <div className="flex min-h-screen bg-background selection:bg-blue-500/20">
      <HRHeader
        companyName={company?.company_name || 'Loading...'}
        activeTab={activeTab}
        onTabChange={() => {}}
      />
      
      <HRSidebar 
        activeTab={activeTab} 
        onTabChange={() => {}} 
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
