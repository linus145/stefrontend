'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Sparkles, BrainCircuit } from 'lucide-react';

interface QuestionItem {
  text: string;
  marks: number;
  ideal_answer?: string;
  mcq_options?: any[];
  question_type?: string;
}

interface RoundQuestionListProps {
  roundId: string;
  index: number;
  questions: (string | QuestionItem)[];
  updateRound: (id: string, updates: any) => void;
  handleGenerateQuestions: (roundId: string) => void;
}

export function RoundQuestionList({
  roundId,
  index,
  questions,
  updateRound,
  handleGenerateQuestions,
}: RoundQuestionListProps) {
  const totalMarks = questions?.reduce(
    (acc, q: any) => acc + (typeof q === 'string' ? 10 : (q.marks || 0)),
    0
  ) || 0;

  return (
    <div className="md:col-span-2 space-y-4 pt-4 border-t border-border/50">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-[13px] font-semibold text-foreground">AI Question Configuration</label>
          <p className="text-[10px] text-muted-foreground mt-1">
            AI will generate these based on candidate resume and job requirements.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold text-muted-foreground bg-muted/30 px-3 py-1.5 rounded-sm border border-border">
            Total Marks: <span className="text-primary">{totalMarks}</span>
          </span>
          <button
            onClick={() => {
              const newQuestions = [...(questions || []), { text: '', marks: 10 }];
              updateRound(roundId, { questions: newQuestions });
            }}
            data-agent={`add-question-button-${index}`}
            className="px-4 py-1.5 rounded-sm border border-border bg-card text-[11px] font-bold hover:bg-muted transition-all"
          >
            + Add Question
          </button>
          <button
            onClick={() => handleGenerateQuestions(roundId)}
            data-agent={`generate-questions-ai-button-${index}`}
            className="px-4 py-1.5 rounded-sm bg-[#0a66c2] text-white text-[11px] font-bold hover:bg-[#004182] transition-all flex items-center gap-2"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Generate with AI
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {questions?.length === 0 ? (
          <div className="py-12 bg-muted/5 border border-dashed border-border rounded-sm flex flex-col items-center justify-center opacity-40">
            <p className="text-[11px] font-bold tracking-widest uppercase">Awaiting AI Generation</p>
          </div>
        ) : (
          questions?.map((q, idx) => (
            <div key={idx} className="relative group flex gap-3 items-start">
              <div className="flex-1 space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-muted-foreground block mb-1 uppercase tracking-wider opacity-60">
                    Question
                  </label>
                  <textarea
                    value={typeof q === 'string' ? q : q.text}
                    onChange={(e) => {
                      const newQuestions = [...(questions || [])] as any[];
                      const current = newQuestions[idx];
                      newQuestions[idx] = typeof current === 'string'
                        ? { text: e.target.value, marks: 10 }
                        : { ...current, text: e.target.value };
                      updateRound(roundId, { questions: newQuestions });
                    }}
                    placeholder="Type your question here..."
                    data-agent="question-text-textarea"
                    className="w-full bg-muted/10 border border-border rounded-sm py-3 px-4 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#0a66c2] transition-all min-h-[60px]"
                  />
                </div>

                {typeof q === 'object' && q.mcq_options && q.mcq_options.length > 0 && (
                  <div className="space-y-2 border border-border/60 bg-[#0a66c2]/[0.01] p-4 rounded-sm">
                    <label className="text-[10px] font-bold text-muted-foreground block uppercase tracking-wider opacity-60">
                      MCQ Options Preview
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {q.mcq_options.map((opt: any, optIdx: number) => (
                        <div
                          key={optIdx}
                          className={cn(
                            "flex items-center gap-2.5 p-3 rounded-sm border text-xs font-semibold transition-all",
                            opt.is_correct
                              ? "bg-emerald-600/10 border-emerald-600/30 text-emerald-600 shadow-sm"
                              : "bg-muted/10 border-border/50 text-muted-foreground"
                          )}
                        >
                          <span
                            className={cn(
                              "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border shrink-0 transition-all",
                              opt.is_correct
                                ? "bg-emerald-600 border-emerald-600 text-white"
                                : "border-border/80 text-muted-foreground bg-muted/20"
                            )}
                          >
                            {opt.label || String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="truncate">{opt.text}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-[10px] font-bold text-[#0a66c2] block mb-1 uppercase tracking-wider opacity-60 flex items-center gap-2">
                    <BrainCircuit className="w-3 h-3" />
                    AI Generated Ideal Answer
                  </label>
                  <textarea
                    value={typeof q === 'object' ? q.ideal_answer : ''}
                    onChange={(e) => {
                      const newQuestions = [...(questions || [])] as any[];
                      const current = newQuestions[idx];
                      if (typeof current === 'object') {
                        newQuestions[idx] = { ...current, ideal_answer: e.target.value };
                        updateRound(roundId, { questions: newQuestions });
                      }
                    }}
                    placeholder="AI will generate an ideal answer to compare against..."
                    data-agent="ideal-answer-textarea"
                    className="w-full bg-[#0a66c2]/[0.03] border border-[#0a66c2]/10 rounded-sm py-3 px-4 text-xs font-medium italic focus:outline-none focus:ring-1 focus:ring-[#0a66c2] transition-all min-h-[60px]"
                  />
                </div>
              </div>

              <div className="w-20 shrink-0">
                <label className="text-[10px] font-bold text-muted-foreground block mb-1">Marks</label>
                <input
                  type="number"
                  value={typeof q === 'string' ? 10 : q.marks}
                  onChange={(e) => {
                    const newQuestions = [...(questions || [])] as any[];
                    const current = newQuestions[idx];
                    const newMarks = parseInt(e.target.value) || 0;
                    newQuestions[idx] = typeof current === 'string'
                      ? { text: current, marks: newMarks }
                      : { ...current, marks: newMarks };
                    updateRound(roundId, { questions: newQuestions });
                  }}
                  data-agent="marks-input"
                  className="w-full bg-muted/10 border border-border rounded-sm py-3 px-3 text-xs font-bold text-center focus:outline-none focus:ring-1 focus:ring-[#0a66c2] transition-all"
                />
              </div>

              <button
                onClick={() => {
                  const newQuestions = questions?.filter((_, i) => i !== idx);
                  updateRound(roundId, { questions: newQuestions });
                }}
                className="absolute top-2 right-2 p-1.5 bg-rose-500 text-white rounded-sm opacity-0 group-hover:opacity-100 transition-all z-10 shadow-sm"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
