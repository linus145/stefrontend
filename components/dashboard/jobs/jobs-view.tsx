'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsService } from '@/services/jobs.service';
import { JobPost } from '@/types/jobs.types';
import { cn } from '@/lib/utils';
import { 
  Briefcase, 
  ChevronRight, 
  Search, 
  Filter,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';

// Modular Components
import { JobCard } from './job-card';
import { ApplicationCard } from './application-card';
import { JobDetails } from './job-details';
import { ApplyModal } from './apply-modal';

interface JobsViewProps {
  isCollapsed: boolean;
}

export function JobsView({ isCollapsed }: JobsViewProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'browse' | 'applications'>('browse');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJob, setSelectedJob] = useState<JobPost | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [resumeUrl, setResumeUrl] = useState('');
  const [coverLetter, setCoverLetter] = useState('');

  const [statusFilter, setStatusFilter] = useState('');

  // Queries
  const { data: jobsResponse, isLoading: isJobsLoading } = useQuery({
    queryKey: ['public-jobs', searchQuery],
    queryFn: () => jobsService.getPublicJobs(searchQuery ? { search: searchQuery } : undefined),
    enabled: activeTab === 'browse',
  });

  const { data: appsResponse, isLoading: isAppsLoading } = useQuery({
    queryKey: ['my-applications', statusFilter],
    queryFn: () => jobsService.getMyApplications(statusFilter || undefined),
    enabled: activeTab === 'applications',
  });

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
    e.preventDefault();
    if (!selectedJob) return;
    applyMutation.mutate({
      jobId: selectedJob.id,
      resume_url: resumeUrl,
      cover_letter: coverLetter
    });
  };

  const handleEasyApply = () => {
    if (!selectedJob) return;
    applyMutation.mutate({
      jobId: selectedJob.id,
      resume_url: '', // Backend pulls from profile
      cover_letter: 'Applied via Easy Apply using profile details.'
    });
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
      {/* Header & Tabs */}
      <div className="mb-6 flex flex-col gap-6">
        <div className="flex items-center gap-2 p-1 bg-muted/30 rounded-xl w-fit border border-border/50">
          <button
            onClick={() => { setActiveTab('browse'); setSelectedJob(null); }}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
              activeTab === 'browse' ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            Browse Jobs
          </button>
          <button
            onClick={() => { setActiveTab('applications'); setSelectedJob(null); }}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-bold transition-all",
              activeTab === 'applications' ? "bg-background text-primary shadow-sm" : "text-muted-foreground hover:text-foreground"
            )}
          >
            My Applications
          </button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          {activeTab === 'browse' ? (
            <>
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search jobs, companies, skills..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-muted/30 border border-border rounded-xl text-sm focus:ring-1 focus:ring-primary outline-none transition-all"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2 bg-muted/30 border border-border rounded-xl text-sm font-medium hover:bg-muted/50 transition-all">
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </>
          ) : (
            <div className="flex gap-2 overflow-x-auto w-full pb-1">
              {appStatusOptions.map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setStatusFilter(opt.value)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap border",
                    statusFilter === opt.value
                      ? "bg-primary/10 text-primary border-primary/30"
                      : "bg-muted/30 text-muted-foreground border-border hover:bg-muted/50"
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Left Side: Job/App List */}
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
                    jobs.map((job) => (
                      <JobCard 
                        key={job.id} 
                        job={job} 
                        isSelected={selectedJob?.id === job.id} 
                        onClick={() => setSelectedJob(job)} 
                      />
                    ))
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

        {/* Right Side: Details View */}
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

      {/* Apply Modal */}
      {isApplyModalOpen && selectedJob && (
        <ApplyModal 
          job={selectedJob}
          resumeUrl={resumeUrl}
          setResumeUrl={setResumeUrl}
          coverLetter={coverLetter}
          setCoverLetter={setCoverLetter}
          isPending={applyMutation.isPending}
          onClose={() => setIsApplyModalOpen(false)}
          onSubmit={handleApply}
        />
      )}
    </div>
  );
}
