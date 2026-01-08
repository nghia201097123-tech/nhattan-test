import { Provider } from '@nestjs/common';
import Redis from 'ioredis';

export const redisProviders: Provider = {
  provide: 'REDIS_CLIENT',
  useFactory: () => {
    const redis = new Redis({
      host: process.env.CONFIG_REDIS_HOST,
      port: +process.env.CONFIG_REDIS_PORT,
      password : process.env.CONFIG_REDIS_PASSWORD
    });

    redis.on('error', (err) => console.error('Redis error:', err));
    return redis;
  },
};

