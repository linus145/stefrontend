'use client';

import React from 'react';

function formatDuration(seconds: number): string {
  if (!seconds || seconds <= 0) return '0 Min';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  if (hrs > 0 && mins > 0) {
    return `${hrs} Hr ${mins} Min`;
  }
  if (hrs > 0) {
    return `${hrs} Hour${hrs > 1 ? 's' : ''}`;
  }
  return `${mins} Min${mins > 1 ? 's' : ''}`;
}

interface DispatchSidebarProps {
  jobs: any[];
  selectedJobId: string;
  selectedApplicationIds: string[];
  rounds: any[];
  isSubmitting: boolean;
  isGenerating: boolean;
  handleConfigure: () => void;
  setStep: (step: number) => void;
}

export function DispatchSidebar({
  jobs,
  selectedJobId,
  selectedApplicationIds,
  rounds,
  isSubmitting,
  isGenerating,
  handleConfigure,
  setStep,
}: DispatchSidebarProps) {
  const isDispatchDisabled =
    isSubmitting ||
    isGenerating ||
    rounds.some(
      (r) =>
        r.question_format !== 'VIDEO' &&
        r.question_format !== 'ONLINE_INTERVIEW' &&
        (!r.questions || r.questions.length === 0)
    );

  const totalSeconds = rounds.reduce((acc, r) => acc + (r.timer_seconds || 0), 0);
  const totalPotentialScore = rounds.reduce(
    (totalAcc, r) =>
      totalAcc +
      (r.questions?.reduce(
        (acc: number, q: any) => acc + (typeof q === 'string' ? 10 : q.marks || 0),
        0
      ) || 0),
    0
  );

  return (
    <div className="hidden lg:block w-[340px] shrink-0 sticky top-24 self-start">
      <div className="bg-card border border-border rounded-sm p-8 shadow-sm space-y-10">
        <div>
          <h3 className="text-sm font-bold text-muted-foreground opacity-70 mb-6 uppercase tracking-wider">
            Dispatch Protocol
          </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <span className="text-[11px] font-bold opacity-50 shrink-0">Target Job</span>
              <span className="text-sm font-bold text-right">
                {jobs.find((j) => j.id === selectedJobId)?.title}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold opacity-50">Candidates</span>
              <span className="text-sm font-bold">{selectedApplicationIds.length} Targets</span>
            </div>

            <div className="border-t border-border pt-6 space-y-4">
              <p className="text-[10px] font-bold opacity-50">Rounds Overview</p>
              {rounds.map((r, i) => {
                const roundMarks =
                  r.questions?.reduce(
                    (acc: number, q: any) => acc + (typeof q === 'string' ? 10 : q.marks || 0),
                    0
                  ) || 0;
                return (
                  <div key={r.id} className="flex items-center justify-between group">
                    <div className="flex items-center gap-2">
                      <span className="w-4 h-4 rounded-full bg-muted border border-border flex items-center justify-center text-[8px] font-bold text-muted-foreground">
                        {i + 1}
                      </span>
                      <span className="text-[11px] font-bold text-foreground truncate max-w-[140px]">
                        {r.title || `Round ${i + 1}`}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        {formatDuration(r.timer_seconds)}
                      </span>
                      <span className="text-[11px] font-bold text-[#0a66c2]">{roundMarks} pts</span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t border-border pt-6">
              <span className="text-[11px] font-bold opacity-50">Total Duration</span>
              <span className="text-sm font-bold">{formatDuration(totalSeconds)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold opacity-50">Total Potential Score</span>
              <span className="text-sm font-bold text-[#0a66c2]">{totalPotentialScore} Marks</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            disabled={isDispatchDisabled}
            onClick={handleConfigure}
            data-agent="dispatch-interviews-button"
            className="w-full py-5 rounded-sm bg-[#0a66c2] text-white font-bold text-sm shadow-2xl shadow-[#0a66c2]/20 hover:bg-[#004182] transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center"
          >
            {isSubmitting ? 'Dispatching Agents...' : isGenerating ? 'Generating...' : 'Dispatch AI Agents'}
          </button>
          <button
            onClick={() => setStep(1)}
            className="w-full py-4 rounded-sm border border-border text-[10px] font-bold text-muted-foreground hover:bg-muted transition-all"
          >
            Return to Selection
          </button>
        </div>

        <div className="p-6 bg-[#0a66c2]/5 rounded-sm border border-[#0a66c2]/10">
          <p className="text-[10px] font-bold text-[#0a66c2] mb-3">Security Enforcement</p>
          <p className="text-[10px] text-muted-foreground leading-relaxed font-medium">
            All sessions are encrypted and monitored by real-time behavioral AI to ensure candidate authenticity and integrity.
          </p>
        </div>
      </div>
    </div>
  );
}
