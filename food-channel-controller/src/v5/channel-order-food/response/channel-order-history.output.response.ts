import { ChannelOrderHistoryResponse } from "./channel-order-history.response";


export class ChannelOrderHistoryOutputResponse {

    list: ChannelOrderHistoryResponse[];

    total_order_completed : number ; 

    total_order_cancelled : number ; 

    total_revenue : number ; 

    total_revenue_SHF : number ; 

    total_revenue_GRF : number ; 

    total_revenue_GOF : number ; 

    total_revenue_BEF : number ; 

    constructor(entity: any = {}) {
    this.list = entity.list ?? [];  
    this.total_order_completed = entity.total_order_completed ?? 0; 
    this.total_order_cancelled = entity.total_order_cancelled ?? 0;
    this.total_revenue = entity.total_revenue ?? 0;
    this.total_revenue_SHF = entity.total_revenue_SHF ?? 0;
    this.total_revenue_GRF = entity.total_revenue_GRF ?? 0;
    this.total_revenue_GOF = entity.total_revenue_GOF ?? 0;
    this.total_revenue_BEF = entity.total_revenue_BEF ?? 0;
}
  
}
