import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Sample } from '../../collection/entities/sample.entity';
import { Staff } from '../../../catalog/staff/entities/staff.entity';
import { User } from '../../../users/entities/user.entity';
import { EvaluationResult } from './evaluation-result.entity';

export enum EvaluationOverallResult {
  PASSED = 'PASSED',
  FAILED = 'FAILED',
  NEEDS_PROPAGATION = 'NEEDS_PROPAGATION',
}

@Entity('sample_evaluations')
export class SampleEvaluation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'sample_id', type: 'uuid' })
  sampleId: string;

  @ManyToOne(() => Sample, (sample) => sample.evaluations)
  @JoinColumn({ name: 'sample_id' })
  sample: Sample;

  @Column({ name: 'stage_id', type: 'uuid' })
  stageId: string;

  @Column({ name: 'evaluation_date', type: 'date' })
  evaluationDate: Date;

  @Column({ name: 'evaluator_id', type: 'uuid', nullable: true })
  evaluatorId: string;

  @ManyToOne(() => Staff)
  @JoinColumn({ name: 'evaluator_id' })
  evaluator: Staff;

  @Column({ name: 'overall_result', type: 'enum', enum: EvaluationOverallResult, nullable: true })
  overallResult: EvaluationOverallResult;

  @Column({ name: 'germination_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  germinationRate: number;

  @Column({ type: 'text', nullable: true })
  conclusion: string;

  @Column({ type: 'text', nullable: true })
  recommendations: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'created_by' })
  creator: User;

  @OneToMany(() => EvaluationResult, (result) => result.evaluation)
  results: EvaluationResult[];
}
