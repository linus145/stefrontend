import { api } from '@/lib/api';

export interface AIScreeningReport {
  id: string;
  job_id: string;
  job_title: string;
  results: {
    processed_count: number;
    total_applicants: number;
    top_candidates: Array<{
      id: string;
      rank: number;
      name: string;
      email: string;
      score: number;
      summary: string;
      recommended: boolean;
    }>;
    openings: number;
  };
  created_at: string;
}

export const aiService = {
  getScreeningHistory: (): Promise<{ data: AIScreeningReport[] }> => {
    return api.get<{ data: AIScreeningReport[] }>('/ai/screening/history/');
  }
};
