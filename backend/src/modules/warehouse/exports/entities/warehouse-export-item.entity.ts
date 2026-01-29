import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { WarehouseExport } from './warehouse-export.entity';
import { Sample } from '../../../samples/collection/entities/sample.entity';
import { StorageLocation } from '../../../catalog/storage-locations/entities/storage-location.entity';

@Entity('warehouse_export_items')
export class WarehouseExportItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'export_id', type: 'uuid' })
  exportId: string;

  @ManyToOne(() => WarehouseExport, (exp) => exp.items)
  @JoinColumn({ name: 'export_id' })
  export: WarehouseExport;

  @Column({ name: 'sample_id', type: 'uuid' })
  sampleId: string;

  @ManyToOne(() => Sample)
  @JoinColumn({ name: 'sample_id' })
  sample: Sample;

  @Column({ name: 'location_id', type: 'uuid', nullable: true })
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
