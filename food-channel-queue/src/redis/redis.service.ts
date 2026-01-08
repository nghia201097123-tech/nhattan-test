// import Bull, { Queue } from 'bull';
import { InjectQueue } from "@nestjs/bull";
import { Inject, Injectable, OnModuleInit } from "@nestjs/common";
import { Job, Queue } from "bull";
import { ChannelOrderFoodNumberEnum } from "src/utils.common/utils.enum/utils.channel-order-food-number";
// const cpuCount = require("os").cpus().length;
const cpuCount = 1;

import Redis from 'ioredis';
import { BufferCacheService } from "src/buffer-cache/buffer-cache.service";

@Injectable()
export class RedisService {
  // private redis;

  constructor(

    @Inject("REDIS_CLIENT")
    private readonly redis: Redis,

    private readonly bufferCacheService: BufferCacheService,

    @InjectQueue(
      process.env.CONFIG_QUEUE_GROUP_REDIS_SYNC_CHANNEL_ORDER_SHOPEEFOOD
    )
    private readonly foodChannelShopeeFoodQueue: Queue,

    @InjectQueue(
      process.env.CONFIG_QUEUE_GROUP_REDIS_SYNC_CHANNEL_ORDER_GRABFOOD
    )
    private readonly foodChannelGrabFoodQueue: Queue,

    @InjectQueue(process.env.CONFIG_QUEUE_GROUP_REDIS_SYNC_CHANNEL_ORDER_BEFOOD)
    private readonly foodChannelBeFoodQueue: Queue,

    @InjectQueue(process.env.CONFIG_QUEUE_GROUP_REDIS_SYNC_CHANNEL_ORDER_CNVL ?? 'queue-sync-channel-order-cnvl')
    private readonly foodChannelCnvlQueue: Queue,

    @InjectQueue(
      process.env
        .CONFIG_QUEUE_GROUP_REDIS_CHANNEL_ORDER_REFRESH_STATUS_SHOPEEFOOD
    )
    private readonly foodChannelRefreshStatusOrderQueueShopeeFood?: Queue,

    @InjectQueue(
      process.env.CONFIG_QUEUE_GROUP_REDIS_CHANNEL_ORDER_REFRESH_STATUS_GRABFOOD
    )
    private readonly foodChannelRefreshStatusOrderQueueGrabFood?: Queue,

    @InjectQueue(
      process.env.CONFIG_QUEUE_GROUP_REDIS_CHANNEL_ORDER_REFRESH_STATUS_BEFOOD
    )
    private readonly foodChannelRefreshStatusOrderQueueBeFood?: Queue,

    @InjectQueue(
      process.env.CONFIG_QUEUE_GROUP_REDIS_CHANNEL_ORDER_REFRESH_STATUS_CNVL ?? 'queue-channel-order-refresh-status-cnvl'
    )
    private readonly foodChannelRefreshStatusOrderQueueCnvl?: Queue,


  ) {
    
  }

