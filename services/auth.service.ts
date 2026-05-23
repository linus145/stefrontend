import { api } from '@/lib/api';
import { BaseAPIResponse, AuthResponsePayload } from '@/types/auth.types';

export const authService = {
  login: (email: string, password: string): Promise<BaseAPIResponse<AuthResponsePayload>> => {
    return api.post<BaseAPIResponse<AuthResponsePayload>>('/auth/login/', { email, password });
  },

  employeeLogin: (email: string, password: string): Promise<BaseAPIResponse<AuthResponsePayload>> => {
    return api.post<BaseAPIResponse<AuthResponsePayload>>('/employees/login/', { email, password });
  },

  logout: (): Promise<BaseAPIResponse<any>> => {
    return api.post<BaseAPIResponse<any>>('/auth/logout/', {});
  },

  employeeLogout: (): Promise<BaseAPIResponse<any>> => {
    return api.post<BaseAPIResponse<any>>('/employees/logout/', {});
  },

  // Refresh is handled silently by the axios interceptor.
  // Backend reads refresh_token from HttpOnly cookie — no body needed.
  refreshToken: (): Promise<{ status: string; message: string }> => {
    return api.post<{ status: string; message: string }>('/auth/token/refresh/', {});
  },

  changePassword: (data: any): Promise<BaseAPIResponse<any>> => {
    return api.post<BaseAPIResponse<any>>('/auth/change-password/', data);
  },

  updateMobileNumber: (phone_number: string): Promise<BaseAPIResponse<any>> => {
    return api.post<BaseAPIResponse<any>>('/auth/update-mobile/', { phone_number });
  },
  
  googleLogin: (token: string): Promise<BaseAPIResponse<AuthResponsePayload>> => {
    return api.post<BaseAPIResponse<AuthResponsePayload>>('/auth/google-login/', { token });
  },

  requestOtp: (email: string): Promise<BaseAPIResponse<any>> => {
    return api.post<BaseAPIResponse<any>>('/auth/request-otp/', { email });
  },

  verifyOtp: (email: string, otp: string): Promise<BaseAPIResponse<AuthResponsePayload>> => {
    return api.post<BaseAPIResponse<AuthResponsePayload>>('/auth/verify-otp/', { email, otp });
  },

  request2FAOTPs: (secondaryEmail: string, thirdEmail: string): Promise<BaseAPIResponse<any>> => {
    return api.post<BaseAPIResponse<any>>('/auth/request-2fa-otps/', { secondary_email: secondaryEmail, third_email: thirdEmail });
  },

  verify2FAOTPs: (secondaryOtp: string, thirdOtp: string): Promise<BaseAPIResponse<any>> => {
    return api.post<BaseAPIResponse<any>>('/auth/verify-2fa-otps/', { secondary_otp: secondaryOtp, third_otp: thirdOtp });
  },

  requestSecondary2FAOTP: (secondaryEmail: string): Promise<BaseAPIResponse<any>> => {
    return api.post<BaseAPIResponse<any>>('/auth/request-secondary-2fa-otp/', { secondary_email: secondaryEmail });
  },

  verifySecondary2FAOTP: (secondaryOtp: string): Promise<BaseAPIResponse<any>> => {
    return api.post<BaseAPIResponse<any>>('/auth/verify-secondary-2fa-otp/', { secondary_otp: secondaryOtp });
  },

  requestThird2FAOTP: (thirdEmail: string): Promise<BaseAPIResponse<any>> => {
    return api.post<BaseAPIResponse<any>>('/auth/request-third-2fa-otp/', { third_email: thirdEmail });
  },

  verifyThird2FAOTP: (thirdOtp: string): Promise<BaseAPIResponse<any>> => {
    return api.post<BaseAPIResponse<any>>('/auth/verify-third-2fa-otp/', { third_otp: thirdOtp });
  },

  disable2FA: (): Promise<BaseAPIResponse<any>> => {
    return api.post<BaseAPIResponse<any>>('/auth/disable-2fa/', {});
  }
};
