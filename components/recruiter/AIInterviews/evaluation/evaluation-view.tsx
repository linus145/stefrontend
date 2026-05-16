'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { aiInterviewsService } from '@/services/ai-interviews.service';
import { jobsService } from '@/services/jobs.service';
import {
  Users2,
  Search,
  ChevronRight,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  BrainCircuit,
  Star,
  MessageSquare,
  ChevronDown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const toSentenceCase = (str: string) => {
  if (!str) return str;
  const lower = str.toLowerCase().replace(/_/g, ' ');
  return lower.charAt(0).toUpperCase() + lower.slice(1);
};

interface InterviewQuestion {
  id: string;
  question_text: string;
  question_type: string;
  candidate_answer: string | null;
  ideal_answer: string | null;
  evaluation: {
    score: number;
    feedback: string;
    key_points_missed: string[];
  } | null;
}

interface InterviewRound {
  id: string;
  designation_display: string;
  difficulty: string;
  questions: InterviewQuestion[];
}

interface InterviewSessionDetail {
  id: string;
  candidate_name: string;
  job_title: string;
  status: string;
  overall_score: number | null;
  application_id: string | null;
  rounds: InterviewRound[];
}

interface InterviewSession {
  id: string;
  candidate_name: string;
  job_title: string;
  status: string;
  overall_score: number | null;
  is_orchestrated: boolean;
}

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

  const sessions: InterviewSession[] = Array.isArray(sessionsResponse?.data) ? sessionsResponse.data : [];
  const filteredSessions = sessions.filter(s =>
    s.candidate_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.job_title.toLowerCase().includes(searchQuery.toLowerCase())
  ).filter(s => s.is_orchestrated);

  const selectedSession: InterviewSessionDetail | undefined = detailResponse?.data;

  const handleEvaluate = async (id: string) => {
    if (isEvaluating) return;

    setIsEvaluating(true);
    setEvaluationProgress(0);
    setEvaluationTime(0);

    try {
      // 1. Fetch session detail to get all questions
      const detailRes = await aiInterviewsService.getSessionDetail(id);
      const sessionData = detailRes?.data;
      if (!sessionData?.rounds) throw new Error('No rounds found');

      // 2. Collect all questions that need evaluation
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
      setEvaluationTime(totalQuestions * 4); // Estimate ~4s per question

      // 3. Evaluate each question one by one
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

      // 4. Aggregate scores via session evaluate
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
          isSidebarCollapsed ? "w-16" : "w-80"
        )}
      >
        {/* Floating Toggle Button */}
        <button
          onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
          className="absolute -right-3 top-6 h-6 w-6 rounded-full bg-background border border-border flex items-center justify-center shadow-sm hover:text-blue-600 hover:border-blue-600 transition-all z-30"
        >
          {isSidebarCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5 rotate-180" />}
        </button>

        {/* Search Header - Removed redundant label to lift data */}
        {!isSidebarCollapsed && (
          <div className="p-3 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground opacity-50" />
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-border rounded-sm py-1.5 pl-9 pr-3 text-[11px] font-medium focus:outline-none focus:ring-1 focus:ring-blue-600/20 transition-all placeholder:opacity-50"
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto no-scrollbar py-1">
          <RenderSidebar
            sessions={filteredSessions}
            isLoading={sessionsLoading}
            selectedId={selectedSessionId}
            isCollapsed={isSidebarCollapsed}
            onSelect={setSelectedSessionId}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto no-scrollbar bg-background">
        <RenderMainContent
          sessionId={selectedSessionId}
          session={selectedSession}
          isLoading={detailLoading}
          isEvaluating={isEvaluating}
          progress={evaluationProgress}
          timeLeft={evaluationTime}
          onEvaluate={handleEvaluate}
          onOnboard={(appId) => onboardMutation.mutate(appId)}
          isOnboarding={onboardMutation.isPending}
        />
      </div>
    </div>
  );
}

// --- Independent Sub-components to prevent re-mounting on parent state updates ---

const RenderSidebar = ({
  sessions,
  isLoading,
  selectedId,
  isCollapsed,
  onSelect
}: {
  sessions: InterviewSession[],
  isLoading: boolean,
  selectedId: string | null,
  isCollapsed: boolean,
  onSelect: (id: string) => void
}) => {
  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <Clock className="w-5 h-5 animate-spin opacity-20" />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="p-8 text-center text-[11px] font-medium text-muted-foreground opacity-50 italic">
        No candidates found
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {sessions.map((session) => (
        <button
          key={session.id}
          onClick={() => onSelect(session.id)}
          className={cn(
            "w-full px-4 py-3 text-left transition-all border-r-2 group relative",
            selectedId === session.id
              ? "border-blue-600 bg-blue-600/5"
              : "border-transparent hover:bg-muted/50"
          )}
        >
          {isCollapsed ? (
            <div className="flex flex-col items-center justify-center gap-1">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-[11px] font-bold border border-border group-hover:border-blue-600/30 transition-all">
                {session.candidate_name[0]}
              </div>
              {session.overall_score !== null && (
                <span className="text-[10px] font-bold text-blue-600">{session.overall_score}%</span>
              )}
            </div>
          ) : (
            <>
              <div className="flex justify-between items-start mb-0.5">
                <h3 className={cn(
                  "text-[12px] font-bold truncate pr-2",
                  selectedId === session.id ? "text-blue-600" : "text-foreground"
                )}>
                  {session.candidate_name}
                </h3>
                {session.overall_score !== null && (
                  <span className="text-[11px] font-extrabold text-blue-600">{session.overall_score}%</span>
                )}
              </div>
              <p className="text-[10px] font-medium text-muted-foreground truncate opacity-70 mb-1">
                {session.job_title}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  session.status === 'COMPLETED' ? "bg-emerald-500" : 
                  session.status === 'EVALUATING' ? "bg-blue-500" : "bg-amber-500"
                )} />
                <span className="text-[10px] font-semibold opacity-40">
                  {toSentenceCase(session.status)}
                </span>
              </div>
            </>
          )}
        </button>
      ))}
    </div>
  );
};

