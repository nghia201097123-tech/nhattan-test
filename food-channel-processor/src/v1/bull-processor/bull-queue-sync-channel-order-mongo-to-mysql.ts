import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { ChannelOrderFoodService } from "../channel-order-food/channel-order-food.service";

@Processor("queue-sync-channel-order-mongo-to-mysql")
export class QueueSyncChannelOrderMongoToMysql {
  constructor(
    private readonly  channelOrderFoodService: ChannelOrderFoodService,

  ) {}

  @Process({ name: "job-queue:sync-channel-order-mongo-to-mysql" , concurrency: +(process.env.CONFIG_QUEUE_JOB_CONCURRENCY_QUANTITY ?? 5 )}) // Tên job
  async syncChannelOrderShoppeFood(job: Job<any>): Promise<any> {
    try {        
      
      
      // if(job.data.channel_order_food_id == +ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER){
      //   await this.channelOrderService.syncChannelOrderShfV2(
      //     // job.data.restaurant_id,job.data.restaurant_brand_id,job.data.branch_id,
      //     job.data.tokens);
      // }
      await this.channelOrderFoodService.syncChannelOrderToMysqlV2(job.data.branch_id);
      
      
    } catch (error) {
      throw new Error("Có lỗi xảy ra khi xử lý task");
    }
  }
}


