import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../../users/entities/user.entity';
import { Sample } from '../../../samples/collection/entities/sample.entity';
import { Warehouse } from '../../../catalog/warehouses/entities/warehouse.entity';
import { StorageLocation } from '../../../catalog/storage-locations/entities/storage-location.entity';

export enum TransactionType {
  IMPORT = 'IMPORT',
  EXPORT = 'EXPORT',
  TRANSFER_IN = 'TRANSFER_IN',
  TRANSFER_OUT = 'TRANSFER_OUT',
  ADJUSTMENT = 'ADJUSTMENT',
}

export enum ReferenceType {
  RECEIPT = 'RECEIPT',
  EXPORT = 'EXPORT',
  TRANSFER = 'TRANSFER',
  TRANSFER_CANCEL = 'TRANSFER_CANCEL',
}

@Entity('inventory_transactions')
@Index(['sampleId'])
@Index(['warehouseId'])
@Index(['transactionDate'])
export class InventoryTransaction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'sample_id', type: 'uuid' })
  sampleId: string;

  @ManyToOne(() => Sample)
  @JoinColumn({ name: 'sample_id' })
  sample: Sample;

  @Column({ name: 'warehouse_id', type: 'uuid' })
  warehouseId: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column({ name: 'location_id', type: 'uuid', nullable: true })
  locationId: string;

  @ManyToOne(() => StorageLocation)
  @JoinColumn({ name: 'location_id' })
  location: StorageLocation;

  @Column({ name: 'transaction_type', type: 'enum', enum: TransactionType })
  transactionType: TransactionType;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  quantity: number;

  @Column({ length: 20 })
  unit: string;

  @Column({ name: 'balance_before', type: 'decimal', precision: 12, scale: 2, nullable: true })
  balanceBefore: number;

  @Column({ name: 'balance_after', type: 'decimal', precision: 12, scale: 2, nullable: true })
  balanceAfter: number;

  @Column({ name: 'reference_type', type: 'enum', enum: ReferenceType, nullable: true })
  referenceType: ReferenceType;

  @Column({ name: 'reference_id', type: 'uuid', nullable: true })
  referenceId: string;

  @Column({ name: 'reference_number', length: 50, nullable: true })
  referenceNumber: string;

  @Column({ name: 'transaction_date', type: 'date' })
  transactionDate: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;
}
