import { z } from 'zod';

// Authentication schemas
export const loginSchema = z.object({
  body: z.object({
    cin: z.string().min(6, 'CIN must be at least 6 characters').max(20),
    password: z.string().min(6, 'Password must be at least 6 characters'),
  }),
});

export const passwordResetRequestSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
  }),
});

export const passwordResetConfirmSchema = z.object({
  body: z.object({
    token: z.string().min(1, 'Token is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters')
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  }),
});

export const refreshTokenSchema = z.object({
  body: z.object({
    refreshToken: z.string().min(1, 'Refresh token is required'),
  }),
});

// User schemas
export const createUserSchema = z.object({
  body: z.object({
    cin: z.string().min(8).max(20),
    firstName: z.string().min(2).max(100),
    lastName: z.string().min(2).max(100),
    email: z.string().email(),
    password: z.string().min(8)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
    role: z.enum(['student', 'teacher', 'department_head', 'admin']),
    phone: z.string().optional(),
    address: z.string().optional(),
    dateOfBirth: z.string().optional(),
    studentCode: z.string().optional(),
    teacherCode: z.string().optional(),
    specialization: z.string().optional(),
    departmentId: z.string().uuid().optional(),
    groupId: z.string().uuid().optional(),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    firstName: z.string().min(2).max(100).optional(),
    lastName: z.string().min(2).max(100).optional(),
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
    dateOfBirth: z.string().optional(),
    status: z.enum(['active', 'inactive', 'suspended', 'eliminated']).optional(),
    departmentId: z.string().uuid().optional(),
    groupId: z.string().uuid().optional(),
    specialization: z.string().optional(),
  }),
});

// Department schemas
export const createDepartmentSchema = z.object({
  body: z.object({
    code: z.string().min(2).max(20),
    name: z.string().min(2).max(255),
    description: z.string().optional(),
  }),
});

export const updateDepartmentSchema = z.object({
  body: z.object({
    code: z.string().min(2).max(20).optional(),
    name: z.string().min(2).max(255).optional(),
    description: z.string().optional(),
    isActive: z.boolean().optional(),
  }),
});

// Specialty schemas
export const createSpecialtySchema = z.object({
  body: z.object({
    code: z.string().min(2).max(20),
    name: z.string().min(2).max(255),
    description: z.string().optional(),
    departmentId: z.string().uuid(),
  }),
});

export const updateSpecialtySchema = z.object({
  body: z.object({
    code: z.string().min(2).max(20).optional(),
    name: z.string().min(2).max(255).optional(),
    description: z.string().optional(),
    departmentId: z.string().uuid().optional(),
  }),
});

// Level schemas
export const createLevelSchema = z.object({
  body: z.object({
    code: z.string().min(2).max(20),
    name: z.string().min(2).max(255),
    year: z.number().int().min(1).max(10),
    specialtyId: z.string().uuid(),
  }),
});

export const updateLevelSchema = z.object({
  body: z.object({
    code: z.string().min(2).max(20).optional(),
    name: z.string().min(2).max(255).optional(),
    year: z.number().int().min(1).max(10).optional(),
    specialtyId: z.string().uuid().optional(),
  }),
});

// Group schemas
export const createGroupSchema = z.object({
  body: z.object({
    code: z.string().min(2).max(20),
    name: z.string().min(2).max(255),
    capacity: z.number().int().min(1).max(200),
    levelId: z.string().uuid(),
  }),
});

export const updateGroupSchema = z.object({
  body: z.object({
    code: z.string().min(2).max(20).optional(),
    name: z.string().min(2).max(255).optional(),
    capacity: z.number().int().min(1).max(200).optional(),
    levelId: z.string().uuid().optional(),
  }),
});

// Room schemas
export const createRoomSchema = z.object({
  body: z.object({
    code: z.string().min(2).max(20),
    name: z.string().min(2).max(255),
    type: z.enum(['classroom', 'lab', 'amphitheater', 'conference_room', 'office']),
    capacity: z.number().int().min(1),
    building: z.string().optional(),
    floor: z.string().optional(),
    equipment: z.string().optional(),
  }),
});

