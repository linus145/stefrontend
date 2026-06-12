'use client';

import React, { useState } from 'react';
import { Settings2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { AIInterviewsHeader } from './interview-header';
import { AIInterviewsSidebar } from './interview-sidebar';
import { InterviewPipelineView } from './interview-pipeline-view';
import { InterviewConfigView } from './configuration/interview-config-view';
import { EvaluationView } from './evaluation/evaluation-view';
import { SchedulingView } from './scheduling/scheduling-view';
import { GlobalLoader } from '@/components/ui/global-loader';
import { useQuery } from '@tanstack/react-query';
import { jobsService } from '@/services/jobs.service';
import { PremiumLocker } from '@/components/ui/premium-locker';

export function AIInterviewsShell() {
  const { user, isAuthenticated, isLoading: authLoading, userSubscription } = useAuth();
  const router = useRouter();

  const [activeSection, setActiveSection] = useState('pipeline');

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('interview-sidebar-collapsed') === 'true';
    }
    return false;
  });

  const handleSidebarCollapse = (collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
    if (typeof window !== 'undefined') {
      localStorage.setItem('interview-sidebar-collapsed', String(collapsed));
    }
  };

  // Interview Pipeline requires Growth (12000) or Enterprise (18000) plan
  const hasPremium = userSubscription && Number(userSubscription.plan_details?.price) >= 12000 && userSubscription.status === 'active';

  // Check if user has a company
  const { data: companyCheck, isLoading: companyLoading } = useQuery({
    queryKey: ['company-check'],
    queryFn: jobsService.checkCompany,
    enabled: isAuthenticated,
  });

  // Redirect if not authenticated
  React.useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/recruiter/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Redirect to register if no company
  React.useEffect(() => {
    if (!companyLoading && companyCheck && !companyCheck.data.has_company) {
      router.replace('/recruiter/register');
    }
  }, [companyLoading, companyCheck, router]);

  const [configInitialAppId, setConfigInitialAppId] = useState<string | undefined>(undefined);
  const [configInitialSessionId, setConfigInitialSessionId] = useState<string | undefined>(undefined);

  const handleConfigureCandidate = (appId?: string, sessionId?: string) => {
    setConfigInitialAppId(appId);
    setConfigInitialSessionId(sessionId);
    setActiveSection('configuration');
  };

  if (authLoading || companyLoading || !isAuthenticated || !companyCheck?.data?.has_company) {
    return <GlobalLoader />;
  }

  const company = companyCheck.data.company!;

  const renderContent = () => {
    if (!hasPremium) {
      return (
        <PremiumLocker
          title="AI Interviews Engine"
          description="Automate talent screening, generate candidate evaluation reports, and schedule interviews autonomously using conversational agents."
          features={[
            "AI Interview Pipeline",
            "Resume Screening & Scoring",
            "Candidate Evaluation Reports",
            "Recruiter Collaboration Panel",
            "Interview Scheduling System",
            "Hiring Analytics & Insights"
          ]}
          backPath="/recruiter"
        />
      );
    }

    switch (activeSection) {
      case 'pipeline':
        return (
          <div className="w-full max-w-7xl mx-auto flex flex-col">
            <InterviewPipelineView 
              onConfigure={handleConfigureCandidate} 
              onSectionChange={setActiveSection}
            />
          </div>
        );
      case 'configuration':
        return (
          <InterviewConfigView
            initialApplicationId={configInitialAppId}
            initialSessionId={configInitialSessionId}
            onBack={() => { 
              setActiveSection('pipeline'); 
              setConfigInitialSessionId(undefined); 
            }}
          />
        );
      case 'evaluation':
        return <EvaluationView />;
      case 'scheduling':
        return <SchedulingView onConfigure={handleConfigureCandidate} onSectionChange={setActiveSection} />;
      default:
        return (
          <div className="flex flex-col items-center justify-center h-full opacity-50 space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border border-border">
              <Settings2 className="w-8 h-8" />
            </div>
            <p className="text-sm font-medium tracking-tight">The {activeSection} module is under deployment.</p>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-background selection:bg-blue-500/20">
      <AIInterviewsHeader
        companyName={company.company_name}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <AIInterviewsSidebar
        isCollapsed={isSidebarCollapsed}
        onToggle={() => handleSidebarCollapse(!isSidebarCollapsed)}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
        companyName={company.company_name}
      />

      <main className={`flex-1 flex flex-col min-w-0 pt-16 transition-all duration-300 ${isSidebarCollapsed ? 'lg:pl-20' : 'lg:pl-60'}`}>
        <div className="flex-1 custom-scrollbar">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
