import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Specialty } from '../entities/Specialty';
import { Department } from '../entities/Department';
import { User } from '../entities/User';
import { AppError } from '../middleware/errorHandler';

export class SpecialtyService {
  private specialtyRepository: Repository<Specialty>;
  private departmentRepository: Repository<Department>;
  private userRepository: Repository<User>;

  constructor() {
    this.specialtyRepository = AppDataSource.getRepository(Specialty);
    this.departmentRepository = AppDataSource.getRepository(Department);
    this.userRepository = AppDataSource.getRepository(User);
  }

  async create(data: {
    name: string;
    code: string;
    departmentId: string;
    description?: string;
  }, userId?: string, userRole?: string): Promise<Specialty> {
    // Check if department exists
    const department = await this.departmentRepository.findOne({
      where: { id: data.departmentId },
    });

    if (!department) {
      throw new AppError('Department not found', 404);
    }

    // Department head authorization: can only create specialties for their department
    if (userRole === 'department_head' && userId) {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['department'],
      });
      
      if (!user?.department || user.department.id !== data.departmentId) {
        throw new AppError('You can only create specialties for your department', 403);
      }
    }

    // Check if specialty code already exists
    const existingSpecialty = await this.specialtyRepository.findOne({
      where: { code: data.code },
    });

    if (existingSpecialty) {
      throw new AppError('Specialty code already exists', 400);
    }

    const specialty = this.specialtyRepository.create({
      name: data.name,
      code: data.code,
      department,
      description: data.description,
    });

    return await this.specialtyRepository.save(specialty);
  }

  async getAll(filters?: {
    departmentId?: string;
    search?: string;
  }): Promise<Specialty[]> {
    const query = this.specialtyRepository
      .createQueryBuilder('specialty')
      .leftJoinAndSelect('specialty.department', 'department')
      .leftJoinAndSelect('specialty.levels', 'levels')
      .orderBy('specialty.name', 'ASC');

    if (filters?.departmentId) {
      query.andWhere('specialty.departmentId = :departmentId', {
        departmentId: filters.departmentId,
      });
    }

    if (filters?.search) {
      query.andWhere(
        '(specialty.name ILIKE :search OR specialty.code ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    return await query.getMany();
  }

  async getById(id: string): Promise<Specialty> {
    const specialty = await this.specialtyRepository.findOne({
      where: { id },
      relations: ['department', 'levels', 'subjects'],
    });

    if (!specialty) {
      throw new AppError('Specialty not found', 404);
    }

    return specialty;
  }

  async update(
    id: string,
    data: {
      name?: string;
      code?: string;
      departmentId?: string;
      description?: string;
    },
    userId?: string,
    userRole?: string
  ): Promise<Specialty> {
    const specialty = await this.getById(id);

    // Department head authorization: can only update specialties in their department
    if (userRole === 'department_head' && userId) {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['department'],
      });
      
      if (!user?.department || user.department.id !== specialty.department.id) {
        throw new AppError('You can only update specialties in your department', 403);
      }
      
      // If changing department, verify new department is still their department (shouldn't be allowed anyway)
      if (data.departmentId && data.departmentId !== specialty.department.id) {
        throw new AppError('Department heads cannot change specialty department', 403);
      }
    }

    // Check if new code conflicts with existing specialty
    if (data.code && data.code !== specialty.code) {
      const existingSpecialty = await this.specialtyRepository.findOne({
        where: { code: data.code },
      });

      if (existingSpecialty) {
        throw new AppError('Specialty code already exists', 400);
      }
    }

    // Check if department exists if changing department
    if (data.departmentId && data.departmentId !== specialty.department.id) {
      const department = await this.departmentRepository.findOne({
        where: { id: data.departmentId },
      });

      if (!department) {
        throw new AppError('Department not found', 404);
      }

      specialty.department = department;
    }

    if (data.name) specialty.name = data.name;
    if (data.code) specialty.code = data.code;
    if (data.description !== undefined) specialty.description = data.description;

    return await this.specialtyRepository.save(specialty);
  }

  async delete(id: string, userId?: string, userRole?: string): Promise<void> {
    const specialty = await this.specialtyRepository.findOne({
      where: { id },
      relations: ['levels', 'subjects', 'department'],
    });

    if (!specialty) {
      throw new AppError('Specialty not found', 404);
    }

    // Department head authorization: can only delete specialties in their department
    if (userRole === 'department_head' && userId) {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['department'],
      });
      
      if (!user?.department || user.department.id !== specialty.department.id) {
        throw new AppError('You can only delete specialties in your department', 403);
      }
    }

    // Check if specialty has associated levels or subjects
    if (specialty.levels && specialty.levels.length > 0) {
      throw new AppError(
        'Cannot delete specialty with associated levels. Please delete levels first.',
        400
      );
    }

    if (specialty.subjects && specialty.subjects.length > 0) {
      throw new AppError(
        'Cannot delete specialty with associated subjects. Please delete subjects first.',
        400
      );
    }

    await this.specialtyRepository.remove(specialty);
  }
}
