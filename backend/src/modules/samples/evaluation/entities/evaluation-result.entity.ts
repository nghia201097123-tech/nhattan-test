import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { SampleEvaluation } from './sample-evaluation.entity';

@Entity('evaluation_results')
@Unique(['evaluationId', 'criteriaId'])
export class EvaluationResult {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'evaluation_id', type: 'uuid' })
  evaluationId: string;

  @ManyToOne(() => SampleEvaluation, (evaluation) => evaluation.results)
  @JoinColumn({ name: 'evaluation_id' })
  evaluation: SampleEvaluation;

  @Column({ name: 'criteria_id', type: 'uuid' })
  criteriaId: string;

  @Column({ name: 'numeric_value', type: 'decimal', precision: 10, scale: 2, nullable: true })
  numericValue: number;

  @Column({ name: 'text_value', type: 'text', nullable: true })
  textValue: string;

  @Column({ name: 'is_passed', nullable: true })
  isPassed: boolean;

  @Column({ type: 'text', nullable: true })
  notes: string;
}
