'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsService } from '@/services/jobs.service';
import { aiService } from '@/services/ai.service';
import { userService } from '@/services/user.service';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Users, FileText, Sparkles } from 'lucide-react';
import { JobApplication } from '@/types/jobs.types';
import { AgentUIController } from '@/agent/ui/AgentUIController';

// Modules
import { ApplicationCard } from './application-card';
import { AIScreeningPanel } from '../Aiscreening/ai-screening-panel';
import { ContactModal } from './contact-modal';
import { JobSelector } from './job-selector';

interface ApplicationsTabProps {

  selectedJobId: string | null;
  onBack: () => void;
}

export function ApplicationsTab({ selectedJobId, onBack }: ApplicationsTabProps) {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);
  const [selectedApplicant, setSelectedApplicant] = useState<JobApplication['applicant'] | null>(null);
  const [message, setMessage] = useState('');
  const [sendEmail, setSendEmail] = useState(true);
  const [contactMode, setContactMode] = useState<'email' | 'chat'>('chat');
  const [manualJobId, setManualJobId] = useState('');
  const [aiResults, setAiResults] = useState<any>(null);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(selectedJobId);
  const [isAiPanelResizing, setIsAiPanelResizing] = useState(false);
  const [selectedModel, setSelectedModel] = useState<string>('gemini-2.5-flash-lite');
  const [windowWidth, setWindowWidth] = useState<number>(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [isAgentSidebarOpen, setIsAgentSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      setIsAgentSidebarOpen(AgentUIController.getInstance().getIsVisible());
    }

    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    const handleAgentSidebarToggle = (e: any) => {
      setIsAgentSidebarOpen(e.detail.isVisible);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('agent-ui-toggle', handleAgentSidebarToggle);

    const handleStart = () => setIsAiPanelResizing(true);
    const handleStop = () => setIsAiPanelResizing(false);
    window.addEventListener('ai-panel-resize-start', handleStart);
    window.addEventListener('ai-panel-resize-stop', handleStop);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('agent-ui-toggle', handleAgentSidebarToggle);
      window.removeEventListener('ai-panel-resize-start', handleStart);
      window.removeEventListener('ai-panel-resize-stop', handleStop);
    };
  }, []);

  // Queries
  const { data: jobsResponse } = useQuery({
    queryKey: ['recruiter-jobs'],
    queryFn: () => jobsService.getMyJobs(),
  });

  const { data: applicationsResponse, isLoading } = useQuery({
    queryKey: ['job-applications', activeJobId],
    queryFn: () => jobsService.getJobApplications(activeJobId!),
    enabled: !!activeJobId,
  });

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({ appId, status, employmentType }: { appId: string; status: string; employmentType?: string }) =>
      jobsService.updateApplicationStatus(appId, status, employmentType),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      queryClient.invalidateQueries({ queryKey: ['recruiter-stats'] });
      toast.success('Application status updated.');
    },
    onError: () => toast.error('Failed to update status.'),
  });

  const analyzeMutation = useMutation({
    mutationFn: ({ jobId, model }: { jobId: string; model: string }) => {
      setAiResults(null);
      setIsAiPanelOpen(true);
      return aiService.analyzeResumes(jobId, model);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      setAiResults(res.data);
      toast.success(res.message || 'AI Screening complete.');

      // Dispatch custom event to notify agent of screening scores
      if (res.data?.top_candidates && res.data.top_candidates.length > 0) {
        const topCandidate = res.data.top_candidates[0];
        window.dispatchEvent(new CustomEvent('agent-screening-completed', {
          detail: {
            score: topCandidate.score,
            candidateName: topCandidate.name || 'Top Candidate',
            totalCandidates: res.data.total_applicants || res.data.top_candidates.length
          }
        }));
      }

      if (res.data?.errors?.length > 0) {
        res.data.errors.forEach((err: string) => toast.error(err, { duration: 6000 }));
      }
    },
    onError: (error: any) => {
      const errorData = error?.response?.data || error?.data || error;
      const msg = errorData?.message || 'AI Screening failed.';
      toast.error(msg, { duration: 6000 });
      if (errorData?.data?.errors?.length > 0) {
        errorData.data.errors.forEach((err: string) => toast.error(err, { duration: 8000 }));
      }
      setIsAiPanelOpen(false);
    },
  });

  const contactMutation = useMutation({
    mutationFn: (data: { target_user_id: string; message: string; send_email: boolean }) =>
      userService.contactUser(data),
    onSuccess: () => {
      if (contactMode === 'email') {
        toast.success('Email sent successfully!');
      } else if (sendEmail) {
        toast.success('Message and Email sent successfully!');
      } else {
        toast.success('Message sent successfully!');
      }
      setSelectedApplicant(null);
      setMessage('');
    },
    onError: (error: any) => {
      const type = contactMode === 'email' ? 'email' : 'message';
      toast.error(error?.response?.data?.message || `Failed to send ${type}.`);
    },
  });

  // Handlers
  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Job ID copied to clipboard');
  };

  const handleContact = () => {
    if (!selectedApplicant || !message.trim()) return;
    contactMutation.mutate({
      target_user_id: selectedApplicant.id,
      message,
      send_email: sendEmail
    });
  };

  const handleOpenContactModal = (app: JobApplication, email: boolean) => {
    const applicant = app.applicant;
    setSelectedApplicant(applicant);
    setSendEmail(email);
    setContactMode(email ? 'email' : 'chat');

    const jobsList = Array.isArray(jobsResponse?.data) ? jobsResponse.data : [];
    const currentJob = jobsList.find((j: any) => j.id === app.job);
    const companyName = currentJob?.company_name || currentJob?.company?.company_name || "";
    const teamSignOff = companyName ? `${companyName} Recruitment Team` : "Recruitment Team";

    if (app.status === 'REJECTED') {
      let parsedAnalysis: any = null;
      if (app.ai_analysis) {
        try {
          if (app.ai_analysis.trim().startsWith('{')) {
            parsedAnalysis = JSON.parse(app.ai_analysis);
          }
        } catch (e) {
          console.error("Failed to parse ai_analysis JSON", e);
        }
      }

      let strengthsText = "";
      let feedbackText = "";

      if (parsedAnalysis) {
        const strengths = parsedAnalysis.recruiter_view?.strengths || [];
        if (strengths.length > 0) {
          strengthsText = `During our evaluation, we recognized several strengths in your background:\n` +
            strengths.slice(0, 2).map((s: string) => `• ${s}`).join('\n') + `\n\n`;
        }

        const gaps: string[] = [];
        const missing = parsedAnalysis.intelligence?.skills_assessment?.missing_required || [];
        if (missing.length > 0) {
          missing.slice(0, 2).forEach((m: any) => {
            if (m.skill) {
              gaps.push(`Strengthen proficiency and hands-on projects with: ${m.skill}`);
            }
          });
        }
        const concerns = parsedAnalysis.recruiter_view?.concerns || [];
        if (concerns.length > 0) {
          concerns.slice(0, 2).forEach((c: string) => {
            gaps.push(c);
          });
        }

        if (gaps.length > 0) {
          feedbackText = `To help you prepare for future roles and align better with requirements, we suggest focusing on the following areas of improvement:\n` +
            gaps.map((g: string) => `• ${g}`).join('\n') + `\n\n`;
        }
      } else {
        let rejectionReason = "identified that we will be moving forward with other candidates whose experience and qualifications more closely align with the requirements of this role";
        if (app.ai_score !== null && app.ai_score !== undefined && app.ai_score < 50) {
          rejectionReason = `highlighted some alignment gaps (AI Fit Score: ${app.ai_score}%) regarding the core technical skills required for this position`;
        }
        feedbackText = `Our screening process has ${rejectionReason}.\n\nTo help you stand out in the future, we recommend highlighting key projects, relevant certifications, or practical experience with the core skills required for this position on your resume.\n\n`;
      }

      const jobTitle = app.job_title || "the position";
      let messageBody = `Hi ${applicant.first_name},\n\nThank you for taking the time to apply for the ${jobTitle} role. After a careful review of your application, we regret to inform you that we will not be moving forward with your candidacy at this time.\n\n`;

      if (app.ai_score !== null && app.ai_score !== undefined) {
        messageBody += `Our AI-assisted evaluation assessed your profile alignment at ${app.ai_score}% for this specific position.\n\n`;
      }

      if (strengthsText) {
        messageBody += strengthsText;
      }

      if (feedbackText) {
        messageBody += feedbackText;
      }

      messageBody += `We highly encourage you to update your resume incorporating these insights, and we would welcome you to apply again for future openings that match your refined profile.\n\nWe appreciate your interest in our team and wish you the best of luck in your job search and future professional endeavors.\n\nBest regards,\n${teamSignOff}`;

      setMessage(messageBody);
    } else if (email) {
      setMessage(`Hi ${applicant.first_name},\n\nI'd like to schedule an interview to discuss your application and match for this position.\n\nPlease let me know your availability this week.\n\nBest regards,\n${teamSignOff}`);
    } else {
      setMessage(`Hi ${applicant.first_name}, I'd like to schedule an interview...`);
    }
  };

  // Data mapping
  const jobs = Array.isArray(jobsResponse?.data) ? jobsResponse.data : [];
  const allApplications = Array.isArray(applicationsResponse?.data) ? applicationsResponse.data : [];
  const filteredApplications = statusFilter
    ? allApplications.filter(app => app.status === statusFilter)
    : allApplications;

  const statusOptions = [
    { label: 'All', value: '', color: '' },
    { label: 'Pending', value: 'PENDING', color: 'bg-amber-500' },
    { label: 'Reviewed', value: 'REVIEWED', color: 'bg-blue-500' },
    { label: 'Shortlisted', value: 'SHORTLISTED', color: 'bg-cyan-500' },
    { label: 'Interview', value: 'INTERVIEW', color: 'bg-purple-500' },
    { label: 'Rejected', value: 'REJECTED', color: 'bg-red-500' },
  ];

  // Determine if we should apply padding-right to make room for AI panel
  // If the viewport is too small or if Agent sidebar is open and squeezing the remaining width,
  // we do not apply padding-right, allowing the AI panel to float over the content as an overlay.
  const shouldApplyPadding = isAiPanelOpen && windowWidth >= 1200 && !(isAgentSidebarOpen && windowWidth < 1350);

  return (
    <div
      className={cn(
        "flex relative w-full",
        isAiPanelOpen ? "h-[calc(100vh-4rem)] overflow-hidden" : "min-h-[calc(100vh-4rem)]",
        isAiPanelResizing ? "transition-none" : "transition-all duration-500"
      )}
      style={{
        paddingRight: shouldApplyPadding ? 'var(--ai-panel-width, 480px)' : '0px'
      }}
    >
      <div
        className={cn(
          "flex-1 w-full max-w-7xl mx-auto flex flex-col p-4 sm:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700",
          isAiPanelOpen ? "h-full overflow-y-auto no-scrollbar" : ""
        )}
      >
        {/* Header */}
        <div className="mb-2">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-1 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Jobs
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">Applications</h1>
              <p className="text-sm text-muted-foreground mt-1 font-medium">
                Review and manage applicants for your job postings
              </p>
            </div>
            <button
              onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
              data-agent="ai-screening-button"
              className={cn(
                "inline-flex items-center gap-2 px-4 py-2 rounded-sm text-xs font-bold transition-all border shrink-0",
                isAiPanelOpen
                  ? "bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-600/20"
                  : "bg-white text-blue-600 border-blue-600/20 hover:bg-blue-50"
              )}
            >
              <Sparkles className={cn("w-3.5 h-3.5", isAiPanelOpen ? "animate-pulse" : "")} />
              AI Screening
            </button>
          </div>
        </div>

        <div className="mb-2">
          <JobSelector
            activeJobId={activeJobId}
            setActiveJobId={(id) => { setActiveJobId(id); setStatusFilter(''); }}
            jobs={jobs}
            copiedId={copiedId}
            onCopyId={handleCopyId}
            manualJobId={manualJobId}
            setManualJobId={setManualJobId}
            onAnalyze={(id) => analyzeMutation.mutate({ jobId: id, model: selectedModel })}
            isAnalyzePending={analyzeMutation.isPending}
          />
        </div>

        {!activeJobId ? (
          <div className="text-center py-20">
            <div className="w-20 h-20 rounded-sm bg-muted/20 border border-dashed border-border/50 flex items-center justify-center mx-auto mb-6">
              <Users className="w-8 h-8 text-muted-foreground opacity-30" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">Select a job</h3>
            <p className="text-sm text-muted-foreground">Choose a job posting above to view its applications.</p>
          </div>
        ) : (
          <>
            {/* Status Filters */}
            <div className="flex gap-2 mb-4 overflow-x-auto pb-1 no-scrollbar">
              {statusOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-xs font-semibold transition-all whitespace-nowrap border",
                    statusFilter === opt.value
                      ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
                      : "bg-muted/30 text-muted-foreground border-border hover:bg-muted/50"
                  )}
                >
                  {opt.color && <div className={cn("w-1.5 h-1.5 rounded-full", opt.color)} />}
                  {opt.label} ({opt.value ? allApplications.filter(a => a.status === opt.value).length : allApplications.length})
                </button>
              ))}
            </div>

            {/* Applications List */}
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
              </div>
            ) : filteredApplications.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-20 h-20 rounded-sm bg-muted/20 border border-dashed border-border/50 flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-8 h-8 text-muted-foreground opacity-30" />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">No applications yet</h3>
                <p className="text-sm text-muted-foreground">
                  {statusFilter ? `No ${statusFilter.toLowerCase()} applications found.` : 'Applications will appear here once people apply.'}
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredApplications.map((app: JobApplication) => (
                  <ApplicationCard
                    key={app.id}
                    app={app}
                    isExpanded={expandedAppId === app.id}
                    onToggleExpand={() => setExpandedAppId(expandedAppId === app.id ? null : app.id)}
                    onUpdateStatus={(id, status, employmentType) => updateStatusMutation.mutate({ appId: id, status, employmentType })}
                    onContact={handleOpenContactModal}
                    isUpdatePending={updateStatusMutation.isPending}
                  />
                ))}
              </div>
            )}
          </>
        )}

        <ContactModal
          selectedApplicant={selectedApplicant}
          message={message}
          setMessage={setMessage}
          sendEmail={sendEmail}
          setSendEmail={setSendEmail}
          onClose={() => setSelectedApplicant(null)}
          onSend={handleContact}
          isPending={contactMutation.isPending}
          mode={contactMode}
        />

        <AIScreeningPanel
          isOpen={isAiPanelOpen}
          onClose={() => setIsAiPanelOpen(false)}
          isLoading={analyzeMutation.isPending}
          results={aiResults}
          selectedModel={selectedModel}
          setSelectedModel={setSelectedModel}
          activeJobId={activeJobId}
          onStartScreening={(jobId, model) => {
            analyzeMutation.mutate({ jobId, model });
          }}
          onLoadHistoryReport={(reportResults) => {
            setAiResults(reportResults);
            queryClient.invalidateQueries({ queryKey: ['job-applications'] });
            toast.success('AI Screening results loaded.');

            // Dispatch custom event to notify agent of screening scores
            if (reportResults?.top_candidates && reportResults.top_candidates.length > 0) {
              const topCandidate = reportResults.top_candidates[0];
              window.dispatchEvent(new CustomEvent('agent-screening-completed', {
                detail: {
                  score: topCandidate.score,
                  candidateName: topCandidate.name || 'Top Candidate',
                  totalCandidates: reportResults.total_applicants || reportResults.top_candidates.length
                }
              }));
            }
          }}
          onViewDetails={(id) => {
            setExpandedAppId(id);
            setIsAiPanelOpen(false);
            // Scroll to the card
            setTimeout(() => {
              document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
          }}
        />
      </div>
    </div>
  );
}
