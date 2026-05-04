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
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [showAgentModal, setShowAgentModal] = useState(false);
  const [agentPrompt, setAgentPrompt] = useState('');
  const [isAgentRunning, setIsAgentRunning] = useState(false);

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

  const handleAgenticPost = async () => {
    if (!agentPrompt.trim()) {
      toast.error('Please enter a job description prompt for the AI Agent.');
      return;
    }
    setIsAgentRunning(true);
    try {
      const data = await aiAgentService.executeTask({
        task_type: 'agentic_job_post',
        payload: { prompt: agentPrompt }
      });
      
      toast.success(data.message || 'AI Agent successfully posted the job!');
      setShowAgentModal(false);
      setAgentPrompt('');
      queryClient.invalidateQueries({ queryKey: ['recruiter-jobs'] });
      queryClient.invalidateQueries({ queryKey: ['recruiter-stats'] });
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Agent failed to post the job.');
      toast.error('Network error. Agent could not reach the server.');
    } finally {
      setIsAgentRunning(false);
    }
  };

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
    <div className="flex relative w-full h-full overflow-hidden">
      <div className={cn(
        "flex-1 p-4 sm:p-6 lg:p-8 animate-in fade-in transition-all duration-500",
        isCollapsed ? "lg:ml-20" : "lg:ml-64",
        showAgentModal ? "lg:mr-[400px]" : ""
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
        <div className="flex items-center gap-3">
          <button
            onClick={() => isApproved && setShowAgentModal(true)}
            disabled={!isApproved}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#F5F3FF] border border-[#7C3AED]/20 text-[#7C3AED] text-sm font-bold rounded-sm shadow-sm hover:bg-[#EDE9FE] transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed group"
            title="Let AI post this job for you"
          >
            <Sparkles className="w-4 h-4 text-[#7C3AED] group-hover:scale-110 transition-transform" />
            AI Job Post
          </button>
          
          <button
            onClick={() => isApproved && setShowPostForm(true)}
            disabled={!isApproved}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-600 to-cyan-600 text-white text-sm font-semibold rounded-sm shadow-sm hover:shadow-lg hover:from-teal-500 hover:to-cyan-500 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            Post New Job
          </button>
        </div>
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
                      {copiedId === job.id ? <Check className="w-2.5 h-2.5 text-teal-500" /> : <Copy className="w-2.5 h-2.5 opacity-40 group-hover:opacity-100" />}
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
                    <span className="flex items-center gap-1 text-teal-600 font-bold">
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

      {/* AI Agent Sidebar */}
      <div className={cn(
        "fixed right-0 top-16 bottom-0 w-full lg:w-[400px] bg-white border-l border-slate-200 shadow-2xl z-40 transform transition-transform duration-500 ease-in-out flex flex-col font-sans",
        showAgentModal ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="p-6 bg-gradient-to-br from-[#F5F3FF] to-white border-b border-slate-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center border border-[#7C3AED]/10">
              <Bot className="w-5 h-5 text-[#7C3AED]" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 tracking-tight">Agentic Task</h3>
              <p className="text-xs font-semibold text-[#7C3AED] uppercase tracking-wider">Automated Job Posting</p>
            </div>
          </div>
          <button onClick={() => !isAgentRunning && setShowAgentModal(false)} className="text-slate-400 hover:text-slate-600 bg-slate-50 hover:bg-slate-100 p-2 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 flex-1 flex flex-col space-y-4 overflow-y-auto">
          <p className="text-sm text-slate-600 font-medium">
            Describe the job you want to post. The AI agent will automatically generate the description, extract skills, determine salary ranges, and publish the job immediately.
          </p>
          
          <textarea
            value={agentPrompt}
            onChange={(e) => setAgentPrompt(e.target.value)}
            placeholder="e.g., Post a job for a Senior Next.js Developer in San Francisco with 5 years experience..."
            className="flex-1 min-h-[150px] w-full p-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#7C3AED] resize-none text-slate-900 placeholder:text-slate-400"
            disabled={isAgentRunning}
          />
          
          <div className="pt-2 pb-6">
            <button
              onClick={handleAgenticPost}
              disabled={isAgentRunning || !agentPrompt.trim()}
              className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-bold rounded-xl transition-all shadow-lg shadow-[#7C3AED]/20 disabled:opacity-50"
            >
              {isAgentRunning ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Agent is working...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Run Agent
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
