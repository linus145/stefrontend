import { api } from '@/lib/api';
import { BaseAPIResponse } from '@/types/auth.types';
import {
  CompanyProfile,
  CompanyHRProfile,
  CompanyRegisterPayload,
  CompanyCheckData,
  JobPost,
  JobPostCreatePayload,
  JobApplication,
  RecruiterDashboardStats,
} from '@/types/jobs.types';

export const jobsService = {
  // ─── Company Profile ──────────────────────────────────────────

  checkCompany: (): Promise<BaseAPIResponse<CompanyCheckData>> => {
    return api.get<BaseAPIResponse<CompanyCheckData>>('/startups/company/check/');
  },

  registerCompany: (data: CompanyRegisterPayload): Promise<BaseAPIResponse<CompanyProfile>> => {
    return api.post<BaseAPIResponse<CompanyProfile>>('/startups/company/register/', data);
  },

  companyLogin: (data: any): Promise<BaseAPIResponse<any>> => {
    return api.post<BaseAPIResponse<any>>('/startups/company/login/', data);
  },

  getMyCompany: (): Promise<BaseAPIResponse<CompanyProfile>> => {
    return api.get<BaseAPIResponse<CompanyProfile>>('/startups/company/me/');
  },

  updateCompany: (data: Partial<CompanyRegisterPayload>): Promise<BaseAPIResponse<CompanyProfile>> => {
    return api.patch<BaseAPIResponse<CompanyProfile>>('/startups/company/me/', data);
  },

  getHRProfile: (): Promise<BaseAPIResponse<CompanyHRProfile>> => {
    return api.get<BaseAPIResponse<CompanyHRProfile>>('/startups/company/hr-profile/');
  },

  updateHRProfile: (data: Partial<CompanyHRProfile>): Promise<BaseAPIResponse<CompanyHRProfile>> => {
    return api.patch<BaseAPIResponse<CompanyHRProfile>>('/startups/company/hr-profile/', data);
  },

  // ─── Public Job Browsing ──────────────────────────────────────

  getPublicJobs: (params?: Record<string, string>): Promise<BaseAPIResponse<JobPost[]>> => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return api.get<BaseAPIResponse<JobPost[]>>(`/jobs/posts/${query}`);
  },

  getJobDetail: (jobId: string): Promise<BaseAPIResponse<JobPost>> => {
    return api.get<BaseAPIResponse<JobPost>>(`/jobs/posts/${jobId}/`);
  },

  // ─── Recruiter Job Management ─────────────────────────────────

  getMyJobs: (status?: string): Promise<BaseAPIResponse<JobPost[]>> => {
    const query = status ? `?status=${status}` : '';
    return api.get<BaseAPIResponse<JobPost[]>>(`/jobs/my-posts/${query}`);
  },

  createJob: (data: JobPostCreatePayload): Promise<BaseAPIResponse<JobPost>> => {
    return api.post<BaseAPIResponse<JobPost>>('/jobs/my-posts/', data);
  },

  updateJob: (jobId: string, data: Partial<JobPostCreatePayload>): Promise<BaseAPIResponse<JobPost>> => {
    return api.patch<BaseAPIResponse<JobPost>>(`/jobs/my-posts/${jobId}/`, data);
  },

  deleteJob: (jobId: string): Promise<BaseAPIResponse<any>> => {
    return api.delete<BaseAPIResponse<any>>(`/jobs/my-posts/${jobId}/`);
  },

  // ─── Applications ─────────────────────────────────────────────

  applyToJob: (jobId: string, data: { resume_url?: string; cover_letter?: string }): Promise<BaseAPIResponse<JobApplication>> => {
    return api.post<BaseAPIResponse<JobApplication>>(`/jobs/posts/${jobId}/apply/`, data);
  },

  getJobApplications: (jobId: string, status?: string): Promise<BaseAPIResponse<JobApplication[]>> => {
    const query = status ? `?status=${status}` : '';
    return api.get<BaseAPIResponse<JobApplication[]>>(`/jobs/posts/${jobId}/applications/${query}`);
  },

  updateApplicationStatus: (applicationId: string, newStatus: string): Promise<BaseAPIResponse<JobApplication>> => {
    return api.patch<BaseAPIResponse<JobApplication>>(`/jobs/applications/${applicationId}/status/`, { status: newStatus });
  },

  getMyApplications: (): Promise<BaseAPIResponse<JobApplication[]>> => {
    return api.get<BaseAPIResponse<JobApplication[]>>('/jobs/my-applications/');
  },

  // ─── Dashboard Stats ──────────────────────────────────────────

  getDashboardStats: (): Promise<BaseAPIResponse<RecruiterDashboardStats>> => {
    return api.get<BaseAPIResponse<RecruiterDashboardStats>>('/jobs/dashboard/stats/');
  },
};
