import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { RedisService } from "src/redis/redis.service";

@Processor(process.env.CONFIG_QUEUE_GROUP_REDIS_REFRESH_STATUS_CHANNEL_ORDER)
export class RefreshStatusChannelOrderQueue {
  constructor(
    private readonly redisService: RedisService,

  ) {}

  @Process({ name: process.env.CONFIG_QUEUE_JOB_REDIS_FOOD_REFRESH_STATUS_CHANNEL_ORDER , concurrency: +(process.env.CONFIG_QUEUE_JOB_CONCURRENCY_QUANTITY ?? 5 )}) // Tên job
  async handleRefreshStatusChannelOrderRedis(job: Job<any>): Promise<any> {
    try {        
      this.redisService.processRefreshStatusMessages(job.data.branch_id,job.data.channel_orders);
    } catch (error) {
      throw new Error("Có lỗi xảy ra khi xử lý task");
    }
  }
}
