import { api } from '@/lib/api';
import { PaginatedResponse } from '@/types/auth.types';

export const notificationService = {
  getNotifications: (dashboard?: string): Promise<any[]> => {
    const url = dashboard ? `/notifications/?dashboard=${dashboard.toUpperCase()}` : '/notifications/';
    return api.get<PaginatedResponse<any>>(url)
      .then(res => res.results || []);
  },

  getUnreadCounts: (): Promise<{ USER: number; RECRUITER: number; INTERVIEW: number; HR: number; total: number }> => {
    return api.get<{ USER: number; RECRUITER: number; INTERVIEW: number; HR: number; total: number }>('/notifications/counts/');
  },

  markNotificationRead: (id: string): Promise<void> => {
    return api.post(`/notifications/${id}/read/`, {});
  },

  markAllNotificationsRead: (dashboard?: string): Promise<void> => {
    const url = dashboard ? `/notifications/mark-all-read/?dashboard=${dashboard.toUpperCase()}` : '/notifications/mark-all-read/';
    return api.post(url, {});
  },

  deleteAllNotifications: (dashboard?: string): Promise<void> => {
    const url = dashboard ? `/notifications/delete-all/?dashboard=${dashboard.toUpperCase()}` : '/notifications/delete-all/';
    return api.delete(url);
  },
};
