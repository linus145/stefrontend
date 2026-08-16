import { Users, User, Calendar, Building2, Newspaper } from 'lucide-react';
import { DashboardSection } from '@/components/dashboard/dashboard-header';
import { CompanyFollowEntry } from '@/services/follow.service';

export type NetworkCategory = 
  | 'CONNECTIONS' 
  | 'SUGGESTIONS' 
  | 'FOLLOWING' 
  | 'GROUPS' 
  | 'EVENTS' 
  | 'PAGES' 
  | 'NEWSLETTERS' 
  | 'FOUNDER' 
  | 'INVESTOR' 
  | 'MENTOR' 
  | 'INVITATIONS';

export const SIDEBAR_ITEMS: { id: NetworkCategory; label: string; icon: any }[] = [
  { id: 'CONNECTIONS', label: 'Connections', icon: Users },
  { id: 'FOLLOWING', label: 'Following & followers', icon: User },
  { id: 'GROUPS', label: 'Groups', icon: Users },
  { id: 'EVENTS', label: 'Events', icon: Calendar },
  { id: 'PAGES', label: 'Pages', icon: Building2 },
  { id: 'NEWSLETTERS', label: 'Newsletters', icon: Newspaper },
];

export const TAB_LABELS: Record<string, string> = {
  CONNECTIONS: 'My Connections',
  SUGGESTIONS: 'Suggestions',
  FOLLOWING: 'Following & Followers',
  GROUPS: 'Groups',
  EVENTS: 'Events',
  PAGES: 'Pages',
  NEWSLETTERS: 'Newsletters',
  FOUNDER: 'Cofounders',
  INVESTOR: 'Investors',
  MENTOR: 'Mentors',
  INVITATIONS: 'Invitations'
};

export interface NetworkViewProps {
  isCollapsed?: boolean;
  onSectionChange: (section: DashboardSection, userId?: string | null, intent?: 'connection' | 'direct') => void;
}
