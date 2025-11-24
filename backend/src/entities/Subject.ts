import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { Department } from './Department';

export enum SubjectType {
  LECTURE = 'lecture',
  TD = 'td', // Travaux Dirigés
  TP = 'tp', // Travaux Pratiques
  INTEGRATED = 'integrated',
}

@Entity('subjects')
@Index(['code'], { unique: true })
export class Subject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 20 })
  code: string; // e.g., "CS101", "MATH201"

  @Column({ length: 255 })
  name: string; // e.g., "Introduction to Programming"

  @Column({
    type: 'enum',
    enum: SubjectType,
    default: SubjectType.LECTURE,
  })
  type: SubjectType;

  @Column({ type: 'int', default: 3 })
  credits: number; // ECTS credits

  @Column({ type: 'int', default: 1 })
  semester: number; // 1 or 2

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Department, (department) => department.subjects, {
    onDelete: 'CASCADE',
  })
  department: Department;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
