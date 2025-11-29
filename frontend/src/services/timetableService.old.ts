import api from '../lib/axios';

export interface Timetable {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  subject: {
    id: string;
    name: string;
    code: string;
  };
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
  };
  room: {
    id: string;
    name: string;
    building: string;
  };
  group: {
    id: string;
    name: string;
  };
  sessionType: 'lecture' | 'td' | 'tp' | 'exam' | 'makeup';
  notes?: string;
  isActive?: boolean;
}

export interface CreateTimetableDto {
  date: string;
  startTime: string;
  endTime: string;
  subjectId: string;
  teacherId: string;
  roomId: string;
  groupId: string;
  sessionType: string;
  notes?: string;
}

export const timetableService = {
  getAll: async () => {
    const response = await api.get<{success: boolean; data: Timetable[]}>('/timetable');
    return response.data.data || [];
  },

  getById: async (id: string) => {
    const response = await api.get<{success: boolean; data: Timetable}>(`/timetable/${id}`);
    return response.data.data;
  },

  create: async (data: CreateTimetableDto) => {
    const response = await api.post<{success: boolean; data: Timetable}>('/timetable', data);
    return response.data.data;
  },

  update: async (id: string, data: Partial<CreateTimetableDto>) => {
    const response = await api.put<{success: boolean; data: Timetable}>(`/timetable/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string) => {
    await api.delete(`/timetable/${id}`);
  },

  getByGroup: async (groupId: string) => {
    const response = await api.get<{success: boolean; data: Timetable[]}>(`/timetable/group/${groupId}`);
    return response.data.data || [];
  },

  getByTeacher: async (teacherId: string) => {
    const response = await api.get<{success: boolean; data: Timetable[]}>(`/timetable/teacher/${teacherId}`);
    return response.data.data || [];
  },

  getByRoom: async (roomId: string) => {
    const response = await api.get<{success: boolean; data: Timetable[]}>(`/timetable/room/${roomId}`);
    return response.data.data || [];
  },
};
