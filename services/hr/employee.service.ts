import { api } from '@/lib/api';
import { BaseAPIResponse, PaginatedResponse } from '@/types/auth.types';

export const hrEmployeeService = {
  getEmployees: (params?: any): Promise<BaseAPIResponse<PaginatedResponse<any>>> =>
    api.get<any>('/employees/employees/', { params }).then(res => ({ status: 'success', message: '', data: res })),

  getEmployeeDetail: (id: string): Promise<BaseAPIResponse<any>> =>
    api.get<any>(`/employees/employees/${id}/`).then(res => ({ status: 'success', message: '', data: res })),

  createEmployee: (data: any): Promise<BaseAPIResponse<any>> =>
    api.post<any>('/employees/employees/', data).then(res => ({ status: 'success', message: '', data: res })),

  addManualEmployee: (data: any): Promise<BaseAPIResponse<any>> =>
    api.post<any>('/employees/employees/add-manual/', data).then(res => ({ status: 'success', message: '', data: res })),

  updateEmployee: (id: string, data: any): Promise<BaseAPIResponse<any>> =>
    api.patch<any>(`/employees/employees/${id}/`, data).then(res => ({ status: 'success', message: '', data: res })),

  deleteEmployee: (id: string): Promise<void> =>
    api.delete<any>(`/employees/employees/${id}/`),

  sendCredentials: (id: string, data?: { password?: string; portal_username?: string }): Promise<BaseAPIResponse<any>> =>
    api.post<any>(`/employees/employees/${id}/send-credentials/`, data || {}).then(res => ({ status: 'success', message: '', data: res })),

  changeCredentials: (data: { portal_username?: string; password?: string }): Promise<BaseAPIResponse<any>> =>
    api.post<any>('/employees/employees/change-credentials/', data).then(res => ({ status: 'success', message: 'Credentials updated successfully.', data: res })),

  getMyProfile: (): Promise<BaseAPIResponse<any>> =>
    api.get<any>('/employees/employees/me/').then(res => ({ status: 'success', message: '', data: res })),
};