export const updateRoomSchema = z.object({
  body: z.object({
    code: z.string().min(2).max(20).optional(),
    name: z.string().min(2).max(255).optional(),
    type: z.enum(['classroom', 'lab', 'amphitheater', 'conference_room', 'office']).optional(),
    capacity: z.number().int().min(1).optional(),
    building: z.string().optional(),
    floor: z.string().optional(),
    equipment: z.string().optional(),
  }),
});

// Subject schemas
export const createSubjectSchema = z.object({
  body: z.object({
    code: z.string().min(2).max(20),
    name: z.string().min(2).max(255),
    type: z.enum(['lecture', 'td', 'tp']),
    credits: z.number().int().min(1).max(10),
    coefficient: z.number().min(0.5).max(5),
    semester: z.number().int().min(1).max(2),
    specialtyId: z.string().uuid(),
    levelId: z.string().uuid(),
    teacherId: z.string().uuid().optional(),
  }),
});

export const updateSubjectSchema = z.object({
  body: z.object({
    code: z.string().min(2).max(20).optional(),
    name: z.string().min(2).max(255).optional(),
    type: z.enum(['lecture', 'td', 'tp']).optional(),
    credits: z.number().int().min(1).max(10).optional(),
    coefficient: z.number().min(0.5).max(5).optional(),
    semester: z.number().int().min(1).max(2).optional(),
    specialtyId: z.string().uuid().optional(),
    levelId: z.string().uuid().optional(),
    teacherId: z.string().uuid().optional(),
  }),
});

export const createTimetableSchema = z.object({
  body: z.object({
    dayOfWeek: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
    subjectId: z.string().uuid(),
    teacherId: z.string().uuid(),
    roomId: z.string().uuid(),
    groupId: z.string().uuid(),
    semesterId: z.string().uuid(),
    sessionType: z.enum(['lecture', 'td', 'tp', 'exam', 'makeup']),
    notes: z.string().optional(),
  }),
});

export const updateTimetableSchema = z.object({
  body: z.object({
    dayOfWeek: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']).optional(),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format').optional(),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format').optional(),
    subjectId: z.string().uuid().optional(),
    teacherId: z.string().uuid().optional(),
    roomId: z.string().uuid().optional(),
    groupId: z.string().uuid().optional(),
    semesterId: z.string().uuid().optional(),
    sessionType: z.enum(['lecture', 'td', 'tp', 'exam', 'makeup']).optional(),
    notes: z.string().optional(),
  }),
});

// Semester schemas
export const createSemesterSchema = z.object({
  body: z.object({
    code: z.string().min(2).max(50),
    name: z.string().min(2).max(255),
    academicYear: z.number().int().min(2000).max(2100),
    semesterNumber: z.number().int().min(1).max(2),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
    isActive: z.boolean().optional(),
  }),
});

export const updateSemesterSchema = z.object({
  body: z.object({
    code: z.string().min(2).max(50).optional(),
    name: z.string().min(2).max(255).optional(),
    academicYear: z.number().int().min(2000).max(2100).optional(),
    semesterNumber: z.number().int().min(1).max(2).optional(),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format').optional(),
    isActive: z.boolean().optional(),
  }),
});

export const createAbsenceSchema = z.object({
  body: z.object({
    studentId: z.string().uuid(),
    timetableEntryId: z.string().uuid(),
    status: z.enum(['unexcused', 'excused']).optional(),
    excuseReason: z.string().min(10).optional(),
  }),
});

export const submitExcuseSchema = z.object({
  body: z.object({
    excuseReason: z.string().min(10, 'Reason must be at least 10 characters'),
  }),
});

export const reviewExcuseSchema = z.object({
  body: z.object({
    status: z.enum(['excused', 'rejected']),
    reviewNotes: z.string().optional(),
  }),
});

export const createMessageSchema = z.object({
  body: z.object({
    receiverId: z.string().uuid(),
    content: z.string().min(1).max(5000),
  }),
});

export const createEventSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(255),
    description: z.string().optional(),
    type: z.enum(['holiday', 'conference', 'exam_period', 'registration', 'workshop', 'other']),
    startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    location: z.string().optional(),
    affectsAllUsers: z.boolean().optional(),
    blocksTimetable: z.boolean().optional(),
    organizer: z.string().optional(),
  }),
});

// Param schemas
export const idParamSchema = z.object({
  params: z.object({
    id: z.string().uuid('Invalid UUID format'),
  }),
});
