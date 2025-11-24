import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Subject } from '../entities/Subject';
import { Specialty } from '../entities/Specialty';
import { Level } from '../entities/Level';
import { User } from '../entities/User';
import { AppError } from '../middleware/errorHandler';

export class SubjectService {
  private subjectRepository: Repository<Subject>;
  private specialtyRepository: Repository<Specialty>;
  private levelRepository: Repository<Level>;
  private userRepository: Repository<User>;

  constructor() {
    this.subjectRepository = AppDataSource.getRepository(Subject);
    this.specialtyRepository = AppDataSource.getRepository(Specialty);
    this.levelRepository = AppDataSource.getRepository(Level);
    this.userRepository = AppDataSource.getRepository(User);
  }

  async create(data: {
    name: string;
    code: string;
    specialtyId: string;
    levelId: string;
    credits: number;
    coefficient: number;
    semester: number;
    type: 'lecture' | 'td' | 'tp';
    teacherId?: string;
  }): Promise<Subject> {
    // Check if specialty exists
    const specialty = await this.specialtyRepository.findOne({
      where: { id: data.specialtyId },
    });

    if (!specialty) {
      throw new AppError('Specialty not found', 404);
    }

    // Check if level exists and belongs to the specialty
    const level = await this.levelRepository.findOne({
      where: { id: data.levelId },
      relations: ['specialty'],
    });

    if (!level) {
      throw new AppError('Level not found', 404);
    }

    if (level.specialty.id !== data.specialtyId) {
      throw new AppError('Level does not belong to the specified specialty', 400);
    }

    // Check if subject code already exists for this specialty
    const existingSubject = await this.subjectRepository.findOne({
      where: {
        code: data.code,
        specialty: { id: data.specialtyId },
      },
    });

    if (existingSubject) {
      throw new AppError('Subject code already exists for this specialty', 400);
    }

    // Check if teacher exists if provided
    let teacher: User | undefined;
    if (data.teacherId) {
      teacher = await this.userRepository.findOne({
        where: { id: data.teacherId },
      });

      if (!teacher) {
        throw new AppError('Teacher not found', 404);
      }

      if (teacher.role !== 'teacher' && teacher.role !== 'department_head') {
        throw new AppError('User is not a teacher', 400);
      }
    }

    const subject = this.subjectRepository.create({
      name: data.name,
      code: data.code,
      specialty,
      level,
      credits: data.credits,
      coefficient: data.coefficient,
      semester: data.semester,
      type: data.type,
      teacher,
    });

    return await this.subjectRepository.save(subject);
  }

