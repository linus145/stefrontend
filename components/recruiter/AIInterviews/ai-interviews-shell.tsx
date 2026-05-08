'use client';

import React, { useState } from 'react';
import { Settings2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { AIInterviewsHeader } from './interview-header';
import { InterviewPipelineView } from './interview-pipeline-view';
import { InterviewConfigView } from './interview-config-view';
import { GlobalLoader } from '@/components/ui/global-loader';
import { useQuery } from '@tanstack/react-query';
import { jobsService } from '@/services/jobs.service';

export function AIInterviewsShell() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [activeSection, setActiveSection] = useState('pipeline');

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

  return (
    <div className="flex min-h-screen bg-background selection:bg-blue-500/20">
      <AIInterviewsHeader
        companyName={company.company_name}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <main className="flex-1 flex flex-col min-w-0 pt-16">
        <div className="flex-1 custom-scrollbar">
          {activeSection === 'pipeline' ? (
            <InterviewPipelineView onConfigure={handleConfigureCandidate} />
          ) : activeSection === 'configuration' ? (
            <InterviewConfigView
              initialApplicationId={configInitialAppId}
              initialSessionId={configInitialSessionId}
              onBack={() => { setActiveSection('pipeline'); setConfigInitialSessionId(undefined); }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full opacity-50 space-y-4">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border border-border">
                <Settings2 className="w-8 h-8" />
              </div>
              <p className="text-sm font-medium tracking-tight">The {activeSection} module is under deployment.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
