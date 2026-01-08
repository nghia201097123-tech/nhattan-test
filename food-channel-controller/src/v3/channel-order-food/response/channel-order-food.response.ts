import { ChannelOrderFoodDataModel } from "../model/channel-order-food.data.model";


export class ChannelOrderFoodResponse {
  id: number;
  name: string;
  code: string;
  image_url: string;
  status: number;
  restaurant_brand_channel_order_food_map_id : number ;
  is_connect : number ;
  channel_order_food_token_id : number;

  constructor(channelOrderFood?: ChannelOrderFoodDataModel) {
    this.id = channelOrderFood?.id ?? 0;
    this.name = channelOrderFood?.name ?? '';
    this.code = channelOrderFood?.code ?? '';
    this.image_url = channelOrderFood?.image_url ?? '';
    this.status = channelOrderFood?.status ?? 0;
    this.restaurant_brand_channel_order_food_map_id = channelOrderFood?.restaurant_brand_channel_order_food_map_id ?? 0;
    this.is_connect = channelOrderFood?.is_connect ?? 0;
    this.channel_order_food_token_id = channelOrderFood?.channel_order_food_token_id ?? 0;
  }

  public mapToList(data: ChannelOrderFoodDataModel[]) {
    let response: ChannelOrderFoodResponse[] = [];
    data.forEach((e) => {
      response.push(new ChannelOrderFoodResponse(e));
    });
    return response;
  }
}
