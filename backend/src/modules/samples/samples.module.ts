import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { Sample } from './collection/entities/sample.entity';
import { SampleAttachment } from './attachments/entities/sample-attachment.entity';
import { SampleEvaluation } from './evaluation/entities/sample-evaluation.entity';
import { EvaluationResult } from './evaluation/entities/evaluation-result.entity';

// Controllers
import { CollectionController } from './collection/collection.controller';
import { EvaluationController } from './evaluation/evaluation.controller';
import { AttachmentsController } from './attachments/attachments.controller';

// Services
import { CollectionService } from './collection/collection.service';
import { EvaluationService } from './evaluation/evaluation.service';
import { AttachmentsService } from './attachments/attachments.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Sample,
      SampleAttachment,
      SampleEvaluation,
      EvaluationResult,
    ]),
  ],
  controllers: [
    CollectionController,
    EvaluationController,
    AttachmentsController,
  ],
  providers: [
    CollectionService,
    EvaluationService,
    AttachmentsService,
  ],
  exports: [
    CollectionService,
    EvaluationService,
  ],
})
export class SamplesModule {}
