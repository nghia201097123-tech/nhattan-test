import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async setKey(key: string, value: string): Promise<any> {
    await this.redis.set(key, value);
  }

  async setKeyCheckToken(key: string, value: string): Promise<any> {    
    await this.redis.set(key, value,'EX', +(process.env.CONFIG_REDIS_CACHE_LIFETIME_CALL_CHECK_TOKEN ?? 30));
  }

  async getKey(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async deleteKey(key: string): Promise<any> {
    return this.redis.del(key);
  }

  async  deleteKeysWithPrefix(prefix) {
    const keys = await this.redis.keys(`${prefix}*`);
    if (keys.length) {
        await this.redis.del(keys);
    }
  }
}
