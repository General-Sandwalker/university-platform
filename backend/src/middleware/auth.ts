import { Request, Response, NextFunction } from 'express';
import { AuthUtils, JWTPayload } from '../utils/auth';
import { AppError } from './errorHandler';
import { UserRole } from '../entities/User';

export interface AuthRequest extends Request {
  user?: JWTPayload & { id: string };
  file?: Express.Multer.File;
}

export const authenticate = (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError(401, 'Authentication required');
    }

    const token = authHeader.substring(7);
    const decoded = AuthUtils.verifyAccessToken(token);

    // Add id as alias for userId for backward compatibility
    req.user = { ...decoded, id: decoded.userId };
    next();
  } catch (error) {
    if (error instanceof AppError) {
      next(error);
    } else {
      next(new AppError(401, 'Invalid or expired token'));
    }
  }
};

export const authorize = (...roles: UserRole[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(new AppError(401, 'Authentication required'));
    }

    if (!roles.includes(req.user.role as UserRole)) {
      return next(new AppError(403, 'Access denied. Insufficient permissions.'));
    }

    next();
  };
};

// Admin only middleware
export const adminOnly = authorize(UserRole.ADMIN);

// Teacher or admin middleware
export const teacherOrAdmin = authorize(UserRole.TEACHER, UserRole.DEPARTMENT_HEAD, UserRole.ADMIN);

// Department head or admin middleware
export const departmentHeadOrAdmin = authorize(UserRole.DEPARTMENT_HEAD, UserRole.ADMIN);
