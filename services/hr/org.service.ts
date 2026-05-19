import { api } from '@/lib/api';
import { BaseAPIResponse, PaginatedResponse } from '@/types/auth.types';

export const hrOrgService = {
  getOrganization: (): Promise<BaseAPIResponse<any>> => 
    api.get<any>('/organization/detail/').then(res => ({ status: 'success', message: '', data: res })),
    
  updateOrganization: (data: any): Promise<BaseAPIResponse<any>> => 
    api.patch<any>('/organization/detail/', data).then(res => ({ status: 'success', message: '', data: res })),

  getDepartments: (): Promise<BaseAPIResponse<PaginatedResponse<any>>> => 
    api.get<any>('/organization/departments/').then(res => ({ status: 'success', message: '', data: res })),
    
  getDesignations: (): Promise<BaseAPIResponse<PaginatedResponse<any>>> => 
    api.get<any>('/organization/designations/').then(res => ({ status: 'success', message: '', data: res })),
};
