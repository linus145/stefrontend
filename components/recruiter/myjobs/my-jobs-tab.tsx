'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsService } from '@/services/jobs.service';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Plus, Briefcase, MapPin, Clock, Users, Loader2, Eye,
  Edit3, Trash2, X, ArrowRight, ChevronDown, Copy, Check, Sparkles, Bot
} from 'lucide-react';
import { JobPost, JobPostCreatePayload, JobStatus } from '@/types/jobs.types';
import { PostJobForm } from '@/components/recruiter/myjobs/post-job-form';
import { aiAgentService } from '@/services/ai-agents.service';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

import { AgentUIController } from '@/agent/ui/AgentUIController';

interface MyJobsTabProps {
  isApproved: boolean;
  onViewApplications: (jobId: string) => void;
}

export function MyJobsTab({ isApproved, onViewApplications }: MyJobsTabProps) {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showPostForm, setShowPostForm] = useState(false);
  const [editingJob, setEditingJob] = useState<JobPost | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [jobToDelete, setJobToDelete] = useState<string | null>(null);

  const handleCopyId = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Job ID copied');
  };

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
        editJob={editingJob}
        onClose={() => { setShowPostForm(false); setEditingJob(null); }}
        onSuccess={() => {
          setShowPostForm(false);
          setEditingJob(null);
          // Invalidate everything related to jobs for immediate sync across tabs
          queryClient.invalidateQueries({ queryKey: ['recruiter-jobs'] });
          queryClient.invalidateQueries({ queryKey: ['recruiter-stats'] });
          queryClient.invalidateQueries({ queryKey: ['job-applications'] });
          queryClient.invalidateQueries({ queryKey: ['screening-history'] });
          queryClient.invalidateQueries({ queryKey: ['recruiter-sessions'] });
        }}
      />
    );
  }

  return (
    <div className="flex relative w-full h-full overflow-hidden">
      <div className={cn(
        "flex-1 p-4 lg:p-6 animate-in fade-in transition-all duration-500 lg:ml-0"
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
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">My Jobs</h1>
            <p className="text-sm text-muted-foreground mt-1 font-medium">{jobs.length} total job postings</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                if (isApproved) {
                  AgentUIController.getInstance().openSidebar("Post a job for a...");
                }
              }}
              disabled={!isApproved}
              data-agent="ai-job-post-button"
              className="flex items-center gap-2 px-5 py-2 bg-[#F5F3FF] border border-[#7C3AED]/20 text-[#7C3AED] text-sm font-bold rounded-sm shadow-sm hover:bg-[#EDE9FE] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
              title="Let AI post this job for you"
            >
              <Sparkles className="w-4 h-4 text-[#7C3AED] group-hover:scale-110 transition-transform" />
              AI Job Post
            </button>

            <button
              onClick={() => isApproved && setShowPostForm(true)}
              disabled={!isApproved}
              data-agent="create-job-button"
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-semibold rounded-sm shadow-sm hover:shadow-lg hover:from-blue-500 hover:to-cyan-500 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-4 h-4" />
              Post New Job
            </button>
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
          {statusFilters.map(f => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={cn(
                "px-4 py-1.5 rounded-md text-xs font-semibold transition-all whitespace-nowrap border",
                statusFilter === f.value
                  ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
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
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
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
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-sm font-semibold rounded-sm hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="bg-card border border-border rounded-sm p-5 hover:border-blue-500/20 hover:shadow-sm transition-all group"
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
                      {(job as any).is_ai_generated && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-[#7C3AED] bg-[#F5F3FF] px-1.5 py-0.5 rounded border border-[#7C3AED]/20 uppercase" title="Posted by AI Copilot">
                          <Sparkles className="w-2.5 h-2.5" /> AI Job Post
                        </span>
                      )}
                      <span className={cn("px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase border", getStatusBadge(job.status))}>
                        {job.status}
                      </span>
                      <div
                        className="flex items-center gap-1.5 px-2 py-0.5 rounded-sm bg-muted text-[9px] font-mono text-muted-foreground border border-border/50 cursor-pointer hover:bg-muted/80 transition-colors"
                        onClick={(e) => handleCopyId(e, job.id)}
                        title="Click to copy Job ID"
                      >
                        <span className="opacity-60">ID:</span> {job.id.slice(0, 8)}...
                        {copiedId === job.id ? <Check className="w-2.5 h-2.5 text-blue-500" /> : <Copy className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100" />}
                      </div>
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
                      <span className="flex items-center gap-1 text-blue-600 font-bold">
                        <Plus className="w-3 h-3" /> {job.open_positions} {job.open_positions === 1 ? 'Opening' : 'Openings'}
                      </span>
                      {job.department && (
                        <span className="flex items-center gap-1 text-violet-600 font-bold">
                          <Briefcase className="w-3 h-3" /> {job.department}
                        </span>
                      )}
                    </div>

                    {/* Skills Section */}
                    {(() => {
                      const displaySkills = Array.from(new Set([
                        ...(job.skills?.map(s => s.name) || []),
                        ...(job.skills_required || [])
                      ]));

                      if (displaySkills.length === 0) return null;

                      return (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {displaySkills.map(skill => (
                            <span
                              key={skill}
                              className="px-2 py-0.5 rounded-[2px] bg-muted text-[10px] font-semibold text-muted-foreground border border-border"
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
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] bg-blue-500/10 text-blue-600 text-xs font-semibold hover:bg-blue-500/20 transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" /> Applications
                    </button>
                    <button
                      onClick={() => setEditingJob(job)}
                      className="p-2 rounded-[2px] text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-all"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setJobToDelete(job.id)}
                      className="p-2 rounded-[2px] text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-all"
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

      {/* Delete Confirmation Modal */}
      <Dialog open={!!jobToDelete} onOpenChange={(open) => !open && setJobToDelete(null)}>
        <DialogContent className="sm:max-w-[400px] border border-border shadow-2xl bg-card overflow-hidden p-0 rounded-sm">
          <div className="p-6">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
              <DialogHeader className="items-center p-0">
                <DialogTitle className="text-xl font-bold text-foreground">Confirm Deletion</DialogTitle>
                <DialogDescription className="text-sm font-medium text-muted-foreground/80 mt-2 max-w-[280px]">
                  Are you sure you want to delete this job posting? This action is permanent and cannot be undone.
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center gap-2">
              <Button
                variant="outline"
                className="w-full sm:flex-1 h-10 font-bold text-xs uppercase tracking-wider border-border hover:bg-muted/50 rounded-sm transition-all"
                onClick={() => setJobToDelete(null)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="w-full sm:flex-1 h-10 font-bold text-xs uppercase tracking-wider rounded-sm shadow-md shadow-red-500/10 transition-all bg-red-600 hover:bg-red-700 text-white border-none"
                disabled={deleteMutation.isPending}
                onClick={() => {
                  if (jobToDelete) {
                    deleteMutation.mutate(jobToDelete, {
                      onSuccess: () => setJobToDelete(null)
                    });
                  }
                }}
              >
                {deleteMutation.isPending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  'Confirm Delete'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

