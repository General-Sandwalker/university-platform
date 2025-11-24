import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Level } from '../entities/Level';
import { Specialty } from '../entities/Specialty';
import { AppError } from '../middleware/errorHandler';

export class LevelService {
  private levelRepository: Repository<Level>;
  private specialtyRepository: Repository<Specialty>;

  constructor() {
    this.levelRepository = AppDataSource.getRepository(Level);
    this.specialtyRepository = AppDataSource.getRepository(Specialty);
  }

  async create(data: {
    name: string;
    code: string;
    specialtyId: string;
    order: number;
  }): Promise<Level> {
    // Check if specialty exists
    const specialty = await this.specialtyRepository.findOne({
      where: { id: data.specialtyId },
    });

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
      order: data.order,
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
      .orderBy('level.order', 'ASC')
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
      relations: ['specialty', 'specialty.department', 'groups', 'subjects'],
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
      order?: number;
    }
  ): Promise<Level> {
    const level = await this.getById(id);

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
    if (data.order !== undefined) level.order = data.order;

    return await this.levelRepository.save(level);
  }

  async delete(id: string): Promise<void> {
    const level = await this.levelRepository.findOne({
      where: { id },
      relations: ['groups', 'subjects'],
    });

    if (!level) {
      throw new AppError('Level not found', 404);
    }

    // Check if level has associated groups or subjects
    if (level.groups && level.groups.length > 0) {
      throw new AppError(
        'Cannot delete level with associated groups. Please delete groups first.',
        400
      );
    }

    if (level.subjects && level.subjects.length > 0) {
      throw new AppError(
        'Cannot delete level with associated subjects. Please delete subjects first.',
        400
      );
    }

    await this.levelRepository.remove(level);
  }
}
