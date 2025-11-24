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
import { Level } from './Level';

@Entity('specialties')
@Index(['code'], { unique: true })
export class Specialty {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 20 })
  code: string; // e.g., "CS-SE", "CS-AI"

  @Column({ length: 255 })
  name: string; // e.g., "Software Engineering", "Artificial Intelligence"

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => Department, (department) => department.specialties, {
    onDelete: 'CASCADE',
  })
  department: Department;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Level, (level) => level.specialty)
  levels: Level[];
}
