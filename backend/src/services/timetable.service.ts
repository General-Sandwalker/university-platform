import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Timetable, DayOfWeek } from '../entities/Timetable';
import { Subject } from '../entities/Subject';
import { User } from '../entities/User';
import { Room } from '../entities/Room';
import { Group } from '../entities/Group';
import { Semester } from '../entities/Semester';
import { Department } from '../entities/Department';
import { AppError } from '../middleware/errorHandler';

export class TimetableService {
  private timetableRepository: Repository<Timetable>;
  private subjectRepository: Repository<Subject>;
  private userRepository: Repository<User>;
  private roomRepository: Repository<Room>;
  private groupRepository: Repository<Group>;
  private semesterRepository: Repository<Semester>;
  private departmentRepository: Repository<Department>;

  constructor() {
    this.timetableRepository = AppDataSource.getRepository(Timetable);
    this.subjectRepository = AppDataSource.getRepository(Subject);
    this.userRepository = AppDataSource.getRepository(User);
    this.roomRepository = AppDataSource.getRepository(Room);
    this.groupRepository = AppDataSource.getRepository(Group);
    this.semesterRepository = AppDataSource.getRepository(Semester);
    this.departmentRepository = AppDataSource.getRepository(Department);
  }

  private timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  // Check if user can access a specific group's schedule
  async canAccessGroup(userId: string, userRole: string, groupId: string): Promise<boolean> {
    if (userRole === 'admin') {
      return true;
    }

    if (userRole === 'student') {
      // Students can only view their own group
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['group'],
      });
      return user?.group?.id === groupId;
    }

    if (userRole === 'department_head') {
      // Department heads can access groups in their department
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['department'],
      });

      const group = await this.groupRepository.findOne({
        where: { id: groupId },
        relations: ['level', 'level.specialty', 'level.specialty.department'],
      });

      return user?.department?.id === group?.level?.specialty?.department?.id;
    }

    if (userRole === 'teacher') {
      // Teachers can view schedules where they teach
      const count = await this.timetableRepository.count({
        where: { teacher: { id: userId }, group: { id: groupId } },
      });
      return count > 0;
    }

    return false;
  }

  // Check if user can edit a specific group's schedule
  async canEditGroup(userId: string, userRole: string, groupId: string): Promise<boolean> {
    if (userRole === 'admin') {
      return true;
    }

    if (userRole === 'department_head') {
      // Department heads can edit groups in their department
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['department'],
      });

      const group = await this.groupRepository.findOne({
        where: { id: groupId },
        relations: ['level', 'level.specialty', 'level.specialty.department'],
      });

      return user?.department?.id === group?.level?.specialty?.department?.id;
    }

    return false; // Students and teachers cannot edit
  }

  private async checkTimeConflict(
    semesterId: string,
    groupId: string,
    dayOfWeek: DayOfWeek,
    startTime: string,
    endTime: string,
    excludeId?: string
  ): Promise<{ hasConflict: boolean; conflictWith?: Timetable }> {
    const query = this.timetableRepository
      .createQueryBuilder('timetable')
      .leftJoinAndSelect('timetable.subject', 'subject')
      .leftJoinAndSelect('timetable.teacher', 'teacher')
      .leftJoinAndSelect('timetable.room', 'room')
      .where('timetable.semesterId = :semesterId', { semesterId })
      .andWhere('timetable.groupId = :groupId', { groupId })
      .andWhere('timetable.dayOfWeek = :dayOfWeek', { dayOfWeek });

    if (excludeId) {
      query.andWhere('timetable.id != :excludeId', { excludeId });
    }

    const existingEntries = await query.getMany();

    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = this.timeToMinutes(endTime);

    for (const entry of existingEntries) {
      const existingStart = this.timeToMinutes(entry.startTime);
      const existingEnd = this.timeToMinutes(entry.endTime);

      // Check for time overlap
      if (
        (startMinutes >= existingStart && startMinutes < existingEnd) ||
        (endMinutes > existingStart && endMinutes <= existingEnd) ||
        (startMinutes <= existingStart && endMinutes >= existingEnd)
      ) {
        return { hasConflict: true, conflictWith: entry };
      }
    }

    return { hasConflict: false };
  }

  async create(
    data: {
      dayOfWeek: DayOfWeek;
      startTime: string;
      endTime: string;
      subjectId: string;
      teacherId: string;
      roomId: string;
      groupId: string;
      semesterId: string;
      sessionType: string;
      notes?: string;
    },
    userId?: string,
    userRole?: string
  ): Promise<Timetable> {
    // Check edit permission
    if (userId && userRole) {
      const canEdit = await this.canEditGroup(userId, userRole, data.groupId);
      if (!canEdit) {
        throw new AppError(403, 'You do not have permission to edit this schedule');
      }
    }

    // Validate entities exist
    const [subject, teacher, room, group, semester] = await Promise.all([
      this.subjectRepository.findOne({ where: { id: data.subjectId } }),
      this.userRepository.findOne({ where: { id: data.teacherId } }),
      this.roomRepository.findOne({ where: { id: data.roomId } }),
      this.groupRepository.findOne({ where: { id: data.groupId } }),
      this.semesterRepository.findOne({ where: { id: data.semesterId } }),
    ]);

    if (!subject) throw new AppError(404, 'Subject not found');
    if (!teacher) throw new AppError(404, 'Teacher not found');
    if (!room) throw new AppError(404, 'Room not found');
    if (!group) throw new AppError(404, 'Group not found');
    if (!semester) throw new AppError(404, 'Semester not found');

    // Check for time conflicts
    const conflict = await this.checkTimeConflict(
      data.semesterId,
      data.groupId,
      data.dayOfWeek,
      data.startTime,
      data.endTime
    );

    if (conflict.hasConflict) {
      throw new AppError(
        409,
        `Time conflict: This slot overlaps with ${conflict.conflictWith?.subject?.name} at ${conflict.conflictWith?.startTime}-${conflict.conflictWith?.endTime}`
      );
    }

    const timetable = this.timetableRepository.create({
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime,
      endTime: data.endTime,
      subject,
      teacher,
      room,
      group,
      semester,
      sessionType: data.sessionType as any,
      notes: data.notes,
    });

    return await this.timetableRepository.save(timetable);
  }

  async getByGroup(
    groupId: string,
    semesterId?: string,
    userId?: string,
    userRole?: string
  ): Promise<Timetable[]> {
    // Check access permission
    if (userId && userRole) {
      const canAccess = await this.canAccessGroup(userId, userRole, groupId);
      if (!canAccess) {
        throw new AppError(403, 'You do not have permission to view this schedule');
      }
    }

    const query = this.timetableRepository
      .createQueryBuilder('timetable')
      .leftJoinAndSelect('timetable.subject', 'subject')
      .leftJoinAndSelect('timetable.teacher', 'teacher')
      .leftJoinAndSelect('timetable.room', 'room')
      .leftJoinAndSelect('timetable.group', 'group')
      .leftJoinAndSelect('timetable.semester', 'semester')
      .where('timetable.groupId = :groupId', { groupId });

    if (semesterId) {
      query.andWhere('timetable.semesterId = :semesterId', { semesterId });
    } else {
      // Get active semester if not specified
      const activeSemester = await this.semesterRepository.findOne({
        where: { isActive: true },
      });
      if (activeSemester) {
        query.andWhere('timetable.semesterId = :semesterId', {
          semesterId: activeSemester.id,
        });
      }
    }

    return await query.orderBy('timetable.dayOfWeek').addOrderBy('timetable.startTime').getMany();
  }

  async getById(id: string, userId?: string, userRole?: string): Promise<Timetable> {
    const timetable = await this.timetableRepository.findOne({
      where: { id },
      relations: ['subject', 'teacher', 'room', 'group', 'semester'],
    });

    if (!timetable) {
      throw new AppError(404, 'Timetable entry not found');
    }

    // Check access permission
    if (userId && userRole) {
      const canAccess = await this.canAccessGroup(userId, userRole, timetable.group.id);
      if (!canAccess) {
        throw new AppError(403, 'You do not have permission to view this schedule');
      }
    }

    return timetable;
  }

  async update(
    id: string,
    data: Partial<{
      dayOfWeek: DayOfWeek;
      startTime: string;
      endTime: string;
      subjectId: string;
      teacherId: string;
      roomId: string;
      groupId: string;
      semesterId: string;
      sessionType: string;
      notes: string;
    }>,
    userId?: string,
    userRole?: string
  ): Promise<Timetable> {
    const timetable = await this.getById(id);

    // Check edit permission
    if (userId && userRole) {
      const canEdit = await this.canEditGroup(userId, userRole, timetable.group.id);
      if (!canEdit) {
        throw new AppError(403, 'You do not have permission to edit this schedule');
      }
    }

    // Validate entities if being updated
    if (data.subjectId) {
      const subject = await this.subjectRepository.findOne({
        where: { id: data.subjectId },
      });
      if (!subject) throw new AppError(404, 'Subject not found');
      timetable.subject = subject;
    }

    if (data.teacherId) {
      const teacher = await this.userRepository.findOne({
        where: { id: data.teacherId },
      });
      if (!teacher) throw new AppError(404, 'Teacher not found');
      timetable.teacher = teacher;
    }

    if (data.roomId) {
      const room = await this.roomRepository.findOne({ where: { id: data.roomId } });
      if (!room) throw new AppError(404, 'Room not found');
      timetable.room = room;
    }

    if (data.groupId) {
      const group = await this.groupRepository.findOne({
        where: { id: data.groupId },
      });
      if (!group) throw new AppError(404, 'Group not found');
      timetable.group = group;
    }

    if (data.semesterId) {
      const semester = await this.semesterRepository.findOne({
        where: { id: data.semesterId },
      });
      if (!semester) throw new AppError(404, 'Semester not found');
      timetable.semester = semester;
    }

    // Check for conflicts if time or day is changing
    if (data.dayOfWeek || data.startTime || data.endTime) {
      const conflict = await this.checkTimeConflict(
        data.semesterId || timetable.semester.id,
        data.groupId || timetable.group.id,
        data.dayOfWeek || timetable.dayOfWeek,
        data.startTime || timetable.startTime,
        data.endTime || timetable.endTime,
        id
      );

      if (conflict.hasConflict) {
        throw new AppError(
          409,
          `Time conflict: This slot overlaps with ${conflict.conflictWith?.subject?.name}`
        );
      }
    }

    // Update simple fields
    Object.assign(timetable, {
      dayOfWeek: data.dayOfWeek,
      startTime: data.startTime,
      endTime: data.endTime,
      sessionType: data.sessionType,
      notes: data.notes,
    });

    return await this.timetableRepository.save(timetable);
  }

  async delete(id: string, userId?: string, userRole?: string): Promise<void> {
    const timetable = await this.getById(id);

    // Check edit permission
    if (userId && userRole) {
      const canEdit = await this.canEditGroup(userId, userRole, timetable.group.id);
      if (!canEdit) {
        throw new AppError(403, 'You do not have permission to delete this schedule entry');
      }
    }

    await this.timetableRepository.remove(timetable);
  }

  // Get all groups accessible to a user
  async getAccessibleGroups(userId: string, userRole: string): Promise<Group[]> {
    if (userRole === 'admin') {
      return await this.groupRepository.find({
        relations: ['level', 'level.specialty', 'level.specialty.department'],
        order: { code: 'ASC' },
      });
    }

    if (userRole === 'department_head') {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['department'],
      });

      if (!user?.department) return [];

      const groups = await this.groupRepository
        .createQueryBuilder('group')
        .leftJoinAndSelect('group.level', 'level')
        .leftJoinAndSelect('level.specialty', 'specialty')
        .leftJoinAndSelect('specialty.department', 'department')
        .where('department.id = :departmentId', {
          departmentId: user.department.id,
        })
        .orderBy('group.code', 'ASC')
        .getMany();

      return groups;
    }

    if (userRole === 'student') {
      const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['group', 'group.level', 'group.level.specialty', 'group.level.specialty.department'],
      });

      return user?.group ? [user.group] : [];
    }

    if (userRole === 'teacher') {
      // Get all groups where this teacher has classes
      const timetables = await this.timetableRepository.find({
        where: { teacher: { id: userId } },
        relations: ['group', 'group.level', 'group.level.specialty', 'group.level.specialty.department'],
      });

      // Deduplicate groups
      const groupMap = new Map<string, Group>();
      timetables.forEach((t) => {
        if (t.group) {
          groupMap.set(t.group.id, t.group);
        }
      });

      return Array.from(groupMap.values()).sort((a, b) => a.code.localeCompare(b.code));
    }

    return [];
  }
}
