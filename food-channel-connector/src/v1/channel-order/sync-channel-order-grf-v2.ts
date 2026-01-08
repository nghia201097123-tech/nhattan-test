import { HttpStatus } from "@nestjs/common";
import { FoodChannelTokenValidatorEntity } from "./entity/food-channel-token-validator.entity";
import { ChannelOrderFoodApiEnum } from "src/utils.common/utils.enum.common/utils.channel-order-food-api.enum";
import { ChannelOrderFoodNumberEnum } from "src/utils.common/utils.enum.common/utils.channel-order-food-number";
import { ChannelOrderToMongo } from "./entity/channel-order-to-mongo.entity";
import { ChannelOrderHistoryToMongo } from "./entity/channel-order-history-to-mongo.entity";
import { SyncChannelOrderGrfService } from "./sync-channel-order/sync-channel-order-grf";
import { RedisService } from "../redis/redis.service";

async function handleTokenRefresh(
  syncService: SyncChannelOrderGrfService,
  channelToken: FoodChannelTokenValidatorEntity
): Promise<string> {
  const {
    url_login = ChannelOrderFoodApiEnum.GRF_LOGIN,
    url_update_device = ChannelOrderFoodApiEnum.GRF_UPDATE_DEVICE_INFO,
    username,
    password,
    device_id,
    device_brand
  } = channelToken;

  return await syncService.syncTokenGRF(
    url_login,
    url_update_device,
    username,
    password,
    device_id,
    device_brand
  );
}

 

async function fetchOrders(
  syncService: SyncChannelOrderGrfService,
  url: string,
  accessToken: string,
  isHistory: boolean = false
) {
  const fetchMethod = isHistory 
    ? syncService.getOrderHistories.bind(syncService)
    : syncService.getOrders.bind(syncService);
    
  let response = await fetchMethod(url, accessToken);
  return response;
}

export default async function performTask(
  channelFoodToken: FoodChannelTokenValidatorEntity
): Promise<any> {
  const syncService = new SyncChannelOrderGrfService();
  let accessTokenNew = '';
  const redisService = new RedisService();
  // const redis = redisService.getClient();
  const redisTaskGetNewOrderKey = `branch_id-${channelFoodToken.branch_id}-grabfood-new-channel-branch-id:id-${channelFoodToken.channel_branch_id}`;
  const branchGroupNewOrderKey = `branch_id-${channelFoodToken.branch_id}-grabfood-new:set`;
  const redisTaskGetOldOrderKey = `branch_id-${channelFoodToken.branch_id}-grabfood-old-channel-branch-id:id-${channelFoodToken.channel_branch_id}`;
  const branchGroupOldOrderKey = `branch_id-${channelFoodToken.branch_id}-grabfood-old:set`;
  const pipeline = redisService.getClient().pipeline();

  // if (channelFoodToken.channel_branch_id == 'huynhhoapxl3') {
  //   // console.log('🔄 Treo 10 giây cho huynhhoapxl3...');
  //   // await new Promise(resolve => setTimeout(resolve, 12000));
  //   // console.log('✅ Đã hoàn thành treo 11 giây');
    
  //   // Cách 1: Throw error để fail task
  //   throw new Error('Task bị fail do test huynhhoapxl3');
    
  //   // Cách 2: Process.exit để kill worker (uncomment nếu muốn)
  //   // process.exit(1);
    
  //   // Cách 3: Reject promise (uncomment nếu muốn)
  //   // return Promise.reject(new Error('Task bị reject do test huynhhoapxl3'));
  // }
  
  // Hàm helper để xử lý việc lấy đơn hàng và refresh token nếu cần
  async function getOrdersWithTokenRefresh(isHistory: boolean) {
    const url = isHistory 
      ? (channelFoodToken.url_get_history_orders ?? ChannelOrderFoodApiEnum.GRF_GET_ORDER_LIST)
      : (channelFoodToken.url_get_new_orders ?? ChannelOrderFoodApiEnum.GRF_GET_NEW_ORDER_LIST);
    
    let data = await fetchOrders(syncService, url, channelFoodToken.access_token, isHistory);
    
    if (data.getStatus() === HttpStatus.UNAUTHORIZED) {
      accessTokenNew = await handleTokenRefresh(syncService, channelFoodToken);
      channelFoodToken.access_token = accessTokenNew;
      data = await fetchOrders(syncService, url, accessTokenNew, isHistory);

      if (data.getStatus() === HttpStatus.UNAUTHORIZED) {
        accessTokenNew = 'token_expired';
      }
    }
    
    return data;
  }

  // Lấy đơn hàng mới
  const newOrdersData = await getOrdersWithTokenRefresh(false);
  const dataChannelOrders = newOrdersData.getStatus() === HttpStatus.OK
    ? new ChannelOrderToMongo().mapToList(
        newOrdersData.getList(),
        ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER,
        channelFoodToken.branch_id,
        channelFoodToken.channel_branch_id,
        channelFoodToken.channel_order_food_token_id,
        channelFoodToken.url_get_order_detail,
        channelFoodToken.access_token
      )
    : [];
  // Lấy lịch sử đơn hàng
  const oldOrdersData = await getOrdersWithTokenRefresh(true);
  const dataChannelOrderHistories = oldOrdersData.getStatus() === HttpStatus.OK
    ? new ChannelOrderHistoryToMongo().mapToList(
        oldOrdersData.getList(),
        ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER,
        channelFoodToken.branch_id,
        channelFoodToken.url_get_order_detail,
        channelFoodToken.access_token
      )
    : [];


    pipeline.set(redisTaskGetNewOrderKey, JSON.stringify(dataChannelOrders), "EX", 600);
    pipeline.sadd(branchGroupNewOrderKey, redisTaskGetNewOrderKey);
    pipeline.expire(branchGroupNewOrderKey, 600);

    pipeline.set(redisTaskGetOldOrderKey, JSON.stringify(dataChannelOrderHistories), "EX", 600);
    pipeline.sadd(branchGroupOldOrderKey, redisTaskGetOldOrderKey);
    pipeline.expire(branchGroupOldOrderKey, 600);
    await pipeline.exec();

    // console.log('Check token call api grabfood: branch_id',channelFoodToken.branch_id,'channel_branch_id',channelFoodToken.channel_branch_id,'-->',newOrdersData.getStatus());

    // await UtilsBaseFunction.addJobSyncChannelOrderByBranch(channelFoodToken.branch_id,+ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER);


  return {
    // new_datas: dataChannelOrders,
    // history_datas: dataChannelOrderHistories,
    access_token: accessTokenNew,
    channel_order_food_token_id: channelFoodToken.channel_order_food_token_id,
    branch_id : channelFoodToken.branch_id

  };
}
