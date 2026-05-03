'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsService } from '@/services/jobs.service';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Plus, Briefcase, MapPin, Clock, Users, Loader2, Eye,
  Edit3, Trash2, X, ArrowRight, ChevronDown
} from 'lucide-react';
import { JobPost, JobPostCreatePayload, JobStatus } from '@/types/jobs.types';
import { PostJobForm } from '@/components/recruiter/myjobs/post-job-form';

interface MyJobsTabProps {
  isCollapsed: boolean;
  isApproved: boolean;
  onViewApplications: (jobId: string) => void;
}

export function MyJobsTab({ isCollapsed, isApproved, onViewApplications }: MyJobsTabProps) {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPost | null>(null);

  const { data: jobsResponse, isLoading } = useQuery({
    queryKey: ['recruiter-jobs', statusFilter],
    queryFn: () => jobsService.getMyJobs(statusFilter || undefined),
  });

  const deleteMutation = useMutation({
    mutationFn: (jobId: string) => jobsService.deleteJob(jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiter-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['recruiter-stats'] });
      toast.success('Job post deleted.');
    },
    onError: () => toast.error('Failed to delete job.'),
  });

  const jobs = Array.isArray(jobsResponse?.data) ? jobsResponse.data : [];

  const statusFilters: { label: string; value: string }[] = [
    { label: 'All', value: '' },
    { label: 'Draft', value: 'DRAFT' },
    { label: 'Active', value: 'ACTIVE' },
    { label: 'Closed', value: 'CLOSED' },
  ];

  const getStatusBadge = (status: JobStatus) => {
    const map: Record<JobStatus, string> = {
      DRAFT: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      ACTIVE: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      CLOSED: 'bg-red-500/10 text-red-500 border-red-500/20',
    };
    return map[status] || '';
  };

  if (showPostForm || editingJob) {
    return (
      <PostJobForm
        isCollapsed={isCollapsed}
        editJob={editingJob}
        onClose={() => { setShowPostForm(false); setEditingJob(null); }}
        onSuccess={() => {
          setShowPostForm(false);
          setEditingJob(null);
          queryClient.invalidateQueries({ queryKey: ['recruiter-jobs'] });
          queryClient.invalidateQueries({ queryKey: ['recruiter-stats'] });
        }}
      />
    );
  }

  return (
    <div className={cn(
      "flex-1 p-4 sm:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700",
      isCollapsed ? "lg:ml-20" : "lg:ml-64"
    )}>
      {!isApproved && (
        <div className="mb-6 p-4 rounded-sm bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
          <div className="p-2 rounded-sm bg-amber-500/20 mt-0.5">
            <Plus className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-amber-600">Pending Approval</h3>
            <p className="text-xs text-amber-600/80 mt-1 font-medium">Your company profile is currently being reviewed. You will be able to post jobs once approved.</p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">My Jobs</h1>
          <p className="text-sm text-muted-foreground mt-1 font-medium">{jobs.length} total job postings</p>
        </div>
        <button
          onClick={() => isApproved && setShowPostForm(true)}
          disabled={!isApproved}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-sm font-semibold rounded-sm shadow-sm hover:shadow-lg hover:from-teal-500 hover:to-cyan-500 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" />
          Post New Job
        </button>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {statusFilters.map(f => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={cn(
              "px-4 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap border",
              statusFilter === f.value
                ? "bg-teal-500/10 text-teal-600 border-teal-500/30"
                : "bg-muted/30 text-muted-foreground border-border hover:bg-muted/50"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Jobs List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
        </div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-20 h-20 rounded-sm bg-muted/20 border border-dashed border-border/50 flex items-center justify-center mx-auto mb-6">
            <Briefcase className="w-8 h-8 text-muted-foreground opacity-30" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">No jobs posted yet</h3>
          <p className="text-sm text-muted-foreground mb-6">Create your first job posting to start receiving applications.</p>
          <button
            onClick={() => isApproved && setShowPostForm(true)}
            disabled={!isApproved}
            className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-sm font-semibold rounded-sm hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Create Job
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {jobs.map((job: JobPost) => (
            <div
              key={job.id}
              className="bg-card border border-border rounded-sm p-5 hover:border-teal-500/20 hover:shadow-sm transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-base font-semibold text-foreground truncate">{job.title}</h3>
                    {job.company?.is_genuine && (
                      <span className="flex items-center gap-1 text-[10px] font-bold text-blue-500 bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20 uppercase" title="Genuine Company">
                        <svg className="w-2.5 h-2.5" fill="currentColor" viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" /></svg>
                        Genuine
                      </span>
                    )}
                    <span className={cn("px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase border", getStatusBadge(job.status))}>
                      {job.status}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {job.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" /> {job.location}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Briefcase className="w-3 h-3" /> {job.job_type.replace('_', ' ')}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {job.work_mode}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" /> {job.applications_count} applicant{job.applications_count !== 1 ? 's' : ''}
                    </span>
                  </div>

                  {/* Skills Section */}
                  {(() => {
                    const displaySkills = (job.skills && job.skills.length > 0) 
                      ? job.skills.map(s => s.name) 
                      : (job.skills_required || []);
                    
                    if (displaySkills.length === 0) return null;

                    return (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {displaySkills.map(skill => (
                          <span
                            key={skill}
                            className="px-2 py-0.5 rounded-sm bg-muted text-[10px] font-semibold text-muted-foreground border border-border"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onViewApplications(job.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-teal-500/10 text-teal-600 text-xs font-semibold hover:bg-teal-500/20 transition-all"
                  >
                    <Eye className="w-3.5 h-3.5" /> Applications
                  </button>
                  <button
                    onClick={() => setEditingJob(job)}
                    className="p-2 rounded-sm text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm('Are you sure you want to delete this job?')) {
                        deleteMutation.mutate(job.id);
                      }
                    }}
                    className="p-2 rounded-sm text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
