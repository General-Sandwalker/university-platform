import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Group } from '../entities/Group';
import { Level } from '../entities/Level';
import { User } from '../entities/User';
import { AppError } from '../middleware/errorHandler';

export class GroupService {
  private groupRepository: Repository<Group>;
  private levelRepository: Repository<Level>;
  private userRepository: Repository<User>;

  constructor() {
    this.groupRepository = AppDataSource.getRepository(Group);
    this.levelRepository = AppDataSource.getRepository(Level);
    this.userRepository = AppDataSource.getRepository(User);
  }

  async create(data: {
    name: string;
    code: string;
    levelId: string;
    capacity: number;
  }): Promise<Group> {
    // Check if level exists
    const level = await this.levelRepository.findOne({
      where: { id: data.levelId },
    });

    if (!level) {
      throw new AppError('Level not found', 404);
    }

    // Check if group code already exists for this level
    const existingGroup = await this.groupRepository.findOne({
      where: {
        code: data.code,
        level: { id: data.levelId },
      },
    });

    if (existingGroup) {
      throw new AppError('Group code already exists for this level', 400);
    }

    const group = this.groupRepository.create({
      name: data.name,
      code: data.code,
      level,
      capacity: data.capacity,
    });

    return await this.groupRepository.save(group);
  }

  async getAll(filters?: {
    levelId?: string;
    specialtyId?: string;
    search?: string;
  }): Promise<Group[]> {
    const query = this.groupRepository
      .createQueryBuilder('group')
      .leftJoinAndSelect('group.level', 'level')
      .leftJoinAndSelect('level.specialty', 'specialty')
      .leftJoinAndSelect('specialty.department', 'department')
      .leftJoinAndSelect('group.students', 'students')
      .orderBy('group.name', 'ASC');

    if (filters?.levelId) {
      query.andWhere('group.levelId = :levelId', {
        levelId: filters.levelId,
      });
    }

    if (filters?.specialtyId) {
      query.andWhere('level.specialtyId = :specialtyId', {
        specialtyId: filters.specialtyId,
      });
    }

    if (filters?.search) {
      query.andWhere(
        '(group.name ILIKE :search OR group.code ILIKE :search)',
        { search: `%${filters.search}%` }
      );
    }

    return await query.getMany();
  }

  async getById(id: string): Promise<Group> {
    const group = await this.groupRepository.findOne({
      where: { id },
      relations: [
        'level',
        'level.specialty',
        'level.specialty.department',
        'students',
        'timetables',
      ],
    });

    if (!group) {
      throw new AppError('Group not found', 404);
    }

    return group;
  }

  async update(
    id: string,
    data: {
      name?: string;
      code?: string;
      levelId?: string;
      capacity?: number;
    }
  ): Promise<Group> {
    const group = await this.getById(id);

    // Check if new code conflicts with existing group in the same level
    if (data.code && data.code !== group.code) {
      const levelId = data.levelId || group.level.id;
      const existingGroup = await this.groupRepository.findOne({
        where: {
          code: data.code,
          level: { id: levelId },
        },
      });

      if (existingGroup && existingGroup.id !== id) {
        throw new AppError('Group code already exists for this level', 400);
      }
    }

    // Check if level exists if changing level
    if (data.levelId && data.levelId !== group.level.id) {
      const level = await this.levelRepository.findOne({
        where: { id: data.levelId },
      });

      if (!level) {
        throw new AppError('Level not found', 404);
      }

      group.level = level;
    }

    // Check if new capacity is sufficient for current students
    if (data.capacity !== undefined && data.capacity < group.students.length) {
      throw new AppError(
        `Cannot reduce capacity below current student count (${group.students.length})`,
        400
      );
    }

    if (data.name) group.name = data.name;
    if (data.code) group.code = data.code;
    if (data.capacity !== undefined) group.capacity = data.capacity;

    return await this.groupRepository.save(group);
  }

  async delete(id: string): Promise<void> {
    const group = await this.groupRepository.findOne({
      where: { id },
      relations: ['students', 'timetables'],
    });

    if (!group) {
      throw new AppError('Group not found', 404);
    }

    // Check if group has students
    if (group.students && group.students.length > 0) {
      throw new AppError(
        'Cannot delete group with students. Please reassign students first.',
        400
      );
    }

    // Check if group has timetable entries
    if (group.timetables && group.timetables.length > 0) {
      throw new AppError(
        'Cannot delete group with timetable entries. Please delete timetables first.',
        400
      );
    }

    await this.groupRepository.remove(group);
  }

  async addStudent(groupId: string, studentId: string): Promise<Group> {
    const group = await this.getById(groupId);

    // Check if group is at capacity
    if (group.students.length >= group.capacity) {
      throw new AppError('Group is at full capacity', 400);
    }

    // Check if student exists and is a student role
    const student = await this.userRepository.findOne({
      where: { id: studentId },
      relations: ['group'],
    });

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    if (student.role !== 'student') {
      throw new AppError('User is not a student', 400);
    }

    // Check if student is already in a group
    if (student.group) {
      throw new AppError(
        'Student is already assigned to a group. Please remove from current group first.',
        400
      );
    }

    student.group = group;
    await this.userRepository.save(student);

    return await this.getById(groupId);
  }

  async removeStudent(groupId: string, studentId: string): Promise<Group> {
    const group = await this.getById(groupId);

    const student = await this.userRepository.findOne({
      where: { id: studentId },
      relations: ['group'],
    });

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    if (!student.group || student.group.id !== groupId) {
      throw new AppError('Student is not in this group', 400);
    }

    student.group = null;
    await this.userRepository.save(student);

    return await this.getById(groupId);
  }
}
