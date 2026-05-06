import { api } from '@/lib/api';
import { BaseAPIResponse } from '@/types/auth.types';
import { User } from '@/types/user.types';

export const userService = {
  getProfile: (): Promise<BaseAPIResponse<User>> => {
    return api.get<BaseAPIResponse<User>>('/auth/profile/');
  },
  
  getUserProfile: (userId: string): Promise<BaseAPIResponse<User>> => {
    return api.get<BaseAPIResponse<User>>(`/auth/profile/${userId}/`);
  },
  
  updateProfile: (data: any): Promise<BaseAPIResponse<User>> => {
    return api.patch<BaseAPIResponse<User>>('/auth/profile/', data);
  },

  listUsers: (): Promise<BaseAPIResponse<User[]>> => {
    return api.get<BaseAPIResponse<User[]>>('/auth/list/');
  },

  contactUser: (data: { target_user_id: string; message: string; send_email: boolean }): Promise<BaseAPIResponse<any>> => {
    return api.post<BaseAPIResponse<any>>('/auth/contact/', data);
  },

  bulkContactUsers: (data: { target_user_ids: string[]; message: string }): Promise<BaseAPIResponse<any>> => {
    return api.post<BaseAPIResponse<any>>('/auth/contact/bulk/', data);
  }
};
