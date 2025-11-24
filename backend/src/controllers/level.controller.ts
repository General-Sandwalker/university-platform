import { Response } from 'express';
import { LevelService } from '../services/level.service';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const levelService = new LevelService();

export const createLevel = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const level = await levelService.create(req.body);
    res.status(201).json({
      success: true,
      data: level,
    });
  }
);

export const getAllLevels = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const filters = {
      specialtyId: req.query.specialtyId as string,
      search: req.query.search as string,
    };

    const levels = await levelService.getAll(filters);
    res.json({
      success: true,
      data: levels,
    });
  }
);

export const getLevelById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const level = await levelService.getById(req.params.id);
    res.json({
      success: true,
      data: level,
    });
  }
);

export const updateLevel = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const level = await levelService.update(req.params.id, req.body);
    res.json({
      success: true,
      data: level,
    });
  }
);

export const deleteLevel = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    await levelService.delete(req.params.id);
    res.json({
      success: true,
      message: 'Level deleted successfully',
    });
  }
);
