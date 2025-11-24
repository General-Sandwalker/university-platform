import { Response } from 'express';
import { RoomService } from '../services/room.service';
import { asyncHandler } from '../middleware/errorHandler';
import { AuthRequest } from '../middleware/auth';

const roomService = new RoomService();

export class RoomController {
  createRoom = asyncHandler(async (req: AuthRequest, res: Response) => {
    const room = await roomService.create(req.body);

    res.status(201).json({
      status: 'success',
      data: { room },
    });
  });

  getRooms = asyncHandler(async (req: AuthRequest, res: Response) => {
    const filters = {
      type: req.query.type as any,
      building: req.query.building as string,
      available: req.query.available === 'true',
    };

    const rooms = await roomService.getAll(filters);

    res.status(200).json({
      status: 'success',
      data: { rooms },
    });
  });

  getRoomById = asyncHandler(async (req: AuthRequest, res: Response) => {
    const room = await roomService.getById(req.params.id);

    res.status(200).json({
      status: 'success',
      data: { room },
    });
  });

  updateRoom = asyncHandler(async (req: AuthRequest, res: Response) => {
    const room = await roomService.update(req.params.id, req.body);

    res.status(200).json({
      status: 'success',
      data: { room },
    });
  });

  deleteRoom = asyncHandler(async (req: AuthRequest, res: Response) => {
    await roomService.delete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Room deleted successfully',
    });
  });
}
