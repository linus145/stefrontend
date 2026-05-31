import { api } from '@/lib/api';
import { BaseAPIResponse, PaginatedResponse } from '@/types/auth.types';

export const hrPayrollService = {
  getPayrolls: (params?: any): Promise<BaseAPIResponse<PaginatedResponse<any>>> => 
    api.get<any>('/payroll/runs/', { params }).then(res => ({ status: 'success', message: '', data: res })),
    
  getPayslips: (params?: any): Promise<BaseAPIResponse<PaginatedResponse<any>>> => 
    api.get<any>('/payroll/payslips/', { params }).then(res => ({ status: 'success', message: '', data: res })),
    
  processPayroll: (id: string): Promise<BaseAPIResponse<any>> => 
    api.post<any>(`/payroll/runs/${id}/process/`).then(res => ({ status: 'success', message: '', data: res })),
    
  generatePayroll: (month: number, year: number): Promise<BaseAPIResponse<any>> => 
    api.post<any>('/payroll/runs/generate/', { month, year }).then(res => ({ status: 'success', message: '', data: res })),

  rerunPayroll: (id: string): Promise<BaseAPIResponse<any>> => 
    api.post<any>(`/payroll/runs/${id}/rerun/`).then(res => ({ status: 'success', message: '', data: res })),

  deletePayroll: (id: string): Promise<BaseAPIResponse<any>> => 
    api.delete<any>(`/payroll/runs/${id}/`).then(res => ({ status: 'success', message: '', data: res })),

  approvePayroll: (id: string): Promise<BaseAPIResponse<any>> => 
    api.post<any>(`/payroll/runs/${id}/approve/`).then(res => ({ status: 'success', message: '', data: res })),

  rejectPayroll: (id: string): Promise<BaseAPIResponse<any>> => 
    api.post<any>(`/payroll/runs/${id}/reject/`).then(res => ({ status: 'success', message: '', data: res })),

  getPayrollRecords: (id: string): Promise<BaseAPIResponse<any>> => 
    api.get<any>(`/payroll/runs/${id}/records_list/`).then(res => ({ status: 'success', message: '', data: res })),

  getPayrollAnalytics: (): Promise<BaseAPIResponse<any>> => 
    api.get<any>('/payroll/runs/analytics/').then(res => ({ status: 'success', message: '', data: res })),

  // Salary Structure CRUD
  getSalaryStructures: (): Promise<BaseAPIResponse<PaginatedResponse<any>>> => 
    api.get<any>('/payroll/structures/').then(res => ({ status: 'success', message: '', data: res })),

  createSalaryStructure: (data: any): Promise<BaseAPIResponse<any>> => 
    api.post<any>('/payroll/structures/', data).then(res => ({ status: 'success', message: '', data: res })),

  updateSalaryStructure: (id: string, data: any): Promise<BaseAPIResponse<any>> => 
    api.put<any>(`/payroll/structures/${id}/`, data).then(res => ({ status: 'success', message: '', data: res })),

  deleteSalaryStructure: (id: string): Promise<BaseAPIResponse<any>> => 
    api.delete<any>(`/payroll/structures/${id}/`).then(res => ({ status: 'success', message: '', data: res })),

  assignAllowance: (data: { structure_id: string; allowance_id: string; amount: number }): Promise<BaseAPIResponse<any>> => 
    api.post<any>('/payroll/structures/assign_allowance/', data).then(res => ({ status: 'success', message: '', data: res })),

  assignDeduction: (data: { structure_id: string; deduction_id: string; amount: number }): Promise<BaseAPIResponse<any>> => 
    api.post<any>('/payroll/structures/assign_deduction/', data).then(res => ({ status: 'success', message: '', data: res })),

  // Reimbursements API
  getReimbursements: (params?: any): Promise<BaseAPIResponse<PaginatedResponse<any>>> => 
    api.get<any>('/payroll/reimbursements/', { params }).then(res => ({ status: 'success', message: '', data: res })),

  createReimbursement: (data: any): Promise<BaseAPIResponse<any>> => 
    api.post<any>('/payroll/reimbursements/', data).then(res => ({ status: 'success', message: '', data: res })),

  approveReimbursement: (id: string): Promise<BaseAPIResponse<any>> => 
    api.post<any>(`/payroll/reimbursements/${id}/approve/`).then(res => ({ status: 'success', message: '', data: res })),

  rejectReimbursement: (id: string): Promise<BaseAPIResponse<any>> => 
    api.post<any>(`/payroll/reimbursements/${id}/reject/`).then(res => ({ status: 'success', message: '', data: res })),

  // Adjustments & Tax Configs
  getPayrollAdjustments: (): Promise<BaseAPIResponse<PaginatedResponse<any>>> => 
    api.get<any>('/payroll/adjustments/').then(res => ({ status: 'success', message: '', data: res })),

  createPayrollAdjustment: (data: any): Promise<BaseAPIResponse<any>> => 
    api.post<any>('/payroll/adjustments/', data).then(res => ({ status: 'success', message: '', data: res })),

  getTaxConfigs: (): Promise<BaseAPIResponse<PaginatedResponse<any>>> => 
    api.get<any>('/payroll/tax-configs/').then(res => ({ status: 'success', message: '', data: res })),

  createTaxConfig: (data: any): Promise<BaseAPIResponse<any>> => 
    api.post<any>('/payroll/tax-configs/', data).then(res => ({ status: 'success', message: '', data: res })),

  // Modular new endpoints
  getDashboardAnalytics: (): Promise<BaseAPIResponse<any>> => 
    api.get<any>('/payroll/dashboard/').then(res => ({ status: 'success', message: '', data: res })),

  getApprovalsQueue: (): Promise<BaseAPIResponse<any>> => 
    api.get<any>('/payroll/approvals/').then(res => ({ status: 'success', message: '', data: res })),

  getReportsAnalytics: (): Promise<BaseAPIResponse<any>> => 
    api.get<any>('/payroll/reports/').then(res => ({ status: 'success', message: '', data: res })),

  getSettingsConfigs: (): Promise<BaseAPIResponse<any>> => 
    api.get<any>('/payroll/settings/').then(res => ({ status: 'success', message: '', data: res })),

  updateSettingsConfigs: (data: any): Promise<BaseAPIResponse<any>> => 
    api.post<any>('/payroll/settings/', data).then(res => ({ status: 'success', message: '', data: res })),

  // Templates CRUD
  getTemplates: (): Promise<BaseAPIResponse<PaginatedResponse<any>>> => 
    api.get<any>('/payroll/templates/').then(res => ({ status: 'success', message: '', data: res })),

  createTemplate: (data: any): Promise<BaseAPIResponse<any>> => 
    api.post<any>('/payroll/templates/', data).then(res => ({ status: 'success', message: '', data: res })),

  updateTemplate: (id: string, data: any): Promise<BaseAPIResponse<any>> => 
    api.put<any>(`/payroll/templates/${id}/`, data).then(res => ({ status: 'success', message: '', data: res })),

  deleteTemplate: (id: string): Promise<BaseAPIResponse<any>> => 
    api.delete<any>(`/payroll/templates/${id}/`).then(res => ({ status: 'success', message: '', data: res })),

  sendTemplate: (employee_id: string, email_body: string, subject?: string, template_name?: string, design_id?: string): Promise<BaseAPIResponse<any>> => 
    api.post<any>(`/payroll/templates/send_template/`, { employee_id, email_body, subject, template_name, design_id }).then(res => ({ status: 'success', message: '', data: res })),

  fetchPayrollData: (employee_id: string, month: string, year: string): Promise<BaseAPIResponse<any>> =>
    api.get<any>('/payroll/templates/fetch_payroll_data/', { params: { employee_id, month, year } }).then(res => ({ status: 'success', message: '', data: res })),
};
