import axios, { AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { appConfig } from './config';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: any | null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

export const axiosInstance: AxiosInstance = axios.create({
  baseURL: appConfig.apiBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Only attempt refresh for 401s that are NOT login/refresh/register endpoints
    const isAuthEndpoint =
      originalRequest.url?.includes('auth/login') ||
      originalRequest.url?.includes('auth/token/refresh') ||
      originalRequest.url?.includes('auth/register');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      // If a refresh is already in progress, queue this request
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => axiosInstance(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Backend reads refresh_token from HttpOnly cookie automatically
        await axios.post(
          `${appConfig.apiBaseUrl}/auth/token/refresh/`,
          {},
          { withCredentials: true }
        );

        processQueue(null);

        // Retry the original request with new cookies set by the refresh response
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);

        // DO NOT redirect here — let AuthContext handle the redirect.
        // Redirecting from interceptor causes infinite loop on /login.
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);
