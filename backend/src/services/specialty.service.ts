import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Specialty } from '../entities/Specialty';
import { Department } from '../entities/Department';
import { AppError } from '../middleware/errorHandler';

export class SpecialtyService {
  private specialtyRepository: Repository<Specialty>;
  private departmentRepository: Repository<Department>;

  constructor() {
    this.specialtyRepository = AppDataSource.getRepository(Specialty);
    this.departmentRepository = AppDataSource.getRepository(Department);
  }

  async create(data: {
    name: string;
    code: string;
    departmentId: string;
    description?: string;
  }): Promise<Specialty> {
    // Check if department exists
    const department = await this.departmentRepository.findOne({
      where: { id: data.departmentId },
    });

    if (!department) {
      throw new AppError('Department not found', 404);
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
    }
  ): Promise<Specialty> {
    const specialty = await this.getById(id);

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

  async delete(id: string): Promise<void> {
    const specialty = await this.specialtyRepository.findOne({
      where: { id },
      relations: ['levels', 'subjects'],
    });

    if (!specialty) {
      throw new AppError('Specialty not found', 404);
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
