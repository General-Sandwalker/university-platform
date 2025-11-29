import { Response } from 'express';
import { TimetableService } from '../services/timetable.service';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const timetableService = new TimetableService();

export const createTimetable = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const timetable = await timetableService.create(req.body);
    res.status(201).json({
      success: true,
      data: timetable,
    });
  }
);

export const getAllTimetables = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const filters = {
      teacherId: req.query.teacherId as string,
      groupId: req.query.groupId as string,
      roomId: req.query.roomId as string,
      subjectId: req.query.subjectId as string,
      startDate: req.query.startDate as string,
      endDate: req.query.endDate as string,
      sessionType: req.query.sessionType as string,
    };

    const timetables = await timetableService.getAll(filters);
    res.json({
      success: true,
      data: timetables,
    });
  }
);

export const getTimetableById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const timetable = await timetableService.getById(req.params.id);
    res.json({
      success: true,
      data: timetable,
    });
  }
);

export const getStudentSchedule = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const studentId = req.params.studentId || req.user?.id;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    if (!studentId) {
      return res.status(400).json({
        success: false,
        message: 'Student ID is required',
      });
    }

    const schedule = await timetableService.getStudentSchedule(
      studentId,
      startDate,
      endDate
    );

    res.json({
      success: true,
      data: schedule,
    });
  }
);

export const getMySchedule = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    // Handle different roles
    let schedule;
    if (req.user.role === 'student') {
      schedule = await timetableService.getStudentSchedule(
        req.user.id,
        startDate,
        endDate
      );
    } else if (req.user.role === 'teacher' || req.user.role === 'department_head') {
      schedule = await timetableService.getAll({
        teacherId: req.user.id,
        startDate,
        endDate,
      });
    } else {
      // Admin - get all
      schedule = await timetableService.getAll({
        startDate,
        endDate,
      });
    }

    res.json({
      success: true,
      data: schedule,
    });
  }
);

export const updateTimetable = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const timetable = await timetableService.update(req.params.id, req.body);
    res.json({
      success: true,
      data: timetable,
    });
  }
);

export const deleteTimetable = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    await timetableService.delete(req.params.id);
    res.json({
      success: true,
      message: 'Timetable entry deleted successfully',
    });
  }
);

export const checkAvailability = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const result = await timetableService.checkAvailability(req.body);
    res.json({
      success: true,
      data: result,
    });
  }
);
