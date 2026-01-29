import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReceiptsController } from './receipts.controller';
import { ReceiptsService } from './receipts.service';
import { WarehouseReceipt } from './entities/warehouse-receipt.entity';
import { WarehouseReceiptItem } from './entities/warehouse-receipt-item.entity';
import { InventoryTransaction } from '../inventory/entities/inventory-transaction.entity';
import { Sample } from '../../samples/collection/entities/sample.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WarehouseReceipt,
      WarehouseReceiptItem,
      InventoryTransaction,
      Sample,
    ]),
  ],
  controllers: [ReceiptsController],
  providers: [ReceiptsService],
  exports: [ReceiptsService],
})
export class ReceiptsModule {}
