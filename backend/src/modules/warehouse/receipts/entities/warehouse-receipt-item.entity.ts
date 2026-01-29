import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { WarehouseReceipt } from './warehouse-receipt.entity';
import { Sample } from '../../../samples/collection/entities/sample.entity';
import { StorageLocation } from '../../../catalog/storage-locations/entities/storage-location.entity';

@Entity('warehouse_receipt_items')
export class WarehouseReceiptItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'receipt_id', type: 'uuid' })
  receiptId: string;

  @ManyToOne(() => WarehouseReceipt, (receipt) => receipt.items)
  @JoinColumn({ name: 'receipt_id' })
  receipt: WarehouseReceipt;

  @Column({ name: 'sample_id', type: 'uuid' })
  sampleId: string;

  @ManyToOne(() => Sample)
  @JoinColumn({ name: 'sample_id' })
  sample: Sample;

  @Column({ name: 'location_id', type: 'uuid' })
  locationId: string;

  @ManyToOne(() => StorageLocation)
  @JoinColumn({ name: 'location_id' })
  location: StorageLocation;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  quantity: number;

  @Column({ length: 20 })
  unit: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
