import { Request, Response, NextFunction } from 'express';
import { AnalyticsService } from '../services/analytics.service';

const analyticsService = new AnalyticsService();

export const getStudentPerformance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { studentId } = req.params;
    const performance = await analyticsService.getStudentPerformance(studentId);
    res.json(performance);
  } catch (error) {
    next(error);
  }
};

export const getMyPerformance = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const studentId = req.user!.id;
    const performance = await analyticsService.getStudentPerformance(studentId);
    res.json(performance);
  } catch (error) {
    next(error);
  }
};

export const getRoomOccupancy = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate, roomId } = req.query;

    const filters: any = {};
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    if (roomId) filters.roomId = roomId as string;

    const occupancy = await analyticsService.getRoomOccupancy(filters);
    res.json(occupancy);
  } catch (error) {
    next(error);
  }
};

export const getAbsenceAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate, groupId, subjectId } = req.query;

    const filters: any = {};
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    if (groupId) filters.groupId = groupId as string;
    if (subjectId) filters.subjectId = subjectId as string;

    const analytics = await analyticsService.getAbsenceAnalytics(filters);
    res.json(analytics);
  } catch (error) {
    next(error);
  }
};

export const getTimetableUtilization = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate, teacherId } = req.query;

    const filters: any = {};
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    if (teacherId) filters.teacherId = teacherId as string;

    const utilization = await analyticsService.getTimetableUtilization(filters);
    res.json(utilization);
  } catch (error) {
    next(error);
  }
};

export const exportStudentPerformancePDF = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { studentId } = req.params;
    const performance = await analyticsService.getStudentPerformance(studentId);
    const pdfBuffer = await analyticsService.exportToPDF('student', performance);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=student-performance-${studentId}.pdf`
    );
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

export const exportRoomOccupancyPDF = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate, roomId } = req.query;

    const filters: any = {};
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    if (roomId) filters.roomId = roomId as string;

    const occupancy = await analyticsService.getRoomOccupancy(filters);
    const pdfBuffer = await analyticsService.exportToPDF('room', occupancy);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=room-occupancy-${Date.now()}.pdf`
    );
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

export const exportAbsenceAnalyticsPDF = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate, groupId, subjectId } = req.query;

    const filters: any = {};
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    if (groupId) filters.groupId = groupId as string;
    if (subjectId) filters.subjectId = subjectId as string;

    const analytics = await analyticsService.getAbsenceAnalytics(filters);
    const pdfBuffer = await analyticsService.exportToPDF('absence', analytics);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=absence-analytics-${Date.now()}.pdf`
    );
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

export const exportTimetableUtilizationPDF = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate, teacherId } = req.query;

    const filters: any = {};
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    if (teacherId) filters.teacherId = teacherId as string;

    const utilization = await analyticsService.getTimetableUtilization(filters);
    const pdfBuffer = await analyticsService.exportToPDF('timetable', utilization);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=timetable-utilization-${Date.now()}.pdf`
    );
    res.send(pdfBuffer);
  } catch (error) {
    next(error);
  }
};

export const exportRoomOccupancyCSV = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate, roomId } = req.query;

    const filters: any = {};
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    if (roomId) filters.roomId = roomId as string;

    const occupancy = await analyticsService.getRoomOccupancy(filters);
    const filePath = await analyticsService.exportToCSV(
      'room',
      occupancy,
      `room-occupancy-${Date.now()}.csv`
    );

    res.download(filePath);
  } catch (error) {
    next(error);
  }
};

export const exportAbsenceAnalyticsCSV = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate, groupId, subjectId } = req.query;

    const filters: any = {};
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    if (groupId) filters.groupId = groupId as string;
    if (subjectId) filters.subjectId = subjectId as string;

    const analytics = await analyticsService.getAbsenceAnalytics(filters);
    const filePath = await analyticsService.exportToCSV(
      'absence',
      analytics,
      `absence-analytics-${Date.now()}.csv`
    );

    res.download(filePath);
  } catch (error) {
    next(error);
  }
};

export const exportTimetableUtilizationCSV = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate, teacherId } = req.query;

    const filters: any = {};
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    if (teacherId) filters.teacherId = teacherId as string;

    const utilization = await analyticsService.getTimetableUtilization(filters);
    const filePath = await analyticsService.exportToCSV(
      'timetable',
      utilization,
      `timetable-utilization-${Date.now()}.csv`
    );

    res.download(filePath);
  } catch (error) {
    next(error);
  }
};
