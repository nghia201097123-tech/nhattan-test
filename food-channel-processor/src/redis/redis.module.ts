import { forwardRef, Module } from '@nestjs/common';
import { redisProviders } from './redis.providers';
import { RedisService } from './redis.service';
import { ChannelOrderFoodModule } from 'src/v1/channel-order-food/channel-order-food.module';

@Module({
  imports: [
    forwardRef(() => ChannelOrderFoodModule),
  ],
  providers: [redisProviders,RedisService],
  exports: [RedisService,redisProviders],
})
export class RedisModule {}
