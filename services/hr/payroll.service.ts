import { api } from '@/lib/api';
import { BaseAPIResponse, PaginatedResponse } from '@/types/auth.types';

export const hrPayrollService = {
  getPayrolls: (): Promise<BaseAPIResponse<PaginatedResponse<any>>> => 
    api.get<any>('/payroll/runs/').then(res => ({ status: 'success', message: '', data: res })),
    
  getPayslips: (params?: any): Promise<BaseAPIResponse<PaginatedResponse<any>>> => 
    api.get<any>('/payroll/payslips/', { params }).then(res => ({ status: 'success', message: '', data: res })),
    
  processPayroll: (id: string): Promise<BaseAPIResponse<any>> => 
    api.post<any>(`/payroll/runs/${id}/process/`).then(res => ({ status: 'success', message: '', data: res })),
    
  getSalaryStructures: (): Promise<BaseAPIResponse<PaginatedResponse<any>>> => 
    api.get<any>('/payroll/structures/').then(res => ({ status: 'success', message: '', data: res })),
};
