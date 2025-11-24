import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  Index,
} from 'typeorm';
import { User } from './User';
import { Subject } from './Subject';
import { Room } from './Room';
import { Group } from './Group';
import { Absence } from './Absence';

export enum SessionType {
  LECTURE = 'lecture',
  TD = 'td',
  TP = 'tp',
  EXAM = 'exam',
  MAKEUP = 'makeup', // Rattrapage
}

@Entity('timetable')
@Index(['date', 'startTime', 'room'])
@Index(['teacher'])
export class Timetable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'date' })
  date: Date;

  @Column({ type: 'time' })
  startTime: string; // e.g., "08:00"

  @Column({ type: 'time' })
  endTime: string; // e.g., "10:00"

  @ManyToOne(() => Subject, { onDelete: 'CASCADE' })
  subject: Subject;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  teacher: User;

  @ManyToOne(() => Room, { onDelete: 'CASCADE' })
  room: Room;

  @ManyToOne(() => Group, { onDelete: 'CASCADE' })
  group: Group;

  @Column({
    type: 'enum',
    enum: SessionType,
    default: SessionType.LECTURE,
  })
  sessionType: SessionType;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'boolean', default: false })
  isCancelled: boolean;

  @Column({ type: 'text', nullable: true })
  cancellationReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Absence, (absence) => absence.timetableEntry)
  absences: Absence[];
}
