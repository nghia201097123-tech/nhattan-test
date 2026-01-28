import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { WarehouseTransfer } from './warehouse-transfer.entity';
import { Sample } from '../../../samples/collection/entities/sample.entity';
import { StorageLocation } from '../../../catalog/storage-locations/entities/storage-location.entity';

@Entity('warehouse_transfer_items')
export class WarehouseTransferItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'transfer_id', type: 'uuid' })
  transferId: string;

  @ManyToOne(() => WarehouseTransfer, (transfer) => transfer.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'transfer_id' })
  transfer: WarehouseTransfer;

  @Column({ name: 'sample_id', type: 'uuid' })
  sampleId: string;

  @ManyToOne(() => Sample)
  @JoinColumn({ name: 'sample_id' })
  sample: Sample;

  // Vị trí nguồn
  @Column({ name: 'from_location_id', type: 'uuid', nullable: true })
  fromLocationId: string;

  @ManyToOne(() => StorageLocation)
  @JoinColumn({ name: 'from_location_id' })
  fromLocation: StorageLocation;

  // Vị trí đích
  @Column({ name: 'to_location_id', type: 'uuid', nullable: true })
  toLocationId: string;

  @ManyToOne(() => StorageLocation)
  @JoinColumn({ name: 'to_location_id' })
  toLocation: StorageLocation;

  @Column({ type: 'decimal', precision: 15, scale: 3 })
  quantity: number;

  @Column({ length: 20, nullable: true })
  unit: string;

  @Column({ type: 'text', nullable: true })
  notes: string;
}
