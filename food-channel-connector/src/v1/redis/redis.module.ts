import { Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { redisProviders } from './redis.providers';
import { createRedisClient } from './redis.service'; // nếu export function ra

@Module({
  imports: [
  ],
  providers: [RedisService,redisProviders,
    {
      provide: 'REDIS_CLIENT',
      useFactory: () => createRedisClient(),
    }
  ],
  exports: [RedisService,redisProviders],
})
export class RedisModule {}
