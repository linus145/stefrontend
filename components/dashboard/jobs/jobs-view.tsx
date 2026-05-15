'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsService } from '@/services/jobs.service';
import { searchFiltersService } from '@/services/search-filters.service';
import { chatService } from '@/services/chat.service';
import { JobPost } from '@/types/jobs.types';
import { cn } from '@/lib/utils';
import {
  Briefcase,
  ChevronRight,
  Search,
  Zap,
  Loader2,
  MoreHorizontal
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

// Modular Components
import { JobCard } from './job-card';
import { ApplicationCard } from './application-card';
import { JobDetails } from './job-details';
import { ApplyModal } from './apply-modal';

interface JobsViewProps {
  isCollapsed?: boolean;
  onNavigateToMessages?: (userId: string) => void;
  initialSearch?: string | null;
  initialJobId?: string | null;
}

export function JobsView({ isCollapsed, onNavigateToMessages, initialSearch, initialJobId }: JobsViewProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'browse' | 'applications'>('browse');
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const [activeSearchQuery, setActiveSearchQuery] = useState(initialSearch || '');
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [resumeUrl, setResumeUrl] = useState('');
  const [coverLetter, setCoverLetter] = useState('');
  const [expectedSalary, setExpectedSalary] = useState('');

  const [statusFilter, setStatusFilter] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const [showMobileMore, setShowMobileMore] = useState(false);

  // Queries
  const { data: jobsResponse, isLoading: isJobsLoading } = useQuery({
    queryKey: ['public-jobs', activeSearchQuery, selectedCategory],
    queryFn: () => searchFiltersService.searchDashboardJobs({
      search: activeSearchQuery || undefined,
      category: selectedCategory || undefined
    }),
    enabled: activeTab === 'browse',
  });

  const { data: appsResponse, isLoading: isAppsLoading } = useQuery({
    queryKey: ['my-applications', activeSearchQuery, statusFilter],
    queryFn: () => searchFiltersService.searchApplications({
      search: activeSearchQuery || undefined,
      status: statusFilter || undefined
    }),
    enabled: activeTab === 'applications',
  });

  // Sync initialSearch if it changes from parent
  React.useEffect(() => {
    if (initialSearch !== undefined && initialSearch !== null) {
      setSearchQuery(initialSearch);
      setActiveSearchQuery(initialSearch);
      setActiveTab('browse');
    }
  }, [initialSearch]);

  // Handle direct job selection from global search
  React.useEffect(() => {
    if (initialJobId && jobsResponse?.data) {
      const job = jobsResponse.data.find((j: any) => j.id === initialJobId);
      if (job) setSelectedJob(job);
    }
  }, [initialJobId, jobsResponse?.data]);

  const isLoading = activeTab === 'browse' ? isJobsLoading : isAppsLoading;
  const jobs = Array.isArray(jobsResponse?.data) ? jobsResponse.data : [];
  const applications = Array.isArray(appsResponse?.data) ? appsResponse.data : [];

  const appStatusOptions = [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Reviewed', value: 'REVIEWED' },
    { label: 'Shortlisted', value: 'SHORTLISTED' },
    { label: 'Hired', value: 'HIRED' },
    { label: 'Rejected', value: 'REJECTED' },
  ];

  // Mutations
  const applyMutation = useMutation({
    mutationFn: (data: { jobId: string; resume_url: string; cover_letter: string }) =>
      jobsService.applyToJob(data.jobId, { resume_url: data.resume_url, cover_letter: data.cover_letter }),
    onSuccess: () => {
      toast.success('Application submitted successfully!');
      setIsApplyModalOpen(false);
      setResumeUrl('');
      setCoverLetter('');
      setExpectedSalary('');
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
      queryClient.invalidateQueries({ queryKey: ['public-jobs'] });
    },
    onError: (error: any) => {
      const errorData = error.data;
      if (errorData?.data && typeof errorData.data === 'object') {
        const firstError = Object.values(errorData.data)[0];
        const errorMessage = Array.isArray(firstError) ? firstError[0] : errorData.message;
        toast.error(errorMessage || 'Validation failed');
      } else {
        toast.error(errorData?.message || error.message || 'Failed to submit application');
      }
    }
  });

  const handleApply = (e: React.FormEvent) => {
    if (!selectedJob) return;

    // Include expected salary in cover letter for backend
    const finalCoverLetter = expectedSalary
      ? `[Expected Salary: $${expectedSalary}/mo]\n\n${coverLetter}`
      : coverLetter;

    applyMutation.mutate({
      jobId: selectedJob.id,
      resume_url: resumeUrl,
      cover_letter: finalCoverLetter
    });
  };

  const handleEasyApply = () => {
    if (!selectedJob) return;
    applyMutation.mutate({
      jobId: selectedJob.id,
      resume_url: '', // Backend pulls from profile
      cover_letter: 'Applied via B2 Apply using profile details.'
    });
  };

  const handleMessageRecruiter = async (recruiterId: string) => {
    try {
      await chatService.sendDirectMessage(recruiterId);
      if (onNavigateToMessages) {
        onNavigateToMessages(recruiterId);
      }
      toast.success('Chat opened with the hiring team!');
    } catch (error: any) {
      toast.error(error?.data?.error || 'Failed to open chat.');
    }
  };

  const handleAppClick = (appJobId: string) => {
    jobsService.getJobDetail(appJobId).then(res => {
      if (res.status === 'success' && res.data) {
        setSelectedJob(res.data);
      }
    });
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Search and Filters Header */}
      <div className="mb-6 flex flex-col gap-4">
        <div className="relative w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
          <input
            type="text"
            placeholder="Search jobs, posts, companies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                setActiveSearchQuery(searchQuery);
              }
            }}
            className="w-full pl-12 pr-4 py-3 bg-card border border-border rounded-sm text-[13px] font-medium focus:ring-1 focus:ring-primary/20 focus:border-primary/30 outline-none transition-all shadow-sm"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            <button
              onClick={() => setSelectedCategory(prev => prev === 'B2_APPLY' ? null : 'B2_APPLY')}
              className={cn(
                "flex items-center gap-2 px-3 md:px-4 py-2 rounded-sm text-[10px] font-bold uppercase tracking-wider whitespace-nowrap shadow-sm transition-all duration-300 border",
                selectedCategory === 'B2_APPLY'
                  ? "bg-[#0a66c2] text-white border-[#0a66c2] shadow-md shadow-[#0a66c2]/20"
                  : "bg-card border-border text-[#0a66c2] hover:bg-[#0a66c2]/5"
              )}
            >
              <Zap className="w-3 h-3 fill-current" />
              B2 Apply
            </button>
            {['IT', 'Freelance', 'Remote'].map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedCategory(prev => prev === filter ? null : filter)}
                className={cn(
                  "px-3 md:px-4 py-2 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-all duration-300 whitespace-nowrap shadow-sm border",
                  selectedCategory === filter
                    ? "bg-[#0a66c2] text-white border-[#0a66c2] shadow-md shadow-[#0a66c2]/20"
                    : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:border-[#0a66c2]/30"
                )}
              >
                {filter}
              </button>
            ))}
            <button
              onClick={() => setShowMobileMore(!showMobileMore)}
              className="md:hidden p-2 bg-card border border-border text-muted-foreground rounded-sm hover:text-foreground hover:bg-muted/50 transition-all shadow-sm flex items-center justify-center outline-none shrink-0"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
          {showMobileMore && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 animate-in slide-in-from-top-1 duration-200 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
              {['Full-time', 'Contract', 'Internship', 'Non-IT'].map((filter) => (
                <button
                  key={`mobile-extra-${filter}`}
                  onClick={() => setSelectedCategory(prev => prev === filter ? null : filter)}
                  className={cn(
                    "px-3 py-2 text-[10px] font-bold uppercase tracking-wider rounded-sm transition-all duration-300 whitespace-nowrap shadow-sm border",
                    selectedCategory === filter
                      ? "bg-[#0a66c2] text-white border-[#0a66c2] shadow-md shadow-[#0a66c2]/20"
                      : "bg-card border-border text-muted-foreground hover:text-foreground hover:bg-muted/50 hover:border-[#0a66c2]/30"
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        <div className={cn(
          "flex-1 overflow-y-auto custom-scrollbar bg-card border border-border/50 rounded-lg transition-all",
          selectedJob ? "hidden lg:block lg:flex-[0.4]" : "w-full"
        )}>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (activeTab === 'browse' ? jobs : applications).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-2xl bg-muted/20 flex items-center justify-center mb-6">
                <Briefcase className="w-8 h-8 text-muted-foreground opacity-20" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {activeTab === 'browse' ? 'No jobs found' : 'No applications yet'}
              </h3>
              <p className="text-muted-foreground text-sm max-w-xs">
                {activeTab === 'browse'
                  ? "We couldn't find any active job listings matching your criteria."
                  : "You haven't applied to any jobs yet. Start exploring the latest opportunities!"}
              </p>
            </div>
          ) : (
            <div className="flex flex-col h-full">
              {activeTab === 'browse' && (
                <div className="p-4 border-b border-border/50">
                  <h3 className="text-lg font-bold text-foreground">Top job picks for you</h3>
                  <p className="text-xs text-muted-foreground">Based on your profile, preferences, and activity like applies, searches, and saves</p>
                </div>
              )}

              <div className="flex-1 overflow-y-auto">
                <div className="grid grid-cols-1">
                  {activeTab === 'browse' ? (
                    <div className="flex flex-col">
                      {jobs.map((job, index) => (
                        <React.Fragment key={job.id}>
                          <JobCard
                            job={job}
                            isSelected={selectedJob?.id === job.id}
                            onClick={() => setSelectedJob(job)}
                          />
                          {index === 4 && (
                            <div className="p-6 bg-muted/10 border-y border-border/50 my-2">
                              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">Recent Searches</p>
                              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                                {['Architect', 'Structural', 'UI Designer', 'PM'].map((query) => (
                                  <button
                                    key={query}
                                    onClick={() => {
                                      setSearchQuery(query);
                                      setActiveSearchQuery(query);
                                    }}
                                    className="px-4 py-2 rounded-sm bg-card border border-border text-[11px] font-bold text-muted-foreground hover:text-foreground transition-all whitespace-nowrap shadow-sm"
                                  >
                                    {query}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </React.Fragment>
                      ))}
                    </div>
                  ) : (
                    applications.map((app) => (
                      <ApplicationCard
                        key={app.id}
                        application={app}
                        isSelected={selectedJob?.id === app.job}
                        onClick={() => handleAppClick(app.job)}
                      />
                    ))
                  )}
                </div>
              </div>

              {activeTab === 'browse' && (
                <button className="w-full py-3 text-sm font-bold text-muted-foreground border-t border-border/50 hover:bg-muted/50 transition-all flex items-center justify-center gap-2">
                  Show all
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}
        </div>

        <div className={cn(
          "lg:flex-[0.6] flex flex-col bg-card border border-border rounded-lg overflow-hidden transition-all",
          selectedJob ? "flex" : "hidden"
        )}>
          {selectedJob ? (
            <JobDetails
              job={selectedJob}
              applications={applications}
              onClose={() => setSelectedJob(null)}
              onApply={() => setIsApplyModalOpen(true)}
              onEasyApply={handleEasyApply}
              isApplying={applyMutation.isPending}
              onMessageRecruiter={handleMessageRecruiter}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-10 opacity-40">
              <div className="w-24 h-24 rounded-3xl bg-muted flex items-center justify-center mb-6">
                <Briefcase className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground mb-2">Select a job</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                Choose a job from the list to view full details and apply.
              </p>
            </div>
          )}
        </div>
      </div>

      {isApplyModalOpen && selectedJob && (
        <ApplyModal
          job={selectedJob}
          resumeUrl={resumeUrl}
          setResumeUrl={setResumeUrl}
          coverLetter={coverLetter}
          setCoverLetter={setCoverLetter}
          expectedSalary={expectedSalary}
          setExpectedSalary={setExpectedSalary}
          isPending={applyMutation.isPending}
          onClose={() => setIsApplyModalOpen(false)}
          onSubmit={handleApply}
        />
      )}
    </div>
  );
}
