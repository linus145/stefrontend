import { api } from '@/lib/api';
import { BaseAPIResponse, PaginatedResponse } from '@/types/auth.types';

export const hrPerformanceService = {
  getKPIs: (): Promise<BaseAPIResponse<PaginatedResponse<any>>> => 
    api.get<any>('/performance/kpis/').then(res => ({ status: 'success', message: '', data: res })),
    
  getGoals: (): Promise<BaseAPIResponse<PaginatedResponse<any>>> => 
    api.get<any>('/performance/goals/').then(res => ({ status: 'success', message: '', data: res })),
    
  getReviews: (): Promise<BaseAPIResponse<PaginatedResponse<any>>> => 
    api.get<any>('/performance/reviews/').then(res => ({ status: 'success', message: '', data: res })),
    
  createReview: (data: any): Promise<BaseAPIResponse<any>> => 
    api.post<any>('/performance/reviews/', data).then(res => ({ status: 'success', message: '', data: res })),
};
