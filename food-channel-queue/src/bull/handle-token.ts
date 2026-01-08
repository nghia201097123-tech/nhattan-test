// import { Process, Processor } from "@nestjs/bull";
// import { Job } from "bull";
// import { RedisService } from "src/redis/redis.service";

// @Processor(process.env.CONFIG_QUEUE_GROUP_REDIS_FOOD_CHANNEL_TOKEN)
// export class ChannelOrderTokenQueue {
//   constructor(
//     private readonly redisService: RedisService,

//   ) {}

//   @Process({ name: process.env.CONFIG_QUEUE_JOB_REDIS_FOOD_CHANNEL_TOKEN , concurrency: 2}) // Tên job
//   async handleTokenRedis(job: Job<any>): Promise<any> {
//     try {      
      
//       let a = []


//       console.log(job.data.token);

//       a.push(job.data.token)
//       console.log(a);
      
//       // await this.redisService.processJobFoodChannelToken(job.data.tokens);
//     } catch (error) {
//       throw new Error("Có lỗi xảy ra khi xử lý task");
//     }
//   }
// }
