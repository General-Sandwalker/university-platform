import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validator';
import {
  sendMessage,
  getInbox,
  getSent,
  getConversation,
  getConversationList,
  getMessageById,
  markAsRead,
  markAllAsRead,
  deleteMessage,
  getUnreadCount,
  toggleStar,
  markConversationAsRead,
} from '../controllers/message.controller';
import { z } from 'zod';

const router = Router();

const sendMessageSchema = z.object({
  body: z.object({
    receiverId: z.string().uuid(),
    content: z.string().min(1).max(5000),
  }),
});

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           format: uuid
 *         sender:
 *           $ref: '#/components/schemas/User'
 *         receiver:
 *           $ref: '#/components/schemas/User'
 *         content:
 *           type: string
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
 * /api/messages/send:
 *   post:
 *     summary: Send a message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiverId
 *               - content
 *             properties:
 *               receiverId:
 *                 type: string
 *                 format: uuid
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 */
router.post('/send', authenticate, validate(sendMessageSchema), sendMessage);

/**
 * @swagger
 * /api/messages/inbox:
 *   get:
 *     summary: Get inbox messages
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: unreadOnly
 *         schema:
 *           type: boolean
 *         description: Show only unread messages
 *     responses:
 *       200:
 *         description: Inbox messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 */
router.get('/inbox', authenticate, getInbox);

/**
 * @swagger
 * /api/messages/sent:
 *   get:
 *     summary: Get sent messages
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Sent messages retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 */
router.get('/sent', authenticate, getSent);

/**
 * @swagger
 * /api/messages/conversations:
 *   get:
 *     summary: Get list of conversations
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Conversations retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   user:
 *                     $ref: '#/components/schemas/User'
 *                   lastMessage:
 *                     $ref: '#/components/schemas/Message'
 *                   unreadCount:
 *                     type: number
 */
router.get('/conversations', authenticate, getConversationList);

/**
 * @swagger
 * /api/messages/unread-count:
 *   get:
 *     summary: Get unread message count
 *     tags: [Messages]
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
 * /api/messages/mark-all-read:
 *   put:
 *     summary: Mark all messages as read
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: All messages marked as read
 */
router.put('/mark-all-read', authenticate, markAllAsRead);

/**
 * @swagger
 * /api/messages/conversation/{otherUserId}/read:
 *   put:
 *     summary: Mark all messages in a conversation as read
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: otherUserId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Conversation marked as read
 */
router.put('/conversation/:otherUserId/read', authenticate, markConversationAsRead);

/**
 * @swagger
 * /api/messages/conversation/{otherUserId}:
 *   get:
 *     summary: Get conversation with a specific user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: otherUserId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Conversation retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Message'
 */
router.get('/conversation/:otherUserId', authenticate, getConversation);

/**
 * @swagger
 * /api/messages/{id}:
 *   get:
 *     summary: Get message by ID
 *     tags: [Messages]
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
 *         description: Message retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 */
router.get('/:id', authenticate, getMessageById);

/**
 * @swagger
 * /api/messages/{id}/read:
 *   put:
 *     summary: Mark message as read
 *     tags: [Messages]
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
 *         description: Message marked as read
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 */
router.put('/:id/read', authenticate, markAsRead);

/**
 * @swagger
 * /api/messages/{id}/star:
 *   put:
 *     summary: Toggle star/favorite status on a message
 *     tags: [Messages]
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
 *         description: Message star status toggled
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Message'
 */
router.put('/:id/star', authenticate, toggleStar);

/**
 * @swagger
 * /api/messages/{id}:
 *   delete:
 *     summary: Delete message
 *     tags: [Messages]
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
 *         description: Message deleted successfully
 */
router.delete('/:id', authenticate, deleteMessage);

export default router;
