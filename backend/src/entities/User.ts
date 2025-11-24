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
import { Department } from './Department';
import { Group } from './Group';
import { Absence } from './Absence';
import { Message } from './Message';
import { Notification } from './Notification';

export enum UserRole {
  STUDENT = 'student',
  TEACHER = 'teacher',
  DEPARTMENT_HEAD = 'department_head',
  ADMIN = 'admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  ELIMINATED = 'eliminated', // For students with too many absences
}

@Entity('users')
@Index(['cin'], { unique: true })
@Index(['email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 20 })
  cin: string; // National ID card number

  @Column({ length: 100 })
  firstName: string;

  @Column({ length: 100 })
  lastName: string;

  @Column({ unique: true, length: 255 })
  email: string;

  @Column({ type: 'text' })
  password: string; // Hashed password

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.STUDENT,
  })
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone: string;

  @Column({ type: 'text', nullable: true })
  address: string;

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date;

  @Column({ type: 'varchar', length: 255, nullable: true })
  profileImage: string;

  // Student-specific fields
  @Column({ type: 'varchar', length: 50, nullable: true })
  studentCode: string; // Unique student identifier

  @ManyToOne(() => Department, { nullable: true })
  department: Department;

  @ManyToOne(() => Group, { nullable: true })
  group: Group;

  // Teacher-specific fields
  @Column({ type: 'varchar', length: 50, nullable: true })
  teacherCode: string; // Unique teacher identifier

  @Column({ type: 'varchar', length: 100, nullable: true })
  specialization: string;

  // Password reset
  @Column({ type: 'varchar', length: 255, nullable: true })
  passwordResetToken: string;

  @Column({ type: 'timestamp', nullable: true })
  passwordResetExpires: Date;

  // Account verification (if needed)
  @Column({ type: 'boolean', default: true })
  isEmailVerified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Absence, (absence) => absence.student)
  absences: Absence[];

  @OneToMany(() => Message, (message) => message.sender)
  sentMessages: Message[];

  @OneToMany(() => Message, (message) => message.receiver)
  receivedMessages: Message[];

  @OneToMany(() => Notification, (notification) => notification.user)
  notifications: Notification[];

  // Virtual fields
  get fullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }
}
