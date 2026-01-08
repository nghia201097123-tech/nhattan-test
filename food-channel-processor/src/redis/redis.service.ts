import { Inject, Injectable } from "@nestjs/common";
import Redis from "ioredis";
import { RedisClientType } from "redis";

@Injectable()
export class RedisService {
  // private readonly redlock: Redlock;
  private redisClient: RedisClientType

  constructor(
    @Inject("REDIS_CLIENT") 
    private readonly redis: Redis,
  ) {

  }

  // async processWithLock(
  //   key: string,
  //   ttl: number,
  //   callback: () => Promise<void>
  // ): Promise<void> {
  //   let lock;
  //   try {
  //     // Tạo khóa với key và thời gian sống (TTL)
  //     lock = await this.redlock.acquire([key], ttl);
  //     // Thực thi logic trong vùng được bảo vệ
  //     await callback();
  //   } catch (error) {
  //     console.error("Error acquiring lock:", error);
  //   } finally {
  //     // Giải phóng khóa
  //     if (lock) {
  //       await lock.release().catch((err) => {
  //         // console.error("Error releasing lock:", err);
  //       });
  //     }
  //   }
  // }

  async incr(key: string): Promise<number> {
    return this.redis.incr(key);
  }

  async setTTL(key: string, ttl: number): Promise<void> {
    await this.redis.expire(key, ttl);
  }

  async setKey(key: string, value: string): Promise<any> {
    await this.redis.set(key, value);
  }

  async setKeyV2(key: string, value: string): Promise<any> {
    await this.redis.set(key, value , "EX", 60);
  }

  async setKeyV3(key: string, value: string , ttl: number): Promise<any> {
    await this.redis.set(key, value , "EX", ttl);
  }


  async setKeySyncChannelOrder(key: string, value: string): Promise<any> {
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

  async setKeyGetChannelBranches(key: string, value: string): Promise<any> {
    // Kiểm tra xem key đã tồn tại chưa trước khi ghi
    const existingValue = await this.redis.get(key);
    if (existingValue) {
      return; // Nếu đã tồn tại, không ghi lại
    }
    await this.redis.set(
      key,
      value,
      "EX",
      +(process.env.CONFIG_REDIS_CACHE_LIFETIME_SHOPEE_FOOD_GET_STORE_LIST ?? 30)
    );
  }

  async getKey(key: string): Promise<string | null> {
    return this.redis.get(key);
  }

  async deleteKey(key: string): Promise<any> {
    return this.redis.del(key);
  }

  async deleteKeysWithPrefix(prefix) {
    const keys = await this.redis.keys(`${prefix}*`);
    if (keys.length) {
      await this.redis.del(keys);
    }
  }

  async sendMessageToStream(tokens : string) {

    this.redisClient.xAdd(process.env.CONFIG_REDIS_STREAM_CHANNEL_FOOD_TOKEN ?? 'redis.stream.channel-food-token', '*', {
        value : tokens
      });
    
  }

  async sendMessageToStreamChannelOrderRefreshStatus(channelOrderRefreshToken : string) {
  
     this.redisClient.xAdd(process.env.CONFIG_REDIS_STREAM_CHANNEL_ORDER_REFRESH_STATUS ?? 'redis.stream.channel-order-refresh-status', '*', {
        value : channelOrderRefreshToken
      });
    
  }

  // async checkSpamByRedis(keyRedisToCheck: string, ttl: number): Promise<boolean> {     
  //   const spamCheckKey = `${keyRedisToCheck}:spam-check`;
  //   let result = false;
  
  //   await this.processWithLock(keyRedisToCheck, 5000, async () => {
  //     const isBlocked = await this.getKey(`${keyRedisToCheck}:blocked`);
  //     if (isBlocked) {
  //       result = true;
  //       return;
  //     }
  
  //     const spamCount = await this.incr(spamCheckKey);
  
  //     if (spamCount === 1) {
  //       await this.setTTL(spamCheckKey, ttl);
  //     }
  
  //     if (spamCount > 1) {
  //       await this.setKey(`${keyRedisToCheck}:blocked`, "true");
  //       await this.setTTL(`${keyRedisToCheck}:blocked`, ttl);
  //       await this.setTTL(spamCheckKey, ttl);
  //       result = true;
  //       return;
  //     }
  
  //     const foodChannelCacheToCheck = await this.getKey(keyRedisToCheck);
  //     if (!foodChannelCacheToCheck) {
  //       await this.setKeySyncChannelOrder(keyRedisToCheck, "true");
  //     }
  //   });
  
  //   return result;
  // }

  async checkSpamByRedis(key: string , ttl: number): Promise<any> {

    const isSpam = await this.redis.set(key,'true', 'EX', ttl, 'NX');

    return isSpam ? false : true ; 
  }

 
 }
 
