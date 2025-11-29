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
import { Semester } from './Semester';

export enum SessionType {
  LECTURE = 'lecture',
  TD = 'td',
  TP = 'tp',
  EXAM = 'exam',
  MAKEUP = 'makeup', // Rattrapage
}

export enum DayOfWeek {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday',
}

@Entity('timetable')
@Index(['group', 'semester', 'dayOfWeek', 'startTime'])
@Index(['teacher', 'semester'])
export class Timetable {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Week-based schedule (repeats weekly throughout the semester)
  @Column({
    type: 'enum',
    enum: DayOfWeek,
  })
  dayOfWeek: DayOfWeek;

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

  @ManyToOne(() => Semester, { onDelete: 'CASCADE' })
  semester: Semester;

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
