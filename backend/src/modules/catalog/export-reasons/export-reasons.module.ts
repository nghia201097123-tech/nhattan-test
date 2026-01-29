import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExportReason } from './entities/export-reason.entity';
import { ExportReasonsService } from './export-reasons.service';
import { ExportReasonsController } from './export-reasons.controller';

@Module({
  imports: [TypeOrmModule.forFeature([ExportReason])],
  controllers: [ExportReasonsController],
  providers: [ExportReasonsService],
  exports: [ExportReasonsService],
})
export class ExportReasonsModule {}
