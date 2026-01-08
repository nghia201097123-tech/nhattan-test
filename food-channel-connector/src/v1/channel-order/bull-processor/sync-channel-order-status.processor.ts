// import { Process, Processor } from "@nestjs/bull";
// import { Job } from "bull";
// import { PiscinaService } from "src/v1/piscina/piscina.service";

// @Processor("food_channel_sync_channel_order_status") // Đặt tên queue
// export class ChannelOrderSyncOrderStatusProcessor {
//   constructor(private readonly piscinaService: PiscinaService) { }

//   @Process({ name: "processSyncChannelOrderStatus", concurrency: +(process.env.CONFIG_QUEUE_JOB_CONCURRENCY_QUANTITY ?? 5) })
//   async syncChannelOrderStatus(job: Job<any>): Promise<any> {
//     try {
//       return await this.piscinaService.runSyncOrderStatusWorkers(job.data);
//     } catch (error) {
//       console.log(error);
//       throw new Error("Có lỗi xảy ra khi xử lý task");
//     }
//   }
// }
