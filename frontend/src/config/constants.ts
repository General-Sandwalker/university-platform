export const API_CONFIG = {
  BASE_URL: import.meta.env.VITE_API_URL || '/api/v1',
  TIMEOUT: 30000,
};

export const APP_CONFIG = {
  APP_NAME: 'University Management Platform',
  VERSION: '1.0.0',
};

export const ROLES = {
  ADMIN: 'admin',
  DEPARTMENT_HEAD: 'department_head',
  TEACHER: 'teacher',
  STUDENT: 'student',
} as const;

export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended',
  ELIMINATED: 'eliminated',
} as const;

export const EVENT_TYPES = {
  HOLIDAY: 'holiday',
  CONFERENCE: 'conference',
  EXAM_PERIOD: 'exam_period',
  REGISTRATION: 'registration',
  WORKSHOP: 'workshop',
  OTHER: 'other',
} as const;

export const ABSENCE_STATUS = {
  PENDING: 'pending',
  JUSTIFIED: 'justified',
  UNJUSTIFIED: 'unjustified',
} as const;

export const SESSION_TYPES = {
  LECTURE: 'lecture',
  TD: 'td',
  TP: 'tp',
} as const;
