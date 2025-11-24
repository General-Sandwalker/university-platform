import { Router } from 'express';
import {
  createTimetable,
  getAllTimetables,
  getTimetableById,
  getStudentSchedule,
  getMySchedule,
  updateTimetable,
  deleteTimetable,
  checkAvailability,
} from '../controllers/timetable.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validator';
import {
  createTimetableSchema,
  updateTimetableSchema,
  idParamSchema,
} from '../validators/schemas';

const router = Router();

/**
 * @swagger
 * /api/timetable:
 *   post:
 *     summary: Create a new timetable entry
 *     tags: [Timetable]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - startTime
 *               - endTime
 *               - subjectId
 *               - teacherId
 *               - roomId
 *               - groupId
 *               - sessionType
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               startTime:
 *                 type: string
 *                 pattern: '^[0-9]{2}:[0-9]{2}$'
 *               endTime:
 *                 type: string
 *                 pattern: '^[0-9]{2}:[0-9]{2}$'
 *               subjectId:
 *                 type: string
 *               teacherId:
 *                 type: string
 *               roomId:
 *                 type: string
 *               groupId:
 *                 type: string
 *               sessionType:
 *                 type: string
 *                 enum: [lecture, td, tp, exam, makeup]
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Timetable entry created successfully
 *       409:
 *         description: Scheduling conflict detected
 */
router.post(
  '/',
  authenticate,
  authorize('admin', 'department_head'),
  validate(createTimetableSchema),
  createTimetable
);

/**
 * @swagger
 * /api/timetable:
 *   get:
 *     summary: Get all timetable entries with filters
 *     tags: [Timetable]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: teacherId
 *         schema:
 *           type: string
 *       - in: query
 *         name: groupId
 *         schema:
 *           type: string
 *       - in: query
 *         name: roomId
 *         schema:
 *           type: string
 *       - in: query
 *         name: subjectId
 *         schema:
 *           type: string
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
 *         name: sessionType
 *         schema:
 *           type: string
 *           enum: [lecture, td, tp, exam, makeup]
 *     responses:
 *       200:
 *         description: List of timetable entries
 */
router.get('/', authenticate, getAllTimetables);

/**
 * @swagger
 * /api/timetable/my-schedule:
 *   get:
 *     summary: Get current user's schedule
 *     tags: [Timetable]
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
 *     responses:
 *       200:
 *         description: User's schedule
 */
router.get('/my-schedule', authenticate, getMySchedule);

/**
 * @swagger
 * /api/timetable/student/{studentId}:
 *   get:
 *     summary: Get schedule for a specific student
 *     tags: [Timetable]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
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
 *     responses:
 *       200:
 *         description: Student's schedule
 *       404:
 *         description: Student not found
 */
router.get(
  '/student/:studentId',
  authenticate,
  authorize('admin', 'department_head', 'teacher'),
  getStudentSchedule
);

/**
 * @swagger
 * /api/timetable/check-availability:
 *   post:
 *     summary: Check availability for scheduling
 *     tags: [Timetable]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - date
 *               - startTime
 *               - endTime
 *             properties:
 *               teacherId:
 *                 type: string
 *               roomId:
 *                 type: string
 *               groupId:
 *                 type: string
 *               date:
 *                 type: string
 *                 format: date
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *     responses:
 *       200:
 *         description: Availability check result
 */
router.post(
  '/check-availability',
  authenticate,
  authorize('admin', 'department_head'),
  checkAvailability
);

/**
 * @swagger
 * /api/timetable/{id}:
 *   get:
 *     summary: Get timetable entry by ID
 *     tags: [Timetable]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Timetable entry details
 *       404:
 *         description: Timetable entry not found
 */
router.get('/:id', authenticate, validate(idParamSchema, 'params'), getTimetableById);

/**
 * @swagger
 * /api/timetable/{id}:
 *   put:
 *     summary: Update a timetable entry
 *     tags: [Timetable]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               date:
 *                 type: string
 *                 format: date
 *               startTime:
 *                 type: string
 *               endTime:
 *                 type: string
 *               subjectId:
 *                 type: string
 *               teacherId:
 *                 type: string
 *               roomId:
 *                 type: string
 *               groupId:
 *                 type: string
 *               sessionType:
 *                 type: string
 *                 enum: [lecture, td, tp, exam, makeup]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Timetable entry updated successfully
 *       409:
 *         description: Scheduling conflict detected
 */
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'department_head'),
  validate(idParamSchema, 'params'),
  validate(updateTimetableSchema),
  updateTimetable
);

/**
 * @swagger
 * /api/timetable/{id}:
 *   delete:
 *     summary: Delete a timetable entry
 *     tags: [Timetable]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Timetable entry deleted successfully
 *       400:
 *         description: Cannot delete entry with recorded absences
 */
router.delete(
  '/:id',
  authenticate,
  authorize('admin', 'department_head'),
  validate(idParamSchema, 'params'),
  deleteTimetable
);

export default router;
