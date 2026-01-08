import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { ChannelOrderService } from "../channel-order.service";

@Processor(process.env.CONFIG_QUEUE_GROUP_NODEJS_FOOD_CHANNEL_CONNECTOR_REDIS_REFRESH_STATUS)
export class FoodChannelRefreshStatusOrderQueue {
  constructor(
    private readonly channelOrderService: ChannelOrderService,

  ) {}

  @Process({ name: process.env.CONFIG_WORKER_KEY_REDIS_SYNC_CHANNEL_ORDER_REFRESH_STATUS, concurrency: +(process.env.CONFIG_QUEUE_JOB_CONCURRENCY_QUANTITY ?? 5 )}) // Tên job
  async syncChannelOrderGrabFood(job: Job<any>): Promise<any> {
    try {

    await this.channelOrderService.refreshStatusChannelOrder(job.data.branch_id,job.data.channel_order_food_id,job.data.channel_orders);
    
    } catch (error) {
      throw new Error("Có lỗi xảy ra khi xử lý task");
    }
  }
}
