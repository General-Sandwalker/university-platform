import { Repository, Between, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Timetable } from '../entities/Timetable';
import { Subject } from '../entities/Subject';
import { User } from '../entities/User';
import { Room } from '../entities/Room';
import { Group } from '../entities/Group';
import { AppError } from '../middleware/errorHandler';

export class TimetableService {
  private timetableRepository: Repository<Timetable>;
  private subjectRepository: Repository<Subject>;
  private userRepository: Repository<User>;
  private roomRepository: Repository<Room>;
  private groupRepository: Repository<Group>;

  constructor() {
    this.timetableRepository = AppDataSource.getRepository(Timetable);
    this.subjectRepository = AppDataSource.getRepository(Subject);
    this.userRepository = AppDataSource.getRepository(User);
    this.roomRepository = AppDataSource.getRepository(Room);
    this.groupRepository = AppDataSource.getRepository(Group);
  }

  private parseTime(time: string): { hours: number; minutes: number } {
    const [hours, minutes] = time.split(':').map(Number);
    return { hours, minutes };
  }

  private timeToMinutes(time: string): number {
    const { hours, minutes } = this.parseTime(time);
    return hours * 60 + minutes;
  }

  private async checkTeacherConflict(
    teacherId: string,
    date: Date,
    startTime: string,
    endTime: string,
    excludeId?: string
  ): Promise<boolean> {
    const query = this.timetableRepository
      .createQueryBuilder('timetable')
      .where('timetable.teacherId = :teacherId', { teacherId })
      .andWhere('timetable.date = :date', { date });

    if (excludeId) {
      query.andWhere('timetable.id != :excludeId', { excludeId });
    }

    const existingEntries = await query.getMany();

    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = this.timeToMinutes(endTime);

    for (const entry of existingEntries) {
      const existingStart = this.timeToMinutes(entry.startTime);
      const existingEnd = this.timeToMinutes(entry.endTime);

      // Check for overlap
      if (
        (startMinutes >= existingStart && startMinutes < existingEnd) ||
        (endMinutes > existingStart && endMinutes <= existingEnd) ||
        (startMinutes <= existingStart && endMinutes >= existingEnd)
      ) {
        return true; // Conflict found
      }
    }

    return false; // No conflict
  }

  private async checkRoomConflict(
    roomId: string,
    date: Date,
    startTime: string,
    endTime: string,
    excludeId?: string
  ): Promise<boolean> {
    const query = this.timetableRepository
      .createQueryBuilder('timetable')
      .where('timetable.roomId = :roomId', { roomId })
      .andWhere('timetable.date = :date', { date });

    if (excludeId) {
      query.andWhere('timetable.id != :excludeId', { excludeId });
    }

    const existingEntries = await query.getMany();

    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = this.timeToMinutes(endTime);

    for (const entry of existingEntries) {
      const existingStart = this.timeToMinutes(entry.startTime);
      const existingEnd = this.timeToMinutes(entry.endTime);

      if (
        (startMinutes >= existingStart && startMinutes < existingEnd) ||
        (endMinutes > existingStart && endMinutes <= existingEnd) ||
        (startMinutes <= existingStart && endMinutes >= existingEnd)
      ) {
        return true; // Conflict found
      }
    }

    return false;
  }

  private async checkGroupConflict(
    groupId: string,
    date: Date,
    startTime: string,
    endTime: string,
    excludeId?: string
  ): Promise<boolean> {
    const query = this.timetableRepository
      .createQueryBuilder('timetable')
      .where('timetable.groupId = :groupId', { groupId })
      .andWhere('timetable.date = :date', { date });

    if (excludeId) {
      query.andWhere('timetable.id != :excludeId', { excludeId });
    }

    const existingEntries = await query.getMany();

    const startMinutes = this.timeToMinutes(startTime);
    const endMinutes = this.timeToMinutes(endTime);

    for (const entry of existingEntries) {
      const existingStart = this.timeToMinutes(entry.startTime);
      const existingEnd = this.timeToMinutes(entry.endTime);

      if (
        (startMinutes >= existingStart && startMinutes < existingEnd) ||
        (endMinutes > existingStart && endMinutes <= existingEnd) ||
        (startMinutes <= existingStart && endMinutes >= existingEnd)
      ) {
        return true; // Conflict found
      }
    }

    return false;
  }

