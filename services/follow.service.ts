import { api } from '@/lib/api';

export interface FollowUser {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  headline: string;
  profile_image_url: string | null;
  is_following: boolean;
}

export interface FollowCounts {
  followers_count: number;
  following_count: number;
  is_following: boolean;
}

export interface CompanyFollowCounts {
  followers_count: number;
  is_following: boolean;
}

export interface CompanyFollowEntry {
  id: string;
  follower: string;
  company: string;
  company_name: string;
  logo_url: string;
  banner_url?: string;
  industry: string;
  website?: string;
  description?: string;
  location?: string;
  company_size?: string;
  founded_year?: number | null;
  created_at: string;
}

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export const followService = {
  // ── User Follow ──
  toggleFollow: (userId: string) =>
    api.post<{ status: string; user_id: string }>('/following/toggle/', { user_id: userId }),

  getFollowers: (userId?: string) =>
    api.get<PaginatedResponse<FollowUser>>(
      userId ? `/following/followers/${userId}/` : '/following/followers/'
    ).then(res => res.results || []),

  getFollowing: (userId?: string) =>
    api.get<PaginatedResponse<FollowUser>>(
      userId ? `/following/following/${userId}/` : '/following/following/'
    ).then(res => res.results || []),

  getFollowCounts: (userId?: string) =>
    api.get<FollowCounts>(
      userId ? `/following/counts/${userId}/` : '/following/counts/'
    ),

  // ── Company Follow ──
  toggleCompanyFollow: (companyId: string) =>
    api.post<{ status: string; company_id: string }>('/following/company/toggle/', { company_id: companyId }),

  getCompanyFollowers: (companyId: string) =>
    api.get<PaginatedResponse<FollowUser>>(
      `/following/company/followers/${companyId}/`
    ).then(res => res.results || []),

  getCompanyFollowCounts: (companyId: string) =>
    api.get<CompanyFollowCounts>(`/following/company/counts/${companyId}/`),

  getMyFollowedCompanies: () =>
    api.get<PaginatedResponse<CompanyFollowEntry>>('/following/company/my-followed/')
      .then(res => res.results || []),
};
