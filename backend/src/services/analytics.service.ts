import { Repository, Between } from 'typeorm';
import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import { Absence } from '../entities/Absence';
import { Timetable } from '../entities/Timetable';
import { Room } from '../entities/Room';
import { Group } from '../entities/Group';
import { Subject } from '../entities/Subject';
import { AppError } from '../middleware/errorHandler';
import PDFDocument from 'pdfkit';
import { createObjectCsvWriter } from 'csv-writer';
import fs from 'fs';
import path from 'path';

export class AnalyticsService {
  private userRepository: Repository<User>;
  private absenceRepository: Repository<Absence>;
  private timetableRepository: Repository<Timetable>;
  private roomRepository: Repository<Room>;
  private groupRepository: Repository<Group>;
  private subjectRepository: Repository<Subject>;

  constructor() {
    this.userRepository = AppDataSource.getRepository(User);
    this.absenceRepository = AppDataSource.getRepository(Absence);
    this.timetableRepository = AppDataSource.getRepository(Timetable);
    this.roomRepository = AppDataSource.getRepository(Room);
    this.groupRepository = AppDataSource.getRepository(Group);
    this.subjectRepository = AppDataSource.getRepository(Subject);
  }

  // Overview statistics for dashboard
  async getOverview(): Promise<{
    totalUsers: number;
    totalTimetables: number;
    pendingAbsences: number;
  }> {
    const [totalUsers, totalTimetables, pendingAbsences] = await Promise.all([
      this.userRepository.count(),
      this.timetableRepository.count(),
      this.absenceRepository.count({ where: { status: 'pending' } })
    ]);

    return {
      totalUsers,
      totalTimetables,
      pendingAbsences
    };
  }

  // Student Performance Analytics
  async getStudentPerformance(studentId: string): Promise<{
    student: User;
    totalAbsences: number;
    excusedAbsences: number;
    unexcusedAbsences: number;
    attendanceRate: number;
    absencesBySubject: {
      subject: string;
      total: number;
      excused: number;
      unexcused: number;
    }[];
    status: string;
  }> {
    const student = await this.userRepository.findOne({
      where: { id: studentId, role: 'student' },
      relations: ['group'],
    });

    if (!student) {
      throw new AppError('Student not found', 404);
    }

    const absences = await this.absenceRepository.find({
      where: { student: { id: studentId } },
      relations: ['subject'],
    });

    const totalAbsences = absences.length;
    const excusedAbsences = absences.filter((a) => a.status === 'excused').length;
    const unexcusedAbsences = totalAbsences - excusedAbsences;

    // Calculate attendance rate based on scheduled sessions
    const totalSessions = await this.timetableRepository.count({
      where: {
        group: { id: student.group?.id },
        date: Between(
          new Date(new Date().getFullYear(), 8, 1), // September 1st
          new Date()
        ),
      },
    });

    const attendanceRate =
      totalSessions > 0 ? ((totalSessions - unexcusedAbsences) / totalSessions) * 100 : 100;

    // Group absences by subject
    const absencesBySubjectMap = new Map<
      string,
      { total: number; excused: number; unexcused: number }
    >();

    absences.forEach((absence) => {
      const subjectName = absence.subject.name;
      if (!absencesBySubjectMap.has(subjectName)) {
        absencesBySubjectMap.set(subjectName, {
          total: 0,
          excused: 0,
          unexcused: 0,
        });
      }

      const stats = absencesBySubjectMap.get(subjectName)!;
      stats.total++;
      if (absence.status === 'excused') {
        stats.excused++;
      } else {
        stats.unexcused++;
      }
    });

    const absencesBySubject = Array.from(absencesBySubjectMap.entries()).map(
      ([subject, stats]) => ({
        subject,
        ...stats,
      })
    );

    return {
      student,
      totalAbsences,
      excusedAbsences,
      unexcusedAbsences,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
      absencesBySubject,
      status: student.status,
    };
  }