  async getAll(filters?: {
    specialtyId?: string;
    levelId?: string;
    teacherId?: string;
    semester?: number;
    type?: 'lecture' | 'td' | 'tp';
    search?: string;
  }): Promise<Subject[]> {
    const query = this.subjectRepository
      .createQueryBuilder('subject')
      .leftJoinAndSelect('subject.specialty', 'specialty')
      .leftJoinAndSelect('subject.level', 'level')
      .leftJoinAndSelect('subject.teacher', 'teacher')
      .orderBy('subject.name', 'ASC');

    if (filters?.specialtyId) {
      query.andWhere('subject.specialtyId = :specialtyId', {
        specialtyId: filters.specialtyId,
      });
    }

    if (filters?.levelId) {
      query.andWhere('subject.levelId = :levelId', {
        levelId: filters.levelId,
      });
    }

    if (filters?.teacherId) {
      query.andWhere('subject.teacherId = :teacherId', {
        teacherId: filters.teacherId,
      });
    }

    if (filters?.semester) {
      query.andWhere('subject.semester = :semester', {
        semester: filters.semester,
      });
    }

    if (filters?.type) {
      query.andWhere('subject.type = :type', {
        type: filters.type,
      });
    }

    if (filters?.search) {
      query.andWhere(
        '(subject.name ILIKE :search OR subject.code ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    return await query.getMany();
  }

  async getById(id: string): Promise<Subject> {
    const subject = await this.subjectRepository.findOne({
      where: { id },
      relations: [
        'specialty',
        'specialty.department',
        'level',
        'teacher',
        'timetables',
      ],
    });

    if (!subject) {
      throw new AppError('Subject not found', 404);
    }

    return subject;
  }

  async update(
    id: string,
    data: {
      name?: string;
      code?: string;
      specialtyId?: string;
      levelId?: string;
      credits?: number;
      coefficient?: number;
      semester?: number;
      type?: 'lecture' | 'td' | 'tp';
      teacherId?: string;
    }
  ): Promise<Subject> {
    const subject = await this.getById(id);

    // Check if new code conflicts with existing subject in the same specialty
    if (data.code && data.code !== subject.code) {
      const specialtyId = data.specialtyId || subject.specialty.id;
      const existingSubject = await this.subjectRepository.findOne({
        where: {
          code: data.code,
          specialty: { id: specialtyId },
        },
      });

      if (existingSubject && existingSubject.id !== id) {
        throw new AppError('Subject code already exists for this specialty', 400);
      }
    }

    // Check if specialty exists if changing specialty
    if (data.specialtyId && data.specialtyId !== subject.specialty.id) {
      const specialty = await this.specialtyRepository.findOne({
        where: { id: data.specialtyId },
      });

      if (!specialty) {
        throw new AppError('Specialty not found', 404);
      }

      subject.specialty = specialty;
    }

    // Check if level exists and belongs to specialty if changing level
    if (data.levelId && data.levelId !== subject.level.id) {
      const level = await this.levelRepository.findOne({
        where: { id: data.levelId },
        relations: ['specialty'],
      });

      if (!level) {
        throw new AppError('Level not found', 404);
      }

      const targetSpecialtyId = data.specialtyId || subject.specialty.id;
      if (level.specialty.id !== targetSpecialtyId) {
        throw new AppError('Level does not belong to the specified specialty', 400);
      }

      subject.level = level;
    }

    // Check if teacher exists if changing teacher
    if (data.teacherId) {
      if (data.teacherId !== subject.teacher?.id) {
        const teacher = await this.userRepository.findOne({
          where: { id: data.teacherId },
        });

        if (!teacher) {
          throw new AppError('Teacher not found', 404);
        }

        if (teacher.role !== 'teacher' && teacher.role !== 'department_head') {
          throw new AppError('User is not a teacher', 400);
        }

        subject.teacher = teacher;
      }
    }

    if (data.name) subject.name = data.name;
    if (data.code) subject.code = data.code;
    if (data.credits !== undefined) subject.credits = data.credits;
    if (data.coefficient !== undefined) subject.coefficient = data.coefficient;
    if (data.semester !== undefined) subject.semester = data.semester;
    if (data.type) subject.type = data.type;

    return await this.subjectRepository.save(subject);
  }

  async delete(id: string): Promise<void> {
    const subject = await this.subjectRepository.findOne({
      where: { id },
      relations: ['timetables'],
    });

    if (!subject) {
      throw new AppError('Subject not found', 404);
    }

    // Check if subject has timetable entries
    if (subject.timetables && subject.timetables.length > 0) {
      throw new AppError(
        'Cannot delete subject with timetable entries. Please delete timetables first.',
        400
      );
    }

    await this.subjectRepository.remove(subject);
  }

  async assignTeacher(subjectId: string, teacherId: string): Promise<Subject> {
    const subject = await this.getById(subjectId);

    const teacher = await this.userRepository.findOne({
      where: { id: teacherId },
    });

    if (!teacher) {
      throw new AppError('Teacher not found', 404);
    }

    if (teacher.role !== 'teacher' && teacher.role !== 'department_head') {
      throw new AppError('User is not a teacher', 400);
    }

    subject.teacher = teacher;
    return await this.subjectRepository.save(subject);
  }

  async unassignTeacher(subjectId: string): Promise<Subject> {
    const subject = await this.getById(subjectId);
    subject.teacher = null;
    return await this.subjectRepository.save(subject);
  }
}
