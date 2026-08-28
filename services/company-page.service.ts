import { api } from '@/lib/api';
import { axiosInstance } from '@/lib/axios';

export interface CompanyJob {
  id: string;
  title: string;
  description: string;
  location: string;
  job_type: string;
  work_mode: string;
  salary_min: number | null;
  salary_max: number | null;
  currency: string;
  experience_level: string;
  open_positions: number;
  department: string;
  status: string;
  hiring_status: string;
  job_category: string;
  skills: string[];
  created_at: string;
}

export interface CompanyPost {
  id: string;
  content: string;
  media_url: string | null;
  visibility: string;
  is_promoted?: boolean;
  created_at: string;
  author_name: string;
  author_email: string;
  author_avatar: string | null;
}

export interface CompanyPageDetail {
  id: string;
  company_id: string;
  slug: string;
  company_name: string;
  company_email: string;
  tagline: string;
  page_type: string;
  industry: string;
  company_size: string;
  description: string;
  overview: string;
  website: string;
  founded_year: number | null;
  location: string;
  phone: string;
  specialties: string[];
  logo_url: string;
  banner_url: string;
  custom_logo_url: string;
  custom_banner_url: string;
  is_verified: boolean;
  call_to_action_label: string;
  call_to_action_url: string;
  followers_count: number;
  is_following: boolean;
  is_owner: boolean;
  active_jobs_count: number;
  jobs: CompanyJob[];
  posts: CompanyPost[];
  created_at: string;
  updated_at: string;
}

export interface UserCompanyCheckResponse {
  has_company: boolean;
  authenticated: boolean;
  company?: CompanyPageDetail;
}

export interface CompanyPageCreatePayload {
  company_name: string;
  slug?: string;
  tagline?: string;
  page_type?: string;
  industry: string;
  company_size?: string;
  website?: string;
  location?: string;
  description?: string;
  founded_year?: number | null;
  specialties?: string[];
  logo_url?: string;
  banner_url?: string;
  call_to_action_label?: string;
  call_to_action_url?: string;
}

export const companyPageService = {
  // Check if current user has an existing company page
  checkUserCompany: () =>
    api.get<UserCompanyCheckResponse>('/comppages/me/'),

  // Get full company page detail by slug or UUID
  getCompanyPage: (slug: string) =>
    api.get<CompanyPageDetail>(`/comppages/${slug}/`),

  // Create a new company page & profile
  createCompanyPage: (payload: CompanyPageCreatePayload) =>
    api.post<CompanyPageDetail>('/comppages/create/', payload),

  // Update existing company page
  updateCompanyPage: (slug: string, payload: Partial<CompanyPageCreatePayload>) =>
    api.put<CompanyPageDetail>(`/comppages/${slug}/`, payload),

  // Toggle company follow status
  toggleFollow: (companyId: string) =>
    api.post<{ status: string; company_id: string }>('/following/company/toggle/', { company_id: companyId }),

  // Fetch company page posts
  getCompanyPosts: (slug: string) =>
    api.get<CompanyPost[]>(`/comppages/${slug}/posts/`),

  // Create a post on behalf of company
  createCompanyPost: (slug: string, content: string, media_url?: string, is_promoted?: boolean) =>
    api.post<CompanyPost>(`/comppages/${slug}/posts/`, { content, media_url, is_promoted }),

  // Edit text content of a company post
  updateCompanyPost: (slug: string, postId: string, content: string) =>
    api.patch<CompanyPost>(`/comppages/${slug}/posts/${postId}/`, { content }),

  // Delete a company post (and its associated ImageKit 3 image)
  deleteCompanyPost: (slug: string, postId: string) =>
    api.delete(`/comppages/${slug}/posts/${postId}/`),

  // Boost / promote an existing company post in backend database
  boostCompanyPost: (slug: string, postId: string) =>
    api.post<CompanyPost>(`/comppages/${slug}/posts/${postId}/boost/`),

  // Upload an image specifically to Company ImageKit 3 storage
  uploadCompanyPostImage: async (file: File): Promise<{ image_url: string; file_id: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', '/company_posts');
    const response = await axiosInstance.post<{ image_url: string; file_id: string }>('/upload/image/', formData);
    return response.data;
  },

  // Fetch active company jobs
  getCompanyJobs: (slug: string) =>
    api.get<CompanyJob[]>(`/comppages/${slug}/jobs/`),

  // Explore featured companies
  getExploreCompanies: () =>
    api.get<CompanyPageDetail[]>('/comppages/explore/'),
};
