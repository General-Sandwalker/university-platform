import { Router } from 'express';
import {
  createLevel,
  getAllLevels,
  getLevelById,
  updateLevel,
  deleteLevel,
} from '../controllers/level.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validator';
import {
  createLevelSchema,
  updateLevelSchema,
  idParamSchema,
} from '../validators/schemas';

const router = Router();

/**
 * @swagger
 * /api/levels:
 *   post:
 *     summary: Create a new level
 *     tags: [Levels]
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
 *               - order
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               specialtyId:
 *                 type: string
 *               order:
 *                 type: number
 *     responses:
 *       201:
 *         description: Level created successfully
 *       400:
 *         description: Invalid input
 */
router.post(
  '/',
  authenticate,
  authorize('admin', 'department_head'),
  validate(createLevelSchema),
  createLevel
);

/**
 * @swagger
 * /api/levels:
 *   get:
 *     summary: Get all levels
 *     tags: [Levels]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: List of levels
 */
router.get('/', authenticate, getAllLevels);

/**
 * @swagger
 * /api/levels/{id}:
 *   get:
 *     summary: Get level by ID
 *     tags: [Levels]
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
 *         description: Level details
 *       404:
 *         description: Level not found
 */
router.get('/:id', authenticate, validate(idParamSchema, 'params'), getLevelById);

/**
 * @swagger
 * /api/levels/{id}:
 *   put:
 *     summary: Update a level
 *     tags: [Levels]
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
 *               order:
 *                 type: number
 *     responses:
 *       200:
 *         description: Level updated successfully
 *       404:
 *         description: Level not found
 */
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'department_head'),
  validate(idParamSchema, 'params'),
  validate(updateLevelSchema),
  updateLevel
);

/**
 * @swagger
 * /api/levels/{id}:
 *   delete:
 *     summary: Delete a level
 *     tags: [Levels]
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
 *         description: Level deleted successfully
 *       404:
 *         description: Level not found
 */
router.delete(
  '/:id',
  authenticate,
  authorize('admin', 'department_head'),
  validate(idParamSchema, 'params'),
  deleteLevel
);

export default router;