  async checkToJobSyncChannelOrderShf(
    tokens: string
  ) {
    const redisKey = `tokens-shopee-food`;
    // const requiredTokens = 12;

    try {
      // Lấy danh sách tokens hiện tại
      let currentData = {
        count: 0,
        tokens: "[]",
      };

      const redisValue = await this.redis.get(redisKey);

      if (redisValue) {
        currentData = JSON.parse(redisValue);
      }

      // Parse tokens hiện tại và tokens mới
      const currentTokens = JSON.parse(currentData.tokens);
      const newTokens = JSON.parse(tokens);

      // Thêm tokens mới vào danh sách và tăng count
      const updatedTokens = [...currentTokens, ...newTokens];
      currentData.tokens = JSON.stringify(updatedTokens);
      currentData.count += 1;

      // Nếu đủ số lượng tokens yêu cầu hoặc count > 2
      if (updatedTokens.length >= cpuCount || currentData.count >= 10) {
        // Lấy tokens để xử lý
        const tokensToProcess = updatedTokens.slice(0, cpuCount);

        currentData.tokens = JSON.stringify(updatedTokens.slice(cpuCount, updatedTokens.length+1));
        // Reset key về mặc định
        await this.redis.set(
          redisKey,
          JSON.stringify({
            count: 1,
            tokens: currentData.tokens,
          })
        );

        // Add job với tokens
        await this.foodChannelShopeeFoodQueue.add(
          process.env
            .CONFIG_QUEUE_JOB_KEY_REDIS_SYNC_CHANNEL_ORDER_SHOPEEFOOD,
          {
            ...{
              channel_order_food_id:
                +ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER,
              tokens: JSON.stringify(tokensToProcess),
            },
          },
          {
            removeOnComplete: true,
            removeOnFail: true,
            delay: 0,
          }
        );


      } else {
        // Nếu chưa đủ điều kiện, lưu lại trạng thái hiện tại
        await this.redis.set(redisKey, JSON.stringify(currentData));

      }
    } catch (error) {
      console.error(`Có lỗi xảy ra khi xử lý tokens: ${error.message}`);
    }

  }

  async checkToJobSyncChannelOrderGrf(
    tokens: string
  ) {
    try {
      const redisKey = `tokens-grab-food`;
      // const requiredTokens = 12;        // Lấy danh sách tokens hiện tại
      let currentData = {
        count: 0,
        tokens: "[]",
      };

      const redisValue = await this.redis.get(redisKey);

      if (redisValue) {
        currentData = JSON.parse(redisValue);
      }

      // Parse tokens hiện tại và tokens mới
      const currentTokens = JSON.parse(currentData.tokens);
      const newTokens = JSON.parse(tokens);

      // Thêm tokens mới vào danh sách và tăng count
      const updatedTokens = [...currentTokens, ...newTokens];
      currentData.tokens = JSON.stringify(updatedTokens);
      currentData.count += 1;

      // Nếu đủ số lượng tokens yêu cầu hoặc count > 2
      if (updatedTokens.length >= cpuCount || currentData.count >= 10) {
        // Lấy tokens để xử lý
        const tokensToProcess = updatedTokens.slice(0, cpuCount);

        currentData.tokens = JSON.stringify(updatedTokens.slice(cpuCount, updatedTokens.length+1));
        // Reset key về mặc định
        await this.redis.set(
          redisKey,
          JSON.stringify({
            count: 1,
            tokens: currentData.tokens,
          })
        );
        // Add job với tokens
        await this.foodChannelGrabFoodQueue.add(
          process.env
            .CONFIG_QUEUE_JOB_KEY_REDIS_SYNC_CHANNEL_ORDER_GRABFOOD,
          {
            ...{
              channel_order_food_id:
                +ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER,
              tokens: JSON.stringify(tokensToProcess),
            },
          },
          {
            removeOnComplete: true,
            removeOnFail: true,
            delay: 0,
          }
        );


      } else {
        // Nếu chưa đủ điều kiện, lưu lại trạng thái hiện tại
        await this.redis.set(redisKey, JSON.stringify(currentData));

      }
    } catch (error) {
      console.error(`Có lỗi xảy ra khi xử lý tokens: ${error.message}`);

    }
  }

