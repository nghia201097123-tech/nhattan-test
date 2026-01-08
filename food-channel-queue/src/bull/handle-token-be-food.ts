import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { RedisService } from "src/redis/redis.service";

@Processor(process.env.CONFIG_QUEUE_GROUP_REDIS_FOOD_CHANNEL_TOKEN_BE_FOOD)
export class ChannelOrderTokenBefoodQueue {
  constructor(
    private readonly redisService: RedisService,

  ) {}

  @Process({ name: process.env.CONFIG_QUEUE_JOB_REDIS_FOOD_CHANNEL_TOKEN_BE_FOOD, concurrency: 1}) // Tên job
  async handleTokenRedis(job: Job<any>): Promise<any> {
    try {            
      await this.redisService.checkToJobSyncChannelOrderBefV2(job.data.tokens);    
    } catch (error) {
      throw new Error("Có lỗi xảy ra khi xử lý task");
    }
  }
}
