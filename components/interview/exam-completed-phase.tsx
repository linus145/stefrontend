'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Toaster } from 'sonner';
import { ExamData } from '@/types/exam-types';

interface ExamCompletedPhaseProps {
  examData: ExamData | null;
  answeredQuestions: number;
  totalQuestions: number;
}

export function ExamCompletedPhase({
  examData, answeredQuestions, totalQuestions
}: ExamCompletedPhaseProps) {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      <Toaster position="top-center" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center max-w-lg"
      >
        <div className="w-20 h-20 rounded-sm bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-8">
          <div className="w-12 h-12 rounded-sm bg-primary flex items-center justify-center">
            <svg className="w-6 h-6 text-primary-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3">Exam Completed</h1>
        <p className="text-muted-foreground text-sm mb-2">
          You answered <span className="text-primary font-bold">{answeredQuestions}</span> out of <span className="text-foreground font-bold">{totalQuestions}</span> questions.
        </p>
        <p className="text-muted-foreground text-xs">
          Your responses have been submitted for AI evaluation. You will receive your results shortly.
        </p>
        <div className="mt-10 p-6 bg-card border border-border rounded-sm shadow-sm">
          <p className="text-xs text-muted-foreground">Assessment for</p>
          <p className="text-lg font-bold mt-1">{examData?.job_title}</p>
          <p className="text-xs text-muted-foreground mt-1">{examData?.candidate_name}</p>
        </div>
      </motion.div>
    </div>
  );
}
