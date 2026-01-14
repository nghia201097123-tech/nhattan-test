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
import { Warehouse } from '../../warehouses/entities/warehouse.entity';

export enum StorageLocationType {
  CABINET = 'CABINET',     // Tủ
  SHELF = 'SHELF',         // Kệ
  COMPARTMENT = 'COMPARTMENT', // Ngăn
}

export enum StorageLocationStatus {
  EMPTY = 'EMPTY',
  PARTIAL = 'PARTIAL',
  FULL = 'FULL',
}

@Entity('storage_locations')
export class StorageLocation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'warehouse_id', type: 'uuid' })
  warehouseId: string;

  @ManyToOne(() => Warehouse, (warehouse) => warehouse.storageLocations)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId: string;

  @ManyToOne(() => StorageLocation, (location) => location.children, { nullable: true })
  @JoinColumn({ name: 'parent_id' })
  parent: StorageLocation;

  @OneToMany(() => StorageLocation, (location) => location.parent)
  children: StorageLocation[];

  @Column({ length: 50 })
  code: string;

  @Column({ length: 150 })
  name: string;

  @Column({ type: 'enum', enum: StorageLocationType })
  type: StorageLocationType;

  @Column()
  level: number; // 1: Tủ, 2: Kệ, 3: Ngăn

  @Column({ length: 500, nullable: true })
  path: string;

  @Column({ nullable: true })
  capacity: number;

  @Column({ name: 'current_usage', default: 0 })
  currentUsage: number;

  @Column({ type: 'enum', enum: StorageLocationStatus, default: StorageLocationStatus.EMPTY })
  status: StorageLocationStatus;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
