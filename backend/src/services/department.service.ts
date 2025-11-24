import { Repository } from 'typeorm';
import { Department } from '../entities/Department';
import { AppDataSource } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

interface CreateDepartmentDto {
  code: string;
  name: string;
  description?: string;
}

interface UpdateDepartmentDto {
  code?: string;
  name?: string;
  description?: string;
  isActive?: boolean;
}

export class DepartmentService {
  private repository: Repository<Department>;

  constructor() {
    this.repository = AppDataSource.getRepository(Department);
  }

  async create(data: CreateDepartmentDto) {
    const existing = await this.repository.findOne({ where: { code: data.code } });
    if (existing) {
      throw new AppError(400, 'Department with this code already exists');
    }

    const department = this.repository.create(data);
    await this.repository.save(department);

    logger.info(`Department created: ${department.code}`);
    return department;
  }

  async getAll() {
    return this.repository.find({
      where: { isActive: true },
      relations: ['specialties'],
      order: { name: 'ASC' },
    });
  }

  async getById(id: string) {
    const department = await this.repository.findOne({
      where: { id },
      relations: ['specialties', 'subjects'],
    });

    if (!department) {
      throw new AppError(404, 'Department not found');
    }

    return department;
  }

  async update(id: string, data: UpdateDepartmentDto) {
    const department = await this.repository.findOne({ where: { id } });

    if (!department) {
      throw new AppError(404, 'Department not found');
    }

    if (data.code && data.code !== department.code) {
      const existing = await this.repository.findOne({ where: { code: data.code } });
      if (existing) {
        throw new AppError(400, 'Department code already in use');
      }
    }

    Object.assign(department, data);
    await this.repository.save(department);

    logger.info(`Department updated: ${department.code}`);
    return department;
  }

  async delete(id: string) {
    const department = await this.repository.findOne({ where: { id } });

    if (!department) {
      throw new AppError(404, 'Department not found');
    }

    await this.repository.remove(department);
    logger.info(`Department deleted: ${department.code}`);
  }
}
