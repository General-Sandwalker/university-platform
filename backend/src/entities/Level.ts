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
import { Specialty } from './Specialty';
import { Group } from './Group';

@Entity('levels')
@Index(['code'], { unique: true })
export class Level {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 20 })
  code: string; // e.g., "L1", "L2", "L3", "M1", "M2"

  @Column({ length: 255 })
  name: string; // e.g., "License 1", "Master 1"

  @Column({ type: 'int' })
  year: number; // 1, 2, 3, 4, 5

  @ManyToOne(() => Specialty, (specialty) => specialty.levels, {
    onDelete: 'CASCADE',
  })
  specialty: Specialty;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Group, (group) => group.level)
  groups: Group[];
}
