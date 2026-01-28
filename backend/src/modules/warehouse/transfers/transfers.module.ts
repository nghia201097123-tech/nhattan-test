import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WarehouseTransfer } from './entities/warehouse-transfer.entity';
import { WarehouseTransferItem } from './entities/warehouse-transfer-item.entity';
import { InventoryTransaction } from '../inventory/entities/inventory-transaction.entity';
import { Sample } from '../../samples/collection/entities/sample.entity';
import { TransfersController } from './transfers.controller';
import { TransfersService } from './transfers.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WarehouseTransfer,
      WarehouseTransferItem,
      InventoryTransaction,
      Sample,
    ]),
  ],
  controllers: [TransfersController],
  providers: [TransfersService],
  exports: [TransfersService],
})
export class TransfersModule {}
