import api from '../lib/axios';

export interface Semester {
  id: string;
  code: string;
  name: string;
  academicYear: number;
  semesterNumber: number;
  startDate: string;
  endDate: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSemesterData {
  code: string;
  name: string;
  academicYear: number;
  semesterNumber: number;
  startDate: string;
  endDate: string;
  isActive?: boolean;
}

export interface UpdateSemesterData {
  code?: string;
  name?: string;
  academicYear?: number;
  semesterNumber?: number;
  startDate?: string;
  endDate?: string;
  isActive?: boolean;
}

export const semesterService = {
  getAll: async (): Promise<Semester[]> => {
    const response = await api.get('/semesters');
    return response.data.data;
  },

  getActive: async (): Promise<Semester | null> => {
    const response = await api.get('/semesters/active');
    return response.data.data;
  },

  getById: async (id: string): Promise<Semester> => {
    const response = await api.get(`/semesters/${id}`);
    return response.data.data;
  },

  create: async (data: CreateSemesterData): Promise<Semester> => {
    const response = await api.post('/semesters', data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateSemesterData): Promise<Semester> => {
    const response = await api.put(`/semesters/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/semesters/${id}`);
  },

  setActive: async (id: string): Promise<Semester> => {
    const response = await api.patch(`/semesters/${id}/activate`);
    return response.data.data;
  },
};
