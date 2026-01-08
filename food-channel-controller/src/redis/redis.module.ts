import { Module } from '@nestjs/common';
import { redisProviders } from './redis.providers';
import { RedisService } from './redis.service';

@Module({
  providers: [redisProviders,RedisService],
  exports: [RedisService,redisProviders],
})
export class RedisModule {}
