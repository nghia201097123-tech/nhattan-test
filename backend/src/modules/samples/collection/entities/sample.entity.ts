import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../../users/entities/user.entity';
import { SeedCategory } from '../../../catalog/seed-categories/entities/seed-category.entity';
import { SeedVariety } from '../../../catalog/seed-varieties/entities/seed-variety.entity';
import { Location } from '../../../catalog/locations/entities/location.entity';
import { SampleProvider } from '../../../catalog/sample-providers/entities/sample-provider.entity';
import { Staff } from '../../../catalog/staff/entities/staff.entity';
import { Warehouse } from '../../../catalog/warehouses/entities/warehouse.entity';
import { StorageLocation } from '../../../catalog/storage-locations/entities/storage-location.entity';
import { SampleAttachment } from '../../attachments/entities/sample-attachment.entity';
import { SampleEvaluation } from '../../evaluation/entities/sample-evaluation.entity';
import { SampleStatus } from '../../../../shared/constants/sample-status.constant';

@Entity('samples')
@Index(['code'])
@Index(['status'])
@Index(['collectionDate'])
export class Sample {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, length: 50 })
  code: string;

  // Thông tin giống
  @Column({ name: 'variety_id', type: 'uuid', nullable: true })
  varietyId: string;

  @ManyToOne(() => SeedVariety)
  @JoinColumn({ name: 'variety_id' })
  variety: SeedVariety;

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @ManyToOne(() => SeedCategory)
  @JoinColumn({ name: 'category_id' })
  category: SeedCategory;

  @Column({ name: 'variety_name', length: 200, nullable: true })
  varietyName: string;

  @Column({ name: 'local_name', length: 200, nullable: true })
  localName: string;

  @Column({ name: 'scientific_name', length: 200, nullable: true })
  scientificName: string;

  // Thông tin thu thập
  @Column({ name: 'collection_date', type: 'date' })
  collectionDate: Date;

  @Column({ name: 'collection_year' })
  collectionYear: number;

  @Column({ length: 50, nullable: true })
  season: string;

  // Địa điểm thu thập
  @Column({ name: 'location_id', type: 'uuid', nullable: true })
  locationId: string;

  @ManyToOne(() => Location)
  @JoinColumn({ name: 'location_id' })
  location: Location;

  @Column({ name: 'location_detail', type: 'text', nullable: true })
  locationDetail: string;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  altitude: number;

  // Nguồn cung cấp
  @Column({ name: 'provider_id', type: 'uuid', nullable: true })
  providerId: string;

  @ManyToOne(() => SampleProvider)
  @JoinColumn({ name: 'provider_id' })
  provider: SampleProvider;

  @Column({ name: 'provider_name', length: 200, nullable: true })
  providerName: string;

  // Người thu thập
  @Column({ name: 'collector_id', type: 'uuid', nullable: true })
  collectorId: string;

  @ManyToOne(() => Staff)
  @JoinColumn({ name: 'collector_id' })
  collector: Staff;

  // Thông tin mẫu
  @Column({ name: 'initial_quantity', type: 'decimal', precision: 12, scale: 2, nullable: true })
  initialQuantity: number;

  @Column({ name: 'current_quantity', type: 'decimal', precision: 12, scale: 2, nullable: true })
  currentQuantity: number;

  @Column({ name: 'quantity_unit', length: 20, default: 'gram' })
  quantityUnit: string;

  // Đặc điểm
  @Column({ type: 'text', nullable: true })
  morphology: string;

  @Column({ type: 'text', nullable: true })
  characteristics: string;

  @Column({ name: 'sample_condition', length: 50, nullable: true })
  sampleCondition: string;

  // Trạng thái
  @Column({ type: 'enum', enum: SampleStatus, default: SampleStatus.COLLECTED })
  status: SampleStatus;

  // Vị trí lưu trữ hiện tại
  @Column({ name: 'current_warehouse_id', type: 'uuid', nullable: true })
  currentWarehouseId: string;

  @ManyToOne(() => Warehouse)
  @JoinColumn({ name: 'current_warehouse_id' })
  currentWarehouse: Warehouse;

  @Column({ name: 'current_location_id', type: 'uuid', nullable: true })
  currentLocationId: string;

  @ManyToOne(() => StorageLocation)
  @JoinColumn({ name: 'current_location_id' })
  currentLocation: StorageLocation;

  // Đánh giá gần nhất
  @Column({ name: 'last_evaluation_date', type: 'date', nullable: true })
  lastEvaluationDate: Date;

  @Column({ name: 'last_germination_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  lastGerminationRate: number;

  // Thời hạn
  @Column({ name: 'storage_date', type: 'date', nullable: true })
  storageDate: Date;

  @Column({ name: 'expiry_date', type: 'date', nullable: true })
  expiryDate: Date;

  @Column({ name: 'next_evaluation_date', type: 'date', nullable: true })
  nextEvaluationDate: Date;

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

  // Relations
  @OneToMany(() => SampleAttachment, (attachment) => attachment.sample)
  attachments: SampleAttachment[];

  @OneToMany(() => SampleEvaluation, (evaluation) => evaluation.sample)
  evaluations: SampleEvaluation[];
}
