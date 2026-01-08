
import { ChannelFoodSumaryDataModel } from "../model/channel-food-sumary-data.data.model";

export class ChannelFoodSumaryDataResponse {

    commission_amount_SHF: number;
    commission_amount_GRF: number;
    commission_amount_BEF: number;
    total_commission_amount: number;
    order_amount_SHF: number;
    order_amount_GRF: number;
    order_amount_BEF: number;
    total_order_amount: number;
    total_amount_SHF: number;
    total_amount_GRF: number;
    total_amount_BEF: number;
    total_revenue_amount: number;
    discount_amount_SHF: number;
    discount_amount_GRF: number;
    discount_amount_BEF: number;
    total_discount_amount: number;

  constructor(entity?: ChannelFoodSumaryDataModel) {
    
    this.commission_amount_SHF = entity ? +entity.commission_amount_SHF : 0;
    this.commission_amount_GRF = entity ? +entity.commission_amount_GRF : 0;
    this.commission_amount_BEF = entity ? +entity.commission_amount_BEF : 0;
    this.total_commission_amount = entity ? +entity.total_commission_amount : 0 ;

    this.order_amount_SHF = entity ? +entity.order_amount_SHF : 0;
    this.order_amount_GRF = entity ? +entity.order_amount_GRF : 0;
    this.order_amount_BEF = entity ? +entity.order_amount_BEF : 0;
    this.total_order_amount = entity ? +entity.total_order_amount : 0;

    this.discount_amount_SHF = entity ? +entity.discount_amount_SHF : 0 ;
    this.discount_amount_GRF = entity ? +entity.discount_amount_GRF : 0;
    this.discount_amount_BEF = entity ? +entity.discount_amount_BEF : 0;
    this.total_discount_amount = entity ? +entity.total_discount_amount : 0;
    
    this.total_amount_SHF = entity ? +entity.total_amount_SHF : 0;
    this.total_amount_GRF = entity ? +entity.total_amount_GRF : 0 ;
    this.total_amount_BEF = entity ? +entity.total_amount_BEF : 0;
    this.total_revenue_amount = entity ? +entity.total_revenue_amount : 0;
  }

  public mapToList(data: ChannelFoodSumaryDataModel[]) {
    let response: ChannelFoodSumaryDataResponse[] = [];
    data.forEach((e) => {
      response.push(new ChannelFoodSumaryDataResponse(e));
    });
    return response;
  }
}
