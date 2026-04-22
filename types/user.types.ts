import { FounderProfile } from './founder.types';
import { InvestorProfile } from './investor.types';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string | null;
  role: 'ADMIN' | 'FOUNDER' | 'INVESTOR';
  is_active: boolean;
  is_verified: boolean;
  profile: FounderProfile | InvestorProfile | null;
  profile_image_url?: string | null;
  created_at: string;
  updated_at: string;
}
