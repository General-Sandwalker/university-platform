import { Router } from 'express';
import {
  createSpecialty,
  getAllSpecialties,
  getSpecialtyById,
  updateSpecialty,
  deleteSpecialty,
} from '../controllers/specialty.controller';
import { authenticate, authorize } from '../middleware/auth';
import { validate } from '../middleware/validator';
import {
  createSpecialtySchema,
  updateSpecialtySchema,
  idParamSchema,
} from '../validators/schemas';

const router = Router();

/**
 * @swagger
 * /api/specialties:
 *   post:
 *     summary: Create a new specialty
 *     tags: [Specialties]
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
 *               - departmentId
 *             properties:
 *               name:
 *                 type: string
 *               code:
 *                 type: string
 *               departmentId:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Specialty created successfully
 *       400:
 *         description: Invalid input
 */
router.post(
  '/',
  authenticate,
  authorize('admin', 'department_head'),
  validate(createSpecialtySchema),
  createSpecialty
);

/**
 * @swagger
 * /api/specialties:
 *   get:
 *     summary: Get all specialties
 *     tags: [Specialties]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: departmentId
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of specialties
 */
router.get('/', authenticate, getAllSpecialties);

/**
 * @swagger
 * /api/specialties/{id}:
 *   get:
 *     summary: Get specialty by ID
 *     tags: [Specialties]
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
 *         description: Specialty details
 *       404:
 *         description: Specialty not found
 */
router.get('/:id', authenticate, validate(idParamSchema, 'params'), getSpecialtyById);

/**
 * @swagger
 * /api/specialties/{id}:
 *   put:
 *     summary: Update a specialty
 *     tags: [Specialties]
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
 *               departmentId:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Specialty updated successfully
 *       404:
 *         description: Specialty not found
 */
router.put(
  '/:id',
  authenticate,
  authorize('admin', 'department_head'),
  validate(idParamSchema, 'params'),
  validate(updateSpecialtySchema),
  updateSpecialty
);

/**
 * @swagger
 * /api/specialties/{id}:
 *   delete:
 *     summary: Delete a specialty
 *     tags: [Specialties]
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
 *         description: Specialty deleted successfully
 *       404:
 *         description: Specialty not found
 */
router.delete(
  '/:id',
  authenticate,
  authorize('admin', 'department_head'),
  validate(idParamSchema, 'params'),
  deleteSpecialty
);

export default router;
