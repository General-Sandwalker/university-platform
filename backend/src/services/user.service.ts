import { Repository, Like, In } from 'typeorm';
import { User, UserRole, UserStatus } from '../entities/User';
import { Department } from '../entities/Department';
import { Group } from '../entities/Group';
import { AppDataSource } from '../config/database';
import { AuthUtils } from '../utils/auth';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';
import * as fs from 'fs';
import { parse } from 'csv-parse/sync';

interface CreateUserDto {
  cin: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: UserRole;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  studentCode?: string;
  teacherCode?: string;
  specialization?: string;
  departmentId?: string;
  groupId?: string;
}

interface UpdateUserDto {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
  status?: UserStatus;
  departmentId?: string;
  groupId?: string;
  specialization?: string;
}

interface UserFilters {
  role?: UserRole;
  status?: UserStatus;
  departmentId?: string;
  groupId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export class UserService {
  private userRepository: Repository<User>;
  private departmentRepository: Repository<Department>;
  private groupRepository: Repository<Group>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.departmentRepository = AppDataSource.getRepository(Department);
    this.groupRepository = AppDataSource.getRepository(Group);
  }

  async createUser(data: CreateUserDto) {
    // Check if CIN already exists
    const existingUser = await this.userRepository.findOne({
      where: [{ cin: data.cin }, { email: data.email }],
    });

    if (existingUser) {
      throw new AppError(400, 'User with this CIN or email already exists');
    }

    // Hash password
    const hashedPassword = await AuthUtils.hashPassword(data.password);

    // Create user entity
    const user = this.userRepository.create({
      ...data,
      password: hashedPassword,
    });

    // Set department if provided
    if (data.departmentId) {
      const department = await this.departmentRepository.findOne({
        where: { id: data.departmentId },
      });
      if (!department) {
        throw new AppError(404, 'Department not found');
      }
      user.department = department;
    }

    // Set group if provided
    if (data.groupId) {
      const group = await this.groupRepository.findOne({
        where: { id: data.groupId },
      });
      if (!group) {
        throw new AppError(404, 'Group not found');
      }
      user.group = group;
    }

    await this.userRepository.save(user);

    logger.info(`User created: ${user.cin} (${user.role})`);

    // Remove password from response
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async getUsers(filters: UserFilters) {
    const page = filters.page || 1;
    const limit = filters.limit || 20;
    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.department', 'department')
      .leftJoinAndSelect('user.group', 'group')
      .select([
        'user.id',
        'user.cin',
        'user.firstName',
        'user.lastName',
        'user.email',
        'user.role',
        'user.status',
        'user.phone',
        'user.studentCode',
        'user.teacherCode',
        'user.dateOfBirth',
        'user.createdAt',
        'user.lastLoginAt',
        'department',
        'group',
      ]);

    // Apply filters
    if (filters.role) {
      queryBuilder.andWhere('user.role = :role', { role: filters.role });
    }

    if (filters.status) {
      queryBuilder.andWhere('user.status = :status', { status: filters.status });
    }

    if (filters.departmentId) {
      queryBuilder.andWhere('user.departmentId = :departmentId', {
        departmentId: filters.departmentId,
      });
    }

    if (filters.groupId) {
      queryBuilder.andWhere('user.groupId = :groupId', { groupId: filters.groupId });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(user.firstName ILIKE :search OR user.lastName ILIKE :search OR user.cin ILIKE :search OR user.email ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    // Get total count
    const total = await queryBuilder.getCount();

    // Apply pagination
    queryBuilder.skip(skip).take(limit);

    // Order by created date
    queryBuilder.orderBy('user.createdAt', 'DESC');

    const users = await queryBuilder.getMany();

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: ['department', 'group'],
      select: [
        'id',
        'cin',
        'firstName',
        'lastName',
        'email',
        'role',
        'status',
        'phone',
        'address',
        'dateOfBirth',
        'studentCode',
        'teacherCode',
        'specialization',
        'profileImage',
        'isEmailVerified',
        'lastLoginAt',
        'createdAt',
        'updatedAt',
      ],
    });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    return user;
  }

  async updateUser(id: string, data: UpdateUserDto) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    // Check email uniqueness if being updated
    if (data.email && data.email !== user.email) {
      const existingUser = await this.userRepository.findOne({
        where: { email: data.email },
      });
      if (existingUser) {
        throw new AppError(400, 'Email already in use');
      }
    }

    // Update basic fields
    Object.assign(user, data);

    // Update department if provided
    if (data.departmentId) {
      const department = await this.departmentRepository.findOne({
        where: { id: data.departmentId },
      });
      if (!department) {
        throw new AppError(404, 'Department not found');
      }
      user.department = department;
    }

    // Update group if provided
    if (data.groupId) {
      const group = await this.groupRepository.findOne({
        where: { id: data.groupId },
      });
      if (!group) {
        throw new AppError(404, 'Group not found');
      }
      user.group = group;
    }

    await this.userRepository.save(user);

    logger.info(`User updated: ${user.cin}`);

    return this.getUserById(id);
  }

