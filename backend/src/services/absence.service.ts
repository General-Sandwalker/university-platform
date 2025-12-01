import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Absence } from '../entities/Absence';
import { User } from '../entities/User';
import { Timetable } from '../entities/Timetable';
import { AppError } from '../middleware/errorHandler';
import { sendAbsenceWarningEmail, sendEliminationRiskEmail } from '../utils/email';
import logger from '../utils/logger';
import { NotificationService } from './notification.service';

export class AbsenceService {
  private absenceRepository: Repository<Absence>;
  private userRepository: Repository<User>;
  private timetableRepository: Repository<Timetable>;
  private notificationService: NotificationService;

  constructor() {
    this.absenceRepository = AppDataSource.getRepository(Absence);
    this.userRepository = AppDataSource.getRepository(User);
    this.timetableRepository = AppDataSource.getRepository(Timetable);
    this.notificationService = new NotificationService();
  }

  async recordAbsence(data: {
    studentId: string;
    timetableEntryId: string;
    recordedById: string; // Teacher who recorded the absence
    status?: 'unexcused' | 'excused';
    excuseReason?: string;
  }): Promise<Absence> {
    // Verify student exists and is a student
    const student = await this.userRepository.findOne({
      where: { id: data.studentId },
    });

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    if (student.role !== 'student') {
      throw new AppError('User is not a student', 400);
    }

    // Verify timetable entry exists
    const timetableEntry = await this.timetableRepository.findOne({
      where: { id: data.timetableEntryId },
      relations: ['subject', 'teacher', 'group'],
    });

    if (!timetableEntry) {
      throw new AppError('Timetable entry not found', 404);
    }

    // Verify teacher exists
    const teacher = await this.userRepository.findOne({
      where: { id: data.recordedById },
    });

    if (!teacher || (teacher.role !== 'teacher' && teacher.role !== 'department_head' && teacher.role !== 'admin')) {
      throw new AppError('Invalid teacher', 400);
    }

    // Check if absence already recorded
    const existingAbsence = await this.absenceRepository.findOne({
      where: {
        student: { id: data.studentId },
        timetableEntry: { id: data.timetableEntryId },
      },
    });

    if (existingAbsence) {
      throw new AppError('Absence already recorded for this session', 400);
    }

    // Create absence record
    const absence = this.absenceRepository.create({
      student,
      timetableEntry,
      recordedBy: teacher,
      status: data.status || 'unexcused',
      excuseReason: data.excuseReason,
      reviewedBy: data.status === 'excused' ? teacher : undefined,
      reviewedAt: data.status === 'excused' ? new Date() : undefined,
    });

    const savedAbsence = await this.absenceRepository.save(absence);

    // Check absence count and send warnings
    await this.checkAndNotifyAbsences(data.studentId, timetableEntry.subject.id);

    return savedAbsence;
  }

  private async checkAndNotifyAbsences(
    studentId: string,
    subjectId: string
  ): Promise<void> {
    try {
      // Count absences for this student in this subject
      const absenceCount = await this.absenceRepository.count({
        where: {
          student: { id: studentId },
          timetableEntry: { subject: { id: subjectId } },
          status: 'unexcused',
        },
      });

      const student = await this.userRepository.findOne({
        where: { id: studentId },
      });

      if (!student) return;

      // Send warning at 3 absences
      if (absenceCount === 3) {
        await sendAbsenceWarningEmail(
          student.email,
          `${student.firstName} ${student.lastName}`,
          absenceCount
        );
        logger.info(`Sent absence warning email to ${student.email}`);
      }

      // Send elimination risk warning at 5 absences
      if (absenceCount >= 5) {
        await sendEliminationRiskEmail(
          student.email,
          `${student.firstName} ${student.lastName}`,
          absenceCount
        );
        logger.info(`Sent elimination risk email to ${student.email}`);

        // Update student status to eliminated if >= 5 absences
        if (student.status === 'active') {
          student.status = 'eliminated';
          await this.userRepository.save(student);
          logger.warn(
            `Student ${student.id} marked as eliminated due to ${absenceCount} absences`
          );
        }
      }
    } catch (error) {
      logger.error('Error checking/notifying absences:', error);
      // Don't throw error - this is a background task
    }
  }

