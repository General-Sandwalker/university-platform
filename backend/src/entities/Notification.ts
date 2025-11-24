import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { User } from './User';

export enum NotificationType {
  ABSENCE_WARNING = 'absence_warning',
  ELIMINATION_RISK = 'elimination_risk',
  TIMETABLE_CHANGE = 'timetable_change',
  EXCUSE_APPROVED = 'excuse_approved',
  EXCUSE_REJECTED = 'excuse_rejected',
  NEW_MESSAGE = 'new_message',
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
  EVENT_REMINDER = 'event_reminder',
}

@Entity('notifications')
@Index(['user'])
@Index(['createdAt'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
  user: User;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Additional data (e.g., absence count, event ID)

  @Column({ type: 'boolean', default: false })
  isRead: boolean;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;

  @Column({ type: 'boolean', default: false })
  emailSent: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
