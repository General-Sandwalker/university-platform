import { Router } from 'express';
import {
  createGroup,
  getAllGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  addStudentToGroup,
  removeStudentFromGroup,
} from '../controllers/group.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validator';
import {
  createGroupSchema,
  updateGroupSchema,
  idParamSchema,
} from '../validators/schemas';

const router = Router();

/**
 * @swagger
 * /api/groups:
 *   post:
 *     summary: Create a new group
 *     tags: [Groups]
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
 *               - levelId
 *               - capacity
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               levelId:
 *                 type: string
 *               capacity:
 *                 type: number
 *     responses:
 *       201:
 *         description: Group created successfully
 *       400:
 *         description: Invalid input
 */
router.post(
  '/',
  authenticate,
  authorize('admin', 'department_head'),
  validate(createGroupSchema),
  createGroup
);

/**
 * @swagger
 * /api/groups:
 *   get:
 *     summary: Get all groups
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: levelId
 *         schema:
 *           type: string
 *       - in: query
 *         name: specialtyId
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of groups
 */
router.get('/', authenticate, getAllGroups);

/**
 * @swagger
 * /api/groups/{id}:
 *   get:
 *     summary: Get group by ID
 *     tags: [Groups]
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
 *         description: Group details
 *       404:
 *         description: Group not found
 */
router.get('/:id', authenticate, validate(idParamSchema, 'params'), getGroupById);

/**
 * @swagger
 * /api/groups/{id}:
 *   put:
 *     summary: Update a group
 *     tags: [Groups]
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
 *               levelId:
 *                 type: string
 *               capacity:
 *                 type: number
 *     responses:
 *       200:
 *         description: Group updated successfully
 *       404:
 *         description: Group not found
 */
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'department_head'),
  validate(idParamSchema, 'params'),
  validate(updateGroupSchema),
  updateGroup
);

/**
 * @swagger
 * /api/groups/{id}:
 *   delete:
 *     summary: Delete a group
 *     tags: [Groups]
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
 *         description: Group deleted successfully
 *       404:
 *         description: Group not found
 */
router.delete(
  '/:id',
  authenticate,
  authorize('admin', 'department_head'),
  validate(idParamSchema, 'params'),
  deleteGroup
);

/**
 * @swagger
 * /api/groups/{id}/students:
 *   post:
 *     summary: Add a student to a group
 *     tags: [Groups]
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
 *               - studentId
 *             properties:
 *               studentId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Student added successfully
 *       400:
 *         description: Group at capacity or student already in group
 */
router.post(
  '/:id/students',
  authenticate,
  authorize('admin', 'department_head'),
  validate(idParamSchema, 'params'),
  addStudentToGroup
);

/**
 * @swagger
 * /api/groups/{id}/students/{studentId}:
 *   delete:
 *     summary: Remove a student from a group
 *     tags: [Groups]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: studentId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Student removed successfully
 *       404:
 *         description: Student or group not found
 */
router.delete(
  '/:id/students/:studentId',
  authenticate,
  authorize('admin', 'department_head'),
  removeStudentFromGroup
);

export default router;
