import { Module } from '@nestjs/common';
import { ReceiptsModule } from './receipts/receipts.module';
import { ExportsModule } from './exports/exports.module';
import { InventoryModule } from './inventory/inventory.module';

@Module({
  imports: [ReceiptsModule, ExportsModule, InventoryModule],
  exports: [ReceiptsModule, ExportsModule, InventoryModule],
})
export class WarehouseModule {}
