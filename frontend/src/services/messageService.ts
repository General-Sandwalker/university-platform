import apiClient from '../lib/axios';
import { Message } from '../types';

export const messageService = {
  sendMessage: async (data: { receiverId: string; content: string }): Promise<Message> => {
    const response = await apiClient.post<Message>('/messages/send', data);
    return response.data;
  },

  getInbox: async (unreadOnly?: boolean): Promise<Message[]> => {
    const response = await apiClient.get<Message[]>('/messages/inbox', {
      params: { unreadOnly },
    });
    return response.data;
  },

  getSentMessages: async (): Promise<Message[]> => {
    const response = await apiClient.get<Message[]>('/messages/sent');
    return response.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await apiClient.get<{ count: number }>('/messages/unread-count');
    return response.data.count;
  },

  getConversations: async (): Promise<any[]> => {
    const response = await apiClient.get<any[]>('/messages/conversations');
    return response.data;
  },

  getConversation: async (otherUserId: string): Promise<Message[]> => {
    const response = await apiClient.get<Message[]>(`/messages/conversation/${otherUserId}`);
    return response.data;
  },

  markAsRead: async (messageId: string): Promise<Message> => {
    const response = await apiClient.put<Message>(`/messages/${messageId}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<void> => {
    await apiClient.put('/messages/mark-all-read');
  },

  deleteMessage: async (messageId: string): Promise<void> => {
    await apiClient.delete(`/messages/${messageId}`);
  },
};
