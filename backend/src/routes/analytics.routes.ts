import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../entities/User';
import {
  getStudentPerformance,
  getMyPerformance,
  getRoomOccupancy,
  getAbsenceAnalytics,
  getTimetableUtilization,
  exportStudentPerformancePDF,
  exportRoomOccupancyPDF,
  exportAbsenceAnalyticsPDF,
  exportTimetableUtilizationPDF,
  exportRoomOccupancyCSV,
  exportAbsenceAnalyticsCSV,
  exportTimetableUtilizationCSV,
} from '../controllers/analytics.controller';

const router = Router();

/**
 * @swagger
 * /api/analytics/student-performance/{studentId}:
 *   get:
 *     summary: Get student performance analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Student performance retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 student:
 *                   $ref: '#/components/schemas/User'
 *                 totalAbsences:
 *                   type: number
 *                 excusedAbsences:
 *                   type: number
 *                 unexcusedAbsences:
 *                   type: number
 *                 attendanceRate:
 *                   type: number
 *                 absencesBySubject:
 *                   type: array
 *                   items:
 *                     type: object
 *                 status:
 *                   type: string
 */
router.get(
  '/student-performance/:studentId',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.DEPARTMENT_HEAD, UserRole.TEACHER),
  getStudentPerformance
);

/**
 * @swagger
 * /api/analytics/my-performance:
 *   get:
 *     summary: Get my performance (Student only)
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Performance retrieved successfully
 */
router.get('/my-performance', authenticate, authorize(UserRole.STUDENT), getMyPerformance);

/**
 * @swagger
 * /api/analytics/room-occupancy:
 *   get:
 *     summary: Get room occupancy analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: roomId
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Room occupancy analytics retrieved successfully
 */
router.get(
  '/room-occupancy',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.DEPARTMENT_HEAD),
  getRoomOccupancy
);

/**
 * @swagger
 * /api/analytics/absence-analytics:
 *   get:
 *     summary: Get absence analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: groupId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: subjectId
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Absence analytics retrieved successfully
 */
router.get(
  '/absence-analytics',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.DEPARTMENT_HEAD, UserRole.TEACHER),
  getAbsenceAnalytics
);

/**
 * @swagger
 * /api/analytics/timetable-utilization:
 *   get:
 *     summary: Get timetable utilization analytics
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: teacherId
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Timetable utilization analytics retrieved successfully
 */
router.get(
  '/timetable-utilization',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.DEPARTMENT_HEAD),
  getTimetableUtilization
);

/**
 * @swagger
 * /api/analytics/export/student-performance/{studentId}/pdf:
 *   get:
 *     summary: Export student performance to PDF
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: PDF file generated successfully
 *         content:
 *           application/pdf:
 *             schema:
 *               type: string
 *               format: binary
 */
router.get(
  '/export/student-performance/:studentId/pdf',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.DEPARTMENT_HEAD, UserRole.TEACHER),
  exportStudentPerformancePDF
);

/**
 * @swagger
 * /api/analytics/export/room-occupancy/pdf:
 *   get:
 *     summary: Export room occupancy to PDF
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: roomId
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: PDF file generated successfully
 */
router.get(
  '/export/room-occupancy/pdf',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.DEPARTMENT_HEAD),
  exportRoomOccupancyPDF
);

/**
 * @swagger
 * /api/analytics/export/absence-analytics/pdf:
 *   get:
 *     summary: Export absence analytics to PDF
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: groupId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: subjectId
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: PDF file generated successfully
 */
router.get(
  '/export/absence-analytics/pdf',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.DEPARTMENT_HEAD, UserRole.TEACHER),
  exportAbsenceAnalyticsPDF
);

/**
 * @swagger
 * /api/analytics/export/timetable-utilization/pdf:
 *   get:
 *     summary: Export timetable utilization to PDF
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: teacherId
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: PDF file generated successfully
 */
router.get(
  '/export/timetable-utilization/pdf',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.DEPARTMENT_HEAD),
  exportTimetableUtilizationPDF
);

/**
 * @swagger
 * /api/analytics/export/room-occupancy/csv:
 *   get:
 *     summary: Export room occupancy to CSV
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: roomId
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: CSV file generated successfully
 */
router.get(
  '/export/room-occupancy/csv',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.DEPARTMENT_HEAD),
  exportRoomOccupancyCSV
);

/**
 * @swagger
 * /api/analytics/export/absence-analytics/csv:
 *   get:
 *     summary: Export absence analytics to CSV
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: groupId
 *         schema:
 *           type: string
 *           format: uuid
 *       - in: query
 *         name: subjectId
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: CSV file generated successfully
 */
router.get(
  '/export/absence-analytics/csv',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.DEPARTMENT_HEAD, UserRole.TEACHER),
  exportAbsenceAnalyticsCSV
);

/**
 * @swagger
 * /api/analytics/export/timetable-utilization/csv:
 *   get:
 *     summary: Export timetable utilization to CSV
 *     tags: [Analytics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *       - in: query
 *         name: teacherId
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: CSV file generated successfully
 */
router.get(
  '/export/timetable-utilization/csv',
  authenticate,
  authorize(UserRole.ADMIN, UserRole.DEPARTMENT_HEAD),
  exportTimetableUtilizationCSV
);

export default router;
