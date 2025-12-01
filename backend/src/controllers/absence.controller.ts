import { Response } from 'express';
import { AbsenceService } from '../services/absence.service';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const absenceService = new AbsenceService();

export const recordAbsence = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const absence = await absenceService.recordAbsence({
      ...req.body,
      recordedById: req.user?.userId,
    });

    res.status(201).json({
      success: true,
      data: absence,
      message: 'Absence recorded successfully',
    });
  }
);

export const getAllAbsences = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const filters = {
      studentId: req.query.studentId as string,
      subjectId: req.query.subjectId as string,
      teacherId: req.query.teacherId as string,
      status: req.query.status as 'unexcused' | 'pending' | 'excused' | 'rejected',
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      currentUserId: req.user?.userId,
      currentUserRole: req.user?.role,
    };

    // If user is a student, they can only see their own absences
    if (req.user?.role === 'student') {
      filters.studentId = req.user.userId;
    }

    const absences = await absenceService.getAll(filters);

    res.json({
      success: true,
      data: absences,
    });
  }
);

export const getAbsenceById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const absence = await absenceService.getById(req.params.id);

    // Check authorization based on role
    if (req.user?.role === 'student') {
      // Students can only view their own absences
      if (absence.student.id !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only view your own absences',
        });
      }
    } else if (req.user?.role === 'department_head') {
      // Department heads can only view absences from their department
      const user = await absenceService.getUserWithDepartment(req.user.userId);
      if (!user?.department || absence.student.department?.id !== user.department.id) {
        return res.status(403).json({
          success: false,
          message: 'You can only view absences from your department',
        });
      }
    } else if (req.user?.role === 'teacher') {
      // Teachers can only view absences from their classes
      if (absence.timetableEntry.teacher.id !== req.user.userId) {
        return res.status(403).json({
          success: false,
          message: 'You can only view absences from your classes',
        });
      }
    }

    res.json({
      success: true,
      data: absence,
    });
  }
);

export const getStudentAbsences = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const studentId = req.params.studentId;
    const subjectId = req.query.subjectId as string;

    // If user is a student, they can only view their own absences
    if (req.user?.role === 'student' && studentId !== req.user.userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own absences',
      });
    }

    const result = await absenceService.getStudentAbsences(studentId, subjectId);

    res.json({
      success: true,
      data: result,
    });
  }
);

export const getMyAbsences = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const subjectId = req.query.subjectId as string;
    const result = await absenceService.getStudentAbsences(req.user.userId, subjectId);

    res.json({
      success: true,
      data: result,
    });
  }
);

export const submitExcuse = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const absence = await absenceService.submitExcuse(
      req.params.id,
      req.user.userId,
      req.body.excuseReason,
      req.file?.path
    );

    res.json({
      success: true,
      data: absence,
      message: 'Excuse submitted successfully',
    });
  }
);

export const reviewExcuse = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const absence = await absenceService.reviewExcuse(
      req.params.id,
      req.user.userId,
      req.body.status,
      req.body.reviewNotes
    );

    res.json({
      success: true,
      data: absence,
      message: `Excuse ${req.body.status} successfully`,
    });
  }
);

export const deleteAbsence = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user?.userId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    await absenceService.deleteAbsence(req.params.id, req.user.userId);

    res.json({
      success: true,
      message: 'Absence record deleted successfully',
    });
  }
);

export const getAbsenceStatistics = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const filters = {
      groupId: req.query.groupId as string,
      subjectId: req.query.subjectId as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
    };

    const statistics = await absenceService.getAbsenceStatistics(filters);

    res.json({
      success: true,
      data: statistics,
    });
  }
);
