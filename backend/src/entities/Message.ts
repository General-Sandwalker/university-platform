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

export enum MessageStatus {
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
}

@Entity('messages')
@Index(['sender'])
@Index(['receiver'])
@Index(['createdAt'])
export class Message {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.sentMessages, { onDelete: 'CASCADE' })
  sender: User;

  @ManyToOne(() => User, (user) => user.receivedMessages, { onDelete: 'CASCADE' })
  receiver: User;

  @Column({ type: 'text' })
  content: string;

  @Column({
    type: 'enum',
    enum: MessageStatus,
    default: MessageStatus.SENT,
  })
  status: MessageStatus;

  @Column({ type: 'timestamp', nullable: true })
  readAt: Date;

  @Column({ type: 'text', nullable: true })
  attachment: string; // Path to attachment file

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @Column({ type: 'boolean', default: false })
  isStarredBySender: boolean;

  @Column({ type: 'boolean', default: false })
  isStarredByReceiver: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
