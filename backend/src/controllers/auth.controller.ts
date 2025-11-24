import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const authService = new AuthService();

export class AuthController {
  /**
   * @route POST /api/v1/auth/login
   * @desc Login with CIN and password
   * @access Public
   */
  login = asyncHandler(async (req: Request, res: Response) => {
    const { cin, password } = req.body;

    const result = await authService.login(cin, password);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  });

  /**
   * @route POST /api/v1/auth/refresh
   * @desc Refresh access token
   * @access Public
   */
  refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    const result = await authService.refreshToken(refreshToken);

    res.status(200).json({
      status: 'success',
      data: result,
    });
  });

  /**
   * @route POST /api/v1/auth/password-reset/request
   * @desc Request password reset
   * @access Public
   */
  requestPasswordReset = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    await authService.requestPasswordReset(email);

    res.status(200).json({
      status: 'success',
      message: 'If the email exists, a password reset link has been sent.',
    });
  });

  /**
   * @route POST /api/v1/auth/password-reset/confirm
   * @desc Confirm password reset with token
   * @access Public
   */
  resetPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;

    await authService.resetPassword(token, newPassword);

    res.status(200).json({
      status: 'success',
      message: 'Password has been reset successfully.',
    });
  });

  /**
   * @route POST /api/v1/auth/password/change
   * @desc Change password (authenticated user)
   * @access Private
   */
  changePassword = asyncHandler(async (req: AuthRequest, res: Response) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user!.userId;

    await authService.changePassword(userId, currentPassword, newPassword);

    res.status(200).json({
      status: 'success',
      message: 'Password has been changed successfully.',
    });
  });

  /**
   * @route GET /api/v1/auth/me
   * @desc Get current user profile
   * @access Private
   */
  getMe = asyncHandler(async (req: AuthRequest, res: Response) => {
    res.status(200).json({
      status: 'success',
      data: {
        user: req.user,
      },
    });
  });
}
