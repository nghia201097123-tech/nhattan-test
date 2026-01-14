import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from '../../../users/entities/user.entity';
import { StorageLocation } from '../../storage-locations/entities/storage-location.entity';

@Entity('warehouses')
export class Warehouse {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  code: string;

  @Column({ length: 150 })
  name: string;

  @Column({ length: 300, nullable: true })
  location: string;

  @Column({ name: 'storage_temp', type: 'decimal', precision: 5, scale: 2, nullable: true })
  storageTemp: number;

  @Column({ name: 'humidity_range', length: 50, nullable: true })
  humidityRange: string;

  @Column({ name: 'max_capacity', nullable: true })
  maxCapacity: number;

  @Column({ name: 'current_usage', default: 0 })
  currentUsage: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => StorageLocation, (location) => location.warehouse)
  storageLocations: StorageLocation[];
}
