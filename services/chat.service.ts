import { api } from '../lib/api';

export interface ChatParticipant {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  profile?: {
    profile_image_url?: string;
    headline?: string;
    company_name?: string; // Added for HR/Recruiter identification
    hr_name?: string;
    hr_designation?: string;
  };
}

export interface LatestMessage {
  id: string;
  text: string;
  sender_id: string;
  created_at: string;
}

export interface ChatRoom {
  id: string;
  name: string | null;
  is_group: boolean;
  room_type?: 'connection' | 'direct' | 'personal'; // Added to distinguish chat types
  participants_data: ChatParticipant[];
  latest_message: LatestMessage | null;
  updated_at: string;
}

export interface Message {
  id: string;
  room: string;
  sender: string;
  sender_data: ChatParticipant;
  text: string;
  is_read: boolean;
  created_at: string;
}

export const chatService = {
  getRooms: (roomType?: 'connection' | 'direct' | 'personal') => {
    const url = roomType ? `/chat/rooms/?type=${roomType}` : '/chat/rooms/';
    return api.get<{ results: ChatRoom[] }>(url)
      .then(res => (res as any)?.results || []);
  },
  
  initialize1to1: (targetUserId: string) => 
    api.post<ChatRoom>('/chat/rooms/1to1/', { target_user_id: targetUserId }),
    
  getMessageHistory: (roomId: string) => 
    api.get<{ results: Message[] }>(`/chat/rooms/${roomId}/messages/`)
      .then(res => (res as any)?.results || []),

  /** Fetches the current JWT from HTTPOnly cookies via a secured endpoint */
  getWsTicket: () => 
    api.get<{ token: string }>('/auth/ws-ticket/'),

  deleteMessage: (messageId: string) => 
    api.delete(`/chat/messages/${messageId}/delete/`),

  /** Creates or gets a direct chat room (no connection required) and optionally sends a message */
  sendDirectMessage: (targetUserId: string, message?: string) =>
    api.post<ChatRoom>('/chat/rooms/direct/', { target_user_id: targetUserId, message: message || '' }),
};
