import { Repository } from 'typeorm';
import { Room, RoomType } from '../entities/Room';
import { AppDataSource } from '../config/database';
import { AppError } from '../middleware/errorHandler';
import { logger } from '../utils/logger';

interface CreateRoomDto {
  code: string;
  name: string;
  type: RoomType;
  capacity: number;
  building?: string;
  floor?: string;
  equipment?: string;
}

interface UpdateRoomDto {
  code?: string;
  name?: string;
  type?: RoomType;
  capacity?: number;
  building?: string;
  floor?: string;
  equipment?: string;
  isAvailable?: boolean;
  notes?: string;
}

export class RoomService {
  private repository: Repository<Room>;

  constructor() {
    this.repository = AppDataSource.getRepository(Room);
  }

  async create(data: CreateRoomDto) {
    const existing = await this.repository.findOne({ where: { code: data.code } });
    if (existing) {
      throw new AppError(400, 'Room with this code already exists');
    }

    const room = this.repository.create(data);
    await this.repository.save(room);

    logger.info(`Room created: ${room.code}`);
    return room;
  }

  async getAll(filters?: { type?: RoomType; building?: string; available?: boolean }) {
    const queryBuilder = this.repository.createQueryBuilder('room');

    if (filters?.type) {
      queryBuilder.andWhere('room.type = :type', { type: filters.type });
    }

    if (filters?.building) {
      queryBuilder.andWhere('room.building = :building', { building: filters.building });
    }

    if (filters?.available !== undefined) {
      queryBuilder.andWhere('room.isAvailable = :available', { available: filters.available });
    }

    queryBuilder.orderBy('room.code', 'ASC');

    return queryBuilder.getMany();
  }

  async getById(id: string) {
    const room = await this.repository.findOne({ where: { id } });

    if (!room) {
      throw new AppError(404, 'Room not found');
    }

    return room;
  }

  async update(id: string, data: UpdateRoomDto) {
    const room = await this.repository.findOne({ where: { id } });

    if (!room) {
      throw new AppError(404, 'Room not found');
    }

    if (data.code && data.code !== room.code) {
      const existing = await this.repository.findOne({ where: { code: data.code } });
      if (existing) {
        throw new AppError(400, 'Room code already in use');
      }
    }

    Object.assign(room, data);
    await this.repository.save(room);

    logger.info(`Room updated: ${room.code}`);
    return room;
  }

  async delete(id: string) {
    const room = await this.repository.findOne({ where: { id } });

    if (!room) {
      throw new AppError(404, 'Room not found');
    }

    await this.repository.remove(room);
    logger.info(`Room deleted: ${room.code}`);
  }

  async checkAvailability(roomId: string, date: Date, startTime: string, endTime: string) {
    // This will be used by timetable service
    const room = await this.getById(roomId);
    
    if (!room.isAvailable) {
      return false;
    }

    // Additional logic will check timetable conflicts
    return true;
  }
}
