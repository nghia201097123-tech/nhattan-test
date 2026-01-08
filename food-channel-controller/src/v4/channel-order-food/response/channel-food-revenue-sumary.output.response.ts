
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

    constructor(entity : any = {}) {
    this.list = entity.list ?? [];  
    this.total_order = +(entity.total_order ?? 0);
    this.total_order_SHF = +(entity.total_order_SHF ?? 0);
    this.total_order_GRF = +(entity.total_order_GRF ?? 0);
    this.total_order_GOF = +(entity.total_order_GOF ?? 0);
    this.total_order_BEF = +(entity.total_order_BEF ?? 0);

    this.total_revenue = +(entity.total_revenue ?? 0);
    this.total_revenue_SHF = +(entity.total_revenue_SHF ?? 0);
    this.total_revenue_GRF = +(entity.total_revenue_GRF ?? 0);
    this.total_revenue_GOF = +(entity.total_revenue_GOF ?? 0);
    this.total_revenue_BEF = +(entity.total_revenue_BEF ?? 0);

    this.percent_SHF = +(entity.percent_SHF ?? 0);
    this.percent_GRF = +(entity.percent_GRF ?? 0);
    this.percent_GOF = +(entity.percent_GOF ?? 0);
    this.percent_BEF = +(entity.percent_BEF ?? 0);
  }

  
}
