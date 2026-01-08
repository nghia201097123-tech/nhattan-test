// src/channel-order-food.response.ts
import { CustomerChannelFoodInformationOrderByDescReportDataModel } from "../model/customer-channel-food-information-order-by-desc-report.data.model";
import { CustomerChannelFoodInformationOrderByDescReportOutputDataModel } from "../model/customer-channel-food-information-order-by-desc-report.output.data.model";
import { CustomerChannelFoodInformationOrderByDescReportResponse } from "./customer-channel-food-information-order-by-desc-report.response";

export class CustomerChannelFoodInformationOrderByDescReportOutputResponse {

    list: CustomerChannelFoodInformationOrderByDescReportResponse[];

    total_record : number;

    limit : number;

  constructor(entityOutput?: CustomerChannelFoodInformationOrderByDescReportOutputDataModel, list?: CustomerChannelFoodInformationOrderByDescReportDataModel[] , limit? : number ) {
    this.list = new CustomerChannelFoodInformationOrderByDescReportResponse().mapToList(list);
    this.total_record = entityOutput ? +entityOutput.total_record : 0;
    this.limit = +limit ; 
  }
}
