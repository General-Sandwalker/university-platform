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
import { Timetable } from './Timetable';

export enum AbsenceStatus {
  UNEXCUSED = 'unexcused',
  EXCUSED = 'excused',
  PENDING = 'pending', // Excuse request pending teacher approval
  REJECTED = 'rejected',
}

@Entity('absences')
@Index(['student'])
@Index(['timetableEntry'])
export class Absence {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.absences, { onDelete: 'CASCADE' })
  student: User;

  @ManyToOne(() => Timetable, (timetable) => timetable.absences, {
    onDelete: 'CASCADE',
  })
  timetableEntry: Timetable;

  @Column({
    type: 'enum',
    enum: AbsenceStatus,
    default: AbsenceStatus.UNEXCUSED,
  })
  status: AbsenceStatus;

  @Column({ type: 'text', nullable: true })
  excuseReason: string;

  @Column({ type: 'text', nullable: true })
  excuseDocument: string; // Path to uploaded document

  @Column({ type: 'timestamp', nullable: true })
  excuseRequestedAt: Date;

  @ManyToOne(() => User, { nullable: true })
  reviewedBy: User; // Teacher who reviewed the excuse

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @Column({ type: 'text', nullable: true })
  reviewNotes: string;

  @Column({ type: 'boolean', default: false })
  notificationSent: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
