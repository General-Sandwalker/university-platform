import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Level } from '../entities/Level';
import { Specialty } from '../entities/Specialty';
import { User } from '../entities/User';
import { AppError } from '../middleware/errorHandler';

export class LevelService {
  private levelRepository: Repository<Level>;
  private specialtyRepository: Repository<Specialty>;
  private userRepository: Repository<User>;

  constructor() {
    this.levelRepository = AppDataSource.getRepository(Level);
    this.specialtyRepository = AppDataSource.getRepository(Specialty);
    this.userRepository = AppDataSource.getRepository(User);
  }

  async create(data: {
    name: string;
    code: string;
    specialtyId: string;
    year: number;
  }, userId?: string, userRole?: string): Promise<Level> {
    // Check if specialty exists
    const specialty = await this.specialtyRepository.findOne({
      where: { id: data.specialtyId },
      relations: ['department'],
    });

    if (!specialty) {
      throw new AppError('Specialty not found', 404);
    }

    // Department head authorization: can only create levels for specialties in their department
    if (userRole === 'department_head' && userId) {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['department'],
      });
      
      if (!user?.department || !specialty.department || 
          user.department.id !== specialty.department.id) {
        throw new AppError('You can only create levels for specialties in your department', 403);
      }
    }

    if (!specialty) {
      throw new AppError('Specialty not found', 404);
    }

    // Check if level code already exists for this specialty
    const existingLevel = await this.levelRepository.findOne({
      where: {
        code: data.code,
        specialty: { id: data.specialtyId },
      },
    });

    if (existingLevel) {
      throw new AppError('Level code already exists for this specialty', 400);
    }

    const level = this.levelRepository.create({
      name: data.name,
      code: data.code,
      specialty,
      year: data.year,
    });

    return await this.levelRepository.save(level);
  }

  async getAll(filters?: {
    specialtyId?: string;
    search?: string;
  }): Promise<Level[]> {
    const query = this.levelRepository
      .createQueryBuilder('level')
      .leftJoinAndSelect('level.specialty', 'specialty')
      .leftJoinAndSelect('specialty.department', 'department')
      .leftJoinAndSelect('level.groups', 'groups')
      .orderBy('level.year', 'ASC')
      .addOrderBy('level.name', 'ASC');

    if (filters?.specialtyId) {
      query.andWhere('level.specialtyId = :specialtyId', {
        specialtyId: filters.specialtyId,
      });
    }

    if (filters?.search) {
      query.andWhere(
        '(level.name ILIKE :search OR level.code ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    return await query.getMany();
  }

  async getById(id: string): Promise<Level> {
    const level = await this.levelRepository.findOne({
      where: { id },
      relations: ['specialty', 'specialty.department', 'groups'],
    });

    if (!level) {
      throw new AppError('Level not found', 404);
    }

    return level;
  }

  async update(
    id: string,
    data: {
      name?: string;
      code?: string;
      specialtyId?: string;
      year?: number;
    },
    userId?: string,
    userRole?: string
  ): Promise<Level> {
    const level = await this.getById(id);

    // Department head authorization: can only update levels in their department
    if (userRole === 'department_head' && userId) {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['department'],
      });
      
      if (!user?.department || !level.specialty?.department || 
          user.department.id !== level.specialty.department.id) {
        throw new AppError('You can only update levels in your department', 403);
      }
      
      // If changing specialty, verify new specialty is also in their department
      if (data.specialtyId && data.specialtyId !== level.specialty.id) {
        const newSpecialty = await this.specialtyRepository.findOne({
          where: { id: data.specialtyId },
          relations: ['department'],
        });
        
        if (!newSpecialty?.department || newSpecialty.department.id !== user.department.id) {
          throw new AppError('You can only assign levels to specialties in your department', 403);
        }
      }
    }

    // Check if new code conflicts with existing level in the same specialty
    if (data.code && data.code !== level.code) {
      const specialtyId = data.specialtyId || level.specialty.id;
      const existingLevel = await this.levelRepository.findOne({
        where: {
          code: data.code,
          specialty: { id: specialtyId },
        },
      });

      if (existingLevel && existingLevel.id !== id) {
        throw new AppError('Level code already exists for this specialty', 400);
      }
    }

    // Check if specialty exists if changing specialty
    if (data.specialtyId && data.specialtyId !== level.specialty.id) {
      const specialty = await this.specialtyRepository.findOne({
        where: { id: data.specialtyId },
      });

      if (!specialty) {
        throw new AppError('Specialty not found', 404);
      }

      level.specialty = specialty;
    }

    if (data.name) level.name = data.name;
    if (data.code) level.code = data.code;
    if (data.year !== undefined) level.year = data.year;

    return await this.levelRepository.save(level);
  }

  async delete(id: string, userId?: string, userRole?: string): Promise<void> {
    const level = await this.levelRepository.findOne({
      where: { id },
      relations: ['groups', 'specialty', 'specialty.department'],
    });

    if (!level) {
      throw new AppError('Level not found', 404);
    }

    // Department head authorization: can only delete levels in their department
    if (userRole === 'department_head' && userId) {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['department'],
      });
      
      if (!user?.department || !level.specialty?.department || 
          user.department.id !== level.specialty.department.id) {
        throw new AppError('You can only delete levels in your department', 403);
      }
    }

    // Check if level has associated groups
    if (level.groups && level.groups.length > 0) {
      throw new AppError(
        'Cannot delete level with associated groups. Please delete groups first.',
        400
      );
    }

    await this.levelRepository.remove(level);
  }
}
