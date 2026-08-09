'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Sparkles, Video } from 'lucide-react';
import { RoundQuestionList } from './round-question-list';

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

interface RoundCardItemProps {
  round: RoundConfig;
  index: number;
  roundsCount: number;
  removeRound: (id: string) => void;
  updateRound: (id: string, updates: Partial<RoundConfig>) => void;
  metadata: any;
  DEFAULT_CATEGORIES: any[];
  SUGGESTED_TOPICS: Record<string, string[]>;
  SUGGESTED_FRAMEWORKS: Record<string, string[]>;
  handleGenerateQuestions: (roundId: string) => void;
  openDropdownId: string | null;
  setOpenDropdownId: (id: string | null) => void;
}

export function RoundCardItem({
  round,
  index,
  roundsCount,
  removeRound,
  updateRound,
  metadata,
  DEFAULT_CATEGORIES,
  SUGGESTED_TOPICS,
  SUGGESTED_FRAMEWORKS,
  handleGenerateQuestions,
  openDropdownId,
  setOpenDropdownId,
}: RoundCardItemProps) {
  const hoursValue = Math.floor(round.timer_seconds / 3600);
  const minsValue = Math.floor((round.timer_seconds % 3600) / 60);

  return (
    <motion.div
      key={round.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 rounded-sm border border-border bg-card shadow-sm hover:border-[#0a66c2]/30 transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-bold px-2 py-0.5 bg-[#0a66c2] text-white rounded-sm">
          Round #{index + 1}
        </span>
        {roundsCount > 1 && (
          <button
            onClick={() => removeRound(round.id)}
            className="text-[11px] font-bold text-rose-500 hover:opacity-70 transition-opacity"
          >
            Remove
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Round Designation */}
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-[13px] font-bold text-muted-foreground">Round designation</label>
          <div className="relative">
            <button
              type="button"
              onClick={() => setOpenDropdownId(openDropdownId === round.id ? null : round.id)}
              className="w-full bg-muted/10 border border-border rounded-sm py-2.5 px-3 text-[11px] font-bold text-left flex justify-between items-center focus:outline-none focus:ring-1 focus:ring-[#0a66c2] transition-all"
            >
              <span>
                {metadata.designations?.find((r: any) => r.value === round.title)?.label || "Select Round Type"}
              </span>
              <span className="text-[8px] opacity-60">▼</span>
            </button>

            {openDropdownId === round.id && (
              <>
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setOpenDropdownId(null)}
                />
                <div className="absolute left-0 right-0 mt-1 bg-popover border border-border rounded-sm shadow-2xl z-40 max-h-60 overflow-y-auto custom-scrollbar">
                  {metadata.designations?.map((r: any) => (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => {
                        updateRound(round.id, { title: r.value });
                        setOpenDropdownId(null);
                      }}
                      className={cn(
                        "w-full text-left px-3 py-2 text-[11px] font-semibold transition-all hover:bg-accent hover:text-accent-foreground",
                        round.title === r.value ? "bg-[#0a66c2] text-white" : "text-popover-foreground"
                      )}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Round Category */}
        <div className="space-y-2">
          <label className="text-[13px] font-semibold text-foreground">Type</label>
          <select
            value={round.round_category}
            onChange={(e) => updateRound(round.id, { round_category: e.target.value as any })}
            data-agent={`round-category-select-${index}`}
            className="w-full bg-muted/10 border border-border rounded-sm py-3 px-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#0a66c2] transition-all appearance-none"
          >
            {(metadata.round_categories || DEFAULT_CATEGORIES).map((c: any) => (
              <option key={c.value} value={c.value} className="bg-popover text-popover-foreground">
                {c.label}
              </option>
            ))}
          </select>
        </div>

        {/* Difficulty */}
        <div className="space-y-2">
          <label className="text-[13px] font-semibold text-foreground">Evaluation Depth</label>
          <select
            value={round.difficulty}
            onChange={(e) => updateRound(round.id, { difficulty: e.target.value as any })}
            data-agent={`evaluation-depth-select-${index}`}
            className="w-full bg-muted/10 border border-border rounded-sm py-3 px-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#0a66c2] transition-all appearance-none"
          >
            {metadata.difficulty_levels?.map((l: any) => (
              <option key={l.value} value={l.value} className="bg-popover text-popover-foreground">
                {l.label}
              </option>
            ))}
          </select>
        </div>

        {/* Question Format */}
        <div className="space-y-2">
          <label className="text-[13px] font-semibold text-foreground">Question Format</label>
          <select
            value={round.question_format}
            onChange={(e) => updateRound(round.id, { question_format: e.target.value })}
            data-agent={`question-format-select-${index}`}
            className="w-full bg-muted/10 border border-border rounded-sm py-3 px-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#0a66c2] transition-all appearance-none"
          >
            {metadata.question_formats?.map((f: any) => {
              const isDisabled = f.value === 'VIDEO' || f.value === 'ONLINE_INTERVIEW';
              return (
                <option
                  key={f.value}
                  value={f.value}
                  disabled={isDisabled}
                  className="bg-popover text-popover-foreground disabled:opacity-50 disabled:text-muted-foreground"
                >
                  {f.label}{isDisabled ? ' (Disabled)' : ''}
                </option>
              );
            })}
          </select>
        </div>

        {/* Code Specific Options */}
        {round.question_format === 'CODE' && (
          <>
            <div className="space-y-2">
              <label className="text-[13px] font-semibold text-foreground">
                Language <span className="text-[10px] opacity-50">(Optional)</span>
              </label>
              <select
                value={round.programming_language}
                onChange={(e) => {
                  const newLang = e.target.value;
                  updateRound(round.id, {
                    programming_language: newLang,
                    selected_frameworks: []
                  });
                }}
                data-agent={`programming-language-select-${index}`}
                className="w-full bg-muted/10 border border-border rounded-sm py-3 px-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#0a66c2] transition-all appearance-none"
              >
                <option value="" className="bg-popover text-popover-foreground">Auto-detect</option>
                {metadata.programming_languages?.map((l: any) => (
                  <option key={l.value} value={l.value} className="bg-popover text-popover-foreground">
                    {l.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Focus Topics */}
            <div className="md:col-span-2 space-y-3">
              <div>
                <label className="text-[13px] font-semibold text-foreground">
                  Focus Topics <span className="text-[10px] opacity-50">(Optional)</span>
                </label>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  Select specific topics to assess for this round.
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {(() => {
                  const suggested = SUGGESTED_TOPICS[round.difficulty] || [];
                  const selected = round.selected_topics || [];
                  const custom = selected.filter(t => !suggested.includes(t));
                  const allTopics = [...suggested, ...custom];

                  return allTopics.map((topic) => {
                    const isChecked = selected.includes(topic);
                    return (
                      <label
                        key={topic}
                        className={cn(
                          "flex items-center gap-2 p-3 rounded-sm border cursor-pointer transition-all text-[11px] font-bold select-none active:scale-[0.98]",
                          isChecked
                            ? "bg-[#0a66c2]/10 border-[#0a66c2]/30 text-[#0a66c2] shadow-sm shadow-[#0a66c2]/5"
                            : "bg-muted/5 border-border hover:border-[#0a66c2]/20 text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {
                            let updated;
                            if (isChecked) {
                              updated = selected.filter(t => t !== topic);
                            } else {
                              updated = [...selected, topic];
                            }
                            updateRound(round.id, { selected_topics: updated });
                          }}
                          className="rounded border-border text-[#0a66c2] focus:ring-[#0a66c2] w-3.5 h-3.5 animate-none"
                        />
                        <span className="truncate">{topic}</span>
                      </label>
                    );
                  });
                })()}
              </div>

              {/* Custom Topic Input */}
              <div className="mt-2.5">
                <input
                  type="text"
                  placeholder="+ Add Custom Topic (Press Enter)"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.currentTarget;
                      const val = input.value.trim();
                      if (val && !(round.selected_topics || []).includes(val)) {
                        updateRound(round.id, { selected_topics: [...(round.selected_topics || []), val] });
                        input.value = '';
                      }
                    }
                  }}
                  className="bg-muted/10 border border-dashed border-border rounded-sm px-3 py-2 text-[11px] font-semibold w-full max-w-xs focus:outline-none focus:border-[#0a66c2] transition-all placeholder:opacity-50"
                />
              </div>
            </div>

            {/* Target Frameworks */}
            {round.programming_language && (
              <div className="md:col-span-2 space-y-3 pt-2">
                <div>
                  <label className="text-[13px] font-semibold text-foreground">
                    Target Frameworks <span className="text-[10px] opacity-50">(Optional)</span>
                  </label>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Select specific frameworks for {round.programming_language}.
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {(() => {
                    const langKey = round.programming_language.toUpperCase();
                    const suggested = SUGGESTED_FRAMEWORKS[langKey] || [];
                    const selected = round.selected_frameworks || [];
                    const custom = selected.filter(f => !suggested.includes(f));
                    const allFrameworks = [...suggested, ...custom];

                    return allFrameworks.map((framework) => {
                      const isChecked = selected.includes(framework);
                      return (
                        <label
                          key={framework}
                          className={cn(
                            "flex items-center gap-2 p-3 rounded-sm border cursor-pointer transition-all text-[11px] font-bold select-none active:scale-[0.98]",
                            isChecked
                              ? "bg-[#0a66c2]/10 border-[#0a66c2]/30 text-[#0a66c2] shadow-sm shadow-[#0a66c2]/5"
                              : "bg-muted/5 border-border hover:border-[#0a66c2]/20 text-muted-foreground hover:text-foreground"
                          )}
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => {
                              let updated;
                              if (isChecked) {
                                updated = selected.filter(f => f !== framework);
                              } else {
                                updated = [...selected, framework];
                              }
                              updateRound(round.id, { selected_frameworks: updated });
                            }}
                            className="rounded border-border text-[#0a66c2] focus:ring-[#0a66c2] w-3.5 h-3.5 animate-none"
                          />
                          <span className="truncate">{framework}</span>
                        </label>
                      );
                    });
                  })()}
                </div>

                {/* Custom Framework Input */}
                <div className="mt-2.5">
                  <input
                    type="text"
                    placeholder="+ Add Custom Framework (Press Enter)"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const input = e.currentTarget;
                        const val = input.value.trim();
                        if (val && !(round.selected_frameworks || []).includes(val)) {
                          updateRound(round.id, { selected_frameworks: [...(round.selected_frameworks || []), val] });
                          input.value = '';
                        }
                      }
                    }}
                    className="bg-muted/10 border border-dashed border-border rounded-sm px-3 py-2 text-[11px] font-semibold w-full max-w-xs focus:outline-none focus:border-[#0a66c2] transition-all placeholder:opacity-50"
                  />
                </div>
              </div>
            )}
          </>
        )}

        {/* Question Count */}
        <div className="space-y-2">
          <label className="text-[13px] font-semibold text-foreground">Question Count</label>
          <input
            type="number"
            value={round.max_questions}
            onChange={(e) => updateRound(round.id, { max_questions: parseInt(e.target.value) || 0 })}
            data-agent={`question-count-input-${index}`}
            className="w-full bg-muted/10 border border-border rounded-sm py-3 px-4 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#0a66c2] transition-all"
          />
        </div>

        {/* Allocated Duration (Separate Hours & Minutes) */}
        <div className="space-y-2">
          <label className="text-[13px] font-semibold text-foreground">Allocated Duration</label>
          <div className="flex gap-3 items-center">
            <div className="flex-1 space-y-1">
              <div className="relative flex items-center">
                <input
                  type="number"
                  min="0"
                  value={hoursValue || ''}
                  onChange={(e) => {
                    const h = Math.max(0, parseInt(e.target.value) || 0);
                    const m = Math.floor((round.timer_seconds % 3600) / 60);
                    updateRound(round.id, { timer_seconds: (h * 3600) + (m * 60) });
                  }}
                  placeholder="0"
                  data-agent={`allocated-hours-input-${index}`}
                  className="w-full bg-muted/10 border border-border rounded-sm py-2.5 px-3 pr-12 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#0a66c2] transition-all"
                />
                <span className="absolute right-3 text-[11px] font-semibold text-muted-foreground pointer-events-none">
                  Hrs
                </span>
              </div>
            </div>
            <div className="flex-1 space-y-1">
              <div className="relative flex items-center">
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={minsValue || ''}
                  onChange={(e) => {
                    const h = Math.floor(round.timer_seconds / 3600);
                    const m = Math.max(0, parseInt(e.target.value) || 0);
                    updateRound(round.id, { timer_seconds: (h * 3600) + (m * 60) });
                  }}
                  placeholder="0"
                  data-agent={`allocated-minutes-input-${index}`}
                  className="w-full bg-muted/10 border border-border rounded-sm py-2.5 px-3 pr-14 text-xs font-bold focus:outline-none focus:ring-1 focus:ring-[#0a66c2] transition-all"
                />
                <span className="absolute right-3 text-[11px] font-semibold text-muted-foreground pointer-events-none">
                  Mins
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Special Round Banners or AI Question Configuration */}
        {round.question_format === 'VIDEO' ? (
          <div className="md:col-span-2 p-6 rounded-sm bg-[#0a66c2]/[0.03] border border-[#0a66c2]/10 flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-[#0a66c2]/10 text-[#0a66c2] flex items-center justify-center shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[12px] font-bold text-[#0a66c2]">AI HR Agent Active</p>
              <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                This round is configured as a Live AI Voice/Video Interview. The AI HR Agent will act as the host, vocalizing tailored questions and transcribing spoken answers at runtime. Manual question layout is not required.
              </p>
            </div>
          </div>
        ) : round.question_format === 'ONLINE_INTERVIEW' ? (
          <div className="md:col-span-2 p-6 rounded-sm bg-emerald-600/[0.03] border border-emerald-600/10 flex items-start gap-4">
            <div className="w-8 h-8 rounded-full bg-emerald-600/10 text-emerald-600 flex items-center justify-center shrink-0">
              <Video className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[12px] font-bold text-emerald-600">Online In-Person Interview Active</p>
              <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                This round is configured as a Live Face-to-Face Online Interview. The interviewer and candidate will connect directly in a Google Meet style workspace. Pre-generating questions in the platform is not required.
              </p>
            </div>
          </div>
        ) : (
          <RoundQuestionList
            roundId={round.id}
            index={index}
            questions={round.questions || []}
            updateRound={updateRound}
            handleGenerateQuestions={handleGenerateQuestions}
          />
        )}
      </div>
    </motion.div>
  );
}
