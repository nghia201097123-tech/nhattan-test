
import { ChannelFoodMenuReportDataModel } from "../model/channel-food-menu-report.data.model";
import { ChannelFoodMenuReportOutputDataModel } from "../model/channel-food-menu-report.output.data.model";
import { ChannelFoodMenuReportResponse } from "./channel-food-menu-report.reponse";

export class ChannelFoodMenuReportOutputResponse {

    list: ChannelFoodMenuReportResponse[];

    total_record : number;

    limit: number;
    
  constructor(entityOutput?: ChannelFoodMenuReportOutputDataModel, list?: ChannelFoodMenuReportDataModel[] , _limit? : number  ) {
    this.list = new ChannelFoodMenuReportResponse().mapToList(list);
    this.total_record = entityOutput ? +entityOutput.total_record : 0;
    this.limit = _limit;
  }

  
}
