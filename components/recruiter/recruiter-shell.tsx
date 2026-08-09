'use client';

import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { RecruiterSidebar, RecruiterSection } from './recruiter-sidebar';
import { RecruiterHeader } from './recruiter-header';
import { OverviewTab } from './overview-tab';
import { MyJobsTab } from './myjobs/my-jobs-tab';
import { ApplicationsTab } from './jobapplication/applications-tab';
import { CandidatesTab } from './professional/candidates-tab';
import { CompanyProfileTab } from './company/company-profile-tab';
import { MessagesView } from '@/components/dashboard/messages/messages-view';

import { GlobalLoader } from '@/components/ui/global-loader';
import { useQuery } from '@tanstack/react-query';
import { jobsService } from '@/services/jobs.service';
import { PremiumLocker } from '@/components/ui/premium-locker';

export function RecruiterShell() {
  const { user, isAuthenticated, isLoading: authLoading, userSubscription } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<RecruiterSection>('overview');

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('recruiter-sidebar-collapsed') === 'true';
    }
    return false;
  });

  const handleSidebarCollapse = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
    if (typeof window !== 'undefined') {
      localStorage.setItem('recruiter-sidebar-collapsed', String(collapsed));
    }
  };

  // Check if user has an active premium plan
  const isPremium = !!(userSubscription &&
    userSubscription.status === 'active' &&
    userSubscription.plan_details &&
    Number(userSubscription.plan_details.price) > 0);

  // Check if user has a company (only when authenticated and premium)
  const { data: companyCheck, isLoading: companyLoading } = useQuery({
    queryKey: ['company-check'],
    queryFn: jobsService.checkCompany,
    enabled: !!(isAuthenticated && isPremium),
  });

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/recruiter/login?redirect=/recruiter');
    }
  }, [authLoading, isAuthenticated, router]);

  // Redirect to register if no company
  React.useEffect(() => {
    if (isPremium && !companyLoading && companyCheck && !companyCheck.data.has_company) {
      router.replace('/recruiter/register');
    }
  }, [isPremium, companyLoading, companyCheck, router]);

  const handleTabChange = (tab: RecruiterSection, jobId?: string) => {
    setActiveTab(tab);
    if (jobId) setSelectedJobId(jobId);
    setIsMobileSidebarOpen(false);
  };

  const handleViewApplications = (jobId: string) => {
    setSelectedJobId(jobId);
    setActiveTab('applications');
  };

  if (authLoading) {
    return <GlobalLoader />;
  }

  if (!isAuthenticated) {
    return <GlobalLoader />;
  }

  // Guard recruiter platform for premium subscribers only
  if (!isPremium) {
    return (
      <div className="flex min-h-screen bg-background pt-16">
        <PremiumLocker
          title="Recruiter Platform"
          description="Access the premium Recruiter dashboard to post jobs, manage applicants, use autonomous AI screening, and streamline hiring."
          features={[
            "AI Hiring Agent Console",
            "Job Postings & ATS Integration",
            "AI Candidate Screening & Scoring",
            "Interactive Applicant Evaluation",
            "Full Hiring Workflow & Onboarding",
            "Advanced Team-based Access Control"
          ]}
          backPath="/dashboard"
        />
      </div>
    );
  }

  if (companyLoading || !companyCheck?.data?.has_company) {
    return <GlobalLoader />;
  }

  const company = companyCheck.data.company!;

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col">
            <OverviewTab onNavigate={handleTabChange} />
          </div>
        );
      case 'my-jobs':
        return (
          <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col">
            <MyJobsTab isApproved={company.is_approved ?? false} onViewApplications={handleViewApplications} />
          </div>
        );
      case 'applications':
        return <ApplicationsTab selectedJobId={selectedJobId} onBack={() => setActiveTab('my-jobs')} />;
      case 'candidates':
        return <CandidatesTab />;
      case 'company':
        return (
          <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col">
            <CompanyProfileTab company={company} />
          </div>
        );
      case 'messages':
        return <MessagesView roomType="direct" />;
      default:
        return (
          <div className="flex-1 w-full max-w-7xl mx-auto flex flex-col">
            <OverviewTab onNavigate={handleTabChange} />
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-background selection:bg-blue-500/20">
      {/* Mobile overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden animate-in fade-in duration-200"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      <RecruiterHeader
        companyName={company.company_name}
        isApproved={company.is_approved ?? false}
        isGenuine={company.is_genuine ?? false}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onMobileMenuToggle={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      <RecruiterSidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => handleSidebarCollapse(!isSidebarCollapsed)}
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isMobileOpen={isMobileSidebarOpen}
        onMobileClose={() => setIsMobileSidebarOpen(false)}
        companyName={company.company_name}
        companyLogo={company.logo_url}
      />

      <div className={`flex-1 flex flex-col min-w-0 pt-16 pb-16 lg:pb-0 transition-all duration-300 ${isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-60'} ${activeTab === 'messages' ? 'h-screen overflow-hidden' : 'min-h-0'}`}>
        {renderContent()}
      </div>
    </div>
  );
}