  // Room Occupancy Analytics
  async getRoomOccupancy(filters?: {
    startDate?: Date;
    endDate?: Date;
    roomId?: string;
  }): Promise<{
    rooms: {
      room: string;
      capacity: number;
      totalSessions: number;
      totalHours: number;
      utilizationRate: number;
    }[];
  }> {
    const whereConditions: any = {};

    if (filters?.startDate && filters?.endDate) {
      whereConditions.date = Between(filters.startDate, filters.endDate);
    }

    if (filters?.roomId) {
      whereConditions.room = { id: filters.roomId };
    }

    const sessions = await this.timetableRepository.find({
      where: whereConditions,
      relations: ['room'],
    });

    const roomStats = new Map<
      string,
      {
        room: string;
        capacity: number;
        totalSessions: number;
        totalHours: number;
      }
    >();

    sessions.forEach((session) => {
      const roomName = session.room.name;
      if (!roomStats.has(roomName)) {
        roomStats.set(roomName, {
          room: roomName,
          capacity: session.room.capacity,
          totalSessions: 0,
          totalHours: 0,
        });
      }

      const stats = roomStats.get(roomName)!;
      stats.totalSessions++;

      // Calculate session duration in hours
      const [startHour, startMin] = session.startTime.split(':').map(Number);
      const [endHour, endMin] = session.endTime.split(':').map(Number);
      const duration = endHour + endMin / 60 - (startHour + startMin / 60);
      stats.totalHours += duration;
    });

    // Calculate utilization rate (assuming 8 hours per day, 5 days per week)
    const totalDays =
      filters?.startDate && filters?.endDate
        ? Math.ceil(
            (filters.endDate.getTime() - filters.startDate.getTime()) /
              (1000 * 60 * 60 * 24)
          )
        : 30; // Default to 30 days

    const availableHours = totalDays * 8; // 8 hours per day

    const rooms = Array.from(roomStats.values()).map((stats) => ({
      ...stats,
      utilizationRate: Math.round((stats.totalHours / availableHours) * 100 * 100) / 100,
    }));

    return { rooms };
  }

