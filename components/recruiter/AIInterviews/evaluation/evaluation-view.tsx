'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { aiInterviewsService } from '@/services/ai-interviews.service';
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

        <div className={cn(
          "p-4 h-16 border-b border-border flex items-center justify-between",
          isSidebarCollapsed ? "justify-center px-2" : ""
        )}>
          {!isSidebarCollapsed && (
            <h2 className="text-[12px] font-bold text-muted-foreground">Candidates</h2>
          )}
        </div>

        {!isSidebarCollapsed && (
          <div className="p-4 border-b border-border">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-50" />
              <input
                type="text"
                placeholder="Search candidates..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-background border border-border rounded-sm py-2 pl-9 pr-3 text-[12px] font-medium focus:outline-none focus:ring-1 focus:ring-blue-600/20 transition-all placeholder:opacity-50"
              />
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto no-scrollbar py-2">
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
              <div className="flex justify-between items-start mb-1">
                <h3 className={cn(
                  "text-[13px] font-bold truncate pr-2",
                  selectedId === session.id ? "text-blue-600" : "text-foreground"
                )}>
                  {session.candidate_name}
                </h3>
                {session.overall_score !== null && (
                  <span className="text-[11px] font-extrabold text-blue-600">{session.overall_score}%</span>
                )}
              </div>
              <p className="text-[11px] font-medium text-muted-foreground truncate opacity-70 mb-2">
                {session.job_title}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  session.status === 'COMPLETED' ? "bg-emerald-500" : "bg-amber-500"
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
  onEvaluate
}: {
  sessionId: string | null,
  session: InterviewSessionDetail | undefined,
  isLoading: boolean,
  isEvaluating: boolean,
  progress: number,
  timeLeft: number,
  onEvaluate: (id: string) => void
}) => {
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
      <div className={cn("p-8 lg:p-16 max-w-6xl mx-auto space-y-12 transition-all duration-1000 animate-in fade-in slide-in-from-right-4")}>
      {/* Candidate Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 pb-10 border-b border-border">
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold tracking-tight">{session.candidate_name}</h1>
            <span className="px-3 py-1 rounded-sm bg-blue-600/10 text-blue-600 text-[10px] font-bold tracking-wide">
              {toSentenceCase(session.status)}
            </span>
          </div>
          <p className="text-[13px] font-medium text-muted-foreground flex items-center gap-2 opacity-70">
            <BrainCircuit className="w-4 h-4 text-blue-600" />
            {session.job_title}
          </p>
        </div>
        <div className="flex items-center gap-10">
          <div className="text-right">
            <p className="text-[11px] font-semibold text-muted-foreground mb-1 opacity-60">AI Match Score</p>
            <p className="text-4xl font-bold tracking-tighter text-blue-600">
              {session.overall_score || 0}
              <span className="text-xl opacity-40 ml-1">%</span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <button
              disabled={isEvaluating}
              onClick={() => onEvaluate(session.id)}
              className={cn(
                "px-6 py-2.5 rounded-sm bg-blue-600 text-white text-[12px] font-semibold shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed",
                isEvaluating && "bg-muted text-muted-foreground shadow-none"
              )}
            >
              {isEvaluating ? "Processing Analysis..." : "Recalculate Analysis"}
            </button>
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
        <Accordion multiple defaultValue={session.rounds.map(r => r.id)} className="space-y-4">
          {session.rounds.map((round: InterviewRound, i: number) => (
            <AccordionItem 
              key={round.id} 
              value={round.id}
              className="border border-border rounded-sm bg-card overflow-hidden"
            >
              <AccordionTrigger className="hover:no-underline py-6 px-8 hover:bg-muted/30 transition-all group">
                <div className="flex items-center gap-6 text-left w-full">
                  <div className="w-10 h-10 rounded-full bg-blue-600/5 border border-blue-600/10 flex items-center justify-center text-sm font-bold text-blue-600 group-hover:scale-110 transition-transform">
                    {i + 1}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold tracking-tight text-foreground/90 group-hover:text-blue-600 transition-colors">
                      {round.designation_display}
                    </h3>
                    <p className="text-[11px] font-medium text-muted-foreground mt-1 opacity-60">
                      {toSentenceCase(round.difficulty)} • Round analysis & metrics
                    </p>
                  </div>
                </div>
              </AccordionTrigger>
              
              <AccordionContent className="px-0 pb-0">
                <Accordion multiple defaultValue={round.questions.map(q => q.id)} className="space-y-2 mt-4 px-8 pb-8">
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
                                <span className="text-xl font-bold tracking-tighter text-blue-600">{q.evaluation.score}</span>
                                <span className="text-[10px] font-bold opacity-30 text-muted-foreground">/10</span>
                              </div>
                              <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest opacity-40">Match</p>
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
                                <div className="p-5 bg-blue-600/[0.03] rounded-sm border border-blue-600/10 transition-colors group-hover/q:bg-blue-600/[0.05]">
                                  <div className="flex items-center gap-2 mb-3 text-blue-600">
                                    <MessageSquare className="w-4 h-4" />
                                    <p className="text-[11px] font-bold uppercase tracking-wider">AI Feedback</p>
                                  </div>
                                  <p className="text-[13px] leading-relaxed font-medium text-foreground/80">{q.evaluation.feedback}</p>
                                </div>
                                <div className="p-5 bg-amber-500/[0.03] rounded-sm border border-amber-500/10">
                                  <div className="flex items-center gap-2 mb-3 text-amber-600">
                                    <AlertCircle className="w-4 h-4" />
                                    <p className="text-[11px] font-bold uppercase tracking-wider">Points Missed</p>
                                  </div>
                                  <ul className="text-[13px] space-y-1.5 list-disc list-inside font-medium opacity-70">
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