  async deleteUser(id: string) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new AppError(404, 'User not found');
    }

    await this.userRepository.remove(user);

    logger.info(`User deleted: ${user.cin}`);
  }

  async importUsersFromCSV(filePath: string) {
    try {
      // Read CSV file
      const fileContent = fs.readFileSync(filePath, 'utf-8');

      // Parse CSV
      const records = parse(fileContent, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      const results = {
        success: 0,
        failed: 0,
        errors: [] as Array<{ row: number; error: string; data: any }>,
      };

      for (let i = 0; i < records.length; i++) {
        const record = records[i];

        try {
          // Validate required fields
          if (!record.cin || !record.firstName || !record.lastName || !record.email || !record.role) {
            throw new Error('Missing required fields');
          }

          // Check if user already exists
          const existing = await this.userRepository.findOne({
            where: [{ cin: record.cin }, { email: record.email }],
          });

          if (existing) {
            throw new Error('User with this CIN or email already exists');
          }

          // Hash password (use default if not provided)
          const password = record.password || 'Password@123';
          const hashedPassword = await AuthUtils.hashPassword(password);

          // Create user
          const user = this.userRepository.create({
            cin: record.cin,
            firstName: record.firstName,
            lastName: record.lastName,
            email: record.email,
            password: hashedPassword,
            role: record.role as UserRole,
            phone: record.phone,
            address: record.address,
            dateOfBirth: record.dateOfBirth,
            studentCode: record.studentCode,
            teacherCode: record.teacherCode,
            specialization: record.specialization,
          });

          // Set department if provided
          if (record.departmentCode) {
            const department = await this.departmentRepository.findOne({
              where: { code: record.departmentCode },
            });
            if (department) {
              user.department = department;
            }
          }

          // Set group if provided
          if (record.groupCode) {
            const group = await this.groupRepository.findOne({
              where: { code: record.groupCode },
            });
            if (group) {
              user.group = group;
            }
          }

          await this.userRepository.save(user);
          results.success++;

          logger.info(`User imported from CSV: ${user.cin}`);
        } catch (error: any) {
          results.failed++;
          results.errors.push({
            row: i + 2, // +2 because of header row and 0-index
            error: error.message,
            data: record,
          });
        }
      }

      // Clean up uploaded file
      fs.unlinkSync(filePath);

      return results;
    } catch (error: any) {
      logger.error('CSV import failed:', error);
      throw new AppError(400, `CSV import failed: ${error.message}`);
    }
  }

  async getUserStats() {
    const totalUsers = await this.userRepository.count();
    const activeUsers = await this.userRepository.count({ where: { status: UserStatus.ACTIVE } });
    const studentCount = await this.userRepository.count({ where: { role: UserRole.STUDENT } });
    const teacherCount = await this.userRepository.count({ where: { role: UserRole.TEACHER } });

    const usersByRole = await this.userRepository
      .createQueryBuilder('user')
      .select('user.role', 'role')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.role')
      .getRawMany();

    const usersByStatus = await this.userRepository
      .createQueryBuilder('user')
      .select('user.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('user.status')
      .getRawMany();

    return {
      total: totalUsers,
      active: activeUsers,
      students: studentCount,
      teachers: teacherCount,
      byRole: usersByRole,
      byStatus: usersByStatus,
    };
  }
}
