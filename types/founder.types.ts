export interface Education {
  school: string;
  degree: string;
  field_of_study: string;
  start_date: string;
  end_date?: string;
  cgpa?: string;
}

export interface Experience {
  company: string;
  position: string;
  start_date: string;
  end_date?: string;
  description: string;
}

export interface FounderProfile {
  id: string;
  user_email: string;
  first_name: string;
  last_name: string;
  headline: string;
  bio: string;
  location: string;
  profile_image_url: string;
  banner_image_url: string;
  experience_years: number;
  primary_industry: string;
  skills: string[];
  linkedin_url: string;
  portfolio_url: string;
  resume_url?: string;
  education?: Education[];
  experience?: Experience[];
  created_at: string;
  updated_at: string;
}