  async checkToJobSyncChannelOrderBef(
    // restaurantId: number,
    // restaurantBrandId: number,
    // branchId: number,
    tokens: string
  ) {
    try {
      const redisKey = `tokens-be-food`;
      // const requiredTokens = 12;        // Lấy danh sách tokens hiện tại
      let currentData = {
        count: 0,
        tokens: "[]",
      };

      const redisValue = await this.redis.get(redisKey);

      if (redisValue) {
        currentData = JSON.parse(redisValue);
      }

      // Parse tokens hiện tại và tokens mới
      const currentTokens = JSON.parse(currentData.tokens);
      const newTokens = JSON.parse(tokens);

      // Thêm tokens mới vào danh sách và tăng count
      const updatedTokens = [...currentTokens, ...newTokens];
      currentData.tokens = JSON.stringify(updatedTokens);
      currentData.count += 1;

      // Nếu đủ số lượng tokens yêu cầu hoặc count > 2
      if (updatedTokens.length >= cpuCount || currentData.count >= 10) {
        // Lấy tokens để xử lý
       const tokensToProcess = updatedTokens.slice(0, cpuCount);

      currentData.tokens = JSON.stringify(updatedTokens.slice(cpuCount, updatedTokens.length+1));
      // Reset key về mặc định
      await this.redis.set(
        redisKey,
        JSON.stringify({
          count: 1,
          tokens: currentData.tokens,
        })
      );

        // Add job với tokens
        await this.foodChannelBeFoodQueue.add(
          process.env
            .CONFIG_QUEUE_JOB_KEY_REDIS_SYNC_CHANNEL_ORDER_BEFOOD,
          {
            ...{
              channel_order_food_id:
                +ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER,
              tokens: JSON.stringify(tokensToProcess),
            },
          },
          {
            removeOnComplete: true,
            removeOnFail: true,
            delay: 0,
          }
        );


      } else {
        // Nếu chưa đủ điều kiện, lưu lại trạng thái hiện tại
        await this.redis.set(redisKey, JSON.stringify(currentData));

      }
    } catch (error) {
      console.error(`Có lỗi xảy ra khi xử lý tokens: ${error.message}`);

    }
  }

  async checkToJobSyncChannelOrderCnvl(
    tokens: string
  ) {
    try {

      const redisKey = `tokens-cnvl`;
      // const requiredTokens = 12;        // Lấy danh sách tokens hiện tại
      let currentData = {
        count: 0,
        tokens: "[]",
      };

      const redisValue = await this.redis.get(redisKey);

      if (redisValue) {
        currentData = JSON.parse(redisValue);
      }

      // Parse tokens hiện tại và tokens mới
      const currentTokens = JSON.parse(currentData.tokens);
      const newTokens = JSON.parse(tokens);

      // Thêm tokens mới vào danh sách và tăng count
      const updatedTokens = [...currentTokens, ...newTokens];
      currentData.tokens = JSON.stringify(updatedTokens);
      currentData.count += 1;

      // Nếu đủ số lượng tokens yêu cầu hoặc count > 2
      if (updatedTokens.length >= cpuCount || currentData.count >= 10) {
        // Lấy tokens để xử lý
        const tokensToProcess = updatedTokens.slice(0, cpuCount);

        // Reset key về mặc định
        await this.redis.set(
          redisKey,
          JSON.stringify({
            count: 0,
            tokens: "[]",
          })
        );
        // Add job với tokens
        await this.foodChannelCnvlQueue.add(
          process.env
            .CONFIG_QUEUE_JOB_KEY_REDIS_SYNC_CHANNEL_ORDER_CNVL ?? 'job-queue:sync-channel-order-cnvl',
          {
            ...{
              channel_order_food_id:
                +ChannelOrderFoodNumberEnum.CNV_LOYALTY_NUMBER,
              tokens: JSON.stringify(tokensToProcess),
            },
          },
          {
            removeOnComplete: true,
            removeOnFail: true,
            delay: 0,
          }
        );


      } else {
        // Nếu chưa đủ điều kiện, lưu lại trạng thái hiện tại
        await this.redis.set(redisKey, JSON.stringify(currentData));

      }
    } catch (error) {
      console.error(`Có lỗi xảy ra khi xử lý tokens: ${error.message}`);

    }
  }