  async create(data: {
    date: string;
    startTime: string;
    endTime: string;
    subjectId: string;
    teacherId: string;
    roomId: string;
    groupId: string;
    sessionType: 'lecture' | 'td' | 'tp' | 'exam' | 'makeup';
    notes?: string;
  }): Promise<Timetable> {
    // Validate entities exist
    const subject = await this.subjectRepository.findOne({
      where: { id: data.subjectId },
    });
    if (!subject) {
      throw new AppError('Subject not found', 404);
    }

    const teacher = await this.userRepository.findOne({
      where: { id: data.teacherId },
    });
    if (!teacher || (teacher.role !== 'teacher' && teacher.role !== 'department_head')) {
      throw new AppError('Teacher not found or invalid role', 404);
    }

    const room = await this.roomRepository.findOne({
      where: { id: data.roomId },
    });
    if (!room) {
      throw new AppError('Room not found', 404);
    }

    const group = await this.groupRepository.findOne({
      where: { id: data.groupId },
      relations: ['students'],
    });
    if (!group) {
      throw new AppError('Group not found', 404);
    }

    // Validate time format
    if (!/^\d{2}:\d{2}$/.test(data.startTime) || !/^\d{2}:\d{2}$/.test(data.endTime)) {
      throw new AppError('Invalid time format. Use HH:MM', 400);
    }

    // Validate start time is before end time
    if (this.timeToMinutes(data.startTime) >= this.timeToMinutes(data.endTime)) {
      throw new AppError('Start time must be before end time', 400);
    }

    // Parse date
    const date = new Date(data.date);
    if (isNaN(date.getTime())) {
      throw new AppError('Invalid date format', 400);
    }

    // Check for conflicts
    const teacherConflict = await this.checkTeacherConflict(
      data.teacherId,
      date,
      data.startTime,
      data.endTime
    );
    if (teacherConflict) {
      throw new AppError(
        'Teacher has a conflicting schedule at this time',
        409
      );
    }

    const roomConflict = await this.checkRoomConflict(
      data.roomId,
      date,
      data.startTime,
      data.endTime
    );
    if (roomConflict) {
      throw new AppError(
        'Room is already booked at this time',
        409
      );
    }

    const groupConflict = await this.checkGroupConflict(
      data.groupId,
      date,
      data.startTime,
      data.endTime
    );
    if (groupConflict) {
      throw new AppError(
        'Group has a conflicting schedule at this time',
        409
      );
    }

    // Check room capacity vs group size
    if (group.students && group.students.length > room.capacity) {
      throw new AppError(
        `Room capacity (${room.capacity}) is insufficient for group size (${group.students.length})`,
        400
      );
    }

    // Create timetable entry
    const timetable = this.timetableRepository.create({
      date,
      startTime: data.startTime,
      endTime: data.endTime,
      subject,
      teacher,
      room,
      group,
      sessionType: data.sessionType,
      notes: data.notes,
    });

    return await this.timetableRepository.save(timetable);
  }

