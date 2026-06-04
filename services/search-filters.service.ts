import { api } from '@/lib/api';
import { BaseAPIResponse } from '@/types/auth.types';

export interface SearchFilters {
  search?: string;
  job_type?: string;
  work_mode?: string;
  experience_level?: string;
  category?: string;
  status?: string;
  location?: string;
  salary_min?: string | number;
  salary_max?: string | number;
  easy_apply?: boolean | string;
  posted_date?: string;
}

export const searchFiltersService = {
  /**
   * Search and filter public jobs using the centralized search service.
   */
  searchJobs: (filters: SearchFilters = {}): Promise<BaseAPIResponse<any[]>> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    return api.get<any>(`/search/jobs/?${params.toString()}`).then(res => {
      const items = res.results || res.data || [];
      return { status: 'success', message: '', data: items };
    });
  },

  /**
   * Search public jobs with pagination metadata preserved.
   */
  searchJobsPaginated: (filters: SearchFilters & { page?: number; page_size?: number } = {}): Promise<any> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });

    return api.get<any>(`/search/jobs/?${params.toString()}`);
  },

  /**
   * Dedicated search for the Dashboard Jobs section.
   */
  searchDashboardJobs: (filters: SearchFilters = {}): Promise<BaseAPIResponse<any[]>> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    return api.get<any>(`/search/jobs/dashboard/?${params.toString()}`).then(res => {
      const items = res.results || res.data || [];
      return { status: 'success', message: '', data: items };
    });
  },

  /**
   * Search and filter user's job applications using the centralized search service.
   */
  searchApplications: (filters: { search?: string; status?: string } = {}): Promise<BaseAPIResponse<any[]>> => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    return api.get<any>(`/search/applications/?${params.toString()}`).then(res => {
      const items = res.results || res.data || [];
      return { status: 'success', message: '', data: items };
    });
  },

  /**
   * Unified global search across all entities (LinkedIn style).
   */
  globalSearch: (search: string, limit: number = 5): Promise<BaseAPIResponse<any>> => {
    return api.get<BaseAPIResponse<any>>(`/search/global/`, { params: { search, limit } });
  },

  /**
   * Targeted global search for news articles.
   */
  searchGlobalNews: (search: string): Promise<BaseAPIResponse<any[]>> => {
    return api.get<any>(`/search/global/news/`, { params: { search } }).then(res => {
      const items = res.results || res.data || [];
      return { status: 'success', message: '', data: items };
    });
  },

  /**
   * Targeted global search for social posts.
   */
  searchGlobalPosts: (search: string): Promise<BaseAPIResponse<any[]>> => {
    return api.get<any>(`/search/global/posts/`, { params: { search } }).then(res => {
      const items = res.results || res.data || [];
      return { status: 'success', message: '', data: items };
    });
  }
};
