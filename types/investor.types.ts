export interface InvestorProfile {
  id: string;
  user_email: string;
  first_name: string;
  last_name: string;
  headline: string;
  bio: string;
  location: string;
  profile_image_url: string;
  firm_name: string;
  preferred_stages: string[];
  preferred_industries: string[];
  minimum_investment_range: string;
  maximum_investment_range: string;
  linkedin_url: string;
  portfolio_url: string;
  created_at: string;
  updated_at: string;
}
