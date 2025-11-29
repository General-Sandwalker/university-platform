import api from '../lib/axios';

export interface Subject {
  id: string;
  code: string;
  name: string;
  description?: string;
  coefficient: number;
  createdAt: string;
  updatedAt: string;
}

export const subjectService = {
  getAll: async (): Promise<Subject[]> => {
    const response = await api.get('/subjects');
    return response.data.data;
  },

  getById: async (id: string): Promise<Subject> => {
    const response = await api.get(`/subjects/${id}`);
    return response.data.data;
  },

  create: async (data: Partial<Subject>): Promise<Subject> => {
    const response = await api.post('/subjects', data);
    return response.data.data;
  },

  update: async (id: string, data: Partial<Subject>): Promise<Subject> => {
    const response = await api.put(`/subjects/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/subjects/${id}`);
  },
};
