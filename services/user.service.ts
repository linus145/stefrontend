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
  }
};
