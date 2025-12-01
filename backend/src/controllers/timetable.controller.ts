import { Response } from 'express';
import { TimetableService } from '../services/timetable.service';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const timetableService = new TimetableService();

export const createTimetable = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const timetable = await timetableService.create(
      req.body,
      req.user?.id,
      req.user?.role
    );
    res.status(201).json({
      success: true,
      data: timetable,
    });
  }
);

export const getTimetableByGroup = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { groupId } = req.params;
    const semesterId = req.query.semesterId as string;

    const timetables = await timetableService.getByGroup(
      groupId,
      semesterId,
      req.user?.id,
      req.user?.role
    );

    res.json({
      success: true,
      data: timetables,
    });
  }
);

export const getMyTeachingSchedule = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user || req.user.role !== 'teacher') {
      return res.status(403).json({
        success: false,
        message: 'Only teachers can access this endpoint',
      });
    }

    const semesterId = req.query.semesterId as string;
    const timetables = await timetableService.getByTeacher(req.user.id, semesterId);

    res.json({
      success: true,
      data: timetables,
    });
  }
);

export const getTimetableById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const timetable = await timetableService.getById(
      req.params.id,
      req.user?.id,
      req.user?.role
    );
    res.json({
      success: true,
      data: timetable,
    });
  }
);

export const updateTimetable = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const timetable = await timetableService.update(
      req.params.id,
      req.body,
      req.user?.id,
      req.user?.role
    );
    res.json({
      success: true,
      data: timetable,
    });
  }
);

export const deleteTimetable = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    await timetableService.delete(req.params.id, req.user?.id, req.user?.role);
    res.status(204).send();
  }
);

export const getAccessibleGroups = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized',
      });
    }

    const groups = await timetableService.getAccessibleGroups(
      req.user.id,
      req.user.role
    );

    res.json({
      success: true,
      data: groups,
    });
  }
);
