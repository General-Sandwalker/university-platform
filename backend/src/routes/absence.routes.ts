import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import {
  recordAbsence,
  getAllAbsences,
  getAbsenceById,
  getStudentAbsences,
  getMyAbsences,
  submitExcuse,
  reviewExcuse,
  deleteAbsence,
  getAbsenceStatistics,
} from '../controllers/absence.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validator';
import {
  createAbsenceSchema,
  submitExcuseSchema,
  reviewExcuseSchema,
  idParamSchema,
} from '../validators/schemas';

const router = Router();

// Configure multer for file uploads (excuse documents)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/excuse-documents/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, 'excuse-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and documents (PDF, DOC, DOCX) are allowed'));
    }
  },
});

/**
 * @swagger
 * /api/absences:
 *   post:
 *     summary: Record a student absence
 *     tags: [Absences]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - studentId
 *               - timetableEntryId
 *             properties:
 *               studentId:
 *                 type: string
 *               timetableEntryId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Absence recorded successfully
 *       400:
 *         description: Invalid input or absence already recorded
 */
router.post(
  '/',
  authenticate,
  authorize('teacher', 'department_head', 'admin'),
  validate(createAbsenceSchema),
  recordAbsence
);

/**
 * @swagger
 * /api/absences:
 *   get:
 *     summary: Get all absences with filters
 *     tags: [Absences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: studentId
 *         schema:
 *           type: string
 *       - in: query
 *         name: subjectId
 *         schema:
 *           type: string
 *       - in: query
 *         name: teacherId
 *         schema:
 *           type: string
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [unexcused, pending, excused, rejected]
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
 *         description: List of absences
 */
router.get('/', authenticate, getAllAbsences);

/**
 * @swagger
 * /api/absences/my-absences:
 *   get:
 *     summary: Get current student's absences
 *     tags: [Absences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: subjectId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student's absences with statistics
 */
router.get('/my-absences', authenticate, authorize('student'), getMyAbsences);

/**
 * @swagger
 * /api/absences/statistics:
 *   get:
 *     summary: Get absence statistics
 *     tags: [Absences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: groupId
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
 *     responses:
 *       200:
 *         description: Absence statistics
 */
router.get(
  '/statistics',
  authenticate,
  authorize('teacher', 'department_head', 'admin'),
  getAbsenceStatistics
);

/**
 * @swagger
 * /api/absences/student/{studentId}:
 *   get:
 *     summary: Get absences for a specific student
 *     tags: [Absences]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: subjectId
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student's absences with statistics
 *       404:
 *         description: Student not found
 */
router.get(
  '/student/:studentId',
  authenticate,
  authorize('teacher', 'department_head', 'admin'),
  getStudentAbsences
);

/**
 * @swagger
 * /api/absences/{id}:
 *   get:
 *     summary: Get absence by ID
 *     tags: [Absences]
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
 *         description: Absence details
 *       404:
 *         description: Absence not found
 */
router.get('/:id', authenticate, validate(idParamSchema, 'params'), getAbsenceById);

/**
 * @swagger
 * /api/absences/{id}/submit-excuse:
 *   post:
 *     summary: Submit an excuse for an absence
 *     tags: [Absences]
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
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - excuseReason
 *             properties:
 *               excuseReason:
 *                 type: string
 *               document:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Excuse submitted successfully
 *       403:
 *         description: Not authorized
 */
router.post(
  '/:id/submit-excuse',
  authenticate,
  authorize('student'),
  upload.single('document'),
  validate(idParamSchema, 'params'),
  validate(submitExcuseSchema),
  submitExcuse
);

/**
 * @swagger
 * /api/absences/{id}/review-excuse:
 *   post:
 *     summary: Review and approve/reject an excuse
 *     tags: [Absences]
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
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [excused, rejected]
 *               reviewNotes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Excuse reviewed successfully
 *       403:
 *         description: Not authorized
 */
router.post(
  '/:id/review-excuse',
  authenticate,
  authorize('teacher', 'department_head', 'admin'),
  validate(idParamSchema, 'params'),
  validate(reviewExcuseSchema),
  reviewExcuse
);

/**
 * @swagger
 * /api/absences/{id}:
 *   delete:
 *     summary: Delete an absence record
 *     tags: [Absences]
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
 *         description: Absence deleted successfully
 *       403:
 *         description: Not authorized
 */
router.delete(
  '/:id',
  authenticate,
  authorize('teacher', 'department_head', 'admin'),
  validate(idParamSchema, 'params'),
  deleteAbsence
);

export default router;
