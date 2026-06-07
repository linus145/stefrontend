'use client';

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiInterviewsService } from '@/services/ai-interviews.service';
import { jobsService } from '@/services/jobs.service';
import { ChevronRight, Zap, X, Clock, CheckCircle2, BrainCircuit, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { EvaluationSidebar } from './EvaluationSidebar';
import { EvaluationContent } from './EvaluationContent';

const toSentenceCase = (str: string) => {
  if (!str) return str;
  const lower = str.toLowerCase().replace(/_/g, ' ');
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

export function EvaluationView() {
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationProgress, setEvaluationProgress] = useState(0);
  const [evaluationTime, setEvaluationTime] = useState(0);

  // Bulk evaluation state
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isBulkEvaluating, setIsBulkEvaluating] = useState(false);
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0, candidateName: '', percent: 0 });
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const queryClient = useQueryClient();

  const onboardMutation = useMutation({
    mutationFn: (applicationId: string) => jobsService.updateApplicationStatus(applicationId, 'ONBOARDED'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluation-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['session-detail', selectedSessionId] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['onboarding-employees'] });
      queryClient.invalidateQueries({ queryKey: ['recruiter-stats'] });
      toast.success('Candidate successfully onboarded to HR System!');
    },
    onError: () => toast.error('Failed to onboard candidate.')
  });

  const { data: sessionsResponse, isLoading: sessionsLoading, refetch: refetchSessions } = useQuery({
    queryKey: ['evaluation-sessions'],
    queryFn: aiInterviewsService.getSessions,
  });

  const { data: detailResponse, isLoading: detailLoading, refetch: refetchDetail } = useQuery({
    queryKey: ['session-detail', selectedSessionId],
    queryFn: () => aiInterviewsService.getSessionDetail(selectedSessionId!),
    enabled: !!selectedSessionId,
  });

  const sessions = Array.isArray(sessionsResponse?.data) ? sessionsResponse.data : [];
  const filteredSessions = sessions.filter((s: any) =>
    s.candidate_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.job_title.toLowerCase().includes(searchQuery.toLowerCase())
  ).filter((s: any) => s.is_orchestrated);

  const selectedSession = detailResponse?.data;

  // Extract unique job roles for the bulk evaluation dropdown
  const uniqueJobs = useMemo(() => {
    const jobMap = new Map<string, { id: string; title: string; count: number }>();
    filteredSessions.forEach((s: any) => {
      if (s.job_id && s.is_orchestrated) {
        const existing = jobMap.get(s.job_id);
        if (existing) {
          existing.count++;
        } else {
          jobMap.set(s.job_id, { id: s.job_id, title: s.job_title, count: 1 });
        }
      }
    });
    return Array.from(jobMap.values());
  }, [filteredSessions]);

  const handleEvaluate = async (id: string) => {
    if (isEvaluating) return;

    setIsEvaluating(true);
    setEvaluationProgress(0);
    setEvaluationTime(0);

    try {
      const detailRes = await aiInterviewsService.getSessionDetail(id);
      const sessionData = detailRes?.data;
      if (!sessionData?.rounds) throw new Error('No rounds found');

      const questionsToEvaluate: { id: string; roundIndex: number; questionIndex: number }[] = [];
      sessionData.rounds.forEach((rnd: any, ri: number) => {
        rnd.questions?.forEach((q: any, qi: number) => {
          if (q.candidate_answer) {
            questionsToEvaluate.push({ id: q.id, roundIndex: ri, questionIndex: qi });
          }
        });
      });

      if (questionsToEvaluate.length === 0) {
        toast.info('No candidate answers to evaluate.');
        setIsEvaluating(false);
        return;
      }

      const totalQuestions = questionsToEvaluate.length;
      setEvaluationTime(totalQuestions * 4);

      let evaluatedCount = 0;
      for (const q of questionsToEvaluate) {
        try {
          await aiInterviewsService.evaluateQuestion(q.id, true);
        } catch (err) {
          console.error(`Failed to evaluate question ${q.id}:`, err);
        }
        evaluatedCount++;
        setEvaluationProgress((evaluatedCount / totalQuestions) * 100);
        setEvaluationTime(Math.max(0, (totalQuestions - evaluatedCount) * 4));
      }

      await aiInterviewsService.evaluateSession(id);

      setEvaluationProgress(100);
      setEvaluationTime(0);

      toast.success('Deep analysis completed!');
      refetchSessions();
      refetchDetail();
    } catch (e) {
      toast.error("Analysis engine encountered an error. Please try again.");
    } finally {
      setTimeout(() => {
        setIsEvaluating(false);
        setEvaluationProgress(0);
      }, 1000);
    }
  };

  // Stop polling utility
  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const handleBulkEvaluate = async () => {
    if (!selectedJobId || isBulkEvaluating) return;

    setIsBulkEvaluating(true);
    setShowBulkModal(false);
    setBulkProgress({ current: 0, total: 0, candidateName: '', percent: 0 });

    try {
      // 1. Kick off the Celery task
      const res = await aiInterviewsService.bulkEvaluate(selectedJobId);
      const taskId = res?.data?.task_id;

      if (!taskId) {
        toast.error('Failed to start bulk evaluation.');
        setIsBulkEvaluating(false);
        return;
      }

      toast.info('Bulk evaluation started in background...');

      // 2. Poll for progress
      pollRef.current = setInterval(async () => {
        try {
          const statusRes = await aiInterviewsService.checkTaskStatus(taskId);
          const data = statusRes?.data;

          if (!data) return;

          if (data.status === 'PROGRESS') {
            setBulkProgress({
              current: data.current || 0,
              total: data.total || 0,
              candidateName: data.candidate_name || '',
              percent: data.percent || 0,
            });
          } else if (data.status === 'SUCCESS') {
            stopPolling();
            setBulkProgress({
              current: data.evaluated || data.total || 0,
              total: data.total || 0,
              candidateName: '',
              percent: 100,
            });
            toast.success(data.message || `Bulk evaluation complete!`);
            refetchSessions();
            if (selectedSessionId) refetchDetail();
            setTimeout(() => {
              setIsBulkEvaluating(false);
              setBulkProgress({ current: 0, total: 0, candidateName: '', percent: 0 });
            }, 1500);
          } else if (data.status === 'FAILURE') {
            stopPolling();
            toast.error('Bulk evaluation failed. Please try again.');
            setIsBulkEvaluating(false);
            setBulkProgress({ current: 0, total: 0, candidateName: '', percent: 0 });
          }
          // PENDING — still waiting, keep polling
        } catch {
          // Network error — keep polling
        }
      }, 2000);
    } catch (e) {
      toast.error('Failed to start bulk evaluation.');
      setIsBulkEvaluating(false);
    }
  };

  // Cleanup on unmount
  React.useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  return (
    <div className="flex h-[calc(100vh-64px)] bg-background overflow-hidden animate-in fade-in duration-500">
      {/* Sidebar */}
      <div
        className={cn(
          "border-r border-border flex flex-col bg-muted/5 transition-all duration-300 ease-in-out relative z-20",
          isSidebarCollapsed ? "w-16" : "w-76"
        )}
      >
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-2.5 top-[18px] h-5 w-5 rounded-full bg-background border border-border flex items-center justify-center shadow-sm hover:text-blue-600 hover:border-blue-600 transition-all z-30"
        >
          <ChevronRight className={cn("w-3 h-3 transition-transform duration-300", !isSidebarCollapsed && "rotate-180")} />
        </button>

        <EvaluationSidebar
          sessions={filteredSessions}
          isLoading={sessionsLoading}
          selectedId={selectedSessionId}
          isCollapsed={isSidebarCollapsed}
          onSelect={setSelectedSessionId}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          toSentenceCase={toSentenceCase}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar bg-background relative">
        {/* Bulk Evaluate Floating Button */}
        {!isBulkEvaluating && (
          <button
            onClick={() => { setShowBulkModal(true); setSelectedJobId(null); }}
            disabled={uniqueJobs.length === 0 || isEvaluating}
            data-agent="bulk-evaluate-btn"
            className="absolute top-4 right-6 z-20 flex items-center gap-2 px-4 h-9 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-bold shadow-lg shadow-blue-600/25 hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0"
          >
            <Zap className="w-3.5 h-3.5" />
            Bulk Evaluate
          </button>
        )}

        {/* Bulk Evaluation Progress Bar */}
        {isBulkEvaluating && (
          <div className="absolute top-4 right-6 z-20 flex items-center gap-3 px-4 py-2.5 rounded-md bg-card border border-blue-600/20 shadow-xl shadow-blue-600/10 animate-in fade-in slide-in-from-top-2 duration-300">
            <div className="flex flex-col gap-1 min-w-[180px]">
              <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600">
                <Clock className="w-3 h-3 animate-spin" />
                <span className="truncate max-w-[140px]">
                  {bulkProgress.candidateName || 'Processing...'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${bulkProgress.percent}%` }}
                  />
                </div>
                <span className="text-[9px] font-bold text-muted-foreground whitespace-nowrap">
                  {bulkProgress.current}/{bulkProgress.total}
                </span>
              </div>
            </div>
          </div>
        )}

        <EvaluationContent
          sessionId={selectedSessionId}
          session={selectedSession}
          isLoading={detailLoading}
          isEvaluating={isEvaluating}
          progress={evaluationProgress}
          timeLeft={evaluationTime}
          onEvaluate={handleEvaluate}
          onOnboard={(appId) => onboardMutation.mutate(appId)}
          isOnboarding={onboardMutation.isPending}
          toSentenceCase={toSentenceCase}
        />
      </div>

      {/* Bulk Evaluation Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-card border border-border/50 rounded-md shadow-2xl w-full max-w-md mx-4 animate-in zoom-in-95 slide-in-from-bottom-2 duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-border/50">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-md bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-600/20">
                  <BrainCircuit className="w-4.5 h-4.5 text-white" />
                </div>
                <div>
                  <h2 className="text-[15px] font-bold tracking-tight">Bulk AI Evaluation</h2>
                  <p className="text-[11px] text-muted-foreground font-medium">Evaluate all candidates for a role at once</p>
                </div>
              </div>
              <button
                onClick={() => setShowBulkModal(false)}
                className="w-8 h-8 rounded-md flex items-center justify-center hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-6 space-y-5">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 block">
                  Select Job Role
                </label>
                <div className="relative">
                  <select
                    value={selectedJobId || ''}
                    onChange={(e) => setSelectedJobId(e.target.value || null)}
                    data-agent="bulk-evaluate-role-select"
                    className="w-full h-11 px-4 pr-10 rounded-md border border-border bg-background text-[13px] font-semibold text-foreground appearance-none focus:outline-none focus:ring-2 focus:ring-blue-600/30 focus:border-blue-600/50 transition-all cursor-pointer"
                  >
                    <option value="">Choose a role...</option>
                    {uniqueJobs.map(job => (
                      <option key={job.id} value={job.id}>
                        {job.title} ({job.count} candidate{job.count > 1 ? 's' : ''})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>
              </div>

              {selectedJobId && (
                <div className="p-4 rounded-md bg-blue-600/[0.03] border border-blue-600/10 animate-in fade-in slide-in-from-bottom-1 duration-200">
                  <div className="flex items-center gap-2 text-blue-600 mb-1.5">
                    <Zap className="w-3.5 h-3.5" />
                    <span className="text-[11px] font-bold">What will happen</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed font-medium">
                    AI will evaluate all unanswered questions for every candidate in the <strong className="text-foreground">{uniqueJobs.find(j => j.id === selectedJobId)?.title}</strong> role. This runs in the background — you can continue working.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border/50 bg-muted/5 rounded-b-md">
              <button
                onClick={() => setShowBulkModal(false)}
                className="px-5 h-9 rounded-md text-[11px] font-bold text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all border border-border/60"
              >
                Cancel
              </button>
              <button
                disabled={!selectedJobId}
                onClick={handleBulkEvaluate}
                data-agent="bulk-evaluate-confirm-btn"
                className="px-5 h-9 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-[11px] font-bold shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center gap-2"
              >
                <Zap className="w-3.5 h-3.5" />
                Start Evaluation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
