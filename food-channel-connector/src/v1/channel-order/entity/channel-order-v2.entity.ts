export class ChannelOrderV2 {

  order_id: string = '';

  order_code: string = '';
  
  delivery_amount: number = 0 ;
  
  discount_amount: number = 0 ;
  
  customer_discount_amount: number = 0 ;
  
  customer_order_amount: number = 0 ;
  
  order_amount: number = 0 ;
  
  total_amount: number = 0 ;

  driver_name: string = '';

  driver_avatar: string = '';

  driver_phone: string = '';

  display_id: string = '';

  status_string: string = '';

  order_status: number = 0 ;

  customer_name: string = '';

  customer_phone: string = '';

  delivery_address: string = '';
  
  item_discount_amount: number = 0 ;
  
  small_order_amount: number = 0 ;
  
  bad_weather_amount: number = 0 ;

  details : string = "[]";

  channel_branch_id : string; 

  channel_order_food_token_id : number; 

  create_at : string; 


  
  constructor(entity?: any , channelOrderFood? : number , channelBranchId? : string , channelOrderFoodTokenId?: number) {
    if(channelOrderFood == 1){
        this.order_id = entity?.order_id ?? '' ;
        this.order_code = entity?.order_code ?? '' ;
        this.total_amount = entity?.total_amount ?? 0 ;
        this.discount_amount = entity?.discount_amount ?? 0 ;
        this.order_amount = entity?.order_amount ?? 0 ;
        this.customer_order_amount = entity?.customer_order_amount ?? 0 ;
        this.customer_discount_amount = entity?.customer_discount_amount ?? 0 ;
        this.delivery_amount = entity?.delivery_amount ?? 0 ;
        this.item_discount_amount = entity?.item_discount_amount ?? 0 ;
        this.small_order_amount = entity?.small_order_amount ?? 0 ;
        this.bad_weather_amount = entity?.bad_weather_amount ?? 0 ;
        this.order_status = entity?.order_status ?? 0 ;
        this.status_string = '';
        this.driver_name = entity?.driver_name ?? '' ;
        this.driver_avatar = entity?.driver_avatar ?? '' ;
        this.driver_phone = entity?.driver_phone ?? '' ;

        this.customer_name = entity?.customer_name ?? '';
        this.customer_phone = entity?.customer_phone ?? '';
        this.delivery_address = entity?.customer_address ?? '';

        this.details = JSON.stringify(entity?.foods ?? []);
        this.channel_branch_id = channelBranchId;
        this.channel_order_food_token_id = channelOrderFoodTokenId;
        this.create_at = entity?.create_at ?? '' ;;

    }
    if(channelOrderFood == 2){
        this.order_id = entity?.order_id ?? '' ;
        this.order_amount = entity?.order_amount ?? 0 ;
        this.status_string = entity?.status_string ?? '' ;
        this.driver_name = entity?.driver_name ?? '' ;
        this.driver_avatar = entity?.driver_avatar ?? '' ;
        this.display_id = entity?.display_id ?? '' ;
        this.channel_branch_id = channelBranchId;
        this.channel_order_food_token_id = channelOrderFoodTokenId;
        this.create_at = entity?.create_at ?? '' ;;

    }
    if(channelOrderFood == 4){
        this.order_id = entity?.order_id ?? '' ;
        this.order_amount = entity?.order_amount ?? 0 ;
        this.status_string = '' ;
        this.driver_name = entity?.driver_name ?? '' ;
        this.driver_phone = entity?.driver_phone ?? '' ;
        this.order_status = entity?.order_status ?? 0 ;
        this.channel_branch_id = channelBranchId;
        this.channel_order_food_token_id = channelOrderFoodTokenId;
        this.create_at = entity?.create_at ?? '' ;;

    }

  }

  public mapToList(data: any[] , channelOrderFood : number , channelBranchId : string , channelOrderFoodTokenId: number) {
    let response: ChannelOrderV2[] = [];
    data.forEach((e) => {
      response.push(new ChannelOrderV2(e,channelOrderFood,channelBranchId,channelOrderFoodTokenId));
    });
    return response;
  }
}
