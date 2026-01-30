import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ExportsController } from './exports.controller';
import { ExportsService } from './exports.service';
import { WarehouseExport } from './entities/warehouse-export.entity';
import { WarehouseExportItem } from './entities/warehouse-export-item.entity';
import { Sample } from '../../samples/collection/entities/sample.entity';
import { InventoryTransaction } from '../inventory/entities/inventory-transaction.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WarehouseExport, WarehouseExportItem, Sample, InventoryTransaction])],
  controllers: [ExportsController],
  providers: [ExportsService],
  exports: [ExportsService],
})
export class ExportsModule {}
