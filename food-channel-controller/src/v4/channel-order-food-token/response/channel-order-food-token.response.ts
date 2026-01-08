import { ChannelOrderFoodTokenEntity } from "../entity/channel-order-food-token.entity";

export class ChannelOrderFoodTokenResponse {
  id: number;

  restaurant_id: number;

  restaurant_brand_id: number;

  channel_order_food_id: number;

  access_token: string;

  username: string;
  
  password: string;

  constructor(entity: ChannelOrderFoodTokenEntity) {
    this.id = entity ? entity.id : 0 ;
    this.restaurant_id = entity ? entity.restaurant_id : 0 ;
    this.restaurant_brand_id = entity ? entity.restaurant_brand_id : 0 ;
    this.channel_order_food_id = entity ? entity.channel_order_food_id : 0;
    this.access_token = entity ? entity.access_token : '';
    this.username = entity ? entity.username : '';
    this.password = entity ? entity.password : '';
  }

  public mapToList(data: ChannelOrderFoodTokenEntity[]) {
    let response: ChannelOrderFoodTokenResponse[] = [];
    data.forEach((e) => {
      response.push(new ChannelOrderFoodTokenResponse(e));
    });
    return response;
  }
}
