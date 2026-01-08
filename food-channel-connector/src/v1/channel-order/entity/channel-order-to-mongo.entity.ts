import { ChannelOrderFoodNumberEnum } from "src/utils.common/utils.enum.common/utils.channel-order-food-number";

export class ChannelOrderToMongo {

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

  note: string = '';

  url_detail: string = '';

  access_token: string = '';

  merchant_id: string = '';

  x_sap_ri: string = '';

  deliver_time: string = '';

  is_scheduled_order: number = 0;

  order_branch_check: string = '';

  branch_id: number = 0;

  constructor(entity?: any ,channelOrderFood? : number ,branchId? : number, channelBranchId? : string , channelOrderFoodTokenId?: number , 
    url_detail ?: string , access_token ?: string , merchant_id ?: string , x_sap_ri ?: string
  ) {    

    this.branch_id = branchId;

    if(channelOrderFood == +ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER){
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
        this.details = JSON.stringify(entity?.foods ?? []);
        this.channel_branch_id = channelBranchId;
        this.channel_order_food_token_id = channelOrderFoodTokenId;
        this.note= entity?.note ?? '';
        this.deliver_time = entity?.deliver_time ?? '';
        this.is_scheduled_order = entity?.is_scheduled_order ?? 0;
        this.order_branch_check = `${this.order_id}${branchId}`;
        this.customer_name= entity?.customer_name ?? '' ;
        this.customer_phone= entity?.customer_phone ?? '' ;
        this.delivery_address= entity?.customer_address ?? '' ;
    }
    if(channelOrderFood == +ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER){
        this.order_id = entity?.order_id ?? '' ;
        this.order_amount = entity?.order_amount ?? 0 ;
        this.status_string = entity?.status_string ?? '' ;
        this.driver_name = entity?.driver_name ?? '' ;
        this.driver_avatar = entity?.driver_avatar ?? '' ;
        this.display_id = entity?.display_id ?? '' ;
        this.channel_branch_id = channelBranchId;
        this.channel_order_food_token_id = channelOrderFoodTokenId;
        this.deliver_time = entity?.deliver_time ?? '';
        this.is_scheduled_order = entity?.is_scheduled_order ?? 0;
        this.order_branch_check = `${this.order_id}${branchId}${this.display_id}`;

    }
    if(channelOrderFood == +ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER){
        this.order_id = entity?.order_id ?? '' ;
        this.order_amount = entity?.order_amount ?? 0 ;
        this.status_string = '' ;
        this.driver_name = entity?.driver_name ?? '' ;
        this.driver_phone = entity?.driver_phone ?? '' ;
        this.order_status = entity?.order_status ?? 0 ;
        this.channel_branch_id = channelBranchId;
        this.channel_order_food_token_id = channelOrderFoodTokenId;
        this.deliver_time = entity?.deliver_time ?? '';
        this.is_scheduled_order = entity?.is_scheduled_order ?? 0;
        this.order_branch_check = `${this.order_id}${branchId}`;
    }

    if(channelOrderFood == +ChannelOrderFoodNumberEnum.CNV_LOYALTY_NUMBER){
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
      this.details = JSON.stringify(entity?.foods ?? []);
      this.channel_branch_id = channelBranchId;
      this.channel_order_food_token_id = channelOrderFoodTokenId;
      this.note= entity?.note ?? '';
      this.deliver_time = entity?.deliver_time ?? '';
      this.is_scheduled_order = entity?.is_scheduled_order ?? 0;
      this.order_branch_check = `${this.order_id}${branchId}`;
      this.status_string = entity?.status_string ?? '' ;
      this.customer_name= entity?.customer_name ?? '' ;
      this.customer_phone= entity?.customer_phone ?? '' ;
      this.delivery_address= entity?.customer_address ?? '' ;
  }

    this.url_detail= url_detail;
    this.access_token= access_token ; 
    this.merchant_id= merchant_id ; 
    this.x_sap_ri= x_sap_ri ; 
  }

  public mapToList(data: any[] , channelOrderFood? : number, branchId? : number , channelBranchId? : string , channelOrderFoodTokenId?: number , 
    url_detail ?: string , access_token ?: string , merchant_id ?: string , x_sap_ri ?: string 
  ) {
    let response: ChannelOrderToMongo[] = [];
    data.forEach((e) => {
      response.push(new ChannelOrderToMongo(e,channelOrderFood,branchId,channelBranchId,channelOrderFoodTokenId , url_detail ,access_token , merchant_id , x_sap_ri));
    });
    return response;
  }
}
