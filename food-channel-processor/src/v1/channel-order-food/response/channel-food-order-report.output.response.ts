
import { ChannelFoodOrderReportModel } from "../model/channel-food-order-report.data.model";
import { ChannelFoodOrderReportResponse } from "./channel-food-order-report.reponse";

export class ChannelFoodOrderReportOutputResponse {

    list: ChannelFoodOrderReportResponse[];

    total_record : number;

    limit: number;
    
  constructor(entityOutput?: any, list?: ChannelFoodOrderReportModel[] , _limit? : number  ) {
    this.list = new ChannelFoodOrderReportResponse().mapToList(list);
    this.total_record = entityOutput ? +entityOutput.total_record : 0;
    this.limit = _limit;
  }

  
}
