import { Response } from 'express';
import { GroupService } from '../services/group.service';
import { AuthRequest } from '../middleware/auth';
import { asyncHandler } from '../middleware/errorHandler';

const groupService = new GroupService();

export const createGroup = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const group = await groupService.create(req.body);
    res.status(201).json({
      success: true,
      data: group,
    });
  }
);

export const getAllGroups = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const filters = {
      levelId: req.query.levelId as string,
      specialtyId: req.query.specialtyId as string,
      search: req.query.search as string,
    };

    const groups = await groupService.getAll(filters);
    res.json({
      success: true,
      data: groups,
    });
  }
);

export const getGroupById = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const group = await groupService.getById(req.params.id);
    res.json({
      success: true,
      data: group,
    });
  }
);

export const updateGroup = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const group = await groupService.update(req.params.id, req.body);
    res.json({
      success: true,
      data: group,
    });
  }
);

export const deleteGroup = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    await groupService.delete(req.params.id);
    res.json({
      success: true,
      message: 'Group deleted successfully',
    });
  }
);

export const addStudentToGroup = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const group = await groupService.addStudent(
      req.params.id,
      req.body.studentId
    );
    res.json({
      success: true,
      data: group,
      message: 'Student added to group successfully',
    });
  }
);

export const removeStudentFromGroup = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const group = await groupService.removeStudent(
      req.params.id,
      req.params.studentId
    );
    res.json({
      success: true,
      data: group,
      message: 'Student removed from group successfully',
    });
  }
);
