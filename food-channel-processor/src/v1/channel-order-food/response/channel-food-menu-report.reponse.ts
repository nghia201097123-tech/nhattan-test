
import { ChannelFoodMenuReportDataModel } from "../model/channel-food-menu-report.data.model";

export class ChannelFoodMenuReportResponse {

    food_name: string;
    
    total_quantity: number;

    shf_quantity: number;

    grf_quantity: number;

    bef_quantity: number;

  constructor(entity?: ChannelFoodMenuReportDataModel) {
    this.food_name = entity ? entity.food_name : '';
    this.total_quantity = entity ? +entity.total_quantity : 0;
    this.shf_quantity = entity ? +entity.shf_quantity : 0;
    this.grf_quantity = entity ? +entity.grf_quantity : 0;
    this.bef_quantity = entity ? +entity.bef_quantity : 0 ;
  }

  public mapToList(data: ChannelFoodMenuReportDataModel[]) {
    let response: ChannelFoodMenuReportResponse[] = [];
    data.forEach((e) => {
      response.push(new ChannelFoodMenuReportResponse(e));
    });
    return response;
  }
}
