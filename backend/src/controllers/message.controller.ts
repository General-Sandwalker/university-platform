import { Request, Response, NextFunction } from 'express';
import { MessageService } from '../services/message.service';

const messageService = new MessageService();

export const sendMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const senderId = req.user!.id;
    const { receiverId, content } = req.body;

    const message = await messageService.sendMessage({
      senderId,
      receiverId,
      content,
    });

    res.status(201).json(message);
  } catch (error) {
    next(error);
  }
};

export const getInbox = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { unreadOnly } = req.query;

    const messages = await messageService.getInbox(
      userId,
      unreadOnly === 'true'
    );

    res.json(messages);
  } catch (error) {
    next(error);
  }
};

export const getSent = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const messages = await messageService.getSent(userId);
    res.json(messages);
  } catch (error) {
    next(error);
  }
};

export const getConversation = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const { otherUserId } = req.params;

    const messages = await messageService.getConversation(userId, otherUserId);
    res.json(messages);
  } catch (error) {
    next(error);
  }
};

export const getConversationList = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const conversations = await messageService.getConversationList(userId);
    res.json(conversations);
  } catch (error) {
    next(error);
  }
};

export const getMessageById = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const message = await messageService.getById(req.params.id, userId);
    res.json(message);
  } catch (error) {
    next(error);
  }
};

export const markAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const message = await messageService.markAsRead(req.params.id, userId);
    res.json(message);
  } catch (error) {
    next(error);
  }
};

export const markAllAsRead = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    await messageService.markAllAsRead(userId);
    res.json({ message: 'All messages marked as read' });
  } catch (error) {
    next(error);
  }
};

export const deleteMessage = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    await messageService.deleteMessage(req.params.id, userId);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

export const getUnreadCount = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.user!.id;
    const count = await messageService.getUnreadCount(userId);
    res.json({ count });
  } catch (error) {
    next(error);
  }
};
