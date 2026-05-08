'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from 'sonner';
import { ExamData } from '@/types/exam-types';

interface ExamActivePhaseProps {
  examData: ExamData | null;
  answers: Record<string, string>;
  setAnswers: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  activeRoundIndex: number;
  setActiveRoundIndex: (idx: number) => void;
  activeQuestionIndex: number;
  setActiveQuestionIndex: (idx: number) => void;
  submitting: string | null;
  isCompleting: boolean;
  handleSubmitAnswer: (questionId: string) => void;
  handleCompleteExam: () => void;
  answeredQuestions: number;
  totalQuestions: number;
}

export function ExamActivePhase({
  examData, answers, setAnswers, activeRoundIndex, setActiveRoundIndex,
  activeQuestionIndex, setActiveQuestionIndex, submitting, isCompleting,
  handleSubmitAnswer, handleCompleteExam, answeredQuestions, totalQuestions
}: ExamActivePhaseProps) {
  const [showConfirmModal, setShowConfirmModal] = React.useState(false);

  const currentRound = examData?.rounds[activeRoundIndex];
  const currentQuestion = currentRound?.questions[activeQuestionIndex];

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Toaster position="top-center" />

      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-card/95 backdrop-blur-xl border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center">
              <span className="text-primary font-bold text-xs">AI</span>
            </div>
            <div>
              <p className="text-sm font-bold leading-tight">{examData?.job_title}</p>
              <p className="text-[10px] text-muted-foreground">{examData?.candidate_name}</p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Progress</p>
              <p className="text-sm font-bold">
                <span className="text-primary">{answeredQuestions}</span>
                <span className="text-muted-foreground"> / {totalQuestions}</span>
              </p>
            </div>
            <div className="w-32 h-1.5 bg-secondary rounded-sm overflow-hidden">
              <div
                className="h-full bg-primary rounded-sm transition-all duration-500"
                style={{ width: `${totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 100 : 0}%` }}
              />
            </div>
            <button
              onClick={() => setShowConfirmModal(true)}
              disabled={isCompleting}
              className="px-5 py-2 rounded-sm bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-50 shadow-sm"
            >
              {isCompleting ? 'Submitting...' : 'Finish Exam'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 flex gap-6">
        {/* Sidebar — Rounds Navigation */}
        <div className="w-72 shrink-0">
          <div className="sticky top-20 space-y-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-4 px-1">Rounds</p>
            {examData?.rounds.map((rnd, rIdx) => {
              const answeredInRound = rnd.questions.filter(q => q.candidate_answer || answers[q.id]).length;
              const isActive = rIdx === activeRoundIndex;

              return (
                <button
                  key={rnd.id}
                  onClick={() => { setActiveRoundIndex(rIdx); setActiveQuestionIndex(0); }}
                  className={`w-full text-left px-4 py-3 rounded-sm border transition-all ${isActive
                      ? 'bg-primary/10 border-primary/30 text-foreground shadow-sm'
                      : 'bg-card/40 border-border text-muted-foreground hover:border-border/80'
                    }`}
                >
                  <p className="text-xs font-bold">{rnd.designation_display}</p>
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-[10px] opacity-80">{rnd.difficulty} • {rnd.question_format}</p>
                    <p className={`text-[10px] font-bold ${answeredInRound === rnd.questions.length ? 'text-primary' : 'opacity-60'}`}>
                      {answeredInRound}/{rnd.questions.length}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {currentRound && (
            <div>
              {/* Round Header */}
              <div className="mb-6">
                <h2 className="text-xl font-bold">{currentRound.designation_display}</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {currentRound.difficulty} Level • {currentRound.question_format === 'CODE' ? `${currentRound.programming_language || 'Any Language'} Coding` : currentRound.question_format} Questions
                </p>
              </div>

              {/* Question Pills */}
              <div className="flex items-center gap-2 mb-8 flex-wrap">
                {currentRound.questions.map((q, qIdx) => {
                  const isAnswered = !!(q.candidate_answer || answers[q.id]);
                  const isCurrent = qIdx === activeQuestionIndex;
                  return (
                    <button
                      key={q.id}
                      onClick={() => setActiveQuestionIndex(qIdx)}
                      className={`w-9 h-9 rounded-sm text-xs font-bold transition-all ${isCurrent
                          ? 'bg-primary text-primary-foreground shadow-sm ring-2 ring-primary/20 ring-offset-2 ring-offset-background'
                          : isAnswered
                            ? 'bg-primary/10 text-primary border border-primary/30'
                            : 'bg-secondary text-muted-foreground border border-border hover:border-border/80'
                        }`}
                    >
                      {qIdx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Question Card */}
              <AnimatePresence mode="wait">
                {currentQuestion && (
                  <motion.div
                    key={currentQuestion.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                    className="bg-card border border-border rounded-sm overflow-hidden shadow-sm"
                  >
                    {/* Question */}
                    <div className="p-8 border-b border-border">
                      <div className="flex items-start gap-4">
                        <span className="shrink-0 w-8 h-8 rounded-sm bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                          Q{activeQuestionIndex + 1}
                        </span>
                        <div className="flex-1">
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">{currentQuestion.question_text}</p>
                          {currentQuestion.question_type === 'MCQ' && currentQuestion.mcq_options && (
                            <div className="mt-4 space-y-2">
                              {currentQuestion.mcq_options.map((opt: any, i: number) => (
                                <label
                                  key={i}
                                  className={`flex items-center gap-3 p-3 rounded-sm border cursor-pointer transition-all ${answers[currentQuestion.id] === opt.label
                                      ? 'bg-primary/10 border-primary/40 text-foreground shadow-sm'
                                      : 'bg-secondary/40 border-border text-muted-foreground hover:border-border/80'
                                    }`}
                                >
                                  <input
                                    type="radio"
                                    name={`q_${currentQuestion.id}`}
                                    checked={answers[currentQuestion.id] === opt.label}
                                    onChange={() => setAnswers(prev => ({ ...prev, [currentQuestion.id]: opt.label }))}
                                    className="sr-only"
                                  />
                                  <span className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${
                                    answers[currentQuestion.id] === opt.label ? 'border-primary' : 'border-muted-foreground/30'
                                  }`}>
                                    {answers[currentQuestion.id] === opt.label && (
                                      <span className="w-3 h-3 rounded-full bg-primary" />
                                    )}
                                  </span>
                                  <span className="text-sm font-medium">{opt.label}) {opt.text}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Answer Area */}
                    {(currentQuestion.question_type === 'TEXT' || currentQuestion.question_type === 'CODE') && (
                      <div className="p-8">
                        <label className="text-[10px] text-muted-foreground uppercase tracking-wider font-bold block mb-3">
                          {currentQuestion.question_type === 'CODE' ? 'Your Code' : 'Your Answer'}
                        </label>
                        <textarea
                          value={answers[currentQuestion.id] ?? currentQuestion.candidate_answer ?? ''}
                          onChange={(e) => setAnswers(prev => ({ ...prev, [currentQuestion.id]: e.target.value }))}
                          placeholder={currentQuestion.question_type === 'CODE' ? 'Write your code here...' : 'Type your answer here...'}
                          className={`w-full bg-background border border-input rounded-sm py-4 px-5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring transition-all resize-none shadow-sm ${currentQuestion.question_type === 'CODE' ? 'font-mono text-xs min-h-[250px]' : 'min-h-[150px]'
                            }`}
                        />
                      </div>
                    )}

                    {/* Actions */}
                    <div className="px-8 py-5 bg-muted/30 border-t border-border flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setActiveQuestionIndex(Math.max(0, activeQuestionIndex - 1))}
                          disabled={activeQuestionIndex === 0}
                          className="px-5 py-2.5 rounded-sm border border-input bg-background text-xs font-bold text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all disabled:opacity-30"
                        >
                          ← Previous
                        </button>
                        <button
                          onClick={() => {
                            if (activeQuestionIndex < currentRound.questions.length - 1) {
                              setActiveQuestionIndex(activeQuestionIndex + 1);
                            } else if (activeRoundIndex < (examData?.rounds.length || 0) - 1) {
                              setActiveRoundIndex(activeRoundIndex + 1);
                              setActiveQuestionIndex(0);
                            }
                          }}
                          className="px-5 py-2.5 rounded-sm border border-input bg-background text-xs font-bold text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-all"
                        >
                          Next →
                        </button>
                      </div>
                      <button
                        onClick={() => handleSubmitAnswer(currentQuestion.id)}
                        disabled={submitting === currentQuestion.id || (!answers[currentQuestion.id]?.trim() && !currentQuestion.candidate_answer)}
                        className="px-8 py-2.5 rounded-sm bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all active:scale-95 disabled:opacity-40 shadow-sm"
                      >
                        {submitting === currentQuestion.id ? 'Saving...' : currentQuestion.candidate_answer ? 'Update Answer' : 'Save Answer'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {showConfirmModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-card border border-border p-8 rounded-sm shadow-xl max-w-sm w-full"
            >
              <h3 className="text-lg font-bold mb-2">Submit Exam?</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Are you sure you want to submit your exam? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowConfirmModal(false)}
                  className="px-4 py-2 rounded-sm border border-input text-xs font-bold hover:bg-muted transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    handleCompleteExam();
                  }}
                  className="px-4 py-2 rounded-sm bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-all"
                >
                  Submit
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
