
import { CustomerChannelFoodInformationReportDataModel } from "../model/customer-channel-food-information-report.data.model";
import { CustomerChannelFoodInformationReportOutputDataModel } from "../model/customer-channel-food-information-report.output.data.model";
import { CustomerChannelFoodInformationReportResponse } from "./customer-channel-food-information-report.response";


export class CustomerChannelFoodInformationReportOutResponse {

    list: CustomerChannelFoodInformationReportResponse[];

    total_customer_buy_once: number;

    total_customer_buy_two : number ;

    total_customer_buy_three : number ;

    total_customer_buy_much : number;

    total_record : number;

    total_order : number;

    total_order_SHF : number;

    total_order_GRF : number;

    total_order_GOF : number;

    total_order_BEF : number;

    total_order_amount : number;

    total_order_amount_SHF : number;

    total_order_amount_GRF : number;

    total_order_amount_BEF : number;

    limit : number;

    constructor(
      entityOutput?: CustomerChannelFoodInformationReportOutputDataModel,
      list?: CustomerChannelFoodInformationReportDataModel[],
      limit?: number,
    ) {
      this.list = new CustomerChannelFoodInformationReportResponse().mapToList(list);
      
      this.total_customer_buy_once = +entityOutput?.total_customer_buy_once ?? 0;
      this.total_customer_buy_two = +entityOutput?.total_customer_buy_two ?? 0;
      this.total_customer_buy_three = +entityOutput?.total_customer_buy_three ?? 0;
      this.total_customer_buy_much = +entityOutput?.total_customer_buy_much ?? 0;
      this.total_record = +entityOutput?.total_record ?? 0;
      this.total_order = +entityOutput?.total_order ?? 0;
      this.total_order_SHF = +entityOutput?.total_order_SHF ?? 0;
      this.total_order_GRF = +entityOutput?.total_order_GRF ?? 0;
      this.total_order_GOF = +entityOutput?.total_order_GOF ?? 0;
      this.total_order_BEF = +entityOutput?.total_order_BEF ?? 0;
    
      this.total_order_amount = +entityOutput?.total_order_amount ?? 0;
      this.total_order_amount_SHF = +entityOutput?.total_order_amount_SHF ?? 0;
      this.total_order_amount_GRF = +entityOutput?.total_order_amount_GRF ?? 0;
      this.total_order_amount_BEF = +entityOutput?.total_order_amount_BEF ?? 0;
    
      this.limit = +limit ?? 0;
    }
    

  
}
