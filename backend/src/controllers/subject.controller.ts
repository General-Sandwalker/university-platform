import { Response } from 'express';
import { SubjectService } from '../services/subject.service';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const subjectService = new SubjectService();

export const createSubject = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const subject = await subjectService.create(req.body);
    res.status(201).json({
      success: true,
      data: subject,
    });
  }
);

export const getAllSubjects = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const filters = {
      specialtyId: req.query.specialtyId as string,
      levelId: req.query.levelId as string,
      teacherId: req.query.teacherId as string,
      semester: req.query.semester ? parseInt(req.query.semester as string) : undefined,
      type: req.query.type as 'lecture' | 'td' | 'tp' | undefined,
      search: req.query.search as string,
    };

    const subjects = await subjectService.getAll(filters);
    res.json({
      success: true,
      data: subjects,
    });
  }
);

export const getSubjectById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const subject = await subjectService.getById(req.params.id);
    res.json({
      success: true,
      data: subject,
    });
  }
);

export const updateSubject = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const subject = await subjectService.update(req.params.id, req.body);
    res.json({
      success: true,
      data: subject,
    });
  }
);

export const deleteSubject = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    await subjectService.delete(req.params.id);
    res.json({
      success: true,
      message: 'Subject deleted successfully',
    });
  }
);

export const assignTeacher = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const subject = await subjectService.assignTeacher(
      req.params.id,
      req.body.teacherId
    );
    res.json({
      success: true,
      data: subject,
      message: 'Teacher assigned successfully',
    });
  }
);

export const unassignTeacher = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const subject = await subjectService.unassignTeacher(req.params.id);
    res.json({
      success: true,
      data: subject,
      message: 'Teacher unassigned successfully',
    });
  }
);
