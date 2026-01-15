import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EvaluationCriteria } from './entities/evaluation-criteria.entity';
import { EvaluationStage } from './entities/evaluation-stage.entity';
import { CriteriaScore } from './entities/criteria-score.entity';
import { EvaluationCriteriaService } from './evaluation-criteria.service';
import { EvaluationCriteriaController } from './evaluation-criteria.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([EvaluationCriteria, EvaluationStage, CriteriaScore]),
  ],
  controllers: [EvaluationCriteriaController],
  providers: [EvaluationCriteriaService],
  exports: [EvaluationCriteriaService],
})
export class EvaluationCriteriaModule {}