  async checkToJobSyncChannelOrderRefreshStatusShf(
    branchId: number,
    channelOrders: string
  ) {
    try {
      const jobId = `job-channel-order-refresh-status-${branchId}-${ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER}`;

      const existingJob =
        await this.foodChannelRefreshStatusOrderQueueShopeeFood.getJob(jobId);

      if (existingJob) {
        return;
      }


      await this.foodChannelRefreshStatusOrderQueueShopeeFood.add(
        process.env
          .CONFIG_QUEUE_JOB_KEY_REDIS_CHANNEL_ORDER_REFRESH_STATUS_SHOPEEFOOD,
        {
          ...{
            branch_id: branchId,
            channel_order_food_id:
              +ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER,
            channel_orders: channelOrders,
          },
        },
        {
          jobId: jobId,
          removeOnComplete: true,
          removeOnFail: true,
          delay: 0,
        }
      );
    } catch (error) {
      console.error(`Có lỗi xảy ra khi lấy hoặc xóa job: ${error.message}`);
    }
  }

  async checkToJobSyncChannelOrderRefreshStatusGrf(
    branchId: number,
    channelOrders: string
  ) {
    try {
      const jobId = `job-channel-order-refresh-status-${branchId}-${ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER}`;

      const existingJob =
        await this.foodChannelRefreshStatusOrderQueueGrabFood.getJob(jobId);

      if (existingJob) {
        return;
      }

      await this.foodChannelRefreshStatusOrderQueueGrabFood.add(
        process.env
          .CONFIG_QUEUE_JOB_KEY_REDIS_CHANNEL_ORDER_REFRESH_STATUS_GRABFOOD,
        {
          ...{
            branch_id: branchId,
            channel_order_food_id: +ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER,
            channel_orders: channelOrders,
          },
        },
        {
          jobId: jobId,
          removeOnComplete: true,
          removeOnFail: true,
          delay: 0,
        }
      );
    } catch (error) {
      console.error(`Có lỗi xảy ra khi lấy hoặc xóa job: ${error.message}`);
    }
  }

  async checkToJobSyncChannelOrderRefreshStatusBef(
    branchId: number,
    channelOrders: string
  ) {
    try {
      const jobId = `job-channel-order-refresh-status-${branchId}-${ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER}`;

      const existingJob =
        await this.foodChannelRefreshStatusOrderQueueBeFood.getJob(jobId);

      if (existingJob) {
        return;
      }

      await this.foodChannelRefreshStatusOrderQueueBeFood.add(
        process.env
          .CONFIG_QUEUE_JOB_KEY_REDIS_CHANNEL_ORDER_REFRESH_STATUS_BEFOOD,
        {
          ...{
            branch_id: branchId,
            channel_order_food_id: +ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER,
            channel_orders: channelOrders,
          },
        },
        {
          jobId: jobId,
          removeOnComplete: true,
          removeOnFail: true,
          delay: 0,
        }
      );
    } catch (error) {
      console.error(`Có lỗi xảy ra khi lấy hoặc xóa job: ${error.message}`);
    }
  }

  async checkToJobSyncChannelOrderRefreshStatusCnvl(
    branchId: number,
    channelOrders: string
  ) {
    try {
      const jobId = `job-channel-order-refresh-status-${branchId}-${ChannelOrderFoodNumberEnum.CNV_LOYALTY_NUMBER}`;

      const existingJob =
        await this.foodChannelRefreshStatusOrderQueueCnvl.getJob(jobId);

      if (existingJob) {
        return;
      }

      await this.foodChannelRefreshStatusOrderQueueCnvl.add(
        process.env
          .CONFIG_QUEUE_JOB_KEY_REDIS_CHANNEL_ORDER_REFRESH_STATUS_CNVL,
        {
          ...{
            branch_id: branchId,
            channel_order_food_id: +ChannelOrderFoodNumberEnum.CNV_LOYALTY_NUMBER,
            channel_orders: channelOrders,
          },
        },
        {
          jobId: jobId,
          removeOnComplete: true,
          removeOnFail: true,
          delay: 0,
        }
      );
    } catch (error) {
      console.error(`Có lỗi xảy ra khi lấy hoặc xóa job: ${error.message}`);
    }
  }

