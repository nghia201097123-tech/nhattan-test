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
import { WarehouseExportItem } from './warehouse-export-item.entity';
import { ExportStatus } from '../../../../shared/constants/export-status.constant';

@Entity('warehouse_exports')
export class WarehouseExport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'export_number', unique: true, length: 50 })
  exportNumber: string;

  @Column({ name: 'warehouse_id', type: 'uuid' })
  warehouseId: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'warehouse_id' })
  warehouse: Warehouse;

  @Column({ name: 'export_date', type: 'date' })
  exportDate: Date;

  @Column({ name: 'reason_id', type: 'uuid' })
  reasonId: string;

  // Đơn vị nhận
  @Column({ name: 'recipient_name', length: 200, nullable: true })
  recipientName: string;

  @Column({ name: 'recipient_address', type: 'text', nullable: true })
  recipientAddress: string;

  @Column({ name: 'recipient_contact', length: 100, nullable: true })
  recipientContact: string;

  @Column({ name: 'total_items', default: 0 })
  totalItems: number;

  @Column({ type: 'enum', enum: ExportStatus, default: ExportStatus.DRAFT })
  status: ExportStatus;

  // Thông tin duyệt
  @Column({ name: 'submitted_at', type: 'timestamp', nullable: true })
  submittedAt: Date;

  @Column({ name: 'submitted_by', type: 'uuid', nullable: true })
  submittedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'submitted_by' })
  submitter: User;

  @Column({ name: 'approved_at', type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ name: 'approved_by', type: 'uuid', nullable: true })
  approvedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'approved_by' })
  approver: User;

  @Column({ name: 'rejection_reason', type: 'text', nullable: true })
  rejectionReason: string;

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

  @OneToMany(() => WarehouseExportItem, (item) => item.export)
  items: WarehouseExportItem[];
}
