import { forwardRef, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { redisProviders } from './redis.providers';
import { BullModule } from '@nestjs/bull';
import { RefreshStatusChannelOrderQueue } from 'src/bull/handle-refresh-status-channel-order';
import { BufferCacheModule } from 'src/buffer-cache/buffer-cache.module';
import { ChannelOrderTokenGrabQueue } from 'src/bull/handle-token-grab-food';
import { ChannelOrderTokenShoppeQueue } from 'src/bull/handle-token-shopee-food';
import { ChannelOrderTokenBefoodQueue } from 'src/bull/handle-token-be-food';

@Module({
  imports: [
    BullModule.registerQueue({
      name: process.env.CONFIG_QUEUE_GROUP_REDIS_SYNC_CHANNEL_ORDER_SHOPEEFOOD,
    }),
    BullModule.registerQueue({
      name: process.env.CONFIG_QUEUE_GROUP_REDIS_SYNC_CHANNEL_ORDER_GRABFOOD,
    }),
    BullModule.registerQueue({
      name: process.env.CONFIG_QUEUE_GROUP_REDIS_SYNC_CHANNEL_ORDER_BEFOOD,
    }),
    BullModule.registerQueue({
      name: process.env.CONFIG_QUEUE_GROUP_REDIS_SYNC_CHANNEL_ORDER_CNVL ?? 'queue-sync-channel-order-cnvl',
    }),
    BullModule.registerQueue({
      name: process.env.CONFIG_QUEUE_GROUP_REDIS_CHANNEL_ORDER_REFRESH_STATUS_SHOPEEFOOD,
    }),
    BullModule.registerQueue({
      name: process.env.CONFIG_QUEUE_GROUP_REDIS_CHANNEL_ORDER_REFRESH_STATUS_GRABFOOD,
    }),
    BullModule.registerQueue({
      name: process.env.CONFIG_QUEUE_GROUP_REDIS_CHANNEL_ORDER_REFRESH_STATUS_BEFOOD,
    }),
    BullModule.registerQueue({
      name: process.env.CONFIG_QUEUE_GROUP_REDIS_CHANNEL_ORDER_REFRESH_STATUS_CNVL ?? 'queue-channel-order-refresh-status-cnvl',
    }),
    // BullModule.registerQueue({
    //   name: process.env.CONFIG_QUEUE_GROUP_REDIS_FOOD_CHANNEL_TOKEN,
    // }),
    BullModule.registerQueue({
      name: process.env.CONFIG_QUEUE_GROUP_REDIS_REFRESH_STATUS_CHANNEL_ORDER,
    }),
    BullModule.registerQueue({
      name: process.env.CONFIG_QUEUE_GROUP_REDIS_FOOD_CHANNEL_TOKEN_SHOPEE_FOOD ?? 'queue-redis-food-channel-token-shopee-food', 
    }),
    BullModule.registerQueue({
      name: process.env.CONFIG_QUEUE_GROUP_REDIS_FOOD_CHANNEL_TOKEN_GRAB_FOOD ?? 'queue-redis-food-channel-token-grab-food',
    }),
    BullModule.registerQueue({
      name: process.env.CONFIG_QUEUE_GROUP_REDIS_FOOD_CHANNEL_TOKEN_BE_FOOD ?? 'queue-redis-food-channel-token-be-food',
    }),
    
    forwardRef(() => BufferCacheModule),

  ],
  providers: [RedisService, redisProviders,RefreshStatusChannelOrderQueue ,ChannelOrderTokenShoppeQueue, ChannelOrderTokenGrabQueue ,ChannelOrderTokenBefoodQueue],
  exports: [RedisService,RefreshStatusChannelOrderQueue ,ChannelOrderTokenShoppeQueue, ChannelOrderTokenGrabQueue,ChannelOrderTokenBefoodQueue],
})
export class RedisModule {}