  // Absence Analytics
  async getAbsenceAnalytics(filters?: {
    startDate?: Date;
    endDate?: Date;
    groupId?: string;
    subjectId?: string;
  }): Promise<{
    totalAbsences: number;
    excusedAbsences: number;
    unexcusedAbsences: number;
    pendingExcuses: number;
    studentsAtRisk: User[];
    absencesByGroup: { group: string; count: number }[];
    absencesBySubject: { subject: string; count: number }[];
    absencesTrend: { date: string; count: number }[];
  }> {
    const whereConditions: any = {};

    if (filters?.startDate && filters?.endDate) {
      whereConditions.date = Between(filters.startDate, filters.endDate);
    }

    if (filters?.groupId) {
      whereConditions.student = { group: { id: filters.groupId } };
    }

    if (filters?.subjectId) {
      whereConditions.subject = { id: filters.subjectId };
    }

    const absences = await this.absenceRepository.find({
      where: whereConditions,
      relations: ['student', 'student.group', 'subject'],
    });

    const totalAbsences = absences.length;
    const excusedAbsences = absences.filter((a) => a.status === 'excused').length;
    const unexcusedAbsences = absences.filter((a) => a.status === 'unexcused').length;
    const pendingExcuses = absences.filter((a) => a.status === 'pending').length;

    // Students at risk (status: at_risk or eliminated)
    const studentsAtRisk = await this.userRepository.find({
      where: [{ status: 'at_risk' }, { status: 'eliminated' }],
      relations: ['group'],
    });

    // Group absences by group
    const absencesByGroupMap = new Map<string, number>();
    absences.forEach((absence) => {
      const groupName = absence.student.group?.name || 'No Group';
      absencesByGroupMap.set(groupName, (absencesByGroupMap.get(groupName) || 0) + 1);
    });

    const absencesByGroup = Array.from(absencesByGroupMap.entries()).map(
      ([group, count]) => ({
        group,
        count,
      })
    );

    // Group absences by subject
    const absencesBySubjectMap = new Map<string, number>();
    absences.forEach((absence) => {
      const subjectName = absence.subject.name;
      absencesBySubjectMap.set(
        subjectName,
        (absencesBySubjectMap.get(subjectName) || 0) + 1
      );
    });

    const absencesBySubject = Array.from(absencesBySubjectMap.entries()).map(
      ([subject, count]) => ({
        subject,
        count,
      })
    );

    // Absences trend (by day)
    const absencesByDateMap = new Map<string, number>();
    absences.forEach((absence) => {
      const date = absence.date.toISOString().split('T')[0];
      absencesByDateMap.set(date, (absencesByDateMap.get(date) || 0) + 1);
    });

    const absencesTrend = Array.from(absencesByDateMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    return {
      totalAbsences,
      excusedAbsences,
      unexcusedAbsences,
      pendingExcuses,
      studentsAtRisk,
      absencesByGroup,
      absencesBySubject,
      absencesTrend,
    };
  }

  // Timetable Utilization Analytics
  async getTimetableUtilization(filters?: {
    startDate?: Date;
    endDate?: Date;
    teacherId?: string;
  }): Promise<{
    totalSessions: number;
    totalHours: number;
    sessionsByType: { type: string; count: number }[];
    teacherWorkload: { teacher: string; sessions: number; hours: number }[];
    roomUsage: { room: string; sessions: number }[];
  }> {
    const whereConditions: any = {};

    if (filters?.startDate && filters?.endDate) {
      whereConditions.date = Between(filters.startDate, filters.endDate);
    }

    if (filters?.teacherId) {
      whereConditions.teacher = { id: filters.teacherId };
    }

    const sessions = await this.timetableRepository.find({
      where: whereConditions,
      relations: ['teacher', 'room'],
    });

    const totalSessions = sessions.length;

    // Calculate total hours
    let totalHours = 0;
    sessions.forEach((session) => {
      const [startHour, startMin] = session.startTime.split(':').map(Number);
      const [endHour, endMin] = session.endTime.split(':').map(Number);
      const duration = endHour + endMin / 60 - (startHour + startMin / 60);
      totalHours += duration;
    });

    // Sessions by type
    const sessionsByTypeMap = new Map<string, number>();
    sessions.forEach((session) => {
      sessionsByTypeMap.set(
        session.sessionType,
        (sessionsByTypeMap.get(session.sessionType) || 0) + 1
      );
    });

    const sessionsByType = Array.from(sessionsByTypeMap.entries()).map(
      ([type, count]) => ({
        type,
        count,
      })
    );

    // Teacher workload
    const teacherWorkloadMap = new Map<
      string,
      { teacher: string; sessions: number; hours: number }
    >();

    sessions.forEach((session) => {
      const teacherName = `${session.teacher.firstName} ${session.teacher.lastName}`;
      if (!teacherWorkloadMap.has(teacherName)) {
        teacherWorkloadMap.set(teacherName, {
          teacher: teacherName,
          sessions: 0,
          hours: 0,
        });
      }

      const workload = teacherWorkloadMap.get(teacherName)!;
      workload.sessions++;

      const [startHour, startMin] = session.startTime.split(':').map(Number);
      const [endHour, endMin] = session.endTime.split(':').map(Number);
      const duration = endHour + endMin / 60 - (startHour + startMin / 60);
      workload.hours += duration;
    });

    const teacherWorkload = Array.from(teacherWorkloadMap.values()).map((workload) => ({
      ...workload,
      hours: Math.round(workload.hours * 100) / 100,
    }));

    // Room usage
    const roomUsageMap = new Map<string, number>();
    sessions.forEach((session) => {
      const roomName = session.room.name;
      roomUsageMap.set(roomName, (roomUsageMap.get(roomName) || 0) + 1);
    });

    const roomUsage = Array.from(roomUsageMap.entries()).map(([room, sessions]) => ({
      room,
      sessions,
    }));

    return {
      totalSessions,
      totalHours: Math.round(totalHours * 100) / 100,
      sessionsByType,
      teacherWorkload,
      roomUsage,
    };
  }

  // Export to PDF
  async exportToPDF(
    type: 'student' | 'room' | 'absence' | 'timetable',
    data: any
  ): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument();
      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Header
      doc.fontSize(20).text('University Management Platform', { align: 'center' });
      doc.moveDown();
      doc
        .fontSize(16)
        .text(
          `${type.charAt(0).toUpperCase() + type.slice(1)} Analytics Report`,
          { align: 'center' }
        );
      doc.moveDown();
      doc.fontSize(10).text(`Generated on: ${new Date().toLocaleString()}`, {
        align: 'center',
      });
      doc.moveDown(2);

      // Content based on type
      switch (type) {
        case 'student':
          this.addStudentPerformanceToPDF(doc, data);
          break;
        case 'room':
          this.addRoomOccupancyToPDF(doc, data);
          break;
        case 'absence':
          this.addAbsenceAnalyticsToPDF(doc, data);
          break;
        case 'timetable':
          this.addTimetableUtilizationToPDF(doc, data);
          break;
      }

      doc.end();
    });
  }

  private addStudentPerformanceToPDF(doc: PDFKit.PDFDocument, data: any) {
    doc.fontSize(14).text('Student Information', { underline: true });
    doc.moveDown();
    doc
      .fontSize(12)
      .text(`Name: ${data.student.firstName} ${data.student.lastName}`);
    doc.text(`Email: ${data.student.email}`);
    doc.text(`Status: ${data.status}`);
    doc.moveDown();

    doc.fontSize(14).text('Attendance Summary', { underline: true });
    doc.moveDown();
    doc.fontSize(12).text(`Total Absences: ${data.totalAbsences}`);
    doc.text(`Excused: ${data.excusedAbsences}`);
    doc.text(`Unexcused: ${data.unexcusedAbsences}`);
    doc.text(`Attendance Rate: ${data.attendanceRate}%`);
    doc.moveDown();

    if (data.absencesBySubject.length > 0) {
      doc.fontSize(14).text('Absences by Subject', { underline: true });
      doc.moveDown();
      data.absencesBySubject.forEach((item: any) => {
        doc
          .fontSize(12)
          .text(
            `${item.subject}: ${item.total} (Excused: ${item.excused}, Unexcused: ${item.unexcused})`
          );
      });
    }
  }

  private addRoomOccupancyToPDF(doc: PDFKit.PDFDocument, data: any) {
    doc.fontSize(14).text('Room Occupancy Report', { underline: true });
    doc.moveDown();

    data.rooms.forEach((room: any) => {
      doc.fontSize(12).text(`Room: ${room.room}`);
      doc.text(`Capacity: ${room.capacity}`);
      doc.text(`Total Sessions: ${room.totalSessions}`);
      doc.text(`Total Hours: ${room.totalHours}`);
      doc.text(`Utilization Rate: ${room.utilizationRate}%`);
      doc.moveDown();
    });
  }

  private addAbsenceAnalyticsToPDF(doc: PDFKit.PDFDocument, data: any) {
    doc.fontSize(14).text('Absence Analytics Report', { underline: true });
    doc.moveDown();

    doc.fontSize(12).text(`Total Absences: ${data.totalAbsences}`);
    doc.text(`Excused: ${data.excusedAbsences}`);
    doc.text(`Unexcused: ${data.unexcusedAbsences}`);
    doc.text(`Pending Excuses: ${data.pendingExcuses}`);
    doc.text(`Students at Risk: ${data.studentsAtRisk.length}`);
    doc.moveDown();

    if (data.absencesByGroup.length > 0) {
      doc.fontSize(14).text('Absences by Group', { underline: true });
      doc.moveDown();
      data.absencesByGroup.forEach((item: any) => {
        doc.fontSize(12).text(`${item.group}: ${item.count}`);
      });
      doc.moveDown();
    }

    if (data.absencesBySubject.length > 0) {
      doc.fontSize(14).text('Absences by Subject', { underline: true });
      doc.moveDown();
      data.absencesBySubject.forEach((item: any) => {
        doc.fontSize(12).text(`${item.subject}: ${item.count}`);
      });
    }
  }

  private addTimetableUtilizationToPDF(doc: PDFKit.PDFDocument, data: any) {
    doc.fontSize(14).text('Timetable Utilization Report', { underline: true });
    doc.moveDown();

    doc.fontSize(12).text(`Total Sessions: ${data.totalSessions}`);
    doc.text(`Total Hours: ${data.totalHours}`);
    doc.moveDown();

    if (data.sessionsByType.length > 0) {
      doc.fontSize(14).text('Sessions by Type', { underline: true });
      doc.moveDown();
      data.sessionsByType.forEach((item: any) => {
        doc.fontSize(12).text(`${item.type}: ${item.count}`);
      });
      doc.moveDown();
    }

    if (data.teacherWorkload.length > 0) {
      doc.fontSize(14).text('Teacher Workload', { underline: true });
      doc.moveDown();
      data.teacherWorkload.forEach((item: any) => {
        doc
          .fontSize(12)
          .text(`${item.teacher}: ${item.sessions} sessions (${item.hours} hours)`);
      });
    }
  }

  // Export to CSV
  async exportToCSV(
    type: 'student' | 'room' | 'absence' | 'timetable',
    data: any,
    filename: string
  ): Promise<string> {
    const exportDir = path.join(process.cwd(), 'exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    const filePath = path.join(exportDir, filename);

    switch (type) {
      case 'room':
        await this.exportRoomOccupancyToCSV(data, filePath);
        break;
      case 'absence':
        await this.exportAbsenceAnalyticsToCSV(data, filePath);
        break;
      case 'timetable':
        await this.exportTimetableUtilizationToCSV(data, filePath);
        break;
      default:
        throw new AppError('Unsupported export type', 400);
    }

    return filePath;
  }

  private async exportRoomOccupancyToCSV(data: any, filePath: string) {
    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'room', title: 'Room' },
        { id: 'capacity', title: 'Capacity' },
        { id: 'totalSessions', title: 'Total Sessions' },
        { id: 'totalHours', title: 'Total Hours' },
        { id: 'utilizationRate', title: 'Utilization Rate (%)' },
      ],
    });

    await csvWriter.writeRecords(data.rooms);
  }

  private async exportAbsenceAnalyticsToCSV(data: any, filePath: string) {
    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'group', title: 'Group' },
        { id: 'count', title: 'Absence Count' },
      ],
    });

    await csvWriter.writeRecords(data.absencesByGroup);
  }

  private async exportTimetableUtilizationToCSV(data: any, filePath: string) {
    const csvWriter = createObjectCsvWriter({
      path: filePath,
      header: [
        { id: 'teacher', title: 'Teacher' },
        { id: 'sessions', title: 'Sessions' },
        { id: 'hours', title: 'Hours' },
      ],
    });

    await csvWriter.writeRecords(data.teacherWorkload);
  }
}
