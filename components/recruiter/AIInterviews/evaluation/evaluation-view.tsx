'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiInterviewsService } from '@/services/ai-interviews.service';
import { jobsService } from '@/services/jobs.service';
import { ChevronRight } from 'lucide-react';
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

  const queryClient = useQueryClient();

  const onboardMutation = useMutation({
    mutationFn: (applicationId: string) => jobsService.updateApplicationStatus(applicationId, 'ONBOARDED'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluation-sessions'] });
      queryClient.invalidateQueries({ queryKey: ['session-detail', selectedSessionId] });
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['onboarding-employees'] });
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
      <div className="flex-1 overflow-y-auto no-scrollbar bg-background">
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
    </div>
  );
}