  async submitExcuse(
    absenceId: string,
    studentId: string,
    excuseReason: string,
    documentPath?: string
  ): Promise<Absence> {
    const absence = await this.absenceRepository.findOne({
      where: { id: absenceId },
      relations: ['student', 'timetableEntry', 'timetableEntry.subject', 'timetableEntry.teacher'],
    });

    if (!absence) {
      throw new AppError('Absence record not found', 404);
    }

    // Verify this absence belongs to the student
    if (absence.student.id !== studentId) {
      throw new AppError('Not authorized to submit excuse for this absence', 403);
    }

    // Can only submit excuse for unexcused absences
    if (absence.status !== 'unexcused') {
      throw new AppError(
        `Cannot submit excuse for absence with status: ${absence.status}`,
        400
      );
    }

    absence.excuseReason = excuseReason;
    absence.excuseDocument = documentPath;
    absence.status = 'pending';
    absence.excuseSubmittedAt = new Date();

    const savedAbsence = await this.absenceRepository.save(absence);

    // Create notification for teacher
    try {
      await this.notificationService.create({
        userId: absence.timetableEntry.teacher.id,
        title: 'New Excuse Request',
        message: `${absence.student.firstName} ${absence.student.lastName} submitted an excuse for ${absence.timetableEntry.subject.name}`,
        type: 'system_announcement',
        relatedId: savedAbsence.id,
      });
    } catch (error) {
      logger.error('Failed to create notification for excuse submission:', error);
    }

    return savedAbsence;
  }

  async reviewExcuse(
    absenceId: string,
    teacherId: string,
    decision: 'excused' | 'rejected',
    reviewNotes?: string
  ): Promise<Absence> {
    const absence = await this.absenceRepository.findOne({
      where: { id: absenceId },
      relations: [
        'student',
        'student.department',
        'timetableEntry',
        'timetableEntry.subject',
        'timetableEntry.teacher',
      ],
    });

    if (!absence) {
      throw new AppError('Absence record not found', 404);
    }

    // Verify teacher is authorized (must be the course teacher or admin/dept head)
    const teacher = await this.userRepository.findOne({
      where: { id: teacherId },
      relations: ['department'],
    });

    if (!teacher) {
      throw new AppError('Teacher not found', 404);
    }

    let isAuthorized = false;
    
    if (teacher.role === 'admin') {
      isAuthorized = true;
    } else if (teacher.role === 'department_head') {
      // Department head can only review excuses from their department
      isAuthorized = teacher.department && 
                     absence.student.department && 
                     teacher.department.id === absence.student.department.id;
    } else if (teacher.role === 'teacher') {
      // Teacher can only review excuses from their classes
      isAuthorized = absence.timetableEntry.teacher.id === teacherId;
    }

    if (!isAuthorized) {
      throw new AppError('Not authorized to review this excuse', 403);
    }

    // Can only review pending excuses
    if (absence.status !== 'pending') {
      throw new AppError(
        `Cannot review excuse with status: ${absence.status}`,
        400
      );
    }

    absence.status = decision;
    absence.reviewNotes = reviewNotes;
    absence.reviewedAt = new Date();
    absence.reviewedBy = teacher;

    const updatedAbsence = await this.absenceRepository.save(absence);

    // Create notification for student
    try {
      const decisionText = decision === 'excused' ? 'approved' : 'rejected';
      const notificationType = decision === 'excused' ? 'excuse_approved' : 'excuse_rejected';
      await this.notificationService.create({
        userId: absence.student.id,
        title: `Excuse Request ${decisionText.charAt(0).toUpperCase() + decisionText.slice(1)}`,
        message: `Your excuse for ${absence.timetableEntry.subject.name} was ${decisionText}${reviewNotes ? `: ${reviewNotes}` : ''}`,
        type: notificationType,
        relatedId: updatedAbsence.id,
      });
    } catch (error) {
      logger.error('Failed to create notification for excuse review:', error);
    }

    // If excuse was accepted, recheck elimination status
    if (decision === 'excused') {
      await this.recheckEliminationStatus(absence.student.id);
    }

    return updatedAbsence;
  }

  private async recheckEliminationStatus(studentId: string): Promise<void> {
    try {
      const student = await this.userRepository.findOne({
        where: { id: studentId },
      });

      if (!student || student.status !== 'eliminated') return;

      // Count current unexcused absences across all subjects
      const unexcusedCount = await this.absenceRepository.count({
        where: {
          student: { id: studentId },
          status: 'unexcused',
        },
      });

      // If below threshold, restore active status
      if (unexcusedCount < 5) {
        student.status = 'active';
        await this.userRepository.save(student);
        logger.info(
          `Student ${studentId} status restored to active (unexcused count: ${unexcusedCount})`
        );
      }
    } catch (error) {
      logger.error('Error rechecking elimination status:', error);
    }
  }

