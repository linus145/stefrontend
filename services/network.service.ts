import { api } from '../lib/api';

export interface Profile {
  headline?: string;
  bio?: string;
  location?: string;
  profile_image_url?: string;
  expertise?: string[];
  skills?: string[];
  primary_industry?: string;
}

export interface NetworkPerson {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  profile: Profile | null;
  connection_info?: {
    id: string;
    status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
    is_incoming: boolean;
    sender_id: string;
  };
}

export const networkService = {
  getPeople: (role: string, excludeExisting: boolean = false) => 
    api.get<NetworkPerson[]>(`/interactions/network/people/?role=${role}&exclude_existing=${excludeExisting}`),

  getMyConnections: () => 
    api.get<NetworkPerson[]>('/interactions/network/my-connections/'),
    
  connect: (receiverId: string) => 
    api.post('/interactions/network/connect/', { receiver_id: receiverId }),
    
  respondToConnection: (connectionId: string, status: 'ACCEPTED' | 'REJECTED') => 
    api.patch(`/interactions/network/connect/${connectionId}/`, { status }),

  disconnect: (userId: string) => 
    api.delete(`/interactions/network/disconnect/${userId}/`),
};
