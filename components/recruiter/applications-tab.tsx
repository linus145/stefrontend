'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { jobsService } from '@/services/jobs.service';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  ArrowLeft, Loader2, Users, Mail, Clock, FileText,
  ChevronDown, User as UserIcon, CheckCircle, XCircle, Eye
} from 'lucide-react';
import { JobApplication, ApplicationStatus } from '@/types/jobs.types';

interface ApplicationsTabProps {
  isCollapsed: boolean;
  selectedJobId: string | null;
  onBack: () => void;
}

export function ApplicationsTab({ isCollapsed, selectedJobId, onBack }: ApplicationsTabProps) {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [expandedApp, setExpandedApp] = useState<string | null>(null);

  // Get all jobs for a selector
  const { data: jobsResponse } = useQuery({
    queryKey: ['recruiter-jobs'],
    queryFn: () => jobsService.getMyJobs(),
  });

  const [activeJobId, setActiveJobId] = useState<string | null>(selectedJobId);

  const { data: applicationsResponse, isLoading } = useQuery({
    queryKey: ['job-applications', activeJobId],
    queryFn: () => jobsService.getJobApplications(activeJobId!),
    enabled: !!activeJobId,
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ appId, status }: { appId: string; status: string }) =>
      jobsService.updateApplicationStatus(appId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-applications'] });
      queryClient.invalidateQueries({ queryKey: ['recruiter-stats'] });
      toast.success('Application status updated.');
    },
    onError: () => toast.error('Failed to update status.'),
  });

  const jobs = Array.isArray(jobsResponse?.data) ? jobsResponse.data : [];
  const allApplications = Array.isArray(applicationsResponse?.data) ? applicationsResponse.data : [];
  
  const applications = statusFilter 
    ? allApplications.filter(app => app.status === statusFilter)
    : allApplications;

  const getStatusCount = (statusValue: string) => {
    if (!statusValue) return allApplications.length;
    return allApplications.filter(app => app.status === statusValue).length;
  };

  const statusOptions: { label: string; value: string; color: string }[] = [
    { label: 'All', value: '', color: '' },
    { label: 'Pending', value: 'PENDING', color: 'bg-amber-500' },
    { label: 'Reviewed', value: 'REVIEWED', color: 'bg-blue-500' },
    { label: 'Shortlisted', value: 'SHORTLISTED', color: 'bg-cyan-500' },
    { label: 'Hired', value: 'HIRED', color: 'bg-emerald-500' },
    { label: 'Rejected', value: 'REJECTED', color: 'bg-red-500' },
  ];

  const getStatusColor = (status: ApplicationStatus) => {
    const map: Record<ApplicationStatus, string> = {
      PENDING: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      REVIEWED: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      SHORTLISTED: 'bg-cyan-500/10 text-cyan-600 border-cyan-500/20',
      HIRED: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      REJECTED: 'bg-red-500/10 text-red-500 border-red-500/20',
    };
    return map[status];
  };

  return (
    <div className={cn(
      "flex-1 p-4 sm:p-6 lg:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700",
      isCollapsed ? "lg:ml-20" : "lg:ml-64"
    )}>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          Back to Jobs
        </button>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Applications</h1>
        <p className="text-sm text-muted-foreground mt-1 font-medium">
          Review and manage applicants for your job postings
        </p>
      </div>

      {/* Job Selector */}
      <div className="mb-6">
        <label className="text-[11px] font-semibold tracking-wider text-muted-foreground uppercase mb-2 block">
          Select Job
        </label>
        <div className="relative max-w-md">
          <select
            value={activeJobId || ''}
            onChange={(e) => { setActiveJobId(e.target.value || null); setStatusFilter(''); }}
            className="w-full rounded-sm bg-muted/30 border border-border text-foreground px-4 py-2.5 text-sm focus:ring-1 focus:ring-teal-500 focus:border-teal-500 outline-none appearance-none"
          >
            <option value="">-- Select a job --</option>
            {jobs.map((job: any) => (
              <option key={job.id} value={job.id}>
                {job.title} ({job.applications_count} applicants)
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-muted-foreground">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
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
          <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
            {statusOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setStatusFilter(opt.value)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all whitespace-nowrap border",
                  statusFilter === opt.value
                    ? "bg-teal-500/10 text-teal-600 border-teal-500/30"
                    : "bg-muted/30 text-muted-foreground border-border hover:bg-muted/50"
                )}
              >
                {opt.color && <div className={cn("w-1.5 h-1.5 rounded-full", opt.color)} />}
                {opt.label} ({getStatusCount(opt.value)})
              </button>
            ))}
          </div>

          {/* Applications List */}
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
            </div>
          ) : applications.length === 0 ? (
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
              {applications.map((app: JobApplication) => (
                <div
                  key={app.id}
                  className="bg-card border border-border rounded-sm overflow-hidden hover:border-teal-500/20 transition-all"
                >
                  <div
                    className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 cursor-pointer"
                    onClick={() => setExpandedApp(expandedApp === app.id ? null : app.id)}
                  >
                    {/* Avatar */}
                    <div className="w-10 h-10 rounded-full bg-teal-500/10 flex items-center justify-center shrink-0">
                      {app.applicant.profile_image_url ? (
                        <img src={app.applicant.profile_image_url} alt="" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <UserIcon className="w-5 h-5 text-teal-600" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="text-sm font-semibold text-foreground">
                          {app.applicant.first_name} {app.applicant.last_name}
                        </h4>
                        <span className={cn("px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border", getStatusColor(app.status))}>
                          {app.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {app.applicant.email}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {new Date(app.applied_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    {/* Quick status actions */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {app.status === 'PENDING' && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); updateStatusMutation.mutate({ appId: app.id, status: 'REVIEWED' }); }}
                            className="p-2 rounded-sm bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 transition-all"
                            title="Mark as Reviewed"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); updateStatusMutation.mutate({ appId: app.id, status: 'SHORTLISTED' }); }}
                            className="p-2 rounded-sm bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-all"
                            title="Shortlist"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); updateStatusMutation.mutate({ appId: app.id, status: 'REJECTED' }); }}
                            className="p-2 rounded-sm bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {app.status === 'REVIEWED' && (
                        <>
                          <button
                            onClick={(e) => { e.stopPropagation(); updateStatusMutation.mutate({ appId: app.id, status: 'SHORTLISTED' }); }}
                            className="p-2 rounded-sm bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 transition-all"
                            title="Shortlist"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); updateStatusMutation.mutate({ appId: app.id, status: 'REJECTED' }); }}
                            className="p-2 rounded-sm bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
                            title="Reject"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      {app.status === 'SHORTLISTED' && (
                        <button
                          onClick={(e) => { e.stopPropagation(); updateStatusMutation.mutate({ appId: app.id, status: 'HIRED' }); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm bg-emerald-500/10 text-emerald-600 text-xs font-semibold hover:bg-emerald-500/20 transition-all"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Hire
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded Content */}
                  {expandedApp === app.id && (
                    <div className="px-5 pb-5 pt-0 border-t border-border/50 animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="mt-4 space-y-4">
                        {app.cover_letter && (
                          <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Cover Letter</p>
                            <p className="text-sm text-foreground leading-relaxed bg-muted/20 rounded-sm p-4 border border-border/50">
                              {app.cover_letter}
                            </p>
                          </div>
                        )}
                        {app.resume_url && (
                          <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Resume</p>
                            <a
                              href={app.resume_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-sm bg-teal-500/10 text-teal-600 text-xs font-semibold hover:bg-teal-500/20 transition-all"
                            >
                              <FileText className="w-3.5 h-3.5" /> View Resume
                            </a>
                          </div>
                        )}

                        {/* Status Changer */}
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">Change Status</p>
                          <div className="flex flex-wrap gap-2">
                            {(['PENDING', 'REVIEWED', 'SHORTLISTED', 'HIRED', 'REJECTED'] as ApplicationStatus[]).map(s => (
                              <button
                                key={s}
                                disabled={app.status === s || updateStatusMutation.isPending}
                                onClick={() => updateStatusMutation.mutate({ appId: app.id, status: s })}
                                className={cn(
                                  "px-3 py-1.5 rounded-full text-[10px] font-bold uppercase border transition-all",
                                  app.status === s
                                    ? cn(getStatusColor(s), "opacity-100")
                                    : "bg-muted/30 text-muted-foreground border-border hover:opacity-80 disabled:opacity-30"
                                )}
                              >
                                {s}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
