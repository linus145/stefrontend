import { api } from '@/lib/api';
import { BaseAPIResponse, PaginatedResponse } from '@/types/auth.types';
import { PerformanceAnalytics } from '@/types/performance';

export const hrPerformanceService = {
  getCycles: (): Promise<BaseAPIResponse<PaginatedResponse<any>>> => 
    api.get<any>('/performance/cycles/').then((res: any) => ({ status: 'success', message: '', data: res })),
    
  createCycle: (data: any): Promise<BaseAPIResponse<any>> => 
    api.post<any>('/performance/cycles/', data).then((res: any) => ({ status: 'success', message: '', data: res })),

  deleteCycle: (id: string): Promise<void> => 
    api.delete<any>(`/performance/cycles/${id}/`),

  getCompetencies: (): Promise<BaseAPIResponse<PaginatedResponse<any>>> => 
    api.get<any>('/performance/competencies/').then((res: any) => ({ status: 'success', message: '', data: res })),
    
  getCompetencyScores: (): Promise<BaseAPIResponse<PaginatedResponse<any>>> => 
    api.get<any>('/performance/competency-scores/').then((res: any) => ({ status: 'success', message: '', data: res })),
    
  createCompetencyScore: (data: any): Promise<BaseAPIResponse<any>> =>
    api.post<any>('/performance/competency-scores/', data).then((res: any) => ({ status: 'success', message: '', data: res })),

  getAnalytics: (): Promise<PerformanceAnalytics> => 
    api.get<PerformanceAnalytics>('/performance/reviews/analytics/').then((res: any) => res as PerformanceAnalytics),
    
  getKPIs: (): Promise<BaseAPIResponse<PaginatedResponse<any>>> => 
    api.get<any>('/performance/kpis/').then((res: any) => ({ status: 'success', message: '', data: res })),
    
  createKPI: (data: any): Promise<BaseAPIResponse<any>> => 
    api.post<any>('/performance/kpis/', data).then((res: any) => ({ status: 'success', message: '', data: res })),

  deleteKPI: (id: string): Promise<void> => 
    api.delete<any>(`/performance/kpis/${id}/`),

  getGoals: (): Promise<BaseAPIResponse<PaginatedResponse<any>>> => 
    api.get<any>('/performance/goals/').then((res: any) => ({ status: 'success', message: '', data: res })),
    
  createGoal: (data: any): Promise<BaseAPIResponse<any>> => 
    api.post<any>('/performance/goals/', data).then((res: any) => ({ status: 'success', message: '', data: res })),

  updateGoal: (id: string, data: any): Promise<BaseAPIResponse<any>> => 
    api.patch<any>(`/performance/goals/${id}/`, data).then((res: any) => ({ status: 'success', message: '', data: res })),

  deleteGoal: (id: string): Promise<void> => 
    api.delete<any>(`/performance/goals/${id}/`),

  getReviews: (): Promise<BaseAPIResponse<PaginatedResponse<any>>> => 
    api.get<any>('/performance/reviews/').then((res: any) => ({ status: 'success', message: '', data: res })),
    
  createReview: (data: any): Promise<BaseAPIResponse<any>> => 
    api.post<any>('/performance/reviews/', data).then((res: any) => ({ status: 'success', message: '', data: res })),
    
  calculateScore: (reviewId: string): Promise<any> =>
    api.post<any>(`/performance/reviews/${reviewId}/calculate/`).then((res: any) => res),

  createFeedback: (data: any): Promise<BaseAPIResponse<any>> => 
    api.post<any>('/performance/feedbacks/', data).then((res: any) => ({ status: 'success', message: '', data: res })),

  generateAIInsights: (): Promise<any> => 
    api.post<any>('/performance/reviews/generate-insights/').then((res: any) => res)
};