  async processJobFoodChannelToken(tokens: string) {
    // const data = JSON.parse(Object.assign({}, entry.message).value);
    const tokenToJson = JSON.parse(tokens);

    const tokensByChannel = {
      [ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER]: tokenToJson.filter(
        (t) =>
          t.channel_order_food_id ===
          +ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER
      ),
      [ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER]: tokenToJson.filter(
        (t) =>
          t.channel_order_food_id ===
          +ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER
      ),
      [ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER]: tokenToJson.filter(
        (t) =>
          t.channel_order_food_id ===
          +ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER
      ),
      // [ChannelOrderFoodNumberEnum.CNV_LOYALTY_NUMBER]: tokenToJson.filter(
      //   (t) =>
      //     t.channel_order_food_id ===
      //     +ChannelOrderFoodNumberEnum.CNV_LOYALTY_NUMBER
      // ),
    };

    await Promise.allSettled([
      tokensByChannel[ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER]
        .length > 0 &&
      this.checkToJobSyncChannelOrderShf(
        JSON.stringify(
          tokensByChannel[ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER]
        )
      ),
      tokensByChannel[ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER]
        .length > 0 &&
      this.checkToJobSyncChannelOrderGrf(
        JSON.stringify(
          tokensByChannel[ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER]
        )
      ),
      tokensByChannel[ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER].length >
      0 &&
      this.checkToJobSyncChannelOrderBef(
        JSON.stringify(
          tokensByChannel[ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER]
        )
      )
      // tokensByChannel[ChannelOrderFoodNumberEnum.CNV_LOYALTY_NUMBER].length >
      // 0 &&
      // this.checkToJobSyncChannelOrderCnvl(
      //   JSON.stringify(
      //     tokensByChannel[ChannelOrderFoodNumberEnum.CNV_LOYALTY_NUMBER]
      //   )
      // ),
    ]);
  }

  async processRefreshStatusMessages(branchId: number, channelOrders: any[]) {

    // Phân loại đơn hàng theo kênh
    const ordersByChannel = {
      [ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER]:
        channelOrders.filter(
          (order) =>
            order.channel_order_food_id ===
            +ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER
        ),
      [ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER]:
        channelOrders.filter(
          (order) =>
            order.channel_order_food_id ===
            +ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER
        ),
      [ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER]:
        channelOrders.filter(
          (order) =>
            order.channel_order_food_id ===
            +ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER
        ),
      // [ChannelOrderFoodNumberEnum.CNV_LOYALTY_NUMBER]:
      //   channelOrders.filter(
      //     (order) =>
      //       order.channel_order_food_id ===
      //       +ChannelOrderFoodNumberEnum.CNV_LOYALTY_NUMBER
      //   ),
    };

    // Xử lý song song cho các kênh
    await Promise.all([
      ordersByChannel[ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER]
        .length > 0 &&
      this.checkToJobSyncChannelOrderRefreshStatusShf(
        branchId,
        JSON.stringify(
          ordersByChannel[ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER]
        )
      ),
      ordersByChannel[ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER]
        .length > 0 &&
      this.checkToJobSyncChannelOrderRefreshStatusGrf(
        branchId,
        JSON.stringify(
          ordersByChannel[ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER]
        )
      ),
      ordersByChannel[ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER].length >
      0 &&
      this.checkToJobSyncChannelOrderRefreshStatusBef(
        branchId,
        JSON.stringify(
          ordersByChannel[ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER]
        )
      ),
      // ordersByChannel[ChannelOrderFoodNumberEnum.CNV_LOYALTY_NUMBER].length >
      // 0 &&
      // this.checkToJobSyncChannelOrderRefreshStatusCnvl(
      //   branchId,
      //   JSON.stringify(
      //     ordersByChannel[ChannelOrderFoodNumberEnum.CNV_LOYALTY_NUMBER]
      //   )
      // ),
    ]);
  }

