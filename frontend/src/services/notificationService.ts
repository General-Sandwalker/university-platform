import api from '../lib/axios';

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  recipient: {
    id: number;
    firstName: string;
    lastName: string;
  };
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotificationDto {
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  recipientId: number;
}

export const notificationService = {
  getAll: async () => {
    const response = await api.get<Notification[]>('/notifications/me');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Notification>(`/notifications/${id}`);
    return response.data;
  },

  create: async (data: CreateNotificationDto) => {
    const response = await api.post<Notification>('/notifications', data);
    return response.data;
  },

  markAsRead: async (id: number) => {
    const response = await api.put<Notification>(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async () => {
    await api.put('/notifications/read-all');
  },

  delete: async (id: number) => {
    await api.delete(`/notifications/${id}`);
  },

  getUnread: async () => {
    const response = await api.get<Notification[]>('/notifications/unread');
    return response.data;
  },
};
