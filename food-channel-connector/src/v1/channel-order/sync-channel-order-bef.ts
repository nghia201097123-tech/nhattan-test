import { HttpStatus } from "@nestjs/common";
import { FoodChannelTokenValidatorEntity } from "./entity/food-channel-token-validator.entity";
import { ChannelOrderFoodApiEnum } from "src/utils.common/utils.enum.common/utils.channel-order-food-api.enum";
import { SyncChannelOrderBefService } from "./sync-channel-order/sync-channel-order-bef";
import { ChannelOrderFoodNumberEnum } from "src/utils.common/utils.enum.common/utils.channel-order-food-number";
import { ChannelOrderToMongo } from "./entity/channel-order-to-mongo.entity";
import { ChannelOrderHistoryToMongo } from "./entity/channel-order-history-to-mongo.entity";

export default async function performTask(
  channelFoodToken: FoodChannelTokenValidatorEntity
): Promise<any> {
  const syncChannelOrderBefService = new SyncChannelOrderBefService();
  
  const accessTokenBefore = channelFoodToken.access_token;

  // Tách logic xử lý token và lấy dữ liệu thành hàm riêng
  async function fetchDataWithTokenRefresh(
    fetchFn: () => Promise<any>,
    isNewOrder = true
  ) {
    let result = await fetchFn();
    
    if (result.getStatus() === HttpStatus.UNAUTHORIZED) {
      const newToken = await syncChannelOrderBefService.syncTokenBEF(
        channelFoodToken.url_login ?? ChannelOrderFoodApiEnum.BEF_LOGIN,
        channelFoodToken.username,
        channelFoodToken.password
      );
      
      channelFoodToken.access_token = newToken;
      result = await fetchFn();

      if (result.getStatus() === HttpStatus.UNAUTHORIZED) {
        channelFoodToken.access_token = 'token_expired';
      }
    }
    
    return {
      data: result,
      token: channelFoodToken.access_token
    };
  }

  // Xử lý đơn hàng mới
  const { data: newOrdersData } = await fetchDataWithTokenRefresh(
    () => syncChannelOrderBefService.getOrders(
      channelFoodToken.url_get_new_orders ?? ChannelOrderFoodApiEnum.BEF_GET_BILL_LIST,
      channelFoodToken.access_token,
      channelFoodToken.channel_branch_id,
      channelFoodToken.merchant_id
    )
  );

  const dataChannelOrders = newOrdersData.getStatus() === HttpStatus.OK
    ? new ChannelOrderToMongo().mapToList(
        newOrdersData.getList(),
        ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER,
        channelFoodToken.branch_id,
        channelFoodToken.channel_branch_id,
        channelFoodToken.channel_order_food_token_id,
        channelFoodToken.url_get_order_detail ?? ChannelOrderFoodApiEnum.BEF_GET_BILL_DETAIL,
        channelFoodToken.access_token,
        channelFoodToken.merchant_id
      )
    : [];

  // Xử lý lịch sử đơn hàng
  const { data: oldOrdersData } = await fetchDataWithTokenRefresh(
    () => syncChannelOrderBefService.getOrderHistories(
      channelFoodToken.url_get_history_orders ?? ChannelOrderFoodApiEnum.BEF_GET_BILL_LIST,
      channelFoodToken.access_token,
      channelFoodToken.channel_branch_id,
      channelFoodToken.merchant_id
    )
  );

  const dataChannelOrderHistories = oldOrdersData.getStatus() === HttpStatus.OK
    ? new ChannelOrderHistoryToMongo().mapToList(
        oldOrdersData.getList(),
        ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER,
        channelFoodToken.branch_id
      )
    : [];

  // console.log('Check token call api befood: branch_id',channelFoodToken.branch_id,'channel_branch_id',channelFoodToken.channel_branch_id,'-->',newOrdersData.getStatus());

  return {
    new_datas: dataChannelOrders,
    history_datas: dataChannelOrderHistories,
    access_token: accessTokenBefore == channelFoodToken.access_token ? "" :  channelFoodToken.access_token ,
    channel_order_food_token_id: channelFoodToken.channel_order_food_token_id,
    branch_id : channelFoodToken.branch_id

  };
}
