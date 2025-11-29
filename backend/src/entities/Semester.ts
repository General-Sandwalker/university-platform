import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('semesters')
@Index(['code'], { unique: true })
export class Semester {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  code: string; // e.g., "2024-2025-S1", "2024-2025-S2"

  @Column({ length: 255 })
  name: string; // e.g., "Fall 2024-2025", "Spring 2024-2025"

  @Column({ type: 'int' })
  academicYear: number; // e.g., 2024 (for 2024-2025)

  @Column({ type: 'int' })
  semesterNumber: number; // 1 or 2

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'boolean', default: false })
  isActive: boolean; // Only one semester should be active at a time

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
