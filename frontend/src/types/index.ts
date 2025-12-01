export interface User {
  id: string;
  cin: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  address?: string;
  dateOfBirth?: string;
  role: 'admin' | 'department_head' | 'teacher' | 'student';
  status: 'active' | 'inactive' | 'suspended' | 'eliminated';
  isEmailVerified: boolean;
  groupId?: string;
  specialtyId?: string;
  department?: {
    id: string;
    name: string;
    code?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface LoginRequest {
  cin: string;
  password: string;
}

export interface LoginResponse {
  status: string;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface Department {
  id: string;
  name: string;
  code: string;
  description?: string;
  headId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Specialty {
  id: string;
  name: string;
  code: string;
  description?: string;
  departmentId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Level {
  id: string;
  name: string;
  code: string;
  description?: string;
  specialtyId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Group {
  id: string;
  name: string;
  code: string;
  capacity: number;
  currentSize: number;
  levelId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  description?: string;
  credits: number;
  coefficient: number;
  levelId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Room {
  id: string;
  name: string;
  code: string;
  capacity: number;
  type: 'classroom' | 'lab' | 'amphitheater' | 'office' | 'other';
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  content: string;
  senderId: string;
  receiverId: string;
  status: 'sent' | 'delivered' | 'read';
  readAt?: string;
  createdAt: string;
  updatedAt: string;
  sender?: User;
  receiver?: User;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  userId: string;
  isRead: boolean;
  readAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Event {
  id: string;
  title: string;
  description?: string;
  type: 'holiday' | 'conference' | 'exam_period' | 'registration' | 'workshop' | 'other';
  startDate: string;
  endDate: string;
  location?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Timetable {
  id: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  sessionType: 'lecture' | 'td' | 'tp';
  subjectId: string;
  teacherId: string;
  groupId: string;
  roomId: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  subject?: Subject;
  teacher?: User;
  group?: Group;
  room?: Room;
}

export interface Absence {
  id: string;
  date: string;
  reason?: string;
  status: 'pending' | 'justified' | 'unjustified';
  justificationDocument?: string;
  studentId: string;
  timetableId: string;
  createdAt: string;
  updatedAt: string;
  student?: User;
  timetable?: Timetable;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  status: string;
  message: string;
  errors?: Record<string, string[]>;
}