  async getAll(filters?: {
    teacherId?: string;
    groupId?: string;
    roomId?: string;
    subjectId?: string;
    startDate?: string;
    endDate?: string;
    sessionType?: string;
  }): Promise<Timetable[]> {
    const query = this.timetableRepository
      .createQueryBuilder('timetable')
      .leftJoinAndSelect('timetable.subject', 'subject')
      .leftJoinAndSelect('timetable.teacher', 'teacher')
      .leftJoinAndSelect('timetable.room', 'room')
      .leftJoinAndSelect('timetable.group', 'group')
      .orderBy('timetable.date', 'ASC')
      .addOrderBy('timetable.startTime', 'ASC');

    if (filters?.teacherId) {
      query.andWhere('timetable.teacherId = :teacherId', {
        teacherId: filters.teacherId,
      });
    }

    if (filters?.groupId) {
      query.andWhere('timetable.groupId = :groupId', {
        groupId: filters.groupId,
      });
    }

    if (filters?.roomId) {
      query.andWhere('timetable.roomId = :roomId', {
        roomId: filters.roomId,
      });
    }

    if (filters?.subjectId) {
      query.andWhere('timetable.subjectId = :subjectId', {
        subjectId: filters.subjectId,
      });
    }

    if (filters?.sessionType) {
      query.andWhere('timetable.sessionType = :sessionType', {
        sessionType: filters.sessionType,
      });
    }

    if (filters?.startDate) {
      query.andWhere('timetable.date >= :startDate', {
        startDate: new Date(filters.startDate),
      });
    }

    if (filters?.endDate) {
      query.andWhere('timetable.date <= :endDate', {
        endDate: new Date(filters.endDate),
      });
    }

    return await query.getMany();
  }

  async getById(id: string): Promise<Timetable> {
    const timetable = await this.timetableRepository.findOne({
      where: { id },
      relations: [
        'subject',
        'subject.specialty',
        'subject.level',
        'teacher',
        'room',
        'group',
        'group.level',
        'absences',
      ],
    });

    if (!timetable) {
      throw new AppError('Timetable entry not found', 404);
    }

    return timetable;
  }

  async getStudentSchedule(
    studentId: string,
    startDate?: string,
    endDate?: string
  ): Promise<Timetable[]> {
    // Get student's group
    const student = await this.userRepository.findOne({
      where: { id: studentId },
      relations: ['group'],
    });

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    if (!student.group) {
      return []; // Student not assigned to any group
    }

    const filters: any = {
      groupId: student.group.id,
    };

    if (startDate) filters.startDate = startDate;
    if (endDate) filters.endDate = endDate;

    return await this.getAll(filters);
  }

