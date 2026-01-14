import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SeedCategory } from '../../seed-categories/entities/seed-category.entity';
import { User } from '../../../users/entities/user.entity';

@Entity('seed_varieties')
export class SeedVariety {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'category_id', type: 'uuid' })
  categoryId: string;

  @ManyToOne(() => SeedCategory)
  @JoinColumn({ name: 'category_id' })
  category: SeedCategory;

  @Column({ unique: true, length: 50 })
  code: string;

  @Column({ length: 200 })
  name: string;

  @Column({ name: 'scientific_name', length: 200, nullable: true })
  scientificName: string;

  @Column({ name: 'local_name', length: 200, nullable: true })
  localName: string;

  @Column({ length: 200, nullable: true })
  origin: string;

  @Column({ type: 'text', nullable: true })
  characteristics: string;

  @Column({ name: 'growth_duration', length: 100, nullable: true })
  growthDuration: string;

  @Column({ name: 'yield_potential', length: 100, nullable: true })
  yieldPotential: string;

  @Column({ name: 'disease_resistance', type: 'text', nullable: true })
  diseaseResistance: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;
}
