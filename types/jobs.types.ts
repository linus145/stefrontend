// ─── Company Profile ─────────────────────────────────────────────

export interface CompanyHRProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  designation: string;
  profile_image_url: string;
  created_at: string;
  updated_at: string;
}

export interface CompanyProfile {
  id: string;
  owner_email: string;
  owner_name: string;
  company_name: string;
  logo_url: string;
  banner_url: string;
  industry: string;
  company_size: string;
  description: string;
  website: string;
  founded_year: number | null;
  location: string;
  is_approved: boolean;
  is_genuine: boolean;
  hr_profile?: CompanyHRProfile;
  total_jobs: number;
  created_at: string;
  updated_at: string;
}

export interface CompanyRegisterPayload {
  company_name: string;
  industry: string;
  company_size?: string;
  description?: string;
  website?: string;
  founded_year?: number | null;
  location?: string;
  logo_url?: string;
  banner_url?: string;
}

// ─── Job Posts ───────────────────────────────────────────────────

export type JobType = 'FULL_TIME' | 'PART_TIME' | 'CONTRACT' | 'INTERNSHIP';
export type WorkMode = 'REMOTE' | 'ONSITE' | 'HYBRID';
export type ExperienceLevel = 'ENTRY' | 'MID' | 'SENIOR' | 'LEAD';
export type JobStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED';
export type HiringStatus = 'ACTIVELY_HIRING' | 'ACTIVELY_REVIEWING';

export interface JobPost {
  id: string;
  company_id?: string;
  company_name?: string;
  company_logo?: string;
  company?: CompanyProfile;
  title: string;
  description: string;
  location: string;
  job_type: JobType;
  work_mode: WorkMode;
  salary_min: number | null;
  salary_max: number | null;
  currency: string;
  skills_required: string[];
  experience_level: ExperienceLevel;
  status: JobStatus;
  hiring_status: HiringStatus;
  deadline: string | null;
  applications_count: number;
  company_is_genuine?: boolean;
  hr_profile?: CompanyHRProfile;
  created_at: string;
  updated_at?: string;
}

export interface JobPostCreatePayload {
  title: string;
  description: string;
  location?: string;
  job_type?: JobType;
  work_mode?: WorkMode;
  salary_min?: number | null;
  salary_max?: number | null;
  currency?: string;
  skills_required?: string[];
  experience_level?: ExperienceLevel;
  status?: JobStatus;
  hiring_status?: HiringStatus;
  deadline?: string | null;
}

// ─── Job Applications ───────────────────────────────────────────

export type ApplicationStatus = 'PENDING' | 'REVIEWED' | 'SHORTLISTED' | 'REJECTED' | 'HIRED';

export interface ApplicantMini {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  profile_image_url?: string;
}

export interface JobApplication {
  id: string;
  job: string;
  job_title: string;
  applicant: ApplicantMini;
  resume_url: string;
  cover_letter: string;
  status: ApplicationStatus;
  applied_at: string;
  updated_at: string;
}

// ─── Dashboard Stats ────────────────────────────────────────────

export interface RecruiterDashboardStats {
  total_jobs: number;
  active_jobs: number;
  draft_jobs: number;
  closed_jobs: number;
  total_applications: number;
  pending_applications: number;
  reviewed: number;
  shortlisted: number;
  rejected: number;
  hired: number;
}

// ─── Company Check ──────────────────────────────────────────────

export interface CompanyCheckData {
  has_company: boolean;
  company?: CompanyProfile;
}
