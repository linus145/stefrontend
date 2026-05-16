'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiInterviewsService } from '@/services/ai-interviews.service';
import { jobsService } from '@/services/jobs.service';
import { 
  Search, 
  Users2, 
  Clock, 
  BrainCircuit,
  ClipboardCheck,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
  Timer,
  CalendarDays,
  Trash2,
  Copy
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface InterviewSession {
  id: string;
  application_id: string;
  candidate_name: string;
  job_title: string;
  status: string;
  rounds_count: number;
  overall_score: number | null;
  created_at: string;
  is_orchestrated: boolean;
  exam_credentials: {
    username: string;
    password: string;
  } | null;
}

interface InterviewPipelineViewProps {
  onConfigure: (appId?: string, sessionId?: string) => void;
  onSectionChange: (section: string) => void;
}

export function InterviewPipelineView({ onConfigure, onSectionChange }: InterviewPipelineViewProps) {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const { data: sessionsResponse, isLoading, refetch, isRefetching } = useQuery({
    queryKey: ['ai-interview-sessions'],
    queryFn: aiInterviewsService.getSessions,
    refetchOnWindowFocus: true,
  });

  const rescheduleMutation = useMutation({
    mutationFn: (applicationId: string) => 
      jobsService.updateApplicationStatus(applicationId, 'INTERVIEW'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-interview-sessions'] });
      toast.success('Interview rescheduled successfully');
    },
    onError: () => toast.error('Failed to reschedule interview')
  });

  const deleteSessionMutation = useMutation({
    mutationFn: (sessionId: string) => aiInterviewsService.deleteSession(sessionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-interview-sessions'] });
      toast.success('Interview session deleted permanently');
    },
    onError: () => toast.error('Failed to delete session'),
  });

  const sessions: InterviewSession[] = Array.isArray(sessionsResponse?.data) ? sessionsResponse.data : [];

  const filteredSessions = sessions.filter(s => {
    const matchesSearch = s.candidate_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         s.job_title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filter === 'all' || s.status.toLowerCase() === filter;
    return matchesSearch && matchesFilter;
  });

  // Stats calculation
  const stats = {
    total: sessions.length,
    active: sessions.filter(s => ['pending', 'active', 'started'].includes(s.status.toLowerCase())).length,
    evaluating: sessions.filter(s => s.status.toLowerCase() === 'evaluating').length,
    completed: sessions.filter(s => s.status.toLowerCase() === 'completed').length
  };

  const getStatusStyle = (status: string) => {
    switch (status.toUpperCase()) {
      case 'COMPLETED': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
      case 'IN_PROGRESS': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'PENDING': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
      default: return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  const RenderTableBody = () => {
    if (isLoading) {
      return Array.from({ length: 4 }).map((_, i) => (
        <tr key={i} className="border-b border-border/50 last:border-0 animate-pulse">
          {Array.from({ length: 6 }).map((__, j) => (
            <td key={j} className="px-4 py-5">
              <div className="h-3.5 bg-muted rounded w-full opacity-40" />
            </td>
          ))}
        </tr>
      ));
    }

    if (filteredSessions.length === 0) {
      return (
        <tr>
          <td colSpan={6} className="px-6 py-20 text-center">
            <p className="text-sm font-medium opacity-40">No matching interview sessions found.</p>
          </td>
        </tr>
      );
    }

    return filteredSessions.map((session) => (
      <tr key={session.id} className="border-b border-border/50 last:border-0 group hover:bg-muted/5 transition-colors">
        {/* Candidate */}
        <td className="pl-6 pr-4 py-3">
          <p className="text-[13px] font-bold truncate max-w-[200px]" data-agent="candidate-name">{session.candidate_name}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{new Date(session.created_at).toLocaleDateString()}</p>
        </td>
        {/* Role */}
        <td className="px-4 py-3">
          <p className="text-[13px] font-semibold truncate max-w-[160px]">{session.job_title}</p>
        </td>
        {/* Status */}
        <td className="px-4 py-3">
          <span className={cn(
            "inline-flex px-2 py-0.5 rounded-sm text-[10px] font-bold capitalize border whitespace-nowrap",
            getStatusStyle(session.status)
          )}>
            {session.status.toLowerCase().replace(/_/g, ' ')}
          </span>
        </td>
        {/* Rounds */}
        <td className="px-4 py-3 text-center">
          <span className="text-[13px] font-bold">{session.rounds_count}</span>
        </td>
        {/* Exam Access */}
        <td className="px-4 py-3">
          {session.exam_credentials ? (
            <div className="flex items-center gap-3">
              <div className="min-w-0">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  <span className="font-mono font-bold text-foreground">{session.exam_credentials.username}</span>
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  <span className="font-mono font-bold text-foreground">{session.exam_credentials.password}</span>
                </p>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `Username: ${session.exam_credentials!.username}\nPassword: ${session.exam_credentials!.password}\nExam Portal: ${window.location.origin}/interview/exam`
                  );
                  toast.success('Credentials copied');
                }}
                className="shrink-0 px-2 py-1 rounded-sm bg-blue-600/10 text-blue-600 text-[10px] font-bold hover:bg-blue-600 hover:text-white transition-all"
              >Copy</button>
            </div>
          ) : (
            <span className="text-[11px] text-muted-foreground/40 italic">Not generated</span>
          )}
        </td>
        {/* Action */}
        <td className="pl-4 pr-6 py-3 text-right">
          <div className="flex items-center justify-end gap-2">
            <button
              onClick={() => onConfigure(session.application_id, session.is_orchestrated ? session.id : undefined)}
              data-agent="configure-interview-button"
              className={cn(
                "px-3 py-1.5 rounded-sm text-[11px] font-bold transition-all active:scale-95 whitespace-nowrap",
                !session.is_orchestrated
                  ? "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                  : "border border-border hover:bg-blue-600 hover:text-white hover:border-blue-600"
              )}
              title={!session.is_orchestrated ? 'Configure Interview' : 'Reconfigure Interview'}
            >
              {!session.is_orchestrated ? 'Configure' : 'Reconfigure'}
            </button>
            
            {session.is_orchestrated && (
              <>
                <button
                  onClick={() => rescheduleMutation.mutate(session.application_id)}
                  disabled={rescheduleMutation.isPending}
                  className="w-8 h-8 flex items-center justify-center rounded-sm bg-blue-600/5 text-blue-600 hover:bg-blue-600 hover:text-white transition-all active:scale-95 border border-blue-600/10 disabled:opacity-50"
                  title="Reschedule Interview"
                >
                  <RefreshCw className={cn("w-3.5 h-3.5", rescheduleMutation.isPending && "animate-spin")} />
                </button>
                <button
                  onClick={() => onSectionChange('evaluation')}
                  className="w-8 h-8 flex items-center justify-center rounded-sm bg-emerald-600/10 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all active:scale-95 shadow-sm"
                  title="View Evaluation"
                >
                  <ClipboardCheck className="w-4 h-4" />
                </button>
              </>
            )}

            {/* Permanent Delete Button */}
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to delete this interview session permanently? This action cannot be undone.')) {
                  deleteSessionMutation.mutate(session.id);
                }
              }}
              disabled={deleteSessionMutation.isPending}
              className="w-8 h-8 flex items-center justify-center rounded-sm bg-red-600/5 text-red-600 hover:bg-red-600 hover:text-white transition-all active:scale-95 border border-red-600/10 disabled:opacity-50"
              title="Delete Session Permanently"
            >
              <Trash2 className={cn("w-3.5 h-3.5", deleteSessionMutation.isPending && "animate-spin")} />
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  const handleSync = async () => {
    const toastId = toast.loading('Syncing pipeline with latest applications...');
    try {
      await refetch();
      toast.success('Pipeline synchronized', { id: toastId });
    } catch (e) {
      toast.error('Sync failed', { id: toastId });
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Header with Search & Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Interview Pipeline</h2>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <button 
            onClick={handleSync}
            disabled={isRefetching}
            data-agent="sync-pipeline-button"
            className="flex items-center gap-2 px-4 py-2 rounded-sm border border-border bg-card text-[13px] font-bold hover:bg-muted transition-all active:scale-95"
          >
            <RefreshCw className={cn("w-3.5 h-3.5", isRefetching && "animate-spin")} />
            Sync Pipeline
          </button>

          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-blue-600" />
            <input 
              type="text" 
              placeholder="Search candidate or role..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              data-agent="pipeline-search-input"
              className="w-full bg-background border border-border rounded-sm py-2 pl-9 pr-3 text-[13px] font-medium focus:outline-none focus:ring-1 focus:ring-blue-600/50 shadow-sm transition-all"
            />
          </div>

          <div className="flex items-center bg-muted/50 rounded-sm p-1 border border-border">
            {(['all', 'pending', 'completed'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={cn(
                  "px-4 py-1.5 rounded-sm text-[13px] font-semibold capitalize transition-all",
                  filter === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border p-4 rounded-sm shadow-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600/10 text-blue-600 flex items-center justify-center">
            <Users2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Sessions</p>
            <h4 className="text-xl font-bold mt-0.5">{stats.total}</h4>
          </div>
        </div>
        <div className="bg-card border border-border p-4 rounded-sm shadow-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-600/10 text-amber-600 flex items-center justify-center">
            <Timer className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Interviewing</p>
            <h4 className="text-xl font-bold mt-0.5">{stats.active}</h4>
          </div>
        </div>
        <div className="bg-card border border-border p-4 rounded-sm shadow-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 flex items-center justify-center">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Evaluating</p>
            <h4 className="text-xl font-bold mt-0.5">{stats.evaluating}</h4>
          </div>
        </div>
        <div className="bg-card border border-border p-4 rounded-sm shadow-sm flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-600/10 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Completed</p>
            <h4 className="text-xl font-bold mt-0.5">{stats.completed}</h4>
          </div>
        </div>
      </div>

      {/* Sessions Table */}
      <div className="bg-card border border-border rounded-sm overflow-hidden shadow-sm">
        <div className="overflow-x-auto no-scrollbar">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/30 border-b border-border">
                <th className="pl-6 pr-4 py-3.5 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider w-[25%]">Candidate</th>
                <th className="px-4 py-3.5 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider w-[20%]">Role</th>
                <th className="px-4 py-3.5 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider w-[10%]">Status</th>
                <th className="px-4 py-3.5 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider w-[7%] text-center">Rounds</th>
                <th className="px-4 py-3.5 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider w-[22%]">Exam Access</th>
                <th className="pl-4 pr-6 py-3.5 text-left text-[11px] font-bold text-muted-foreground uppercase tracking-wider w-[23%] text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              <RenderTableBody />
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
