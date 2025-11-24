import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Event, EventType } from '../entities/Event';
import { AppError } from '../middleware/errorHandler';

export class EventService {
  private eventRepository: Repository<Event>;

  constructor() {
    this.eventRepository = AppDataSource.getRepository(Event);
  }

  async getAllEvents(filters?: {
    type?: EventType;
    startDate?: Date;
    endDate?: Date;
    isActive?: boolean;
  }): Promise<Event[]> {
    const where: any = {};

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    if (filters?.startDate && filters?.endDate) {
      where.startDate = Between(filters.startDate, filters.endDate);
    } else if (filters?.startDate) {
      where.startDate = MoreThanOrEqual(filters.startDate);
    } else if (filters?.endDate) {
      where.endDate = LessThanOrEqual(filters.endDate);
    }

    return await this.eventRepository.find({
      where,
      order: { startDate: 'ASC' },
    });
  }

  async getEventById(id: string): Promise<Event> {
    const event = await this.eventRepository.findOne({
      where: { id },
    });

    if (!event) {
      throw new AppError(404, 'Event not found');
    }

    return event;
  }

  async createEvent(data: Partial<Event>): Promise<Event> {
    // Validate dates
    if (data.startDate && data.endDate && data.startDate > data.endDate) {
      throw new AppError(400, 'Start date must be before end date');
    }

    const event = this.eventRepository.create(data);
    return await this.eventRepository.save(event);
  }

  async updateEvent(id: string, data: Partial<Event>): Promise<Event> {
    const event = await this.getEventById(id);

    // Validate dates if provided
    const startDate = data.startDate || event.startDate;
    const endDate = data.endDate || event.endDate;

    if (startDate > endDate) {
      throw new AppError(400, 'Start date must be before end date');
    }

    Object.assign(event, data);
    return await this.eventRepository.save(event);
  }

  async deleteEvent(id: string): Promise<void> {
    const event = await this.getEventById(id);
    await this.eventRepository.remove(event);
  }

  async getUpcomingEvents(limit: number = 10): Promise<Event[]> {
    return await this.eventRepository.find({
      where: {
        startDate: MoreThanOrEqual(new Date()),
        isActive: true,
      },
      order: { startDate: 'ASC' },
      take: limit,
    });
  }

  async getEventsByDateRange(startDate: Date, endDate: Date): Promise<Event[]> {
    return await this.eventRepository
      .createQueryBuilder('event')
      .where('event.startDate <= :endDate', { endDate })
      .andWhere('event.endDate >= :startDate', { startDate })
      .andWhere('event.isActive = :isActive', { isActive: true })
      .orderBy('event.startDate', 'ASC')
      .getMany();
  }

  async getEventsByType(type: EventType): Promise<Event[]> {
    return await this.eventRepository.find({
      where: { type, isActive: true },
      order: { startDate: 'ASC' },
    });
  }
}
