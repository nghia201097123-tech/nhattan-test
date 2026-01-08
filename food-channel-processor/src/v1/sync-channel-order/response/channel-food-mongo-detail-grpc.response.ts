export class ChannelOrderMongoDetailGrpcResponse {
  id: number;
  channel_order_id: number;
  food_id: string;
  food_name: string;
  order_id: string;
  channel_order_food_id: number;
  quantity: number;
  food_price: number;
  food_note: string;
  food_price_addition: number;
  food_options: string;

  constructor(detail?: any , channelOrderId ?: number , channelOrderFoodId ?: number , orderId ?: string) {
    this.id = detail?.id ?? 0;
    this.food_id = detail?.food_id ?? "";
    this.food_name = detail?.food_name ?? "";
    this.quantity = +(detail?.quantity ?? 0);
    this.food_price = +(detail?.price ?? 0);
    this.food_note = detail?.note ?? "";
    this.food_price_addition = +(detail?.food_price_addition ?? 0);
    this.food_options = JSON.stringify(detail?.options ?? "[]");
    this.channel_order_id = channelOrderId;
    this.channel_order_food_id = channelOrderFoodId;
    this.order_id = orderId;
  }

  public mapToList(data: any[] ,channelOrderId ?: number , channelOrderFoodId ?: number , orderId ?: string) {    
    let response: ChannelOrderMongoDetailGrpcResponse[] = [];
    data.forEach((e) => {
      response.push(new ChannelOrderMongoDetailGrpcResponse(e,channelOrderId , channelOrderFoodId ,orderId ));
    });
    return response;
  }

}
