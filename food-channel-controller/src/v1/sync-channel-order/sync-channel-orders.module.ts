import { Module } from '@nestjs/common';
import { SyncChannelOrderController } from './sync-channel-orders.controller';
import { SyncChannelOrdersService } from './sync-channel-orders.service';

@Module({
  imports: [],
  providers: [SyncChannelOrdersService],
  exports: [SyncChannelOrdersService],
  controllers: [SyncChannelOrderController]
})
export class SyncChannelOrdersModule {}
