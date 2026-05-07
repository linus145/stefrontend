import { api } from '@/lib/api';

export interface AIScreeningReport {
  id: string;
  job_id: string;
  job_title: string;
  results: {
    status?: string;
    count?: number;
    report_id?: string;
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
  },

  analyzeResumes: (jobId: string): Promise<any> => {
    return api.post(`/ai/screening/analyze/${jobId}/`, {});
  },

  deleteScreeningReport: (reportId: string): Promise<any> => {
    return api.delete(`/ai/screening/report/${reportId}/`);
  }
};
