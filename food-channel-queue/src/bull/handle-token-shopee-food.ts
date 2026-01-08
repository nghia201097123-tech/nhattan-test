import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { RedisService } from "src/redis/redis.service";

@Processor(process.env.CONFIG_QUEUE_GROUP_REDIS_FOOD_CHANNEL_TOKEN_SHOPEE_FOOD)
export class ChannelOrderTokenShoppeQueue {
  constructor(
    private readonly redisService: RedisService,

  ) {}

  @Process({ name: process.env.CONFIG_QUEUE_JOB_REDIS_FOOD_CHANNEL_TOKEN_SHOPEE_FOOD, concurrency: 1}) // Tên job
  async handleTokenRedis(job: Job<any>): Promise<any> {
    try {        
      await this.redisService.checkToJobSyncChannelOrderShfV2(job.data.tokens);    
    } catch (error) {
      throw new Error("Có lỗi xảy ra khi xử lý task");
    }
  }
}
