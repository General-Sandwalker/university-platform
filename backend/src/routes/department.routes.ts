import { Router } from 'express';
import { DepartmentController } from '../controllers/department.controller';
import { authenticate, adminOnly } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { createDepartmentSchema, updateDepartmentSchema } from '../validators/schemas';

const router = Router();
const controller = new DepartmentController();

/**
 * @swagger
 * /departments:
 *   get:
 *     summary: Get all departments
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authenticate, controller.getDepartments);

/**
 * @swagger
 * /departments:
 *   post:
 *     summary: Create a new department
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authenticate, adminOnly, validate(createDepartmentSchema), controller.createDepartment);

/**
 * @swagger
 * /departments/{id}:
 *   get:
 *     summary: Get department by ID
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authenticate, controller.getDepartmentById);

/**
 * @swagger
 * /departments/{id}:
 *   put:
 *     summary: Update department
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authenticate, adminOnly, validate(updateDepartmentSchema), controller.updateDepartment);

/**
 * @swagger
 * /departments/{id}:
 *   delete:
 *     summary: Delete department
 *     tags: [Departments]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authenticate, adminOnly, controller.deleteDepartment);

export default router;
