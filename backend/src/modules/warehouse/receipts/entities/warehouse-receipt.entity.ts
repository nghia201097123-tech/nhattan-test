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
import { Warehouse } from '../../../catalog/warehouses/entities/warehouse.entity';
import { WarehouseReceiptItem } from './warehouse-receipt-item.entity';

export enum ReceiptStatus {
  DRAFT = 'DRAFT',
  CONFIRMED = 'CONFIRMED',
  CANCELLED = 'CANCELLED',
}

export enum ReceiptSourceType {
  COLLECTION = 'COLLECTION',
  PROPAGATION = 'PROPAGATION',
  TRANSFER = 'TRANSFER',
  OTHER = 'OTHER',
}

@Entity('warehouse_receipts')
export class WarehouseReceipt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'receipt_number', unique: true, length: 50 })
  receiptNumber: string;

  @Column({ name: 'warehouse_id', type: 'uuid' })
  warehouseId: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column({ name: 'receipt_date', type: 'date' })
  receiptDate: Date;

  @Column({ name: 'source_type', type: 'enum', enum: ReceiptSourceType, nullable: true })
  sourceType: ReceiptSourceType;

  @Column({ name: 'source_reference', length: 100, nullable: true })
  sourceReference: string;

  @Column({ name: 'total_items', default: 0 })
  totalItems: number;

  @Column({ type: 'enum', enum: ReceiptStatus, default: ReceiptStatus.DRAFT })
  status: ReceiptStatus;

  @Column({ name: 'confirmed_at', type: 'timestamp', nullable: true })
  confirmedAt: Date;

  @Column({ name: 'confirmed_by', type: 'uuid', nullable: true })
  confirmedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'confirmed_by' })
  confirmer: User;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => WarehouseReceiptItem, (item) => item.receipt)
  items: WarehouseReceiptItem[];
}
