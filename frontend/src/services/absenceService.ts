import api from '../lib/axios';

export interface Absence {
  id: number;
  student: {
    id: number;
    firstName: string;
    lastName: string;
    cin: string;
  };
  subject: {
    id: number;
    name: string;
    code: string;
  };
  date: string;
  isJustified: boolean;
  justificationDocument?: string;
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAbsenceDto {
  studentId: number;
  subjectId: number;
  date: string;
  isJustified?: boolean;
  reason?: string;
}

export const absenceService = {
  getAll: async () => {
    const response = await api.get<any>('/absences');
    // Handle different response formats
    const data = response.data.data || response.data;
    if (Array.isArray(data)) {
      return data;
    }
    if (data?.absences && Array.isArray(data.absences)) {
      return data.absences;
    }
    if (data?.items && Array.isArray(data.items)) {
      return data.items;
    }
    console.warn('Unexpected absences data format:', data);
    return [];
  },

  getById: async (id: number) => {
    const response = await api.get<any>(`/absences/${id}`);
    return response.data.data?.absence || response.data.data || response.data;
  },

  create: async (data: CreateAbsenceDto) => {
    const response = await api.post<any>('/absences', data);
    return response.data.data?.absence || response.data.data || response.data;
  },

  update: async (id: number, data: Partial<CreateAbsenceDto>) => {
    const response = await api.put<any>(`/absences/${id}`, data);
    return response.data.data?.absence || response.data.data || response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/absences/${id}`);
  },

  getByStudent: async (studentId: number) => {
    const response = await api.get<any>(`/absences/student/${studentId}`);
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : data?.absences || [];
  },

  getBySubject: async (subjectId: number) => {
    const response = await api.get<any>(`/absences/subject/${subjectId}`);
    const data = response.data.data || response.data;
    return Array.isArray(data) ? data : data?.absences || [];
  },

  justify: async (id: number, formData: FormData) => {
    const response = await api.put<any>(`/absences/${id}/justify`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data?.absence || response.data.data || response.data;
  },
};
