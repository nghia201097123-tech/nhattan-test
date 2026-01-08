// import { InjectQueue } from '@nestjs/bull';
// import { Injectable, OnModuleInit } from '@nestjs/common';
// import { Queue } from 'bull';

// import { ConsumerService } from './consumer.service';
// import { ChannelOrderFoodNumberEnum } from 'src/utils.common/utils.enum/utils.channel-order-food-number';

// @Injectable()
// export class Consumer implements OnModuleInit {
//   constructor(
//     private readonly consumerService: ConsumerService,

//     @InjectQueue('food_channel_queue')
//     private readonly foodChannelQueue: Queue,
//   ) {}

//   async onModuleInit() {
//     // await this.consumerService.consumerKafka(
//     //   {
//     //     topic: process.env.CONFIG_KAFKA_TOPIC_CHANNEL_FOOD_QUEUE,
//     //     partition: 0,
//     //     offset: '',
//     //   },
//     //   {
//     //     eachMessage: async ({ topic, partition, message }): Promise<void> => {
//     //       const data = JSON.parse(message.value.toString());

//     //       const tokenToJson = JSON.parse(data.tokens);
//     //       const tokenShf = tokenToJson.filter((t) => t.channel_order_food_id === +ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER);
//     //       const tokenGrf = tokenToJson.filter((t) => t.channel_order_food_id === +ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER);
//     //       const tokenBef = tokenToJson.filter((t) => t.channel_order_food_id === +ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER);

//     //       if(tokenShf.length > 0 ){
//     //         await this.checkToJobSyncChannelOrderShf(data.restaurant_id , data.restaurant_brand_id , data.branch_id , JSON.stringify(tokenShf));
//     //       }

//     //       if(tokenGrf.length > 0 ){
            
//     //         await this.checkToJobSyncChannelOrderGrf(data.restaurant_id , data.restaurant_brand_id , data.branch_id , JSON.stringify(tokenGrf));
//     //       }

//     //       if(tokenBef.length > 0 ){
//     //         await this.checkToJobSyncChannelOrderBef(data.restaurant_id , data.restaurant_brand_id , data.branch_id , JSON.stringify(tokenBef));
//     //       }

//     //       },
//     //   },
//     // );
//   }

//   // async checkToJobSyncChannelOrderShf(
//   //   restaurantId: number,
//   //   restaurantBrandId: number,
//   //   branchId: number,
//   //   tokens: string,
//   // ) {
//   //   try {

//   //     const jobId = `unique-job-${branchId}-${ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER}`      

//   //     const existingJob = await this.foodChannelQueue.getJob(jobId);

//   //     if (existingJob) {

//   //       if (await existingJob.getState() === 'failed') {
//   //         // Xóa job nếu trạng thái là "failed"
//   //         await existingJob.remove();
//   //         // console.log(`Removed failed job with ID: ${jobId}`);
//   //       } else {
//   //         return;
//   //       }
//   //     }
      

//   //     await this.foodChannelQueue.add(
//   //       process.env.CONFIG_QUEUE_JOB_KEY_REDIS_SYNC_CHANNEL_ORDER_SHOPEEFOOD,
//   //       {
//   //         ...{
//   //           restaurant_id :restaurantId,
//   //           restaurant_brand_id:restaurantBrandId,
//   //           branch_id:branchId,
//   //           channel_order_food_id:+ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER,
//   //           tokens:tokens,
//   //         },
//   //       },
//   //       {
//   //         jobId:jobId,
//   //         removeOnComplete: true,
//   //         // removeOnFail: { age: 30 }, // Xóa job thất bại sau 1 giờ (3600 giây)
//   //         delay: 0,
          
//   //       },
//   //     );
  
//   //   } catch (error) {
//   //     console.error(`Có lỗi xảy ra khi lấy hoặc xóa job: ${error.message}`);
//   //   }
//   // }

//   // async checkToJobSyncChannelOrderGrf(
//   //   restaurantId: number,
//   //   restaurantBrandId: number,
//   //   branchId: number,
//   //   tokens: string,
//   // ) {
//   //   try {

//   //     const jobId = `unique-job-${branchId}-${ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER}`

//   //     const existingJob = await this.foodChannelQueue.getJob(jobId);

//   //     if (existingJob) {

//   //       if (await existingJob.getState() === 'failed') {
//   //         // Xóa job nếu trạng thái là "failed"
//   //         await existingJob.remove();
//   //         // console.log(`Removed failed job with ID: ${jobId}`);
//   //       } else {
//   //         return;
//   //       }
//   //     }
//   //     // Nếu không có, tạo một công việc mới
//   //     // const data = ;
//   //     await this.foodChannelQueue.add(
//   //       process.env.CONFIG_QUEUE_JOB_KEY_REDIS_SYNC_CHANNEL_ORDER_GRABFOOD,
//   //       {
//   //         ...{
//   //           restaurant_id :restaurantId,
//   //           restaurant_brand_id:restaurantBrandId,
//   //           branch_id:branchId,
//   //           channel_order_food_id:+ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER,
//   //           tokens:tokens,
//   //         },
//   //       },
//   //       {
//   //         jobId:jobId,
//   //         removeOnComplete: true,
//   //         // removeOnFail: { age: 30 }, // Xóa job thất bại sau 1 giờ (3600 giây)
//   //         delay: 0,
//   //       },
//   //     );
//   //   } catch (error) {
//   //     console.error(`Có lỗi xảy ra khi lấy hoặc xóa job: ${error.message}`);
//   //   }
//   // }

//   // async checkToJobSyncChannelOrderBef(
//   //   restaurantId: number,
//   //   restaurantBrandId: number,
//   //   branchId: number,
//   //   tokens: string,
//   // ) {
//   //   try {

//   //     const jobId = `unique-job-${branchId}-${ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER}`

//   //     const existingJob = await this.foodChannelQueue.getJob(jobId);

//   //     if (existingJob) {

//   //       if (await existingJob.getState() === 'failed') {
//   //         // Xóa job nếu trạng thái là "failed"
//   //         await existingJob.remove();
//   //         // console.log(`Removed failed job with ID: ${jobId}`);
//   //       } else {
//   //         return;
//   //       }
//   //     }
      
//   //     await this.foodChannelQueue.add(
//   //       process.env.CONFIG_QUEUE_JOB_KEY_REDIS_SYNC_CHANNEL_ORDER_BEFOOD,
//   //       {
//   //         ...{
//   //           restaurant_id :restaurantId,
//   //           restaurant_brand_id:restaurantBrandId,
//   //           branch_id:branchId,
//   //           channel_order_food_id:+ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER,
//   //           tokens:tokens,
//   //         },
//   //       },
//   //       {
//   //         jobId:jobId,
//   //         removeOnComplete: true,
//   //         // removeOnFail: { age: 30 }, // Xóa job thất bại sau 1 giờ (3600 giây)
//   //         delay: 0,
          
//   //       },
//   //     );
//   //   } catch (error) {
//   //     console.error(`Có lỗi xảy ra khi lấy hoặc xóa job: ${error.message}`);
//   //   }
//   // }
  
// }
