import { api } from '@/lib/api';

export interface RoundConfig {
  type: 'TECHNICAL' | 'CODING' | 'HR' | 'BEHAVIORAL' | 'SYSTEM_DESIGN';
  difficulty: 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD';
  max_questions: number;
  timer_seconds: number;
}

export interface InterviewConfig {
  job_application_id: string;
  rounds: RoundConfig[];
}

export const aiInterviewsService = {
  // Fetch all interview sessions for the recruiter's company
  getSessions: async () => {
    return api.get<any>('/AIrounds/sessions/');
  },

  // Orchestrate a new interview
  configureInterview: async (data: InterviewConfig) => {
    return api.post<any>('/AIrounds/configure/', data);
  },

  // Verify a candidate's token (usually for candidate side, but good to have)
  verifyToken: async (token: string) => {
    return api.get<any>(`/AIrounds/verify-token/${token}/`);
  },

  // Generate final report
  generateReport: async (sessionId: string) => {
    return api.post<any>(`/AIrounds/session/${sessionId}/report/`);
  },

  // Generate a pool of questions for configuration
  generateQuestions: async (data: { application_id: string; type: string; designation: string; difficulty: string; question_format: string; programming_language: string; count: number }) => {
    return api.post<any>('/AIrounds/generate-questions/', data);
  },

  // Get specific session details
  getSessionDetails: async (sessionId: string) => {
    return api.get<any>(`/AIrounds/session/${sessionId}/`);
  },

  // Generate active exam link for a candidate
  generateLink: async (data: { session_id: string; expiry_hours?: number }) => {
    return api.post<any>('/AIrounds/generate-link/', data);
  },

  // Get metadata for rounds (designations, tiers, levels)
  getMetadata: async () => {
    return api.get<any>('/AIrounds/metadata/');
  },

  // Get full session detail with rounds, questions, and exam link
  getSessionDetail: async (sessionId: string) => {
    return api.get<any>(`/AIrounds/session/${sessionId}/detail/`);
  },

  // Delete a specific question
  deleteQuestion: async (questionId: string) => {
    return api.delete<any>(`/AIrounds/question/${questionId}/delete/`);
  },

  // Regenerate AI questions for a round
  regenerateRoundQuestions: async (roundId: string, count?: number) => {
    return api.post<any>(`/AIrounds/round/${roundId}/regenerate/`, { count });
  },
};
