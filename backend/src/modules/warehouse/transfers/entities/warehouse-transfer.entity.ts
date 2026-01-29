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
import { WarehouseTransferItem } from './warehouse-transfer-item.entity';

export enum TransferStatus {
  DRAFT = 'DRAFT',
  IN_TRANSIT = 'IN_TRANSIT',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

@Entity('warehouse_transfers')
export class WarehouseTransfer {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'transfer_number', unique: true, length: 50 })
  transferNumber: string;

  // Kho xuất
  @Column({ name: 'from_warehouse_id', type: 'uuid' })
  fromWarehouseId: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'from_warehouse_id' })
  fromWarehouse: Warehouse;

  // Kho nhận
  @Column({ name: 'to_warehouse_id', type: 'uuid' })
  toWarehouseId: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'to_warehouse_id' })
  toWarehouse: Warehouse;

  @Column({ name: 'transfer_date', type: 'date' })
  transferDate: Date;

  @Column({ name: 'total_items', default: 0 })
  totalItems: number;

  @Column({ type: 'enum', enum: TransferStatus, default: TransferStatus.DRAFT })
  status: TransferStatus;

  // Người gửi xác nhận
  @Column({ name: 'sent_at', type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ name: 'sent_by', type: 'uuid', nullable: true })
  sentBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'sent_by' })
  sender: User;

  // Người nhận xác nhận
  @Column({ name: 'received_at', type: 'timestamp', nullable: true })
  receivedAt: Date;

  @Column({ name: 'received_by', type: 'uuid', nullable: true })
  receivedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'received_by' })
  receiver: User;

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

  @OneToMany(() => WarehouseTransferItem, (item) => item.transfer)
  items: WarehouseTransferItem[];
}
