
export class ChannelBranch {

  branch_id: number;

  branch_name: string;
  
  channel_order_food_token_id: number;

  channel_order_food_token_name : string 

  merchant_id : string 

  branch_address: string;

  branch_phone: string;

  constructor(entity?: any , channelOrderFoodTokenId? : number , channelOrderFoodTokenName? : string) {
    this.branch_id = entity?.branch_id ?? 0 ;
    this.branch_name = entity?.branch_name ?? '' ;
    this.channel_order_food_token_id = channelOrderFoodTokenId;
    this.channel_order_food_token_name = channelOrderFoodTokenName;
    this.merchant_id = entity?.merchant_id ?? '0';
    this.branch_address = entity?.branch_address ?? '' ;
    this.branch_phone = entity?.branch_phone ?? '' ;

  }

  public mapToList(data: any[],channelOrderFoodTokenId? : number , channelOrderFoodTokenName? : string) {
    let response: ChannelBranch[] = [];
    data.forEach((e) => {
      response.push(new ChannelBranch(e , channelOrderFoodTokenId , channelOrderFoodTokenName));
    });
    return response;
  }
}



