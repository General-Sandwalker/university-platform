import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  Index,
} from 'typeorm';
import { Level } from './Level';

@Entity('groups')
@Index(['code'], { unique: true })
export class Group {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 20 })
  code: string; // e.g., "L1-G1", "M1-G2"

  @Column({ length: 255 })
  name: string; // e.g., "Group 1", "Group A"

  @Column({ type: 'int', default: 30 })
  maxCapacity: number;

  @ManyToOne(() => Level, (level) => level.groups, {
    onDelete: 'CASCADE',
  })
  level: Level;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
