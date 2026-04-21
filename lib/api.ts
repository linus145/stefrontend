import { AxiosRequestConfig, AxiosResponse } from 'axios';
import { axiosInstance } from './axios';

export const api = {
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await axiosInstance.get(url, config);
      return response.data;
    } catch (error) {
      throw api.handleError(error);
    }
  },

  async post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await axiosInstance.post(url, data, config);
      return response.data;
    } catch (error) {
      throw api.handleError(error);
    }
  },

  async put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await axiosInstance.put(url, data, config);
      return response.data;
    } catch (error) {
      throw api.handleError(error);
    }
  },

  async patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await axiosInstance.patch(url, data, config);
      return response.data;
    } catch (error) {
      throw api.handleError(error);
    }
  },

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response: AxiosResponse<T> = await axiosInstance.delete(url, config);
      return response.data;
    } catch (error) {
      throw api.handleError(error);
    }
  },

  handleError(error: any): Error {
    // Standardizes axios errors into clean throwable Error instances explicitly 
    // components can reliably read the message string or structured data
    const apiError = new Error(
      error.response?.data?.message || 
      error.response?.data?.detail || 
      error.message || 
      'An unexpected error occurred'
    );
    // Bind specific code if components want to act on it natively
    (apiError as any).status = error.response?.status;
    (apiError as any).data = error.response?.data;
    return apiError;
  }
};
