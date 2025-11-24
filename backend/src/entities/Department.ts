import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Specialty } from './Specialty';
import { User } from './User';
import { Subject } from './Subject';

@Entity('departments')
@Index(['code'], { unique: true })
export class Department {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 20 })
  code: string; // e.g., "CS", "MATH", "PHYS"

  @Column({ length: 255 })
  name: string; // e.g., "Computer Science"

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Specialty, (specialty) => specialty.department)
  specialties: Specialty[];

  @OneToMany(() => Subject, (subject) => subject.department)
  subjects: Subject[];
}
