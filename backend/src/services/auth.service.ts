import { Repository } from 'typeorm';
import { User, UserStatus } from '../entities/User';
import { AppDataSource } from '../config/database';
import { AuthUtils } from '../utils/auth';
import { emailService } from '../utils/email';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

export class AuthService {
  private userRepository: Repository<User>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
  }

  async login(cin: string, password: string) {
    // Find user by CIN
    const user = await this.userRepository.findOne({
      where: { cin },
      relations: ['department', 'group'],
    });

    if (!user) {
      throw new AppError(401, 'Invalid credentials');
    }

    // Check if user is active
    if (user.status !== UserStatus.ACTIVE) {
      throw new AppError(403, 'Account is not active. Please contact administration.');
    }

    // Verify password
    const isPasswordValid = await AuthUtils.comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new AppError(401, 'Invalid credentials');
    }

    // Generate tokens
    const payload = {
      userId: user.id,
      cin: user.cin,
      role: user.role,
      email: user.email,
    };

    const accessToken = AuthUtils.generateAccessToken(payload);
    const refreshToken = AuthUtils.generateRefreshToken(payload);

    // Update last login
    user.lastLoginAt = new Date();
    await this.userRepository.save(user);

    logger.info(`User logged in: ${user.cin} (${user.role})`);

    return {
      user: {
        id: user.id,
        cin: user.cin,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        status: user.status,
        department: user.department,
        group: user.group,
      },
      accessToken,
      refreshToken,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const decoded = AuthUtils.verifyRefreshToken(refreshToken);

      // Verify user still exists and is active
      const user = await this.userRepository.findOne({
        where: { id: decoded.userId },
      });

      if (!user || user.status !== UserStatus.ACTIVE) {
        throw new AppError(401, 'Invalid refresh token');
      }

      // Generate new tokens
      const payload = {
        userId: user.id,
        cin: user.cin,
        role: user.role,
        email: user.email,
      };

      const newAccessToken = AuthUtils.generateAccessToken(payload);
      const newRefreshToken = AuthUtils.generateRefreshToken(payload);

      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
      };
    } catch (error) {
      throw new AppError(401, 'Invalid or expired refresh token');
    }
  }

  async requestPasswordReset(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      // Don't reveal if email exists
      logger.warn(`Password reset requested for non-existent email: ${email}`);
      return;
    }

    // Generate reset token
    const resetToken = AuthUtils.generateResetToken();
    const hashedToken = AuthUtils.hashResetToken(resetToken);

    // Set expiry time (15 minutes from now)
    const expiryTime = new Date();
    expiryTime.setMinutes(expiryTime.getMinutes() + 15);

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = expiryTime;
    await this.userRepository.save(user);

    // Send reset email
    await emailService.sendPasswordResetEmail(
      user.email,
      resetToken,
      user.fullName
    );

    logger.info(`Password reset email sent to: ${user.email}`);
  }

  async resetPassword(token: string, newPassword: string) {
    const hashedToken = AuthUtils.hashResetToken(token);

    const user = await this.userRepository.findOne({
      where: {
        passwordResetToken: hashedToken,
      },
    });

    if (!user || !user.passwordResetExpires || user.passwordResetExpires < new Date()) {
      throw new AppError(400, 'Invalid or expired reset token');
    }

    // Hash new password
    user.password = await AuthUtils.hashPassword(newPassword);
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await this.userRepository.save(user);

    logger.info(`Password reset successful for user: ${user.cin}`);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // Verify current password
    const isPasswordValid = await AuthUtils.comparePassword(currentPassword, user.password);
    if (!isPasswordValid) {
      throw new AppError(401, 'Current password is incorrect');
    }

    // Hash and save new password
    user.password = await AuthUtils.hashPassword(newPassword);
    await this.userRepository.save(user);

    logger.info(`Password changed for user: ${user.cin}`);
  }

  async getUserById(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['department', 'group'],
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return {
      id: user.id,
      cin: user.cin,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      status: user.status,
      phone: user.phone,
      address: user.address,
      dateOfBirth: user.dateOfBirth,
      department: user.department,
      group: user.group,
    };
  }
}
