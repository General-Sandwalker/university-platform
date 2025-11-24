import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum RoomType {
  CLASSROOM = 'classroom',
  LAB = 'lab',
  AMPHITHEATER = 'amphitheater',
  CONFERENCE_ROOM = 'conference_room',
  OFFICE = 'office',
}

@Entity('rooms')
@Index(['code'], { unique: true })
export class Room {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 20 })
  code: string; // e.g., "A101", "LAB-CS-01"

  @Column({ length: 255 })
  name: string; // e.g., "Room A101", "Computer Lab 1"

  @Column({
    type: 'enum',
    enum: RoomType,
    default: RoomType.CLASSROOM,
  })
  type: RoomType;

  @Column({ type: 'int', default: 30 })
  capacity: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  building: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  floor: string;

  @Column({ type: 'text', nullable: true })
  equipment: string; // JSON string or comma-separated list of equipment

  @Column({ type: 'boolean', default: true })
  isAvailable: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
