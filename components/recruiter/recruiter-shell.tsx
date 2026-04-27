'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { RecruiterSidebar, RecruiterSection } from './recruiter-sidebar';
import { RecruiterHeader } from './recruiter-header';
import { OverviewTab } from './overview-tab';
import { MyJobsTab } from './my-jobs-tab';
import { ApplicationsTab } from './applications-tab';
import { CompanyProfileTab } from './company-profile-tab';
import { GlobalLoader } from '@/components/ui/global-loader';
import { useQuery } from '@tanstack/react-query';
import { jobsService } from '@/services/jobs.service';

export function RecruiterShell() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<RecruiterSection>('overview');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Check if user has a company
  const { data: companyCheck, isLoading: companyLoading } = useQuery({
    queryKey: ['company-check'],
    queryFn: jobsService.checkCompany,
    enabled: isAuthenticated,
  });

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/recruiter/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Redirect to register if no company
  React.useEffect(() => {
    if (!companyLoading && companyCheck && !companyCheck.data.has_company) {
      router.push('/recruiter/register');
    }
  }, [companyLoading, companyCheck, router]);

  const handleTabChange = (tab: RecruiterSection, jobId?: string) => {
    setActiveTab(tab);
    if (jobId) setSelectedJobId(jobId);
    setIsMobileSidebarOpen(false);
  };

  const handleViewApplications = (jobId: string) => {
    setSelectedJobId(jobId);
    setActiveTab('applications');
  };

  if (authLoading || companyLoading || !isAuthenticated || !companyCheck?.data?.has_company) {
    return <GlobalLoader />;
  }

  const company = companyCheck.data.company!;

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewTab isCollapsed={isSidebarCollapsed} onNavigate={handleTabChange} />;
      case 'my-jobs':
        return <MyJobsTab isCollapsed={isSidebarCollapsed} isApproved={company.is_approved ?? false} onViewApplications={handleViewApplications} />;
      case 'applications':
        return <ApplicationsTab isCollapsed={isSidebarCollapsed} selectedJobId={selectedJobId} onBack={() => setActiveTab('my-jobs')} />;
      case 'company':
        return <CompanyProfileTab isCollapsed={isSidebarCollapsed} company={company} />;
      default:
        return <OverviewTab isCollapsed={isSidebarCollapsed} onNavigate={handleTabChange} />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background selection:bg-teal-500/20">
      {/* Mobile overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <RecruiterSidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        companyName={company.company_name}
        companyLogo={company.logo_url}
      />

      <RecruiterHeader
        isCollapsed={isSidebarCollapsed}
        companyName={company.company_name}
        isApproved={company.is_approved ?? false}
        isGenuine={company.is_genuine ?? false}
        onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      <div className="flex-1 flex flex-col min-w-0 pt-16 pb-16 lg:pb-0">
        {renderContent()}
      </div>
    </div>
  );
}
