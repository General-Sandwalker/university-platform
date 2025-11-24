import { Router } from 'express';
import { RoomController } from '../controllers/room.controller';
import { authenticate, adminOnly } from '../middleware/auth';
import { validate } from '../middleware/validator';
import { createRoomSchema } from '../validators/schemas';

const router = Router();
const controller = new RoomController();

/**
 * @swagger
 * /rooms:
 *   get:
 *     summary: Get all rooms
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 */
router.get('/', authenticate, controller.getRooms);

/**
 * @swagger
 * /rooms:
 *   post:
 *     summary: Create a new room
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 */
router.post('/', authenticate, adminOnly, validate(createRoomSchema), controller.createRoom);

/**
 * @swagger
 * /rooms/{id}:
 *   get:
 *     summary: Get room by ID
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 */
router.get('/:id', authenticate, controller.getRoomById);

/**
 * @swagger
 * /rooms/{id}:
 *   put:
 *     summary: Update room
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 */
router.put('/:id', authenticate, adminOnly, controller.updateRoom);

/**
 * @swagger
 * /rooms/{id}:
 *   delete:
 *     summary: Delete room
 *     tags: [Rooms]
 *     security:
 *       - bearerAuth: []
 */
router.delete('/:id', authenticate, adminOnly, controller.deleteRoom);

export default router;
