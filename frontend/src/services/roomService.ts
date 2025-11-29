import api from '../lib/axios';

export interface Room {
  id: string;
  code: string;
  name: string;
  capacity: number;
  type?: string;
  building?: string;
  floor?: number;
  createdAt: string;
  updatedAt: string;
}

export const roomService = {
  getAll: async (): Promise<Room[]> => {
    const response = await api.get('/rooms');
    return response.data.data?.rooms || [];
  },

  getById: async (id: string): Promise<Room> => {
    const response = await api.get(`/rooms/${id}`);
    return response.data.data;
  },

  create: async (data: Partial<Room>): Promise<Room> => {
    const response = await api.post('/rooms', data);
    return response.data.data;
  },

  update: async (id: string, data: Partial<Room>): Promise<Room> => {
    const response = await api.put(`/rooms/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/rooms/${id}`);
  },
};
