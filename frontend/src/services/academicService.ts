import api from '../lib/axios';

// Departments
export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  headOfDepartment?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDepartmentDto {
  name: string;
  code: string;
  description?: string;
  headOfDepartmentId?: string;
}

// Specialties
export interface Specialty {
  id: string;
  name: string;
  code: string;
  description?: string;
  department: {
    id: string;
    name: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSpecialtyDto {
  name: string;
  code: string;
  description?: string;
  departmentId: string;
}

// Levels
export interface Level {
  id: string;
  name: string;
  code: string;
  year: number;
  specialty: {
    id: string;
    name: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateLevelDto {
  name: string;
  code: string;
  year: number;
  specialtyId: string;
}

// Groups
export interface Group {
  id: string;
  name: string;
  code: string;
  maxCapacity: number;
  level: {
    id: string;
    name: string;
    specialty?: {
      id: string;
      name: string;
    };
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateGroupDto {
  name: string;
  code: string;
  levelId: string;
  capacity: number;
}

// Subjects
export interface Subject {
  id: string;
  name: string;
  code: string;
  type: 'lecture' | 'td' | 'tp';
  description?: string;
  credits: number;
  coefficient: number;
  semester: number;
  specialty?: {
    id: string;
    name: string;
  };
  level?: {
    id: string;
    name: string;
  };
  teacher?: {
    id: string;
    firstName: string;
    lastName: string;
  };
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubjectDto {
  name: string;
  code: string;
  type: 'lecture' | 'td' | 'tp';
  credits: number;
  coefficient: number;
  semester: number;
  specialtyId: string;
  levelId: string;
  teacherId?: string;
}

// Rooms
export interface Room {
  id: string;
  name: string;
  code: string;
  building?: string;
  floor?: string;
  capacity: number;
  type: 'classroom' | 'lab' | 'amphitheater' | 'conference_room' | 'office';
  equipment?: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRoomDto {
  name: string;
  code: string;
  building?: string;
  floor?: string;
  capacity: number;
  type: 'classroom' | 'lab' | 'amphitheater' | 'conference_room' | 'office';
  equipment?: string;
}

// Services
export const departmentService = {
  getAll: async () => {
    const response = await api.get<{status: string; data: {departments: Department[]}}>('/departments');
    return response.data.data?.departments || [];
  },
  getById: async (id: string) => {
    const response = await api.get<{status: string; data: {department: Department}}>(`/departments/${id}`);
    return response.data.data.department;
  },
  create: async (data: CreateDepartmentDto) => {
    const response = await api.post<{status: string; data: {department: Department}}>('/departments', data);
    return response.data.data.department;
  },
  update: async (id: string, data: Partial<CreateDepartmentDto>) => {
    const response = await api.put<{status: string; data: {department: Department}}>(`/departments/${id}`, data);
    return response.data.data.department;
  },
  delete: async (id: string) => {
    await api.delete(`/departments/${id}`);
  },
};

export const specialtyService = {
  getAll: async () => {
    const response = await api.get<{success: boolean; data: Specialty[]}>('/specialties');
    return response.data.data || [];
  },
  getById: async (id: string) => {
    const response = await api.get<{status: string; data: {specialty: Specialty}}>(`/specialties/${id}`);
    return response.data.data.specialty;
  },
  create: async (data: CreateSpecialtyDto) => {
    const response = await api.post<{status: string; data: {specialty: Specialty}}>('/specialties', data);
    return response.data.data.specialty;
  },
  update: async (id: string, data: Partial<CreateSpecialtyDto>) => {
    const response = await api.put<{status: string; data: {specialty: Specialty}}>(`/specialties/${id}`, data);
    return response.data.data.specialty;
  },
  delete: async (id: string) => {
    await api.delete(`/specialties/${id}`);
  },
  getByDepartment: async (departmentId: string) => {
    const response = await api.get<{status: string; data: {specialties: Specialty[]}}>(`/specialties/department/${departmentId}`);
    return response.data.data.specialties;
  },
};

export const levelService = {
  getAll: async () => {
    const response = await api.get<{success: boolean; data: Level[]}>('/levels');
    return response.data.data || [];
  },
  getById: async (id: string) => {
    const response = await api.get<{status: string; data: {level: Level}}>(`/levels/${id}`);
    return response.data.data.level;
  },
  create: async (data: CreateLevelDto) => {
    const response = await api.post<{status: string; data: {level: Level}}>('/levels', data);
    return response.data.data.level;
  },
  update: async (id: string, data: Partial<CreateLevelDto>) => {
    const response = await api.put<{status: string; data: {level: Level}}>(`/levels/${id}`, data);
    return response.data.data.level;
  },
  delete: async (id: string) => {
    await api.delete(`/levels/${id}`);
  },
};

export const groupService = {
  getAll: async () => {
    const response = await api.get<{success: boolean; data: Group[]}>('/groups');
    return response.data.data || [];
  },
  getById: async (id: string) => {
    const response = await api.get<{status: string; data: {group: Group}}>(`/groups/${id}`);
    return response.data.data.group;
  },
  create: async (data: CreateGroupDto) => {
    const response = await api.post<{status: string; data: {group: Group}}>('/groups', data);
    return response.data.data.group;
  },
  update: async (id: string, data: Partial<CreateGroupDto>) => {
    const response = await api.put<{status: string; data: {group: Group}}>(`/groups/${id}`, data);
    return response.data.data.group;
  },
  delete: async (id: string) => {
    await api.delete(`/groups/${id}`);
  },
  getBySpecialty: async (specialtyId: string) => {
    const response = await api.get<{status: string; data: {groups: Group[]}}>(`/groups/specialty/${specialtyId}`);
    return response.data.data.groups;
  },
};

export const subjectService = {
  getAll: async () => {
    const response = await api.get<{success: boolean; data: Subject[]}>('/subjects');
    return response.data.data || [];
  },
  getById: async (id: string) => {
    const response = await api.get<{status: string; data: {subject: Subject}}>(`/subjects/${id}`);
    return response.data.data.subject;
  },
  create: async (data: CreateSubjectDto) => {
    const response = await api.post<{status: string; data: {subject: Subject}}>('/subjects', data);
    return response.data.data.subject;
  },
  update: async (id: string, data: Partial<CreateSubjectDto>) => {
    const response = await api.put<{status: string; data: {subject: Subject}}>(`/subjects/${id}`, data);
    return response.data.data.subject;
  },
  delete: async (id: string) => {
    await api.delete(`/subjects/${id}`);
  },
  getByDepartment: async (departmentId: string) => {
    const response = await api.get<{status: string; data: {subjects: Subject[]}}>(`/subjects/department/${departmentId}`);
    return response.data.data.subjects;
  },
};

export const roomService = {
  getAll: async () => {
    const response = await api.get<{status: string; data: {rooms: Room[]}}>('/rooms');
    return response.data.data?.rooms || [];
  },
  getById: async (id: string) => {
    const response = await api.get<{status: string; data: {room: Room}}>(`/rooms/${id}`);
    return response.data.data.room;
  },
  create: async (data: CreateRoomDto) => {
    const response = await api.post<{status: string; data: {room: Room}}>('/rooms', data);
    return response.data.data.room;
  },
  update: async (id: string, data: Partial<CreateRoomDto>) => {
    const response = await api.put<{status: string; data: {room: Room}}>(`/rooms/${id}`, data);
    return response.data.data.room;
  },
  delete: async (id: string) => {
    await api.delete(`/rooms/${id}`);
  },
  getAvailable: async () => {
    const response = await api.get<{status: string; data: {rooms: Room[]}}>('/rooms/available');
    return response.data.data.rooms;
  },
};
