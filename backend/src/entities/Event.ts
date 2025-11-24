import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum EventType {
  HOLIDAY = 'holiday',
  CONFERENCE = 'conference',
  EXAM_PERIOD = 'exam_period',
  REGISTRATION = 'registration',
  WORKSHOP = 'workshop',
  OTHER = 'other',
}

@Entity('events')
@Index(['startDate', 'endDate'])
export class Event {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: EventType,
    default: EventType.OTHER,
  })
  type: EventType;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'time', nullable: true })
  startTime: string;

  @Column({ type: 'time', nullable: true })
  endTime: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location: string;

  @Column({ type: 'boolean', default: false })
  affectsAllUsers: boolean; // If true, visible to everyone

  @Column({ type: 'boolean', default: false })
  blocksTimetable: boolean; // If true, no classes during this event

  @Column({ type: 'text', nullable: true })
  organizer: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
