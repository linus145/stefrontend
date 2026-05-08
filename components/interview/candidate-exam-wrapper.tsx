'use client';

import { useState, useCallback } from 'react';
import { toast, Toaster } from 'sonner';
import axios from 'axios';
import { ExamData } from '@/types/exam-types';
import { ExamLoginPhase } from '@/components/interview/exam-login-phase';
import { ExamCompletedPhase } from '@/components/interview/exam-completed-phase';
import { ExamActivePhase } from '@/components/interview/exam-active-phase';

// Standalone axios for candidate exam — NO JWT auth, NO token refresh
const examApi = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000/api',
  headers: { 'Content-Type': 'application/json' },
});

export function CandidateExamWrapper() {
  const [phase, setPhase] = useState<'login' | 'exam' | 'completed'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [activeRoundIndex, setActiveRoundIndex] = useState(0);
  const [activeQuestionIndex, setActiveQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [isCompleting, setIsCompleting] = useState(false);

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      toast.error('Please enter both username and password.');
      return;
    }

    setIsLoggingIn(true);
    try {
      const response = await examApi.post('/AIrounds/exam-login/', {
        username: username.trim(),
        password: password.trim(),
      });

      if (response.data.status === 'success') {
        setExamData(response.data.data);
        setPhase('exam');
        toast.success('Welcome! Your exam is ready.');
      } else {
        toast.error(response.data.message || 'Login failed.');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleSubmitAnswer = useCallback(async (questionId: string) => {
    if (!examData || !answers[questionId]?.trim()) {
      toast.error('Please write your answer before submitting.');
      return;
    }

    setSubmitting(questionId);
    try {
      const response = await examApi.post(`/AIrounds/exam-submit/${questionId}/`, {
        exam_token: examData.exam_token,
        answer: answers[questionId],
      });

      if (response.data.status === 'success') {
        // Update local state
        setExamData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            rounds: prev.rounds.map(rnd => ({
              ...rnd,
              questions: rnd.questions.map(q =>
                q.id === questionId
                  ? { ...q, candidate_answer: answers[questionId], answered_at: new Date().toISOString() }
                  : q
              ),
            })),
          };
        });
        toast.success('Answer saved successfully.');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to submit answer.');
    } finally {
      setSubmitting(null);
    }
  }, [examData, answers]);

  const handleCompleteExam = async () => {
    if (!examData) return;

    setIsCompleting(true);
    try {
      const response = await examApi.post('/AIrounds/exam-complete/', {
        exam_token: examData.exam_token,
      });

      if (response.data.status === 'success') {
        setPhase('completed');
        toast.success('Exam submitted successfully!');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to complete exam.');
    } finally {
      setIsCompleting(false);
    }
  };

  // Calculate progress
  const totalQuestions = examData?.rounds.reduce((sum, r) => sum + r.questions.length, 0) || 0;
  const answeredQuestions = examData?.rounds.reduce(
    (sum, r) => sum + r.questions.filter(q => q.candidate_answer || answers[q.id]).length,
    0
  ) || 0;

  // --- RENDER PHASES ---
  if (phase === 'login') {
    return (
      <ExamLoginPhase
        username={username}
        setUsername={setUsername}
        password={password}
        setPassword={setPassword}
        isLoggingIn={isLoggingIn}
        handleLogin={handleLogin}
      />
    );
  }

  if (phase === 'completed') {
    return (
      <ExamCompletedPhase
        examData={examData}
        answeredQuestions={answeredQuestions}
        totalQuestions={totalQuestions}
      />
    );
  }

  return (
    <ExamActivePhase
      examData={examData}
      answers={answers}
      setAnswers={setAnswers}
      activeRoundIndex={activeRoundIndex}
      setActiveRoundIndex={setActiveRoundIndex}
      activeQuestionIndex={activeQuestionIndex}
      setActiveQuestionIndex={setActiveQuestionIndex}
      submitting={submitting}
      isCompleting={isCompleting}
      handleSubmitAnswer={handleSubmitAnswer}
      handleCompleteExam={handleCompleteExam}
      answeredQuestions={answeredQuestions}
      totalQuestions={totalQuestions}
    />
  );
}
