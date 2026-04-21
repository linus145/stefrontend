import { api } from '@/lib/api';
import { BaseAPIResponse, AuthResponsePayload } from '@/types/auth.types';

export const authService = {
  login: (email: string, password: string): Promise<BaseAPIResponse<AuthResponsePayload>> => {
    return api.post<BaseAPIResponse<AuthResponsePayload>>('/auth/login/', { email, password });
  },

  logout: (): Promise<BaseAPIResponse<any>> => {
    return api.post<BaseAPIResponse<any>>('/auth/logout/', {});
  },

  // Refresh is handled silently by the axios interceptor.
  // Backend reads refresh_token from HttpOnly cookie — no body needed.
  refreshToken: (): Promise<{ status: string; message: string }> => {
    return api.post<{ status: string; message: string }>('/auth/token/refresh/', {});
  }
};
