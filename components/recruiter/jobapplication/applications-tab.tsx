'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsService } from '@/services/jobs.service';
import { aiService } from '@/services/ai.service';
import { userService } from '@/services/user.service';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Users, FileText, Sparkles } from 'lucide-react';
import { JobApplication } from '@/types/jobs.types';

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
  const [manualJobId, setManualJobId] = useState('');
  const [aiResults, setAiResults] = useState<any>(null);
  const [isAiPanelOpen, setIsAiPanelOpen] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeJobId, setActiveJobId] = useState<string | null>(selectedJobId);

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
    mutationFn: (jobId: string) => {
      setAiResults(null);
      setIsAiPanelOpen(true);
      return aiService.analyzeResumes(jobId);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      setAiResults(res.data);
      toast.success(res.message || 'AI Screening complete.');
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
      toast.success('Message sent successfully!');
      setSelectedApplicant(null);
      setMessage('');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to send message.');
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

  const handleOpenContactModal = (applicant: any, email: boolean) => {
    setSelectedApplicant(applicant);
    setSendEmail(email);
    if (email) setMessage(`Hi ${applicant.first_name}, I'd like to schedule an interview...`);
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
    { label: 'Hired', value: 'HIRED', color: 'bg-emerald-500' },
    { label: 'Rejected', value: 'REJECTED', color: 'bg-red-500' },
  ];

  return (
    <div className="flex relative w-full h-full overflow-hidden">
      <div className={cn(
        "flex-1 p-4 sm:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700 transition-all duration-500 lg:ml-0",
        isAiPanelOpen ? "lg:mr-[480px]" : ""
      )}>
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-3 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back to Jobs
          </button>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Applications</h1>
              <p className="text-sm text-muted-foreground mt-1 font-medium">
                Review and manage applicants for your job postings
              </p>
            </div>
            <button 
              onClick={() => setIsAiPanelOpen(!isAiPanelOpen)}
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

      <div className="mb-4">
        <JobSelector
          activeJobId={activeJobId}
          setActiveJobId={(id) => { setActiveJobId(id); setStatusFilter(''); }}
          jobs={jobs}
          copiedId={copiedId}
          onCopyId={handleCopyId}
          manualJobId={manualJobId}
          setManualJobId={setManualJobId}
          onAnalyze={(id) => analyzeMutation.mutate(id)}
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
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap border",
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
      />

      <AIScreeningPanel
        isOpen={isAiPanelOpen}
        onClose={() => setIsAiPanelOpen(false)}
        isLoading={analyzeMutation.isPending}
        results={aiResults}
        onLoadHistoryReport={(reportResults) => {
          setAiResults(reportResults);
          queryClient.invalidateQueries({ queryKey: ['job-applications'] });
          toast.success('AI Screening results loaded.');
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