const RenderMainContent = ({
  sessionId,
  session,
  isLoading,
  isEvaluating,
  progress,
  timeLeft,
  onEvaluate,
  onOnboard,
  isOnboarding
}: {
  sessionId: string | null,
  session: InterviewSessionDetail | undefined,
  isLoading: boolean,
  isEvaluating: boolean,
  progress: number,
  timeLeft: number,
  onEvaluate: (id: string) => void,
  onOnboard: (appId: string) => void,
  isOnboarding: boolean
}) => {
  // Controlled accordion state — all rounds/questions start expanded
  const [openRounds, setOpenRounds] = useState<string[]>([]);
  const [openQuestions, setOpenQuestions] = useState<Record<string, string[]>>({});

  // Expand all rounds/questions when session data loads
  React.useEffect(() => {
    if (session?.rounds) {
      setOpenRounds(session.rounds.map(r => r.id));
      const qMap: Record<string, string[]> = {};
      session.rounds.forEach(r => {
        qMap[r.id] = r.questions.map(q => q.id);
      });
      setOpenQuestions(qMap);
    }
  }, [session?.id]);

  if (!sessionId) {
    return (
      <div className="h-full flex flex-col items-center justify-center opacity-20 space-y-4">
        <Users2 className="w-12 h-12" />
        <p className="text-xs font-bold uppercase tracking-widest">Select a candidate to view AI analysis</p>
      </div>
    );
  }

  if (isLoading || !session) {
    return (
      <div className="h-full flex items-center justify-center">
        <Clock className="w-6 h-6 animate-spin opacity-20" />
      </div>
    );
  }

  return (
    <div className="relative">
      <div className={cn("p-6 lg:p-10 max-w-5xl mx-auto space-y-10 transition-all duration-1000 animate-in fade-in slide-in-from-right-4")}>
        {/* Candidate Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-bold tracking-tight">{session.candidate_name}</h1>
            <span className={cn(
              "px-2 py-0.5 rounded-sm text-[9px] font-bold tracking-wide uppercase",
              session.status === 'COMPLETED' ? "bg-emerald-600/10 text-emerald-600" :
              session.status === 'EVALUATING' ? "bg-blue-600/10 text-blue-600" :
              "bg-amber-600/10 text-amber-600"
            )}>
              {toSentenceCase(session.status)}
            </span>
            </div>
            <p className="text-[12px] font-medium text-muted-foreground flex items-center gap-2 opacity-70">
              <BrainCircuit className="w-3.5 h-3.5 text-blue-600" />
              {session.job_title}
            </p>
          </div>
          <div className="flex items-center gap-8">
            <div className="text-right">
              <p className="text-[10px] font-bold text-muted-foreground mb-1 opacity-60 uppercase tracking-wider">AI Score</p>
              <p className="text-2xl font-bold tracking-tighter text-blue-600">
                {session.overall_score || 0}
                <span className="text-base opacity-40 ml-0.5">%</span>
              </p>
            </div>
          <div className="flex flex-col items-center gap-3 w-full max-w-sm">
            <div className="flex gap-3 w-full">
              <button
                disabled={isEvaluating}
                onClick={() => onEvaluate(session.id)}
                className={cn(
                  "flex-1 px-6 h-10 rounded-sm bg-blue-600/5 text-blue-600 text-[12px] font-bold hover:bg-blue-600/10 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed border border-blue-600/20 shadow-sm",
                  isEvaluating && "bg-muted text-muted-foreground shadow-none border-transparent"
                )}
              >
                {isEvaluating ? "Processing..." : "Recalculate Analysis"}
              </button>
              
              {session.application_id && (
                <button
                  disabled={isOnboarding || session.status === 'ONBOARDED'}
                  onClick={() => onOnboard(session.application_id!)}
                  className={cn(
                    "flex-1 px-6 h-10 rounded-sm bg-emerald-600 text-white text-[12px] font-bold shadow-lg shadow-emerald-600/20 hover:bg-emerald-500 hover:-translate-y-0.5 transition-all active:scale-95 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2",
                    (isOnboarding || session.status === 'ONBOARDED') && "bg-muted text-muted-foreground shadow-none"
                  )}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  {isOnboarding ? "Onboarding..." : session.status === 'ONBOARDED' ? "Onboarded" : "Onboard Candidate"}
                </button>
              )}
            </div>
              {isEvaluating && (
                <div className="flex flex-col items-end gap-1.5 min-w-[200px]">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600">
                    <Clock className="w-3 h-3 animate-spin" />
                    <span>Evaluating... {Math.round(progress)}% • ~{timeLeft}s left</span>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Rounds Overview */}
        <div className="space-y-6">
          <Accordion multiple value={openRounds} onValueChange={setOpenRounds} className="space-y-4">
            {session.rounds.map((round: InterviewRound, i: number) => (
              <AccordionItem
                key={round.id}
                value={round.id}
                className="border border-border rounded-sm bg-card overflow-hidden"
              >
                <AccordionTrigger className="hover:no-underline py-4 px-6 hover:bg-muted/30 transition-all group">
                  <div className="flex items-center gap-4 text-left w-full">
                    <div className="w-8 h-8 rounded-full bg-blue-600/5 border border-blue-600/10 flex items-center justify-center text-xs font-bold text-blue-600 group-hover:scale-110 transition-transform">
                      {i + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-[16px] font-bold tracking-tight text-foreground/90 group-hover:text-blue-600 transition-colors">
                        {round.designation_display}
                      </h3>
                      <p className="text-[10px] font-medium text-muted-foreground mt-0.5 opacity-60">
                        {toSentenceCase(round.difficulty)} • Round analysis
                      </p>
                    </div>
                  </div>
                </AccordionTrigger>

                <AccordionContent className="px-0 pb-0">
                  <Accordion multiple value={openQuestions[round.id] || []} onValueChange={(val) => setOpenQuestions(prev => ({ ...prev, [round.id]: val }))} className="space-y-2 mt-4 px-8 pb-8">
                    {round.questions.map((q: InterviewQuestion, qi: number) => (
                      <AccordionItem
                        key={q.id}
                        value={q.id}
                        className="bg-muted/10 border border-border/50 rounded-sm overflow-hidden group/q hover:border-blue-600/20 transition-all"
                      >
                        <AccordionTrigger className="hover:no-underline py-4 px-6 hover:bg-blue-600/[0.02] transition-all">
                          <div className="flex justify-between items-center gap-6 text-left w-full pr-4">
                            <div className="flex-1">
                              <p className="text-[10px] font-bold text-blue-600 mb-1 uppercase tracking-tight">Question {qi + 1}</p>
                              <h4 className="text-[14px] font-bold leading-relaxed tracking-tight text-foreground/80">{q.question_text}</h4>
                            </div>
                            {q.evaluation?.score !== undefined && (
                              <div className="shrink-0 text-right">
                                <div className="flex items-baseline gap-0.5">
                                  <span className="text-[18px] font-bold tracking-tighter text-blue-600">{q.evaluation.score}</span>
                                  <span className="text-[9px] font-bold opacity-30 text-muted-foreground">/10</span>
                                </div>
                                <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">Match</p>
                              </div>
                            )}
                          </div>
                        </AccordionTrigger>

                        <AccordionContent className="px-6 pb-6 pt-2">
                          {q.candidate_answer ? (
                            <div className="space-y-6 mt-2">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="p-5 bg-background rounded-sm border border-border/50 shadow-sm">
                                  <p className="text-[11px] font-bold text-muted-foreground mb-3 opacity-60 flex items-center gap-2 uppercase tracking-wider">
                                    <Users2 className="w-3.5 h-3.5" />
                                    Candidate Answer
                                  </p>
                                  <p className="text-[13px] leading-relaxed font-medium italic opacity-90">{q.candidate_answer}</p>
                                </div>

                                <div className="p-5 bg-blue-600/[0.02] rounded-sm border border-blue-600/10 shadow-sm">
                                  <p className="text-[11px] font-bold text-blue-600 mb-3 flex items-center gap-2 uppercase tracking-wider">
                                    <BrainCircuit className="w-3.5 h-3.5" />
                                    Ideal Criteria
                                  </p>
                                  <p className="text-[13px] leading-relaxed font-medium opacity-90">{q.ideal_answer || "No specific criteria defined."}</p>
                                </div>
                              </div>

                              {q.evaluation ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="p-4 bg-blue-600/[0.03] rounded-sm border border-blue-600/10 transition-colors group-hover/q:bg-blue-600/[0.05]">
                                    <div className="flex items-center gap-2 mb-2 text-blue-600">
                                      <MessageSquare className="w-3.5 h-3.5" />
                                      <p className="text-[10px] font-bold uppercase tracking-wider">AI Feedback</p>
                                    </div>
                                    <p className="text-[12px] leading-relaxed font-medium text-foreground/80">{q.evaluation.feedback}</p>
                                  </div>
                                  <div className="p-4 bg-amber-500/[0.03] rounded-sm border border-amber-500/10">
                                    <div className="flex items-center gap-2 mb-2 text-amber-600">
                                      <AlertCircle className="w-3.5 h-3.5" />
                                      <p className="text-[10px] font-bold uppercase tracking-wider">Points Missed</p>
                                    </div>
                                    <ul className="text-[12px] space-y-1 list-disc list-inside font-medium opacity-70">
                                      {Array.isArray(q.evaluation.key_points_missed) ? (
                                        q.evaluation.key_points_missed.map((point: string, pi: number) => (
                                          <li key={pi}>{point}</li>
                                        ))
                                      ) : (
                                        <li>No specific points identified</li>
                                      )}
                                    </ul>
                                  </div>
                                </div>
                              ) : (
                                <div className="p-6 border border-dashed border-border rounded-sm flex items-center justify-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground opacity-50">
                                  Analysis pending. Click Recalculate to process.
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="p-10 text-center border border-dashed border-border rounded-sm opacity-30 mt-2">
                              <p className="text-[10px] font-bold uppercase tracking-widest italic">No answer provided by candidate.</p>
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </div>
  );
};
