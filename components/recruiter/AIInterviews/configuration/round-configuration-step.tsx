'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { RoundCardItem } from './round-card-item';
import { DispatchSidebar } from './dispatch-sidebar';

type RoundType = 'TECHNICAL' | 'CODING' | 'HR' | 'BEHAVIORAL' | 'SYSTEM_DESIGN';

interface RoundConfig {
  id: string;
  title: string;
  type: RoundType;
  difficulty: 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD';
  round_category: 'CODING' | 'NON_CODING';
  question_format: string;
  programming_language: string;
  max_questions: number;
  timer_seconds: number;
  questions?: { text: string; marks: number; ideal_answer?: string; mcq_options?: any[]; question_type?: string }[];
  selected_topics?: string[];
  selected_frameworks?: string[];
}

interface RoundConfigurationStepProps {
  loadedSessionStatus: string | null;
  rounds: RoundConfig[];
  addRound: () => void;
  removeRound: (id: string) => void;
  updateRound: (id: string, updates: Partial<RoundConfig>) => void;
  metadata: any;
  DEFAULT_CATEGORIES: any[];
  SUGGESTED_TOPICS: Record<string, string[]>;
  SUGGESTED_FRAMEWORKS: Record<string, string[]>;
  handleGenerateQuestions: (roundId: string) => void;
  isSubmitting: boolean;
  isGenerating: boolean;
  jobs: any[];
  selectedJobId: string;
  selectedApplicationIds: string[];
  handleConfigure: () => void;
  setStep: (step: number) => void;
}

export function RoundConfigurationStep({
  loadedSessionStatus,
  rounds,
  addRound,
  removeRound,
  updateRound,
  metadata,
  DEFAULT_CATEGORIES,
  SUGGESTED_TOPICS,
  SUGGESTED_FRAMEWORKS,
  handleGenerateQuestions,
  isSubmitting,
  isGenerating,
  jobs,
  selectedJobId,
  selectedApplicationIds,
  handleConfigure,
  setStep,
}: RoundConfigurationStepProps) {
  const [openDropdownId, setOpenDropdownId] = React.useState<string | null>(null);

  return (
    <div
      key="architecture"
      className="flex flex-col lg:flex-row gap-12 items-start animate-in fade-in duration-500 fill-mode-both"
    >
      {/* Left: Configuration Form */}
      <div className="flex-1 min-w-0 space-y-8">
        {/* Session status warning banner */}
        {loadedSessionStatus && ['ACTIVE', 'EVALUATING', 'COMPLETED'].includes(loadedSessionStatus) && (
          <div className="flex items-start gap-3 p-4 rounded-sm bg-amber-500/10 border border-amber-500/20">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-[12px] font-bold text-amber-600">
                Candidate has {loadedSessionStatus === 'ACTIVE' ? 'started' : loadedSessionStatus === 'EVALUATING' ? 'completed (awaiting evaluation)' : 'completed'} this exam
              </p>
              <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                Re-dispatching will permanently delete the previous session, all answers, and credentials. Generate new questions if needed before dispatching.
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-muted-foreground opacity-70">Architecture</h3>
          <button
            onClick={addRound}
            data-agent="add-round-button"
            className="px-4 py-2 rounded-sm border border-[#0a66c2] text-[#0a66c2] text-[10px] font-bold hover:bg-[#0a66c2] hover:text-white transition-all shadow-sm"
          >
            Add
          </button>
        </div>

        <div className="space-y-6">
          {rounds.map((round, index) => (
            <RoundCardItem
              key={round.id}
              round={round as any}
              index={index}
              roundsCount={rounds.length}
              removeRound={removeRound}
              updateRound={updateRound}
              metadata={metadata}
              DEFAULT_CATEGORIES={DEFAULT_CATEGORIES}
              SUGGESTED_TOPICS={SUGGESTED_TOPICS}
              SUGGESTED_FRAMEWORKS={SUGGESTED_FRAMEWORKS}
              handleGenerateQuestions={handleGenerateQuestions}
              openDropdownId={openDropdownId}
              setOpenDropdownId={setOpenDropdownId}
            />
          ))}
        </div>
      </div>

      {/* Right: Dispatch Sidebar */}
      <DispatchSidebar
        jobs={jobs}
        selectedJobId={selectedJobId}
        selectedApplicationIds={selectedApplicationIds}
        rounds={rounds}
        isSubmitting={isSubmitting}
        isGenerating={isGenerating}
        handleConfigure={handleConfigure}
        setStep={setStep}
      />
    </div>
  );
}
