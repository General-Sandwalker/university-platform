import api from '../lib/axios';
import { User } from '../types';

export interface CreateUserDto {
  cin: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'student' | 'teacher' | 'department_head' | 'admin';
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  departmentId?: number;
  specialtyId?: number;
  groupId?: number;
}

export interface UpdateUserDto extends Partial<CreateUserDto> {
  isActive?: boolean;
}

export const userService = {
  getAll: async () => {
    const response = await api.get<{status: string; data: any}>('/users');
    // Handle both response formats
    const data = response.data.data;
    if (Array.isArray(data)) {
      return data;
    }
    if (data?.users && Array.isArray(data.users)) {
      return data.users;
    }
    if (data?.items && Array.isArray(data.items)) {
      return data.items;
    }
    console.warn('Unexpected users data format:', data);
    return [];
  },

  getById: async (id: number) => {
    const response = await api.get<{status: string; data: {user: User}}>(`/users/${id}`);
    return response.data.data.user;
  },

  create: async (data: CreateUserDto) => {
    const response = await api.post<{status: string; data: {user: User}}>('/users', data);
    return response.data.data.user;
  },

  update: async (id: number, data: UpdateUserDto) => {
    const response = await api.put<{status: string; data: {user: User}}>(`/users/${id}`, data);
    return response.data.data.user;
  },

  delete: async (id: number) => {
    await api.delete(`/users/${id}`);
  },

  getByRole: async (role: string) => {
    const response = await api.get<{status: string; data: {users: User[]}}>(`/users?role=${role}`);
    return response.data.data?.users || [];
  },

  getByDepartment: async (departmentId: number) => {
    const response = await api.get<{status: string; data: {users: User[]}}>(`/users?departmentId=${departmentId}`);
    return response.data.data?.users || [];
  },
};
