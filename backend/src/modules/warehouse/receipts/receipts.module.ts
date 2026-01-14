import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReceiptsController } from './receipts.controller';
import { ReceiptsService } from './receipts.service';
import { WarehouseReceipt } from './entities/warehouse-receipt.entity';
import { WarehouseReceiptItem } from './entities/warehouse-receipt-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WarehouseReceipt, WarehouseReceiptItem])],
  controllers: [ReceiptsController],
  providers: [ReceiptsService],
  exports: [ReceiptsService],
})
export class ReceiptsModule {}
