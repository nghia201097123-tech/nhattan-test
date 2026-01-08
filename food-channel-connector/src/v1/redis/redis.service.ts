import { Inject, Injectable } from '@nestjs/common';
import Redis, { RedisOptions } from 'ioredis';

// Singleton client dùng chung trong worker / ngoài Nest
let redisSingleton: Redis | null = null;

export function createRedisClient(options?: RedisOptions): Redis {
  if (!redisSingleton) {
    redisSingleton = new Redis({
      host: process.env.CONFIG_REDIS_HOST,
      port: +process.env.CONFIG_REDIS_PORT,
      password : process.env.CONFIG_REDIS_PASSWORD,
      db: Number(2),
      maxRetriesPerRequest: null,
      enableOfflineQueue: true, // Bật queue để tránh lỗi "Stream isn't writeable"
      ...options,
    });

    // redisSingleton.on('error', (err) => {
    //   // console.error('[RedisService] Redis error:', err?.message);
    // });
  }

  return redisSingleton;
}

@Injectable()
export class RedisService {
  private readonly redis: Redis;

  constructor(
    // Trong Nest thì DI REDIS_CLIENT vào đây
    @Inject('REDIS_CLIENT') redisClient?: Redis,
  ) {
    // Nếu có DI từ Nest → dùng
    // Nếu gọi new RedisService() trong worker → tự tạo client standalone
    this.redis = redisClient ?? createRedisClient();
  }

  async setKeyTolock(key: string, value: string, ttl: number): Promise<any> {
    return this.redis.set(key, value, 'EX', ttl, 'NX');
  }

  // Nếu cần dùng trực tiếp client
  getClient(): Redis {
    return this.redis;
  }

  async setKey(
    key: string,
    value: string,
    ttl?: number, // seconds
  ): Promise<'OK'> {
    if (ttl && ttl > 0) {
      return this.redis.set(key, value, 'EX', ttl);
    }
    return this.redis.set(key, value);
  }

  // ===== GET key =====
  async getKey(key: string): Promise<string> {
    const value = await this.redis.get(key);
    return value;   
  }
  
}
