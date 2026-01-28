import { Module } from '@nestjs/common';
import { ReceiptsModule } from './receipts/receipts.module';
import { ExportsModule } from './exports/exports.module';
import { InventoryModule } from './inventory/inventory.module';
import { TransfersModule } from './transfers/transfers.module';

@Module({
  imports: [ReceiptsModule, ExportsModule, InventoryModule, TransfersModule],
  exports: [ReceiptsModule, ExportsModule, InventoryModule, TransfersModule],
})
export class WarehouseModule {}