  async update(
    id: string,
    data: {
      date?: string;
      startTime?: string;
      endTime?: string;
      subjectId?: string;
      teacherId?: string;
      roomId?: string;
      groupId?: string;
      sessionType?: 'lecture' | 'td' | 'tp' | 'exam' | 'makeup';
      notes?: string;
    }
  ): Promise<Timetable> {
    const timetable = await this.getById(id);

    // Prepare updated values
    const updatedDate = data.date ? new Date(data.date) : timetable.date;
    const updatedStartTime = data.startTime || timetable.startTime;
    const updatedEndTime = data.endTime || timetable.endTime;
    const updatedTeacherId = data.teacherId || timetable.teacher.id;
    const updatedRoomId = data.roomId || timetable.room.id;
    const updatedGroupId = data.groupId || timetable.group.id;

    // Validate time if changed
    if (data.startTime || data.endTime) {
      if (this.timeToMinutes(updatedStartTime) >= this.timeToMinutes(updatedEndTime)) {
        throw new AppError('Start time must be before end time', 400);
      }
    }

    // Check conflicts if time, date, teacher, room, or group changed
    if (
      data.date ||
      data.startTime ||
      data.endTime ||
      data.teacherId ||
      data.roomId ||
      data.groupId
    ) {
      if (data.teacherId || data.startTime || data.endTime || data.date) {
        const teacherConflict = await this.checkTeacherConflict(
          updatedTeacherId,
          updatedDate,
          updatedStartTime,
          updatedEndTime,
          id
        );
        if (teacherConflict) {
          throw new AppError(
            'Teacher has a conflicting schedule at this time',
            409
          );
        }
      }

      if (data.roomId || data.startTime || data.endTime || data.date) {
        const roomConflict = await this.checkRoomConflict(
          updatedRoomId,
          updatedDate,
          updatedStartTime,
          updatedEndTime,
          id
        );
        if (roomConflict) {
          throw new AppError('Room is already booked at this time', 409);
        }
      }

      if (data.groupId || data.startTime || data.endTime || data.date) {
        const groupConflict = await this.checkGroupConflict(
          updatedGroupId,
          updatedDate,
          updatedStartTime,
          updatedEndTime,
          id
        );
        if (groupConflict) {
          throw new AppError(
            'Group has a conflicting schedule at this time',
            409
          );
        }
      }
    }

    // Update entities if IDs changed
    if (data.subjectId && data.subjectId !== timetable.subject.id) {
      const subject = await this.subjectRepository.findOne({
        where: { id: data.subjectId },
      });
      if (!subject) {
        throw new AppError('Subject not found', 404);
      }
      timetable.subject = subject;
    }

    if (data.teacherId && data.teacherId !== timetable.teacher.id) {
      const teacher = await this.userRepository.findOne({
        where: { id: data.teacherId },
      });
      if (!teacher || (teacher.role !== 'teacher' && teacher.role !== 'department_head')) {
        throw new AppError('Teacher not found or invalid role', 404);
      }
      timetable.teacher = teacher;
    }

    if (data.roomId && data.roomId !== timetable.room.id) {
      const room = await this.roomRepository.findOne({
        where: { id: data.roomId },
      });
      if (!room) {
        throw new AppError('Room not found', 404);
      }
      timetable.room = room;
    }

    if (data.groupId && data.groupId !== timetable.group.id) {
      const group = await this.groupRepository.findOne({
        where: { id: data.groupId },
        relations: ['students'],
      });
      if (!group) {
        throw new AppError('Group not found', 404);
      }
      timetable.group = group;

      // Check capacity
      if (group.students && group.students.length > timetable.room.capacity) {
        throw new AppError(
          `Room capacity (${timetable.room.capacity}) is insufficient for group size (${group.students.length})`,
          400
        );
      }
    }

    // Update simple fields
    if (data.date) timetable.date = updatedDate;
    if (data.startTime) timetable.startTime = data.startTime;
    if (data.endTime) timetable.endTime = data.endTime;
    if (data.sessionType) timetable.sessionType = data.sessionType;
    if (data.notes !== undefined) timetable.notes = data.notes;

    return await this.timetableRepository.save(timetable);
  }

  async delete(id: string): Promise<void> {
    const timetable = await this.timetableRepository.findOne({
      where: { id },
      relations: ['absences'],
    });

    if (!timetable) {
      throw new AppError('Timetable entry not found', 404);
    }

    // Check if there are recorded absences
    if (timetable.absences && timetable.absences.length > 0) {
      throw new AppError(
        'Cannot delete timetable entry with recorded absences. Please delete absences first.',
        400
      );
    }

    await this.timetableRepository.remove(timetable);
  }

  async checkAvailability(data: {
    teacherId?: string;
    roomId?: string;
    groupId?: string;
    date: string;
    startTime: string;
    endTime: string;
  }): Promise<{
    available: boolean;
    conflicts: string[];
  }> {
    const date = new Date(data.date);
    const conflicts: string[] = [];

    if (data.teacherId) {
      const hasConflict = await this.checkTeacherConflict(
        data.teacherId,
        date,
        data.startTime,
        data.endTime
      );
      if (hasConflict) {
        conflicts.push('Teacher is not available at this time');
      }
    }

    if (data.roomId) {
      const hasConflict = await this.checkRoomConflict(
        data.roomId,
        date,
        data.startTime,
        data.endTime
      );
      if (hasConflict) {
        conflicts.push('Room is already booked at this time');
      }
    }

    if (data.groupId) {
      const hasConflict = await this.checkGroupConflict(
        data.groupId,
        date,
        data.startTime,
        data.endTime
      );
      if (hasConflict) {
        conflicts.push('Group has a conflicting schedule at this time');
      }
    }

    return {
      available: conflicts.length === 0,
      conflicts,
    };
  }
}
