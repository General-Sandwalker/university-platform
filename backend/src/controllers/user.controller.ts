import { Response } from 'express';
import { UserService } from '../services/user.service';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';
import { AppError } from '../middleware/errorHandler';

const userService = new UserService();

export class UserController {
  /**
   * @route POST /api/v1/users
   * @desc Create a new user
   * @access Private (Admin only)
   */
  createUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await userService.createUser(req.body);

    res.status(201).json({
      status: 'success',
      data: { user },
    });
  });

  /**
   * @route GET /api/v1/users
   * @desc Get all users with filters and pagination
   * @access Private
   */
  getUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
    const filters = {
      role: req.query.role as any,
      status: req.query.status as any,
      departmentId: req.query.departmentId as string,
      groupId: req.query.groupId as string,
      search: req.query.search as string,
      page: req.query.page ? parseInt(req.query.page as string) : undefined,
      limit: req.query.limit ? parseInt(req.query.limit as string) : undefined,
    };

    const result = await userService.getUsers(filters);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  });

  /**
   * @route GET /api/v1/users/stats
   * @desc Get user statistics
   * @access Private (Admin only)
   */
  getUserStats = asyncHandler(async (req: AuthRequest, res: Response) => {
    const stats = await userService.getUserStats();

    res.status(200).json({
      status: 'success',
      data: stats,
    });
  });

  /**
   * @route GET /api/v1/users/:id
   * @desc Get user by ID
   * @access Private
   */
  getUserById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await userService.getUserById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: { user },
    });
  });

  /**
   * @route PUT /api/v1/users/:id
   * @desc Update user
   * @access Private (Admin only)
   */
  updateUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    const user = await userService.updateUser(req.params.id, req.body);

    res.status(200).json({
      status: 'success',
      data: { user },
    });
  });

  /**
   * @route DELETE /api/v1/users/:id
   * @desc Delete user
   * @access Private (Admin only)
   */
  deleteUser = asyncHandler(async (req: AuthRequest, res: Response) => {
    await userService.deleteUser(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully',
    });
  });

  /**
   * @route POST /api/v1/users/import
   * @desc Import users from CSV file
   * @access Private (Admin only)
   */
  importUsers = asyncHandler(async (req: AuthRequest, res: Response) => {
    if (!req.file) {
      throw new AppError(400, 'CSV file is required');
    }

    const results = await userService.importUsersFromCSV(req.file.path);

    res.status(200).json({
      status: 'success',
      message: `Import completed: ${results.success} succeeded, ${results.failed} failed`,
      data: results,
    });
  });
}
