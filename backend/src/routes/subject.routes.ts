import { Router } from 'express';
import {
  createSubject,
  getAllSubjects,
  getSubjectById,
  updateSubject,
  deleteSubject,
  assignTeacher,
  unassignTeacher,
} from '../controllers/subject.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validator';
import {
  createSubjectSchema,
  updateSubjectSchema,
  idParamSchema,
} from '../validators/schemas';

const router = Router();

/**
 * @swagger
 * /api/subjects:
 *   post:
 *     summary: Create a new subject
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - code
 *               - specialtyId
 *               - levelId
 *               - credits
 *               - coefficient
 *               - semester
 *               - type
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               specialtyId:
 *                 type: string
 *               levelId:
 *                 type: string
 *               credits:
 *                 type: number
 *               coefficient:
 *                 type: number
 *               semester:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [lecture, td, tp]
 *               teacherId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Subject created successfully
 *       400:
 *         description: Invalid input
 */
router.post(
  '/',
  authenticate,
  authorize('admin', 'department_head'),
  validate(createSubjectSchema),
  createSubject
);

/**
 * @swagger
 * /api/subjects:
 *   get:
 *     summary: Get all subjects
 *     tags: [Subjects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: specialtyId
 *         schema:
 *           type: string
 *       - in: query
 *         name: levelId
 *         schema:
 *           type: string
 *       - in: query
 *         name: teacherId
 *         schema:
 *           type: string
 *       - in: query
 *         name: semester
 *         schema:
 *           type: number
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [lecture, td, tp]
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of subjects
 */
router.get('/', authenticate, getAllSubjects);

/**
 * @swagger
 * /api/subjects/{id}:
 *   get:
 *     summary: Get subject by ID
 *     tags: [Subjects]
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
 *         description: Subject details
 *       404:
 *         description: Subject not found
 */
router.get('/:id', authenticate, validate(idParamSchema, 'params'), getSubjectById);

/**
 * @swagger
 * /api/subjects/{id}:
 *   put:
 *     summary: Update a subject
 *     tags: [Subjects]
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
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               specialtyId:
 *                 type: string
 *               levelId:
 *                 type: string
 *               credits:
 *                 type: number
 *               coefficient:
 *                 type: number
 *               semester:
 *                 type: number
 *               type:
 *                 type: string
 *                 enum: [lecture, td, tp]
 *               teacherId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Subject updated successfully
 *       404:
 *         description: Subject not found
 */
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'department_head'),
  validate(idParamSchema, 'params'),
  validate(updateSubjectSchema),
  updateSubject
);

/**
 * @swagger
 * /api/subjects/{id}:
 *   delete:
 *     summary: Delete a subject
 *     tags: [Subjects]
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
 *         description: Subject deleted successfully
 *       404:
 *         description: Subject not found
 */
router.delete(
  '/:id',
  authenticate,
  authorize('admin', 'department_head'),
  validate(idParamSchema, 'params'),
  deleteSubject
);

/**
 * @swagger
 * /api/subjects/{id}/assign-teacher:
 *   post:
 *     summary: Assign a teacher to a subject
 *     tags: [Subjects]
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
 *               - teacherId
 *             properties:
 *               teacherId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Teacher assigned successfully
 *       404:
 *         description: Subject or teacher not found
 */
router.post(
  '/:id/assign-teacher',
  authenticate,
  authorize('admin', 'department_head'),
  validate(idParamSchema, 'params'),
  assignTeacher
);

/**
 * @swagger
 * /api/subjects/{id}/unassign-teacher:
 *   post:
 *     summary: Unassign a teacher from a subject
 *     tags: [Subjects]
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
 *         description: Teacher unassigned successfully
 *       404:
 *         description: Subject not found
 */
router.post(
  '/:id/unassign-teacher',
  authenticate,
  authorize('admin', 'department_head'),
  validate(idParamSchema, 'params'),
  unassignTeacher
);

export default router;
