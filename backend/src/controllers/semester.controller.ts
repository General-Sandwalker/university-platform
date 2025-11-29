import { Response } from 'express';
import { SemesterService } from '../services/semester.service';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const semesterService = new SemesterService();

export const createSemester = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const semester = await semesterService.create(req.body);
    res.status(201).json({
      success: true,
      data: semester,
    });
  }
);

export const getAllSemesters = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const semesters = await semesterService.getAll();
    res.json({
      success: true,
      data: semesters,
    });
  }
);

export const getActiveSemester = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const semester = await semesterService.getActive();
    res.json({
      success: true,
      data: semester,
    });
  }
);

export const getSemesterById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const semester = await semesterService.getById(req.params.id);
    res.json({
      success: true,
      data: semester,
    });
  }
);

export const updateSemester = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const semester = await semesterService.update(req.params.id, req.body);
    res.json({
      success: true,
      data: semester,
    });
  }
);

export const deleteSemester = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    await semesterService.delete(req.params.id);
    res.status(204).send();
  }
);

export const setActiveSemester = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const semester = await semesterService.setActive(req.params.id);
    res.json({
      success: true,
      data: semester,
    });
  }
);
