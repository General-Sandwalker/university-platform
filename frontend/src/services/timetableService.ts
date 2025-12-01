import api from '../lib/axios';

export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
export type SessionType = 'lecture' | 'td' | 'tp' | 'exam' | 'makeup';

export interface TimetableEntry {
  id: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  subject: {
    id: string;
    code: string;
    name: string;
  };
  teacher: {
    id: string;
    firstName: string;
    lastName: string;
  };
  room: {
    id: string;
    code: string;
    name: string;
  };
  group: {
    id: string;
    code: string;
    name: string;
  };
  semester: {
    id: string;
    code: string;
    name: string;
  };
  sessionType: SessionType;
  notes?: string;
  isCancelled: boolean;
  cancellationReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTimetableData {
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  subjectId: string;
  teacherId: string;
  roomId: string;
  groupId: string;
  semesterId: string;
  sessionType: SessionType;
  notes?: string;
}

export interface UpdateTimetableData {
  dayOfWeek?: DayOfWeek;
  startTime?: string;
  endTime?: string;
  subjectId?: string;
  teacherId?: string;
  roomId?: string;
  groupId?: string;
  semesterId?: string;
  sessionType?: SessionType;
  notes?: string;
}

export interface AccessibleGroup {
  id: string;
  code: string;
  name: string;
  level: {
    id: string;
    code: string;
    name: string;
    specialty: {
      id: string;
      code: string;
      name: string;
      department: {
        id: string;
        code: string;
        name: string;
      };
    };
  };
}

export const timetableService = {
  getByGroup: async (groupId: string, semesterId?: string): Promise<TimetableEntry[]> => {
    const params = semesterId ? { semesterId } : {};
    const response = await api.get(`/timetable/group/${groupId}`, { params });
    return response.data.data;
  },

  getById: async (id: string): Promise<TimetableEntry> => {
    const response = await api.get(`/timetable/${id}`);
    return response.data.data;
  },

  getAccessibleGroups: async (): Promise<AccessibleGroup[]> => {
    const response = await api.get('/timetable/accessible-groups');
    return response.data.data;
  },

  getMyTeachingSchedule: async (semesterId?: string): Promise<TimetableEntry[]> => {
    const params = semesterId ? { semesterId } : {};
    const response = await api.get('/timetable/my-schedule', { params });
    return response.data.data;
  },

  create: async (data: CreateTimetableData): Promise<TimetableEntry> => {
    const response = await api.post('/timetable', data);
    return response.data.data;
  },

  update: async (id: string, data: UpdateTimetableData): Promise<TimetableEntry> => {
    const response = await api.put(`/timetable/${id}`, data);
    return response.data.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/timetable/${id}`);
  },
};
