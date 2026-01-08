
import { ChannelFoodRevenueSumaryDataModel } from "../model/channel-food-revenue-sumary.data.model";
import { ChannelFoodRevenueSumaryOutputDataModel } from "../model/channel-food-revenue-sumary.output.data.model";
import { ChannelFoodRevenueSumaryResponse } from "./channel-food-revenue-sumary.response";

export class ChannelFoodRevenueSumarOutputResponse {

    list: ChannelFoodRevenueSumaryResponse[];

    total_order : number;

    total_order_SHF: number;
    
    total_order_GRF: number;

    total_order_GOF: number;

    total_order_BEF: number;

    total_revenue: number;

    total_revenue_SHF: number;

    total_revenue_GRF: number;

    total_revenue_GOF : number;

    total_revenue_BEF : number;

    percent_SHF: number;

    percent_GRF: number;

    percent_GOF : number;

    percent_BEF : number;

  constructor(entityOutput?: ChannelFoodRevenueSumaryOutputDataModel, list?: ChannelFoodRevenueSumaryDataModel[]) {
    this.list = new ChannelFoodRevenueSumaryResponse().mapToList(list);
    this.total_order = entityOutput ? +entityOutput.total_order : 0;
    this.total_order_SHF = entityOutput ? +entityOutput.total_order_SHF : 0;
    this.total_order_GRF = entityOutput ? +entityOutput.total_order_GRF : 0;
    this.total_order_GOF = entityOutput ? +entityOutput.total_order_GOF : 0;
    this.total_order_BEF = entityOutput ? +entityOutput.total_order_BEF : 0;

    this.total_revenue = entityOutput ? +entityOutput.total_revenue : 0;
    this.total_revenue_SHF = entityOutput ? +entityOutput.total_revenue_SHF : 0;
    this.total_revenue_GRF = entityOutput ? +entityOutput.total_revenue_GRF : 0;
    this.total_revenue_GOF = entityOutput ? +entityOutput.total_revenue_GOF : 0;
    this.total_revenue_BEF = entityOutput ? +entityOutput.total_revenue_BEF : 0;

    this.percent_SHF = entityOutput ? +entityOutput.percent_SHF : 0;
    this.percent_GRF = entityOutput ? +entityOutput.percent_GRF : 0;
    this.percent_GOF = entityOutput ? +entityOutput.percent_GOF : 0;
    this.percent_BEF = entityOutput ? +entityOutput.percent_BEF : 0;
  }

  
}
