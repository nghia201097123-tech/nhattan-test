// queue.module.ts
import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

@Module({
  imports: [
    BullModule.registerQueue(
      { name: 'queue-sync-channel-order-mongo-to-mysql' },
      { name: 'queue-sync-token-expired' },
      { name: process.env.CONFIG_QUEUE_GROUP_NODEJS_FOOD_CHANNEL_CONNECTOR_REDIS_SYNC_CHANNEL_ORDER },
      { name: `${process.env.CONFIG_QUEUE_GROUP_NODEJS_FOOD_CHANNEL_CONNECTOR_REDIS_SYNC_CHANNEL_ORDER}-by-branch`},
      { name: process.env.CONFIG_QUEUE_GROUP_NODEJS_FOOD_CHANNEL_CONNECTOR_REDIS_REFRESH_STATUS },
    ),
  ],
  exports: [BullModule],
})
export class QueueModule {}
