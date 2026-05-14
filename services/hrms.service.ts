import { api } from '@/lib/api';
import { BaseAPIResponse, PaginatedResponse } from '@/types/auth.types';

export const hrmsService = {
  // Organization
  getDepartments: (): Promise<BaseAPIResponse<PaginatedResponse<any>>> => 
    api.get<any>('/organization/departments/').then(res => ({ status: 'success', message: '', data: res })),
    
  getDesignations: (): Promise<BaseAPIResponse<PaginatedResponse<any>>> => 
    api.get<any>('/organization/designations/').then(res => ({ status: 'success', message: '', data: res })),

  // Employees
  getEmployees: (params?: any): Promise<BaseAPIResponse<PaginatedResponse<any>>> => 
    api.get<any>('/employees/employees/', { params }).then(res => ({ status: 'success', message: '', data: res })),
    
  getEmployeeDetail: (id: string): Promise<BaseAPIResponse<any>> => 
    api.get<any>(`/employees/employees/${id}/`).then(res => ({ status: 'success', message: '', data: res })),
    
  createEmployee: (data: any): Promise<BaseAPIResponse<any>> => 
    api.post<any>('/employees/employees/', data).then(res => ({ status: 'success', message: '', data: res })),
    
  updateEmployee: (id: string, data: any): Promise<BaseAPIResponse<any>> => 
    api.patch<any>(`/employees/employees/${id}/`, data).then(res => ({ status: 'success', message: '', data: res })),

  deleteEmployee: (id: string): Promise<void> => 
    api.delete<any>(`/employees/employees/${id}/`),

  // Attendance
  getAttendance: (params?: any): Promise<BaseAPIResponse<PaginatedResponse<any>>> => 
    api.get<any>('/attendance/records/', { params }).then(res => ({ status: 'success', message: '', data: res })),
    
  checkIn: (data: { location_in?: string }): Promise<BaseAPIResponse<any>> => 
    api.post<any>('/attendance/records/check_in/', data).then(res => ({ status: 'success', message: '', data: res })),
    
  checkOut: (data: { location_out?: string }): Promise<BaseAPIResponse<any>> => 
    api.post<any>('/attendance/records/check_out/', data).then(res => ({ status: 'success', message: '', data: res })),

  // Leave Management
  getLeaveRequests: (params?: any): Promise<BaseAPIResponse<PaginatedResponse<any>>> => 
    api.get<any>('/leave_management/requests/', { params }).then(res => ({ status: 'success', message: '', data: res })),
    
  getLeaveBalances: (): Promise<BaseAPIResponse<PaginatedResponse<any>>> => 
    api.get<any>('/leave_management/balances/').then(res => ({ status: 'success', message: '', data: res })),
    
  getLeaveTypes: (): Promise<BaseAPIResponse<PaginatedResponse<any>>> => 
    api.get<any>('/leave_management/types/').then(res => ({ status: 'success', message: '', data: res })),
    
  createLeaveRequest: (data: any): Promise<BaseAPIResponse<any>> => 
    api.post<any>('/leave_management/requests/', data).then(res => ({ status: 'success', message: '', data: res })),
    
  approveLeave: (id: string, comment?: string): Promise<BaseAPIResponse<any>> => 
    api.post<any>(`/leave_management/requests/${id}/approve/`, { comment }).then(res => ({ status: 'success', message: '', data: res })),
    
  rejectLeave: (id: string, comment?: string): Promise<BaseAPIResponse<any>> => 
    api.post<any>(`/leave_management/requests/${id}/reject/`, { comment }).then(res => ({ status: 'success', message: '', data: res })),

  // Payroll
  getPayrolls: (): Promise<BaseAPIResponse<PaginatedResponse<any>>> => 
    api.get<any>('/payroll/runs/').then(res => ({ status: 'success', message: '', data: res })),
    
  getPayslips: (params?: any): Promise<BaseAPIResponse<PaginatedResponse<any>>> => 
    api.get<any>('/payroll/payslips/', { params }).then(res => ({ status: 'success', message: '', data: res })),
    
  processPayroll: (id: string): Promise<BaseAPIResponse<any>> => 
    api.post<any>(`/payroll/runs/${id}/process/`).then(res => ({ status: 'success', message: '', data: res })),
    
  getSalaryStructures: (): Promise<BaseAPIResponse<PaginatedResponse<any>>> => 
    api.get<any>('/payroll/structures/').then(res => ({ status: 'success', message: '', data: res })),

  // Performance
  getKPIs: (): Promise<BaseAPIResponse<PaginatedResponse<any>>> => 
    api.get<any>('/performance/kpis/').then(res => ({ status: 'success', message: '', data: res })),
    
  getGoals: (): Promise<BaseAPIResponse<PaginatedResponse<any>>> => 
    api.get<any>('/performance/goals/').then(res => ({ status: 'success', message: '', data: res })),
    
  getReviews: (): Promise<BaseAPIResponse<PaginatedResponse<any>>> => 
    api.get<any>('/performance/reviews/').then(res => ({ status: 'success', message: '', data: res })),
    
  createReview: (data: any): Promise<BaseAPIResponse<any>> => 
    api.post<any>('/performance/reviews/', data).then(res => ({ status: 'success', message: '', data: res })),
};