  async checkToJobSyncChannelOrderGrfV2(
    token: string
  ) {
    try {

      const bufferKey = `job-buffer-token-queue-grabfood`;

      let listToken = this.bufferCacheService.get(bufferKey);
      
      if (!listToken || !Array.isArray(listToken)) {
        listToken = [];
      }      
      // Thêm token mới vào danh sách
      listToken.push(JSON.parse(token));   
            
      // Sửa lỗi toán tử so sánh từ = thành >=
      if (listToken.length >= cpuCount) {
        // Lấy tokens để xử lý
        await this.foodChannelGrabFoodQueue.add(
          process.env
            .CONFIG_QUEUE_JOB_KEY_REDIS_SYNC_CHANNEL_ORDER_GRABFOOD,
          {
            ...{
              channel_order_food_id:
                +ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER,
              tokens: JSON.stringify(listToken),
            },
          },
          {
            removeOnComplete: true,
            removeOnFail: true,
            delay: 0,
          }
        );

        // Reset buffer cache
        this.bufferCacheService.set(bufferKey, []);

      } else {
        // Nếu chưa đủ điều kiện, lưu lại trạng thái hiện tại
        this.bufferCacheService.set(bufferKey, listToken);

      }      

    } catch (error) {
      console.error(`Có lỗi xảy ra khi xử lý tokens: ${error.message}`);

    }
  }

  async checkToJobSyncChannelOrderBefV2(
    token: string
  ) {
    try {

      const bufferKey = `job-buffer-token-queue-befood`;

      let listToken = this.bufferCacheService.get(bufferKey);
      
      if (!listToken || !Array.isArray(listToken)) {
        listToken = []; 
      }      
      // Thêm token mới vào danh sách
      listToken.push(JSON.parse(token));   
            
      // Sửa lỗi toán tử so sánh từ = thành >=
      if (listToken.length >= cpuCount) {
        // Lấy tokens để xử lý
        await this.foodChannelBeFoodQueue.add(
          process.env
            .CONFIG_QUEUE_JOB_KEY_REDIS_SYNC_CHANNEL_ORDER_BEFOOD,
          {
            ...{
              channel_order_food_id:
                +ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER,
              tokens: JSON.stringify(listToken),
            },
          },
          {
            removeOnComplete: true,
            removeOnFail: true,
            delay: 0,
          }
        );

        // Reset buffer cache
        this.bufferCacheService.set(bufferKey, []);

      } else {
        // Nếu chưa đủ điều kiện, lưu lại trạng thái hiện tại
        this.bufferCacheService.set(bufferKey, listToken);

      }      

    } catch (error) {
      console.error(`Có lỗi xảy ra khi xử lý tokens: ${error.message}`);

    }
  }

  async checkToJobSyncChannelOrderShfV2(
    token: string
  ) {
    try {

      const bufferKey = 'job-buffer-token-queue-shhopeefood';

      let listToken = this.bufferCacheService.get(bufferKey);
      
      if (!listToken || !Array.isArray(listToken)) {
        listToken = [];
      }      
      // Thêm token mới vào danh sách
      listToken.push(JSON.parse(token));   
            
      // Sửa lỗi toán tử so sánh từ = thành >=
      if (listToken.length >= cpuCount) {
        // Lấy tokens để xử lý
        await this.foodChannelShopeeFoodQueue.add(
          process.env
            .CONFIG_QUEUE_JOB_KEY_REDIS_SYNC_CHANNEL_ORDER_SHOPEEFOOD,
          {
            ...{
              channel_order_food_id:
                +ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER,
              tokens: JSON.stringify(listToken),
            },
          },
          {
            removeOnComplete: true,
            removeOnFail: true,
            delay: 0,
          }
        );

        // Reset buffer cache
        this.bufferCacheService.set(bufferKey, []);

      } else {
        // Nếu chưa đủ điều kiện, lưu lại trạng thái hiện tại
        this.bufferCacheService.set(bufferKey, listToken);

      }      

    } catch (error) {
      console.error(`Có lỗi xảy ra khi xử lý tokens: ${error.message}`);

    }
  }
}






