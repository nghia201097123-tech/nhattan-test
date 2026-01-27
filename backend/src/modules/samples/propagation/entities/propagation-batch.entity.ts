import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../../users/entities/user.entity';
import { Sample } from '../../collection/entities/sample.entity';
import { Warehouse } from '../../../catalog/warehouses/entities/warehouse.entity';
import { StorageLocation } from '../../../catalog/storage-locations/entities/storage-location.entity';

export enum PropagationStatus {
  PLANNED = 'PLANNED',           // Đã lên kế hoạch
  IN_PROGRESS = 'IN_PROGRESS',   // Đang thực hiện
  HARVESTED = 'HARVESTED',       // Đã thu hoạch
  COMPLETED = 'COMPLETED',       // Hoàn thành
  CANCELLED = 'CANCELLED',       // Đã hủy
}

@Entity('propagation_batches')
@Index(['code'])
@Index(['status'])
@Index(['startDate'])
export class PropagationBatch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  code: string;

  @Column({ length: 200, nullable: true })
  name: string;

  // Mẫu gốc
  @Column({ name: 'sample_id', type: 'uuid' })
  sampleId: string;

  @ManyToOne(() => Sample)
  @JoinColumn({ name: 'sample_id' })
  sample: Sample;

  // Người phụ trách
  @Column({ name: 'propagator_id', type: 'uuid', nullable: true })
  propagatorId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'propagator_id' })
  propagator: User;

  // Thời gian
  @Column({ name: 'start_date', type: 'date' })
  startDate: Date;

  @Column({ name: 'expected_end_date', type: 'date', nullable: true })
  expectedEndDate: Date;

  @Column({ name: 'actual_end_date', type: 'date', nullable: true })
  actualEndDate: Date;

  // Số lượng
  @Column({ name: 'initial_quantity', type: 'decimal', precision: 12, scale: 2 })
  initialQuantity: number;

  @Column({ name: 'initial_unit', length: 20, default: 'gram' })
  initialUnit: string;

  @Column({ name: 'harvest_quantity', type: 'decimal', precision: 12, scale: 2, nullable: true })
  harvestQuantity: number;

  @Column({ name: 'harvest_unit', length: 20, default: 'gram' })
  harvestUnit: string;

  // Vị trí nhân mẫu
  @Column({ name: 'propagation_location', length: 500, nullable: true })
  propagationLocation: string;

  // Phương pháp nhân giống
  @Column({ name: 'propagation_method', length: 100, nullable: true })
  propagationMethod: string;

  // Điều kiện môi trường
  @Column({ name: 'environment_conditions', type: 'text', nullable: true })
  environmentConditions: string;

  // Tiến độ (0-100%)
  @Column({ type: 'int', default: 0 })
  progress: number;

  // Trạng thái
  @Column({ type: 'enum', enum: PropagationStatus, default: PropagationStatus.PLANNED })
  status: PropagationStatus;

  // Kết quả thu hoạch
  @Column({ name: 'harvest_date', type: 'date', nullable: true })
  harvestDate: Date;

  @Column({ name: 'harvest_notes', type: 'text', nullable: true })
  harvestNotes: string;

  @Column({ name: 'quality_rating', type: 'varchar', length: 20, nullable: true })
  qualityRating: string; // A, B, C, D

  // Kho lưu trữ kết quả
  @Column({ name: 'result_warehouse_id', type: 'uuid', nullable: true })
  resultWarehouseId: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'result_warehouse_id' })
  resultWarehouse: Warehouse;

  @Column({ name: 'result_location_id', type: 'uuid', nullable: true })
  resultLocationId: string;

  @ManyToOne(() => StorageLocation)
  @JoinColumn({ name: 'result_location_id' })
  resultLocation: StorageLocation;

  @Column({ type: 'text', nullable: true })
  notes: string;

  // Audit
  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'updated_by' })
  updater: User;
}
