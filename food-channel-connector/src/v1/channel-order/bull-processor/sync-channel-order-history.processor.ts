// import { Process, Processor } from "@nestjs/bull";
// import { Job } from "bull";
// import { PiscinaService } from "src/v1/piscina/piscina.service";

// @Processor("food_channel_sync_channel_order_histories") // Đặt tên queue
// export class ChannelOrderSyncOrderHistoryProcessor {
//   constructor(private readonly piscinaService: PiscinaService) {}

//   @Process({ name: "processSyncChannelOrderHistory", concurrency: +(process.env.CONFIG_QUEUE_JOB_CONCURRENCY_QUANTITY ?? 5 )})
//   async syncChannelOrders(job: Job<any>): Promise<any> {
//     try {      

//       const listToken = job.data.tokens;
//       return await this.piscinaService.runSyncOrderHistoryWorkers(listToken , job.data.time);
//     } catch (error) {
//       console.log(error);
//       throw new Error("Có lỗi xảy ra khi xử lý task");
//     }
//   }
// }
