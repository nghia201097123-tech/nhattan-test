import { ChannelOrderFoodNumberEnum } from "src/utils.common/utils.enum.common/utils.channel-order-food-number";

export class ChannelOrderHistoryToMongo {

  order_id: string = '';

  status_string: string = '';

  order_status: number = 0 ;

  driver_name: string = '';

  driver_phone: string = '';

  url_detail: string = '';

  access_token: string = '';

  branch_id: number = 0;

  order_branch_check: string = '';

  display_id : string = '';

  constructor(entity?: any , channelOrderFood? : number,branchId? : number , urlDetail ?: string , accessToken ?: string ) {
    
    this.branch_id = branchId;

    if(channelOrderFood == +ChannelOrderFoodNumberEnum.SHOPEE_FOOD_NUMBER){
        this.order_id = entity?.order_id ?? '' ;
        this.order_status = entity?.order_status ?? 0 ;
        this.status_string = '';
        this.driver_name = entity?.driver_name ?? '' ;
        this.driver_phone = entity?.driver_phone ?? '' ;
        this.order_branch_check = `${this.order_id}${branchId}`;
    }

    if(channelOrderFood == +ChannelOrderFoodNumberEnum.GRAB_FOOD_NUMBER){
      this.order_id = entity?.order_id ?? '' ;
      this.order_status = 0;
      this.status_string = entity?.status_string ?? '' ;
      this.display_id = entity?.display_id ?? '' ;
      this.url_detail= urlDetail;
      this.access_token =  accessToken;
      this.order_branch_check = `${this.order_id}${branchId}${this.display_id}`;
    }

    if(channelOrderFood == +ChannelOrderFoodNumberEnum.BE_FOOD_NUMBER){
      this.order_id = entity?.order_id ?? '' ;
      this.order_status = entity?.order_status ?? 0 ;
      this.status_string = '';
      this.driver_name = entity?.driver_name ?? '' ;
      this.driver_phone = entity?.driver_phone ?? '' ;
      this.order_branch_check = `${this.order_id}${branchId}`;
    }

    if(channelOrderFood == +ChannelOrderFoodNumberEnum.CNV_LOYALTY_NUMBER){
      this.order_id = entity?.order_id ?? '' ;
      this.order_status = 0;
      this.status_string = entity?.status_string ?? '' ;
      this.url_detail= urlDetail;
      this.access_token =  accessToken;
      this.order_branch_check = `${this.order_id}${branchId}`;
    }

  }

  public mapToList(data: any[] , channelOrderFood? : number,branchId? : number , urlDetail ?: string , accessToken ?: string ) {
    let response: ChannelOrderHistoryToMongo[] = [];
    data.forEach((e) => {
      response.push(new ChannelOrderHistoryToMongo(e,channelOrderFood,branchId,urlDetail,accessToken ));
    });
    return response;
  }
}
