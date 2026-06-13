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
  MoreHorizontal,
  Bookmark
} from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

// Modular Components
import { JobCard } from './job-card';
import { ApplicationCard } from './application-card';
import { JobDetails } from './job-details';
import { ApplyModal } from './apply-modal';
import { JobFiltersHeader } from './job-filters-header';
import { RecentSearches } from './recent-searches';

interface JobsViewProps {
  isCollapsed?: boolean;
  onNavigateToMessages?: (userId: string) => void;
  initialSearch?: string | null;
  initialJobId?: string | null;
  onSectionChange?: (section: any, id?: string | null) => void;
}

export function JobsView({ isCollapsed, onNavigateToMessages, initialSearch, initialJobId, onSectionChange }: JobsViewProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'browse' | 'applications' | 'saved'>('browse');
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

  // Saved Jobs queries and mutations
  const { data: savedJobIdsResponse, refetch: refetchSavedIds } = useQuery({
    queryKey: ['saved-job-ids'],
    queryFn: () => jobsService.getSavedJobIds(),
  });
  const savedJobIds = savedJobIdsResponse?.data || [];

  const { data: savedJobsResponse, isLoading: isSavedJobsLoading, refetch: refetchSavedJobs } = useQuery({
    queryKey: ['saved-jobs'],
    queryFn: () => jobsService.getSavedJobs(),
    enabled: activeTab === 'saved',
  });
  const savedJobs = savedJobsResponse?.data || [];

  const toggleSaveJobMutation = useMutation({
    mutationFn: (jobId: string) => jobsService.toggleSaveJob(jobId),
    onSuccess: (res) => {
      const isSaved = res.data?.saved;
      toast.success(isSaved ? 'Job saved!' : 'Job unsaved.');
      refetchSavedIds();
      refetchSavedJobs();
      queryClient.invalidateQueries({ queryKey: ['saved-job-ids'] });
      queryClient.invalidateQueries({ queryKey: ['saved-jobs'] });
    },
    onError: () => {
      toast.error('Failed to update saved job.');
    }
  });

  const toggleSaveJob = (jobId: string) => {
    toggleSaveJobMutation.mutate(jobId);
  };

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

  const isLoading = activeTab === 'browse' ? isJobsLoading : (activeTab === 'applications' ? isAppsLoading : isSavedJobsLoading);
  const jobs = Array.isArray(jobsResponse?.data) ? jobsResponse.data : [];
  const applications = Array.isArray(appsResponse?.data) ? appsResponse.data : [];

  const appStatusOptions = [
    { label: 'All', value: '' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Reviewed', value: 'REVIEWED' },
    { label: 'Shortlisted', value: 'SHORTLISTED' },
    { label: 'Onboarded', value: 'ONBOARDED' },
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
    if (!recruiterId) {
      toast.info("Hiring manager details are pending for this startup. We have notified their HR team.");
      return;
    }
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
    <div 
      className="flex flex-col"
      style={{
        '--radius-sm': '6px',
        '--radius-md': '8px',
        '--radius-lg': '10px',
        '--radius': '10px',
      } as React.CSSProperties}
    >
      {/* Tabs Switcher */}
      <div className="flex border-b border-border/50 mb-6 select-none">
        <button
          onClick={() => {
            setActiveTab('browse');
            setSelectedJob(null);
          }}
          className={cn(
            "px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2",
            activeTab === 'browse'
              ? "border-[#0a66c2] text-[#0a66c2]"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Briefcase className="w-3.5 h-3.5" />
          Browse Jobs
        </button>
        <button
          onClick={() => {
            setActiveTab('saved');
            setSelectedJob(null);
          }}
          className={cn(
            "px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2",
            activeTab === 'saved'
              ? "border-[#0a66c2] text-[#0a66c2]"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Bookmark className="w-3.5 h-3.5 animate-in fade-in" />
          Saved Jobs
        </button>
        <button
          onClick={() => {
            setActiveTab('applications');
            setSelectedJob(null);
          }}
          className={cn(
            "px-5 py-3 text-xs font-bold uppercase tracking-wider border-b-2 transition-all cursor-pointer flex items-center gap-2",
            activeTab === 'applications'
              ? "border-[#0a66c2] text-[#0a66c2]"
              : "border-transparent text-muted-foreground hover:text-foreground"
          )}
        >
          <Briefcase className="w-3.5 h-3.5" />
          Applied Jobs
        </button>
      </div>

      {/* Search and Filters Header */}
      {activeTab === 'browse' && (
        <JobFiltersHeader
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          selectedCategory={selectedCategory}
          setSelectedCategory={setSelectedCategory}
          showMobileMore={showMobileMore}
          setShowMobileMore={setShowMobileMore}
          setActiveSearchQuery={setActiveSearchQuery}
          onSectionChange={onSectionChange}
        />
      )}

      <div className="flex gap-6 items-start">
        <div className={cn(
          "flex-1 bg-card border border-border/50 rounded-sm transition-all",
          selectedJob ? "hidden lg:block lg:flex-[0.4]" : "w-full"
        )}>
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (activeTab === 'browse' ? jobs : activeTab === 'applications' ? applications : savedJobs).length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <div className="w-20 h-20 rounded-sm bg-muted/20 flex items-center justify-center mb-6">
                <Briefcase className="w-8 h-8 text-muted-foreground opacity-20" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {activeTab === 'browse' ? 'No jobs found' : activeTab === 'applications' ? 'No applications yet' : 'No saved jobs yet'}
              </h3>
              <p className="text-muted-foreground text-sm max-w-xs">
                {activeTab === 'browse'
                  ? "We couldn't find any active job listings matching your criteria."
                  : activeTab === 'applications'
                  ? "You haven't applied to any jobs yet. Start exploring the latest opportunities!"
                  : "You haven't saved any jobs yet. Save jobs to keep track of them here."}
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {activeTab === 'browse' && (
                <div className="p-4 border-b border-border/50">
                  <h3 className="text-lg font-bold text-foreground">Top job picks for you</h3>
                  <p className="text-xs text-muted-foreground">Based on your profile, preferences, and activity like applies, searches, and saves</p>
                </div>
              )}

              <div>
                <div className="grid grid-cols-1">
                  {activeTab === 'browse' || activeTab === 'saved' ? (
                    <div className="flex flex-col">
                      {(activeTab === 'browse' ? jobs : savedJobs).map((job, index) => (
                        <React.Fragment key={job.id}>
                          <JobCard
                            job={job}
                            isSelected={selectedJob?.id === job.id}
                            onClick={() => {
                              setSelectedJob(job);
                              jobsService.getJobDetail(job.id).then(res => {
                                if (res.status === 'success' && res.data) setSelectedJob(res.data);
                              });
                            }}
                            onUnsave={activeTab === 'saved' ? () => {
                              toggleSaveJob(job.id);
                              if (selectedJob?.id === job.id) {
                                setSelectedJob(null);
                              }
                            } : undefined}
                          />
                          {activeTab === 'browse' && index === 4 && (
                            <RecentSearches
                              onSearchClick={(query) => {
                                setSearchQuery(query);
                                setActiveSearchQuery(query);
                              }}
                            />
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
          "lg:flex-[0.6] flex flex-col bg-card border border-border rounded-sm overflow-hidden transition-all",
          "h-[calc(100vh-9rem)] lg:h-[calc(100vh-5.5rem)] lg:sticky lg:top-20 lg:self-start",
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
              savedJobIds={savedJobIds}
              onToggleSave={toggleSaveJob}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-10 opacity-40">
              <div className="w-24 h-24 rounded-sm bg-muted flex items-center justify-center mb-6">
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
