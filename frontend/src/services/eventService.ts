import api from '../lib/axios';

export interface Event {
  id: number;
  title: string;
  description: string;
  type: 'exam' | 'holiday' | 'meeting' | 'conference' | 'other';
  startDate: string;
  endDate: string;
  location?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEventDto {
  title: string;
  description: string;
  type: 'exam' | 'holiday' | 'meeting' | 'conference' | 'other';
  startDate: string;
  endDate: string;
  location?: string;
}

export const eventService = {
  getAll: async () => {
    const response = await api.get<Event[]>('/events');
    return response.data;
  },

  getById: async (id: number) => {
    const response = await api.get<Event>(`/events/${id}`);
    return response.data;
  },

  create: async (data: CreateEventDto) => {
    const response = await api.post<Event>('/events', data);
    return response.data;
  },

  update: async (id: number, data: Partial<CreateEventDto>) => {
    const response = await api.put<Event>(`/events/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await api.delete(`/events/${id}`);
  },

  getUpcoming: async () => {
    const response = await api.get<Event[]>('/events/upcoming');
    return response.data;
  },

  getByType: async (type: string) => {
    const response = await api.get<Event[]>(`/events/type/${type}`);
    return response.data;
  },

  getByDateRange: async (startDate: string, endDate: string) => {
    const response = await api.get<Event[]>(`/events/date-range`, {
      params: { startDate, endDate },
    });
    return response.data;
  },
};
