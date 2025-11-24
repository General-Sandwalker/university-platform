import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../entities/User';
import { validate } from '../middleware/validator';
import {
  createNotification,
  createBulkNotifications,
  getMyNotifications,
  getNotificationById,
  markNotificationAsRead,
  markAllAsRead,
  deleteNotification,
  deleteAllNotifications,
  getUnreadCount,
  getStatistics,
} from '../controllers/notification.controller';
import { z } from 'zod';

const router = Router();

const createNotificationSchema = z.object({
  body: z.object({
    userId: z.string().uuid(),
    type: z.enum([
      'absence_warning',
      'elimination_risk',
      'message_received',
      'grade_published',
      'timetable_change',
      'announcement',
      'excuse_reviewed',
    ]),
    title: z.string().min(1).max(200),
    message: z.string().min(1).max(1000),
    relatedId: z.string().uuid().optional(),
  }),
});

const createBulkNotificationsSchema = z.object({
  body: z.object({
    userIds: z.array(z.string().uuid()).min(1),
    type: z.enum([
      'absence_warning',
      'elimination_risk',
      'message_received',
      'grade_published',
      'timetable_change',
      'announcement',
      'excuse_reviewed',
    ]),
    title: z.string().min(1).max(200),
    message: z.string().min(1).max(1000),
    relatedId: z.string().uuid().optional(),
  }),
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Notification:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         user:
 *           $ref: '#/components/schemas/User'
 *         type:
 *           type: string
 *           enum: [absence_warning, elimination_risk, message_received, grade_published, timetable_change, announcement, excuse_reviewed]
 *         title:
 *           type: string
 *         message:
 *           type: string
 *         relatedId:
 *           type: string
 *           format: uuid
 *         isRead:
 *           type: boolean
 *         readAt:
 *           type: string
 *           format: date-time
 *         createdAt:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/notifications:
 *   post:
 *     summary: Create a notification (Admin only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - type
 *               - title
 *               - message
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *               type:
 *                 type: string
 *                 enum: [absence_warning, elimination_risk, message_received, grade_published, timetable_change, announcement, excuse_reviewed]
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               relatedId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Notification created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 */
router.post(
  '/',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(createNotificationSchema),
  createNotification
);

/**
 * @swagger
 * /api/notifications/bulk:
 *   post:
 *     summary: Create bulk notifications (Admin only)
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userIds
 *               - type
 *               - title
 *               - message
 *             properties:
 *               userIds:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uuid
 *               type:
 *                 type: string
 *                 enum: [absence_warning, elimination_risk, message_received, grade_published, timetable_change, announcement, excuse_reviewed]
 *               title:
 *                 type: string
 *               message:
 *                 type: string
 *               relatedId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       201:
 *         description: Notifications created successfully
 */
router.post(
  '/bulk',
  authenticate,
  authorize(UserRole.ADMIN),
  validate(createBulkNotificationsSchema),
  createBulkNotifications
);

/**
 * @swagger
 * /api/notifications/me:
 *   get:
 *     summary: Get my notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [absence_warning, elimination_risk, message_received, grade_published, timetable_change, announcement, excuse_reviewed]
 *         description: Filter by notification type
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *         description: Show only unread notifications
 *     responses:
 *       200:
 *         description: Notifications retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Notification'
 */
router.get('/me', authenticate, getMyNotifications);

/**
 * @swagger
 * /api/notifications/unread-count:
 *   get:
 *     summary: Get unread notification count
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: number
 */
router.get('/unread-count', authenticate, getUnreadCount);

/**
 * @swagger
 * /api/notifications/statistics:
 *   get:
 *     summary: Get notification statistics
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 total:
 *                   type: number
 *                 unread:
 *                   type: number
 *                 byType:
 *                   type: object
 *                   additionalProperties:
 *                     type: number
 */
router.get('/statistics', authenticate, getStatistics);

/**
 * @swagger
 * /api/notifications/mark-all-read:
 *   put:
 *     summary: Mark all notifications as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications marked as read
 */
router.put('/mark-all-read', authenticate, markAllAsRead);

/**
 * @swagger
 * /api/notifications/delete-all:
 *   delete:
 *     summary: Delete all notifications
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All notifications deleted
 */
router.delete('/delete-all', authenticate, deleteAllNotifications);

/**
 * @swagger
 * /api/notifications/{id}:
 *   get:
 *     summary: Get notification by ID
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Notification retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 */
router.get('/:id', authenticate, getNotificationById);

/**
 * @swagger
 * /api/notifications/{id}/read:
 *   put:
 *     summary: Mark notification as read
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Notification marked as read
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Notification'
 */
router.put('/:id/read', authenticate, markNotificationAsRead);

/**
 * @swagger
 * /api/notifications/{id}:
 *   delete:
 *     summary: Delete notification
 *     tags: [Notifications]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       204:
 *         description: Notification deleted successfully
 */
router.delete('/:id', authenticate, deleteNotification);

export default router;
