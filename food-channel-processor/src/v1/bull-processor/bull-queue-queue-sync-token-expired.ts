import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { ChannelOrderFoodService } from "../channel-order-food/channel-order-food.service";

@Processor("queue-sync-token-expired")
export class QueueSyncTokenExpired{
  constructor(
    private readonly  channelOrderFoodService: ChannelOrderFoodService,
  ) {}

  @Process({ name: "job-queue:sync-token-expired", concurrency: +(process.env.CONFIG_QUEUE_JOB_CONCURRENCY_QUANTITY ?? 5 )}) // Tên job
  async syncChannelOrderGrabFood(job: Job<any>): Promise<any> {
    try {      

      await this.channelOrderFoodService.handleReconnectionTokens(job.data.branch_id,job.data.tokens);
      
    } catch (error) {
      throw new Error("Có lỗi xảy ra khi xử lý task");
    }
  }
}
