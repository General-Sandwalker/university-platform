import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { Specialty } from './Specialty';
import { Level } from './Level';
import { User } from './User';

export enum SubjectType {
  LECTURE = 'lecture',
  TD = 'td', // Travaux Dirigés
  TP = 'tp', // Travaux Pratiques
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

  @Column({ type: 'decimal', precision: 3, scale: 1, default: 1.0 })
  coefficient: number; // Subject weight in final grade

  @Column({ type: 'int', default: 1 })
  semester: number; // 1 or 2

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Specialty, { onDelete: 'CASCADE' })
  specialty: Specialty;

  @ManyToOne(() => Level, { onDelete: 'CASCADE' })
  level: Level;

  @ManyToOne(() => User, { nullable: true })
  teacher: User;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
