import { ChannelOrderHistoryDataModel } from "../model/channel-order-history.data.model";


export class ChannelOrderHistoryResponse {

    id: number;

    order_id: string;
  
    channel_branch_id: string;
  
    total_amount: number;

    channel_order_food_id: number;

    channel_order_food_name : string ;

    channel_order_food_code : string ;

    order_created_at : string ;

    display_id : string;

    is_completed: number;

  constructor(channelOrderFood?: ChannelOrderHistoryDataModel) {
    this.id = channelOrderFood ? +channelOrderFood.id : 0;
    this.order_id = channelOrderFood ? channelOrderFood.order_id : '';
    this.channel_branch_id = channelOrderFood ? channelOrderFood.channel_branch_id : '';
    this.total_amount = channelOrderFood ? +channelOrderFood.total_amount : 0;
    this.channel_order_food_id = channelOrderFood ? +channelOrderFood.channel_order_food_id : 0;
    this.channel_order_food_name = channelOrderFood ? channelOrderFood.channel_order_food_name : '';
    this.channel_order_food_code = channelOrderFood ? channelOrderFood.channel_order_food_code : '';
    this.order_created_at = channelOrderFood ? channelOrderFood.order_created_at : '';
    this.display_id = channelOrderFood ? channelOrderFood.display_id : '';
    this.is_completed = channelOrderFood ? +channelOrderFood.is_completed : 0;
  }

  public mapToList(data: ChannelOrderHistoryDataModel[]) {
    let response: ChannelOrderHistoryResponse[] = [];
    data.forEach((e) => {
      response.push(new ChannelOrderHistoryResponse(e));
    });
    return response;
  }
}
