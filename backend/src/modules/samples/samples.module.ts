import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Entities
import { Sample } from './collection/entities/sample.entity';
import { SampleAttachment } from './attachments/entities/sample-attachment.entity';
import { SampleEvaluation } from './evaluation/entities/sample-evaluation.entity';
import { EvaluationResult } from './evaluation/entities/evaluation-result.entity';
import { PropagationBatch } from './propagation/entities/propagation-batch.entity';

// Controllers
import { CollectionController } from './collection/collection.controller';
import { EvaluationController } from './evaluation/evaluation.controller';
import { AttachmentsController } from './attachments/attachments.controller';
import { PropagationController } from './propagation/propagation.controller';
import { SeedCardController } from './seed-card/seed-card.controller';

// Services
import { CollectionService } from './collection/collection.service';
import { EvaluationService } from './evaluation/evaluation.service';
import { AttachmentsService } from './attachments/attachments.service';
import { PropagationService } from './propagation/propagation.service';
import { SeedCardService } from './seed-card/seed-card.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Sample,
      SampleAttachment,
      SampleEvaluation,
      EvaluationResult,
      PropagationBatch,
    ]),
  ],
  controllers: [
    // Specific routes must be registered first to avoid conflicts with wildcard routes
    PropagationController,    // /samples/propagation
    SeedCardController,       // /samples/seed-card
    AttachmentsController,    // /samples/attachments
    EvaluationController,     // /evaluations
    CollectionController,     // /samples - has wildcard route /samples/:id, must be last
  ],
  providers: [
    CollectionService,
    EvaluationService,
    AttachmentsService,
    PropagationService,
    SeedCardService,
  ],
  exports: [
    CollectionService,
    EvaluationService,
    PropagationService,
    SeedCardService,
  ],
})
export class SamplesModule {}
