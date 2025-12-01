import { Repository, IsNull } from 'typeorm';
import { AppDataSource } from '../config/database';
import { Message, MessageStatus } from '../entities/Message';
import { User } from '../entities/User';
import { AppError } from '../middleware/errorHandler';
import { NotificationService } from './notification.service';

export class MessageService {
  private messageRepository: Repository<Message>;
  private userRepository: Repository<User>;
  private notificationService: NotificationService;

  constructor() {
    this.messageRepository = AppDataSource.getRepository(Message);
    this.userRepository = AppDataSource.getRepository(User);
    this.notificationService = new NotificationService();
  }

  async sendMessage(data: {
    senderId: string;
    receiverId: string;
    content: string;
  }): Promise<Message> {
    // Verify sender exists
    const sender = await this.userRepository.findOne({
      where: { id: data.senderId },
    });

    if (!sender) {
      throw new AppError(404, 'Sender not found');
    }

    // Verify receiver exists
    const receiver = await this.userRepository.findOne({
      where: { id: data.receiverId },
    });

    if (!receiver) {
      throw new AppError(404, 'Receiver not found');
    }

    // Prevent sending message to self
    if (data.senderId === data.receiverId) {
      throw new AppError(400, 'Cannot send message to yourself');
    }

    const message = this.messageRepository.create({
      sender,
      receiver,
      content: data.content,
      status: MessageStatus.SENT,
      readAt: null,
    });

    const savedMessage = await this.messageRepository.save(message);

    // Create notification for receiver
    try {
      await this.notificationService.create({
        userId: receiver.id,
        type: 'new_message',
        title: 'New Message',
        message: `You have a new message from ${sender.firstName} ${sender.lastName}`,
      });
    } catch (error) {
      // Don't fail message send if notification fails
      console.error('Failed to create message notification:', error);
    }

    return savedMessage;
  }

  async getConversation(
    userId: string,
    otherUserId: string
  ): Promise<Message[]> {
    return await this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receiver', 'receiver')
      .where(
        '(message.senderId = :userId AND message.receiverId = :otherUserId) OR (message.senderId = :otherUserId AND message.receiverId = :userId)',
        { userId, otherUserId }
      )
      .orderBy('message.createdAt', 'ASC')
      .getMany();
  }

  async getInbox(userId: string, unreadOnly: boolean = false): Promise<Message[]> {
    const query = this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receiver', 'receiver')
      .where('message.receiverId = :userId', { userId })
      .orderBy('message.createdAt', 'DESC');

    if (unreadOnly) {
      query.andWhere('message.readAt IS NULL');
    }

    return await query.getMany();
  }

  async getSent(userId: string): Promise<Message[]> {
    return await this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .leftJoinAndSelect('message.receiver', 'receiver')
      .where('message.senderId = :userId', { userId })
      .orderBy('message.createdAt', 'DESC')
      .getMany();
  }

  async getById(id: string, userId: string): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id },
      relations: ['sender', 'receiver'],
    });

    if (!message) {
      throw new AppError(404, 'Message not found');
    }

    // Verify user is sender or receiver
    if (message.sender.id !== userId && message.receiver.id !== userId) {
      throw new AppError(403, 'Not authorized to view this message');
    }

    return message;
  }

  async markAsRead(id: string, userId: string): Promise<Message> {
    const message = await this.getById(id, userId);

    // Only receiver can mark as read
    if (message.receiver.id !== userId) {
      throw new AppError(403, 'Only receiver can mark message as read');
    }

    message.status = MessageStatus.READ;
    message.readAt = new Date();

    return await this.messageRepository.save(message);
  }

  async markAllAsRead(userId: string): Promise<void> {
    await this.messageRepository
      .createQueryBuilder()
      .update(Message)
      .set({ status: MessageStatus.READ, readAt: new Date() })
      .where('receiverId = :userId AND readAt IS NULL', {
        userId,
      })
      .execute();
  }

  async deleteMessage(id: string, userId: string): Promise<void> {
    const message = await this.messageRepository.findOne({
      where: { id },
      relations: ['sender', 'receiver'],
    });

    if (!message) {
      throw new AppError(404, 'Message not found');
    }

    // Only sender or receiver can delete
    if (message.sender.id !== userId && message.receiver.id !== userId) {
      throw new AppError(403, 'Not authorized to delete this message');
    }

    await this.messageRepository.remove(message);
  }

  async getConversationList(userId: string): Promise<
    Array<{
      user: User;
      lastMessage: Message;
      unreadCount: number;
    }>
  > {
    // Get all users the current user has messaged with
    const sentMessages = await this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.receiver', 'receiver')
      .where('message.senderId = :userId', { userId })
      .orderBy('message.createdAt', 'DESC')
      .getMany();

    const receivedMessages = await this.messageRepository
      .createQueryBuilder('message')
      .leftJoinAndSelect('message.sender', 'sender')
      .where('message.receiverId = :userId', { userId })
      .orderBy('message.createdAt', 'DESC')
      .getMany();

    // Get unique user IDs
    const userIds = new Set<string>();
    sentMessages.forEach((m: Message) => userIds.add(m.receiver.id));
    receivedMessages.forEach((m: Message) => userIds.add(m.sender.id));

    // Build conversation list
    const conversations = await Promise.all(
      Array.from(userIds).map(async (otherUserId) => {
        const messages = await this.getConversation(userId, otherUserId);
        const lastMessage = messages[messages.length - 1];
        const unreadCount = messages.filter(
          (m) => m.receiver.id === userId && m.readAt === null
        ).length;

        const user = await this.userRepository.findOne({
          where: { id: otherUserId },
        });

        return {
          user: user!,
          lastMessage,
          unreadCount,
        };
      })
    );

    // Sort by last message date
    return conversations.sort(
      (a, b) =>
        b.lastMessage.createdAt.getTime() - a.lastMessage.createdAt.getTime()
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await this.messageRepository.count({
      where: {
        receiver: { id: userId },
        readAt: IsNull(),
      },
    });
  }

  async toggleStar(messageId: string, userId: string): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id: messageId },
      relations: ['sender', 'receiver'],
    });

    if (!message) {
      throw new AppError(404, 'Message not found');
    }

    // Verify user is sender or receiver
    if (message.sender.id !== userId && message.receiver.id !== userId) {
      throw new AppError(403, 'Not authorized to star this message');
    }

    // Toggle star based on user role
    if (message.sender.id === userId) {
      message.isStarredBySender = !message.isStarredBySender;
    } else {
      message.isStarredByReceiver = !message.isStarredByReceiver;
    }

    return await this.messageRepository.save(message);
  }

  async markConversationAsRead(userId: string, otherUserId: string): Promise<void> {
    await this.messageRepository
      .createQueryBuilder()
      .update(Message)
      .set({ status: MessageStatus.READ, readAt: new Date() })
      .where('receiverId = :userId AND senderId = :otherUserId AND readAt IS NULL', {
        userId,
        otherUserId,
      })
      .execute();
  }
}
