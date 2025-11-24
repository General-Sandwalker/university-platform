import { Repository } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Notification } from '../entities/Notification';
import { User } from '../entities/User';
import { AppError } from '../middleware/errorHandler';

export class NotificationService {
  private notificationRepository: Repository<Notification>;
  private userRepository: Repository<User>;

  constructor() {
    this.notificationRepository = AppDataSource.getRepository(Notification);
    this.userRepository = AppDataSource.getRepository(User);
  }

  async create(data: {
    userId: string;
    type:
      | 'absence_warning'
      | 'elimination_risk'
      | 'message_received'
      | 'grade_published'
      | 'timetable_change'
      | 'announcement'
      | 'excuse_reviewed';
    title: string;
    message: string;
    relatedId?: string;
  }): Promise<Notification> {
    const user = await this.userRepository.findOne({
      where: { id: data.userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const notification = this.notificationRepository.create({
      user,
      type: data.type,
      title: data.title,
      message: data.message,
      relatedId: data.relatedId,
      isRead: false,
    });

    return await this.notificationRepository.save(notification);
  }

  async createBulk(data: {
    userIds: string[];
    type:
      | 'absence_warning'
      | 'elimination_risk'
      | 'message_received'
      | 'grade_published'
      | 'timetable_change'
      | 'announcement'
      | 'excuse_reviewed';
    title: string;
    message: string;
    relatedId?: string;
  }): Promise<Notification[]> {
    const notifications = await Promise.all(
      data.userIds.map((userId) =>
        this.create({
          userId,
          type: data.type,
          title: data.title,
          message: data.message,
          relatedId: data.relatedId,
        })
      )
    );

    return notifications;
  }

  async getAll(
    userId: string,
    filters?: {
      type?: string;
      unreadOnly?: boolean;
    }
  ): Promise<Notification[]> {
    const query = this.notificationRepository
      .createQueryBuilder('notification')
      .where('notification.userId = :userId', { userId })
      .orderBy('notification.createdAt', 'DESC');

    if (filters?.type) {
      query.andWhere('notification.type = :type', { type: filters.type });
    }

    if (filters?.unreadOnly) {
      query.andWhere('notification.isRead = :isRead', { isRead: false });
    }

    return await query.getMany();
  }

  async getById(id: string, userId: string): Promise<Notification> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    // Verify notification belongs to user
    if (notification.user.id !== userId) {
      throw new AppError('Not authorized to view this notification', 403);
    }

    return notification;
  }

  async markAsRead(id: string, userId: string): Promise<Notification> {
    const notification = await this.getById(id, userId);

    notification.isRead = true;
    notification.readAt = new Date();

    return await this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.notificationRepository
      .createQueryBuilder()
      .update(Notification)
      .set({ isRead: true, readAt: new Date() })
      .where('userId = :userId AND isRead = :isRead', {
        userId,
        isRead: false,
      })
      .execute();
  }

  async delete(id: string, userId: string): Promise<void> {
    const notification = await this.notificationRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!notification) {
      throw new AppError('Notification not found', 404);
    }

    // Verify notification belongs to user
    if (notification.user.id !== userId) {
      throw new AppError('Not authorized to delete this notification', 403);
    }

    await this.notificationRepository.remove(notification);
  }

  async deleteAll(userId: string): Promise<void> {
    await this.notificationRepository
      .createQueryBuilder()
      .delete()
      .from(Notification)
      .where('userId = :userId', { userId })
      .execute();
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationRepository.count({
      where: {
        user: { id: userId },
        isRead: false,
      },
    });
  }

  async getStatistics(userId: string): Promise<{
    total: number;
    unread: number;
    byType: { [key: string]: number };
  }> {
    const notifications = await this.getAll(userId);

    const statistics = {
      total: notifications.length,
      unread: notifications.filter((n) => !n.isRead).length,
      byType: {} as { [key: string]: number },
    };

    notifications.forEach((notification) => {
      if (!statistics.byType[notification.type]) {
        statistics.byType[notification.type] = 0;
      }
      statistics.byType[notification.type]++;
    });

    return statistics;
  }

  // Helper method to send notifications for specific events
  async notifyAbsenceWarning(userId: string, absenceCount: number): Promise<void> {
    await this.create({
      userId,
      type: 'absence_warning',
      title: 'Absence Warning',
      message: `You have ${absenceCount} unexcused absences. Please submit excuses if applicable.`,
    });
  }

  async notifyEliminationRisk(userId: string, absenceCount: number): Promise<void> {
    await this.create({
      userId,
      type: 'elimination_risk',
      title: 'Elimination Risk',
      message: `URGENT: You have ${absenceCount} unexcused absences. You are at risk of elimination.`,
    });
  }

  async notifyMessageReceived(userId: string, senderName: string): Promise<void> {
    await this.create({
      userId,
      type: 'message_received',
      title: 'New Message',
      message: `You have received a new message from ${senderName}.`,
    });
  }

  async notifyExcuseReviewed(
    userId: string,
    status: string,
    subjectName: string
  ): Promise<void> {
    await this.create({
      userId,
      type: 'excuse_reviewed',
      title: 'Excuse Reviewed',
      message: `Your excuse for ${subjectName} has been ${status}.`,
    });
  }

  async notifyTimetableChange(
    userIds: string[],
    changeDetails: string
  ): Promise<void> {
    await this.createBulk({
      userIds,
      type: 'timetable_change',
      title: 'Timetable Change',
      message: changeDetails,
    });
  }

  async notifyAnnouncement(
    userIds: string[],
    title: string,
    message: string
  ): Promise<void> {
    await this.createBulk({
      userIds,
      type: 'announcement',
      title,
      message,
    });
  }
}
