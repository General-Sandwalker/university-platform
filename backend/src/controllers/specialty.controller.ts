import { Response } from 'express';
import { SpecialtyService } from '../services/specialty.service';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const specialtyService = new SpecialtyService();

export const createSpecialty = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const specialty = await specialtyService.create(req.body, req.user?.userId, req.user?.role);
    res.status(201).json({
      success: true,
      data: specialty,
    });
  }
);

export const getAllSpecialties = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const filters = {
      departmentId: req.query.departmentId as string,
      search: req.query.search as string,
    };

    const specialties = await specialtyService.getAll(filters);
    res.json({
      success: true,
      data: specialties,
    });
  }
);

export const getSpecialtyById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const specialty = await specialtyService.getById(req.params.id);
    res.json({
      success: true,
      data: specialty,
    });
  }
);

export const updateSpecialty = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const specialty = await specialtyService.update(req.params.id, req.body, req.user?.userId, req.user?.role);
    res.json({
      success: true,
      data: specialty,
    });
  }
);

export const deleteSpecialty = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    await specialtyService.delete(req.params.id, req.user?.userId, req.user?.role);
    res.json({
      success: true,
      message: 'Specialty deleted successfully',
    });
  }
);
