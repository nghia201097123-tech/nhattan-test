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

  async setKeyGetChannelOrder(key: string, value: string): Promise<any> {
    // Kiểm tra xem key đã tồn tại chưa trước khi ghi
    const existingValue = await this.redis.get(key);
    if (existingValue) {
      return; // Nếu đã tồn tại, không ghi lại
    }
    await this.redis.set(
      key,
      value,
      "EX",
      +process.env.CONFIG_REDIS_CACHE_LIFETIME_CALL_CONNECTOR
    );
  }

  async checkSpamByRedis(key: string , ttl: number): Promise<any> {

    const isSpam = await this.redis.set(key,'true', 'EX', ttl, 'NX');

    return isSpam ? false : true ; 
  }

  async setKeyV3(key: string, value: string , ttl : number): Promise<any> {    
    await this.redis.set(key, value,'EX', ttl);
  }

}
