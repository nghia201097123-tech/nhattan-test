
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

    limit : number;

    total_order_amount : number;

    total_order_amount_SHF : number;

    total_order_amount_GRF : number;

    total_order_amount_BEF : number;

  constructor(entity: any = {}) {
    this.list = entity.list ?? [];  
    this.total_customer_buy_once = +entity.total_customer_buy_once ?? 0;
    this.total_customer_buy_two = +entity.total_customer_buy_two ?? 0;
    this.total_customer_buy_three = +entity.total_customer_buy_three ?? 0;
    this.total_customer_buy_much = +entity.total_customer_buy_much ?? 0;
    this.total_record = +entity.total_record ?? 0;
    this.total_order = +entity.total_order ?? 0;
    this.total_order_SHF = +entity.total_order_SHF ?? 0;
    this.total_order_GRF = +entity.total_order_GRF ?? 0;
    this.total_order_GOF = +entity.total_order_GOF ?? 0;
    this.total_order_BEF = +entity.total_order_BEF ?? 0;
    this.total_order_amount = +entity?.total_order_amount ?? 0;
    this.total_order_amount_SHF = +entity?.total_order_amount_SHF ?? 0;
    this.total_order_amount_GRF = +entity?.total_order_amount_GRF ?? 0;
    this.total_order_amount_BEF = +entity?.total_order_amount_BEF ?? 0;
    this.limit = +entity.limit ?? 0; 
}

  
}
