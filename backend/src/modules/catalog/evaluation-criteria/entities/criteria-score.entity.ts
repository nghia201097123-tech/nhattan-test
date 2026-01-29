import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EvaluationCriteria } from './evaluation-criteria.entity';

@Entity('criteria_scores')
export class CriteriaScore {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'criteria_id' })
  criteriaId: string;

  @Column({ name: 'min_score', type: 'decimal', precision: 10, scale: 2 })
  minScore: number;

  @Column({ name: 'max_score', type: 'decimal', precision: 10, scale: 2 })
  maxScore: number;

  @Column({ length: 50 })
  label: string;

  @Column({ length: 20, nullable: true })
  color: string;

  @Column({ name: 'sort_order', default: 0 })
  sortOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => EvaluationCriteria, (criteria) => criteria.scores)
  @JoinColumn({ name: 'criteria_id' })
  criteria: EvaluationCriteria;
}
