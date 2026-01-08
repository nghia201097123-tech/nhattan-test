import { HttpStatus } from "@nestjs/common";
import { FoodChannelTokenValidatorEntity } from "./entity/food-channel-token-validator.entity";
import { ChannelOrderFoodApiEnum } from "src/utils.common/utils.enum.common/utils.channel-order-food-api.enum";
import { SyncChannelOrderShfService } from "./sync-channel-order/sync-channel-order-shf";
import { ChannelOrderFoodNumberEnum } from "src/utils.common/utils.enum.common/utils.channel-order-food-number";
import { ChannelOrderToMongo } from "./entity/channel-order-to-mongo.entity";
import { ChannelOrderHistoryToMongo } from "./entity/channel-order-history-to-mongo.entity";

interface SyncResult {
  new_datas: ChannelOrderToMongo[];
  history_datas: ChannelOrderHistoryToMongo[];
  access_token: string;
  channel_order_food_token_id: number;
  branch_id : number;
}

export default async function performTask(
  channelFoodToken: FoodChannelTokenValidatorEntity
): Promise<SyncResult> {
  const syncChannelOrderShfService = new SyncChannelOrderShfService();
  const x_sap_ri = createXSapRi();
  let accessTokenNew = "";
  
  // Chạy song song cả 2 request để tăng tốc độ
  const [dataNew, dataOld] = await Promise.all([
    syncChannelOrderShfService.getOrders(
      channelFoodToken.url_get_new_orders ??
        ChannelOrderFoodApiEnum.SHF_GET_BILL_LIST,
      channelFoodToken.access_token,
      channelFoodToken.channel_branch_id,
      x_sap_ri
    ),
    syncChannelOrderShfService.getOrderHistories(
      channelFoodToken.url_get_history_orders ??
        ChannelOrderFoodApiEnum.SHF_GET_BILL_LIST,
      channelFoodToken.access_token,
      channelFoodToken.channel_branch_id,
      x_sap_ri
    ),
  ]);
  
  const dataChannelOrders =
    dataNew.getStatus() === HttpStatus.OK
      ? new ChannelOrderToMongo().mapToList(
          dataNew.getList(),
          ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER,
          channelFoodToken.branch_id,
          channelFoodToken.channel_branch_id,
          channelFoodToken.channel_order_food_token_id,
          channelFoodToken.url_get_order_detail,
          channelFoodToken.access_token,
          channelFoodToken.merchant_id,
          x_sap_ri
        )
      : [];

  const dataChannelOrderHistories =
    dataOld.getStatus() === HttpStatus.OK
      ? new ChannelOrderHistoryToMongo().mapToList(
          dataOld.getList(),
          ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER,
          channelFoodToken.branch_id,
        )
      : [];
    
    if(dataNew.getMessage() == 'Bad Request'){
      accessTokenNew = 'token_expired';
    }

  // console.log('Check token call api shopeefood: branch_id',channelFoodToken.branch_id,'channel_branch_id',channelFoodToken.channel_branch_id,'-->',dataNew.getStatus());
  return {
    new_datas: dataChannelOrders,
    history_datas: dataChannelOrderHistories,
    access_token: accessTokenNew,
    channel_order_food_token_id: channelFoodToken.channel_order_food_token_id,
    branch_id : channelFoodToken.branch_id
  };
}

// Tối ưu hàm tạo x_sap_ri bằng cách sử dụng Buffer
function createXSapRi(): string {
  const prefix = "1".repeat(24);
  const randomPart = Array.from({ length: 24 }, () =>
    Math.floor(Math.random() * 10).toString()
  ).join("");
  return prefix + randomPart;
}
