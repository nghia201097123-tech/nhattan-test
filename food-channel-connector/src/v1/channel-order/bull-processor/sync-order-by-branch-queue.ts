import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";
import { ChannelOrderService } from "../channel-order.service";
import { ChannelOrderFoodNumberEnum } from "src/utils.common/utils.enum.common/utils.channel-order-food-number";

@Processor(`${process.env.CONFIG_QUEUE_GROUP_NODEJS_FOOD_CHANNEL_CONNECTOR_REDIS_SYNC_CHANNEL_ORDER}-by-branch`)
export class SyncOrderByBranchQueue {
  constructor(
    private readonly channelOrderService: ChannelOrderService,

  ) {}

  @Process({ name: `${process.env.CONFIG_WORKER_KEY_REDIS_SYNC_CHANNEL_ORDER}-by-branch` , concurrency: +(process.env.CONFIG_QUEUE_JOB_CONCURRENCY_QUANTITY ?? 5 )}) // Tên job
  async syncChannelOrderShoppeFood(job: Job<any>): Promise<any> {
    try {     
                        
      if(job.data.channel_order_food_id == +ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER){
        await this.channelOrderService.syncChannelOrderShfByBranch(
          job.data.branch_id);
      }

      if(job.data.channel_order_food_id == +ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER){
        await this.channelOrderService.syncChannelOrderGrfByBranch(
          job.data.branch_id);
      }

      if(job.data.channel_order_food_id == +ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER){
        await this.channelOrderService.syncChannelOrderBefByBranch(
          job.data.branch_id);
      }
      
    } catch (error) {
      throw new Error("Có lỗi xảy ra khi xử lý task");
    }
  }
}
