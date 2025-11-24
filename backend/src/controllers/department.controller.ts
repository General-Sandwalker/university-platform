import { Response } from 'express';
import { DepartmentService } from '../services/department.service';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const departmentService = new DepartmentService();

export class DepartmentController {
  createDepartment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const department = await departmentService.create(req.body);

    res.status(201).json({
      status: 'success',
      data: { department },
    });
  });

  getDepartments = asyncHandler(async (req: AuthRequest, res: Response) => {
    const departments = await departmentService.getAll();

    res.status(200).json({
      status: 'success',
      data: { departments },
    });
  });

  getDepartmentById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const department = await departmentService.getById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: { department },
    });
  });

  updateDepartment = asyncHandler(async (req: AuthRequest, res: Response) => {
    const department = await departmentService.update(req.params.id, req.body);

    res.status(200).json({
      status: 'success',
      data: { department },
    });
  });

  deleteDepartment = asyncHandler(async (req: AuthRequest, res: Response) => {
    await departmentService.delete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Department deleted successfully',
    });
  });
}
