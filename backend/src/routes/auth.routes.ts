import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { validate } from '../middleware/validator';
import { authenticate } from '../middleware/auth';
import {
  loginSchema,
  passwordResetRequestSchema,
  passwordResetConfirmSchema,
  refreshTokenSchema,
} from '../validators/schemas';

const router = Router();
const authController = new AuthController();

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login with CIN and password
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               cin:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', validate(loginSchema), authController.login);

/**
 * @swagger
 * /auth/refresh:
 *   post:
 *     summary: Refresh access token
 *     tags: [Authentication]
 */
router.post('/refresh', validate(refreshTokenSchema), authController.refreshToken);

/**
 * @swagger
 * /auth/password-reset/request:
 *   post:
 *     summary: Request password reset
 *     tags: [Authentication]
 */
router.post(
  '/password-reset/request',
  validate(passwordResetRequestSchema),
  authController.requestPasswordReset
);

/**
 * @swagger
 * /auth/password-reset/confirm:
 *   post:
 *     summary: Confirm password reset with token
 *     tags: [Authentication]
 */
router.post(
  '/password-reset/confirm',
  validate(passwordResetConfirmSchema),
  authController.resetPassword
);

/**
 * @swagger
 * /auth/password/change:
 *   post:
 *     summary: Change password (requires authentication)
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 */
router.post('/password/change', authenticate, authController.changePassword);

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user profile
 *     tags: [Authentication]
 *     security:
 *       - bearerAuth: []
 */
router.get('/me', authenticate, authController.getMe);

export default router;
