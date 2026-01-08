// src/channel-order-food.response.ts
import { CustomerChannelFoodInformationReportDataModel } from "../model/customer-channel-food-information-report.data.model";


export class CustomerChannelFoodInformationReportResponse {

    id: number;

    customer_name: string;
  
    customer_phone: string;
  
    customer_address: string;
  
    total_order: number;

    total_order_SHF : number ;

    total_order_GRF : number ;

    total_order_GOF : number;

    total_order_BEF : number;

    total_order_amount_SHF : number;

    total_order_amount_BEF : number;

    total_order_amount_GRF : number;

    total_order_amount : number;

    total_amount_avg_SHF: number;

    total_amount_avg_GRF: number;

    total_amount_avg_BEF: number;
    
    total_amount_avg: number;

  constructor(data?: CustomerChannelFoodInformationReportDataModel) {
    this.id = data ? +data.id : 0;
    this.customer_name = data ? data.customer_name : '';
    this.customer_phone = data ? data.customer_phone : '';
    this.customer_address = data ? data.customer_address : '';
    this.total_order = data ? +data.total_order : 0;
    this.total_order_SHF = data ? +data.total_order_SHF : 0;
    this.total_order_GRF = data ? +data.total_order_GRF : 0;
    this.total_order_GOF = data ? +data.total_order_GOF : 0;
    this.total_order_BEF = data ? +data.total_order_BEF : 0;
    
    this.total_order_amount_SHF = +data?.total_order_amount_SHF ?? 0;
    this.total_order_amount_BEF = +data?.total_order_amount_BEF ?? 0;
    this.total_order_amount_GRF = +data?.total_order_amount_GRF ?? 0;
    this.total_order_amount = +data?.total_order_amount ?? 0;

    this.total_amount_avg_SHF = +data?.total_amount_avg_SHF ?? 0;
    this.total_amount_avg_GRF = +data?.total_amount_avg_GRF ?? 0;
    this.total_amount_avg_BEF = +data?.total_amount_avg_BEF ?? 0;
    this.total_amount_avg = +data?.total_amount_avg ?? 0;
  }

  public mapToList(data: CustomerChannelFoodInformationReportDataModel[]) {
    let response: CustomerChannelFoodInformationReportResponse[] = [];
    data.forEach((e) => {
      response.push(new CustomerChannelFoodInformationReportResponse(e));
    });
    return response;
  }
}
