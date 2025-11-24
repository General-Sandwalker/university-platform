import { Request, Response, NextFunction } from 'express';
import { EventService } from '../services/event.service';
import { EventType } from '../entities/Event';
import { AuthRequest } from '../middleware/auth';

const eventService = new EventService();

export const getAllEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { type, startDate, endDate, isActive } = req.query;

    const filters: any = {};
    if (type) filters.type = type as EventType;
    if (startDate) filters.startDate = new Date(startDate as string);
    if (endDate) filters.endDate = new Date(endDate as string);
    if (isActive !== undefined) filters.isActive = isActive === 'true';

    const events = await eventService.getAllEvents(filters);
    res.json(events);
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const event = await eventService.getEventById(req.params.id);
    res.json(event);
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const event = await eventService.createEvent(req.body);
    res.status(201).json(event);
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const event = await eventService.updateEvent(req.params.id, req.body);
    res.json(event);
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    await eventService.deleteEvent(req.params.id);
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const getUpcomingEvents = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10;
    const events = await eventService.getUpcomingEvents(limit);
    res.json(events);
  } catch (error) {
    next(error);
  }
};

export const getEventsByDateRange = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { startDate, endDate } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({
        status: 'error',
        message: 'startDate and endDate are required',
      });
    }

    const events = await eventService.getEventsByDateRange(
      new Date(startDate as string),
      new Date(endDate as string)
    );
    res.json(events);
  } catch (error) {
    next(error);
  }
};

export const getEventsByType = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { type } = req.params;
    const events = await eventService.getEventsByType(type as EventType);
    res.json(events);
  } catch (error) {
    next(error);
  }
};