  async getAll(filters?: {
    studentId?: string;
    subjectId?: string;
    teacherId?: string;
    status?: 'unexcused' | 'pending' | 'excused' | 'rejected';
    startDate?: string;
    endDate?: string;
    currentUserId?: string;
    currentUserRole?: string;
  }): Promise<Absence[]> {
    const query = this.absenceRepository
      .createQueryBuilder('absence')
      .leftJoinAndSelect('absence.student', 'student')
      .leftJoinAndSelect('student.department', 'studentDepartment')
      .leftJoinAndSelect('absence.timetableEntry', 'timetable')
      .leftJoinAndSelect('timetable.subject', 'subject')
      .leftJoinAndSelect('timetable.teacher', 'teacher')
      .leftJoinAndSelect('absence.reviewedBy', 'reviewedBy')
      .orderBy('absence.createdAt', 'DESC')
      .addOrderBy('timetable.startTime', 'DESC');

    // Department head: only see absences from students in their department
    if (filters?.currentUserRole === 'department_head' && filters?.currentUserId) {
      const currentUser = await this.userRepository.findOne({
        where: { id: filters.currentUserId },
        relations: ['department'],
      });
      if (currentUser?.department) {
        query.andWhere('student.departmentId = :departmentId', {
          departmentId: currentUser.department.id,
        });
      }
    }

    // Teacher: only see absences from their own classes
    if (filters?.currentUserRole === 'teacher' && filters?.currentUserId) {
      query.andWhere('timetable.teacherId = :currentTeacherId', {
        currentTeacherId: filters.currentUserId,
      });
    }

    // Department head: only see absences from students in their department
    if (filters?.currentUserRole === 'department_head' && filters?.currentUserId) {
      const currentUser = await this.userRepository.findOne({
        where: { id: filters.currentUserId },
        relations: ['department'],
      });
      if (currentUser?.department) {
        query.andWhere('student.departmentId = :departmentId', {
          departmentId: currentUser.department.id,
        });
      }
    }

    // Teacher: only see absences from their own classes
    if (filters?.currentUserRole === 'teacher' && filters?.currentUserId) {
      query.andWhere('timetable.teacherId = :currentTeacherId', {
        currentTeacherId: filters.currentUserId,
      });
    }

    if (filters?.studentId) {
      query.andWhere('absence.studentId = :studentId', {
        studentId: filters.studentId,
      });
    }

    if (filters?.subjectId) {
      query.andWhere('timetable.subjectId = :subjectId', {
        subjectId: filters.subjectId,
      });
    }

    if (filters?.teacherId) {
      query.andWhere('timetable.teacherId = :teacherId', {
        teacherId: filters.teacherId,
      });
    }

    if (filters?.status) {
      query.andWhere('absence.status = :status', {
        status: filters.status,
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

  async getById(id: string): Promise<Absence> {
    const absence = await this.absenceRepository.findOne({
      where: { id },
      relations: [
        'student',
        'student.group',
        'timetableEntry',
        'timetableEntry.subject',
        'timetableEntry.teacher',
        'timetableEntry.room',
        'reviewedBy',
      ],
    });

    if (!absence) {
      throw new AppError('Absence record not found', 404);
    }

    return absence;
  }

  async getStudentAbsences(
    studentId: string,
    subjectId?: string
  ): Promise<{
    absences: Absence[];
    statistics: {
      total: number;
      unexcused: number;
      pending: number;
      excused: number;
      rejected: number;
      bySubject: { [subjectId: string]: { subjectName: string; count: number } };
    };
  }> {
    const filters: any = { studentId };
    if (subjectId) filters.subjectId = subjectId;

    const absences = await this.getAll(filters);

    // Calculate statistics
    const statistics = {
      total: absences.length,
      unexcused: absences.filter((a) => a.status === 'unexcused').length,
      pending: absences.filter((a) => a.status === 'pending').length,
      excused: absences.filter((a) => a.status === 'excused').length,
      rejected: absences.filter((a) => a.status === 'rejected').length,
      bySubject: {} as { [key: string]: { subjectName: string; count: number } },
    };

    // Group by subject
    absences.forEach((absence) => {
      const subId = absence.timetableEntry.subject.id;
      const subName = absence.timetableEntry.subject.name;

      if (!statistics.bySubject[subId]) {
        statistics.bySubject[subId] = { subjectName: subName, count: 0 };
      }
      statistics.bySubject[subId].count++;
    });

    return { absences, statistics };
  }

  async deleteAbsence(id: string, deletedById: string): Promise<void> {
    const absence = await this.absenceRepository.findOne({
      where: { id },
      relations: ['student', 'student.department', 'timetableEntry', 'timetableEntry.teacher'],
    });

    if (!absence) {
      throw new AppError('Absence record not found', 404);
    }

    // Get the user who is trying to delete
    const user = await this.userRepository.findOne({
      where: { id: deletedById },
      relations: ['department'],
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    // Authorization logic based on role
    let isAuthorized = false;
    
    if (user.role === 'admin') {
      isAuthorized = true;
    } else if (user.role === 'department_head') {
      // Department head can only delete absences from their department
      isAuthorized = user.department && 
                     absence.student.department && 
                     user.department.id === absence.student.department.id;
    } else if (user.role === 'teacher') {
      // Teacher can only delete absences from their classes
      isAuthorized = absence.timetableEntry?.teacher?.id === deletedById;
    } else if (user.role === 'student') {
      // Student can delete their own absence
      isAuthorized = absence.student?.id === deletedById;
    }

    if (!isAuthorized) {
      throw new AppError('Not authorized to delete this absence record', 403);
    }

    await this.absenceRepository.remove(absence);

    // Recheck elimination status after deletion
    await this.recheckEliminationStatus(absence.student.id);
  }

  async getAbsenceStatistics(filters?: {
    groupId?: string;
    subjectId?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<{
    totalAbsences: number;
    byStatus: { [key: string]: number };
    studentsAtRisk: Array<{ studentId: string; studentName: string; count: number }>;
    bySubject: Array<{ subjectId: string; subjectName: string; count: number }>;
  }> {
    const query = this.absenceRepository
      .createQueryBuilder('absence')
      .leftJoinAndSelect('absence.student', 'student')
      .leftJoinAndSelect('student.group', 'group')
      .leftJoinAndSelect('absence.timetableEntry', 'timetable')
      .leftJoinAndSelect('timetable.subject', 'subject');

    if (filters?.groupId) {
      query.andWhere('group.id = :groupId', { groupId: filters.groupId });
    }

    if (filters?.subjectId) {
      query.andWhere('timetable.subjectId = :subjectId', {
        subjectId: filters.subjectId,
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

    const absences = await query.getMany();

    // Calculate statistics
    const byStatus: { [key: string]: number } = {
      unexcused: 0,
      pending: 0,
      excused: 0,
      rejected: 0,
    };

    const studentAbsenceCounts: { [key: string]: { name: string; count: number } } = {};
    const subjectAbsenceCounts: { [key: string]: { name: string; count: number } } = {};

    absences.forEach((absence) => {
      // Count by status
      byStatus[absence.status] = (byStatus[absence.status] || 0) + 1;

      // Count by student
      const studentId = absence.student.id;
      const studentName = `${absence.student.firstName} ${absence.student.lastName}`;
      if (!studentAbsenceCounts[studentId]) {
        studentAbsenceCounts[studentId] = { name: studentName, count: 0 };
      }
      if (absence.status === 'unexcused') {
        studentAbsenceCounts[studentId].count++;
      }

      // Count by subject
      const subjectId = absence.timetableEntry.subject.id;
      const subjectName = absence.timetableEntry.subject.name;
      if (!subjectAbsenceCounts[subjectId]) {
        subjectAbsenceCounts[subjectId] = { name: subjectName, count: 0 };
      }
      subjectAbsenceCounts[subjectId].count++;
    });

    // Students at risk (>= 3 unexcused absences)
    const studentsAtRisk = Object.entries(studentAbsenceCounts)
      .filter(([_, data]) => data.count >= 3)
      .map(([studentId, data]) => ({
        studentId,
        studentName: data.name,
        count: data.count,
      }))
      .sort((a, b) => b.count - a.count);

    // By subject
    const bySubject = Object.entries(subjectAbsenceCounts)
      .map(([subjectId, data]) => ({
        subjectId,
        subjectName: data.name,
        count: data.count,
      }))
      .sort((a, b) => b.count - a.count);

    return {
      totalAbsences: absences.length,
      byStatus,
      studentsAtRisk,
      bySubject,
    };
  }

  async getUserWithDepartment(userId: string): Promise<User | null> {
    return await this.userRepository.findOne({
      where: { id: userId },
      relations: ['department'],
    });
  }
}
