import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { EvaluationStage } from './evaluation-stage.entity';
import { CriteriaScore } from './criteria-score.entity';

export enum DataType {
  NUMBER = 'NUMBER',
  TEXT = 'TEXT',
  BOOLEAN = 'BOOLEAN',
  SELECT = 'SELECT',
}

@Entity('evaluation_criteria')
export class EvaluationCriteria {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'stage_id', nullable: true })
  stageId: string;

  @Column({ unique: true, length: 50 })
  code: string;

  @Column({ length: 200 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 50, nullable: true })
  unit: string;

  @Column({ name: 'data_type', type: 'enum', enum: DataType, default: DataType.NUMBER })
  dataType: DataType;

  @Column({ name: 'min_value', type: 'decimal', precision: 10, scale: 2, nullable: true })
  minValue: number;

  @Column({ name: 'max_value', type: 'decimal', precision: 10, scale: 2, nullable: true })
  maxValue: number;

  @Column({ name: 'is_required', default: false })
  isRequired: boolean;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => EvaluationStage, (stage) => stage.criteria)
  @JoinColumn({ name: 'stage_id' })
  stage: EvaluationStage;

  @OneToMany(() => CriteriaScore, (score) => score.criteria)
  scores: CriteriaScore[];
}
