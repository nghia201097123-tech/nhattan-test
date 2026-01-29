import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExportsController } from './exports.controller';
import { ExportsService } from './exports.service';
import { WarehouseExport } from './entities/warehouse-export.entity';
import { WarehouseExportItem } from './entities/warehouse-export-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WarehouseExport, WarehouseExportItem])],
  controllers: [ExportsController],
  providers: [ExportsService],
  exports: [ExportsService],
})
export class ExportsModule {}
