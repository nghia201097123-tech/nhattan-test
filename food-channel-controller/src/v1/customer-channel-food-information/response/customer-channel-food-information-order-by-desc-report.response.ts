// src/channel-order-food.response.ts
import { CustomerChannelFoodInformationOrderByDescReportDataModel } from "../model/customer-channel-food-information-order-by-desc-report.data.model";

export class CustomerChannelFoodInformationOrderByDescReportResponse {

    id: number;

    customer_name: string;
  
    customer_phone: string;
  
    customer_address: string;
  
    total_order: number;

    total_order_SHF : number ;

    total_order_GRF : number ;

    total_order_GOF : number;

    total_order_BEF : number;

    percent_SHF: number;

    percent_GRF : number ;

    percent_GOF : number ;

    percent_BEF : number;

  constructor(data?: CustomerChannelFoodInformationOrderByDescReportDataModel) {
    this.id = data ? +data.id : 0;
    this.customer_name = data ? data.customer_name : '';
    this.customer_phone = data ? data.customer_phone : '';
    this.customer_address = data ? data.customer_address : '';
    this.total_order = data ? +data.total_order : 0;
    this.total_order_SHF = data ? +data.total_order_SHF : 0;
    this.total_order_GRF = data ? +data.total_order_GRF : 0;
    this.total_order_GOF = data ? +data.total_order_GOF : 0;
    this.total_order_BEF = data ? +data.total_order_BEF : 0;
    this.percent_SHF = data ? +data.percent_SHF : 0;
    this.percent_GRF = data ? +data.percent_GRF : 0;
    this.percent_GOF = data ? +data.percent_GOF : 0;
    this.percent_BEF = data ? +data.percent_BEF : 0;
  }

  public mapToList(data: CustomerChannelFoodInformationOrderByDescReportDataModel[]) {
    let response: CustomerChannelFoodInformationOrderByDescReportResponse[] = [];
    data.forEach((e) => {
      response.push(new CustomerChannelFoodInformationOrderByDescReportResponse(e));
    });
    return response;
  }
}
