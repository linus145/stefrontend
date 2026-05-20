import { api } from '@/lib/api';
import { BaseAPIResponse, PaginatedResponse } from '@/types/auth.types';

export const hrLeaveService = {
  getLeaveRequests: (params?: any): Promise<BaseAPIResponse<PaginatedResponse<any>>> => 
    api.get<any>('/leave_management/requests/', { params }).then(res => ({ status: 'success', message: '', data: res })),
    
  getLeaveBalances: (): Promise<BaseAPIResponse<PaginatedResponse<any>>> => 
    api.get<any>('/leave_management/balances/').then(res => ({ status: 'success', message: '', data: res })),
    
  getLeaveTypes: (): Promise<BaseAPIResponse<PaginatedResponse<any>>> => 
    api.get<any>('/leave_management/types/').then(res => ({ status: 'success', message: '', data: res })),
    
  createLeaveType: (data: any): Promise<BaseAPIResponse<any>> => 
    api.post<any>('/leave_management/types/', data).then(res => ({ status: 'success', message: '', data: res })),

  updateLeaveType: (id: string, data: any): Promise<BaseAPIResponse<any>> => 
    api.patch<any>(`/leave_management/types/${id}/`, data).then(res => ({ status: 'success', message: '', data: res })),

  deleteLeaveType: (id: string): Promise<BaseAPIResponse<any>> => 
    api.delete<any>(`/leave_management/types/${id}/`).then(res => ({ status: 'success', message: '', data: res })),

  approveLeave: (id: string, comment?: string): Promise<BaseAPIResponse<any>> => 
    api.post<any>(`/leave_management/requests/${id}/approve/`, { comment }).then(res => ({ status: 'success', message: '', data: res })),
    
  rejectLeave: (id: string, comment?: string): Promise<BaseAPIResponse<any>> => 
    api.post<any>(`/leave_management/requests/${id}/reject/`, { comment }).then(res => ({ status: 'success', message: '', data: res })),

  deleteLeaveRequest: (id: string): Promise<BaseAPIResponse<any>> => 
    api.delete<any>(`/leave_management/requests/${id}/`).then(res => ({ status: 'success', message: '', data: res })),

  createLeaveRequest: (data: any): Promise<BaseAPIResponse<any>> => 
    api.post<any>('/leave_management/requests/', data).then(res => ({ status: 'success', message: '', data: res })),
};

