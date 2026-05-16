'use client';

import React, { useState } from 'react';
import { Users2, Clock, CheckCircle2, BrainCircuit, MessageSquare, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

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

interface EvaluationContentProps {
  sessionId: string | null;
  session: InterviewSessionDetail | undefined;
  isLoading: boolean;
  isEvaluating: boolean;
  progress: number;
  timeLeft: number;
  onEvaluate: (id: string) => void;
  onOnboard: (appId: string) => void;
  isOnboarding: boolean;
  toSentenceCase: (str: string) => string;
}

const CircularProgress = ({ percentage }: { percentage: number }) => {
  const radius = 22;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative inline-flex items-center justify-center shrink-0">
      <svg className="w-14 h-14 transform -rotate-90">
        <circle
          className="text-slate-100"
          strokeWidth="4"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="28"
          cy="28"
        />
        <circle
          className="text-blue-600 transition-all duration-1000 ease-in-out"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx="28"
          cy="28"
        />
      </svg>
      <span className="absolute text-[12px] font-bold text-blue-600">{percentage}%</span>
    </div>
  );
};

export const EvaluationContent = ({
  sessionId,
  session,
  isLoading,
  isEvaluating,
  progress,
  timeLeft,
  onEvaluate,
  onOnboard,
  isOnboarding,
  toSentenceCase
}: EvaluationContentProps) => {
  const [openRounds, setOpenRounds] = useState<string[]>([]);
  const [openQuestions, setOpenQuestions] = useState<Record<string, string[]>>({});

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
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-[10px] font-bold text-muted-foreground mb-0.5 opacity-60 uppercase tracking-wider">AI Score</p>
                <CircularProgress percentage={session.overall_score || 0} />
              </div>
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
                      <h3 className="text-[15px] font-bold tracking-tight text-foreground/90 group-hover:text-blue-600 transition-colors">
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
                              <h4 className="text-[13px] font-bold leading-relaxed tracking-tight text-foreground/80">{q.question_text}</h4>
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
                                  <p className="text-[12px] leading-relaxed font-medium italic opacity-90">{q.candidate_answer}</p>
                                </div>

                                <div className="p-5 bg-blue-600/[0.02] rounded-sm border border-blue-600/10 shadow-sm">
                                  <p className="text-[11px] font-bold text-blue-600 mb-3 flex items-center gap-2 uppercase tracking-wider">
                                    <BrainCircuit className="w-3.5 h-3.5" />
                                    Ideal Criteria
                                  </p>
                                  <p className="text-[12px] leading-relaxed font-medium opacity-90">{q.ideal_answer || "No specific criteria defined."}</p>
                                </div>
                              </div>

                              {q.evaluation ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                  <div className="p-4 bg-blue-600/[0.03] rounded-sm border border-blue-600/10 transition-colors group-hover/q:bg-blue-600/[0.05]">
                                    <div className="flex items-center gap-2 mb-2 text-blue-600">
                                      <MessageSquare className="w-3.5 h-3.5" />
                                      <p className="text-[10px] font-bold uppercase tracking-wider">AI Feedback</p>
                                    </div>
                                    <p className="text-[11px] leading-relaxed font-medium text-foreground/80">{q.evaluation.feedback}</p>
                                  </div>
                                  <div className="p-4 bg-amber-500/[0.03] rounded-sm border border-amber-500/10">
                                    <div className="flex items-center gap-2 mb-2 text-amber-600">
                                      <AlertCircle className="w-3.5 h-3.5" />
                                      <p className="text-[10px] font-bold uppercase tracking-wider">Points Missed</p>
                                    </div>
                                    <ul className="text-[11px] space-y-1 list-disc list-inside font-medium opacity-70">
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
