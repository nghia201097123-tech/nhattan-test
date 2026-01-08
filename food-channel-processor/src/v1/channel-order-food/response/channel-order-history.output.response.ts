import { ChannelOrderHistoryDataModel } from "../model/channel-order-history.data.model";
import { ChannelOrderHistoryOutputDataModel } from "../model/channel-order-history.output.data.model";
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

  constructor(entityOutput?: ChannelOrderHistoryOutputDataModel, list?: ChannelOrderHistoryDataModel[]) {
    this.list = new ChannelOrderHistoryResponse().mapToList(list);
    this.total_order_completed = entityOutput ? +entityOutput.total_order_completed : 0;
    this.total_order_cancelled = entityOutput ? +entityOutput.total_order_cancelled : 0;
    this.total_revenue = entityOutput ? +entityOutput.total_revenue : 0;
    this.total_revenue_SHF = entityOutput ? +entityOutput.total_revenue_SHF : 0;
    this.total_revenue_GRF = entityOutput ? +entityOutput.total_revenue_GRF : 0;
    this.total_revenue_GOF = entityOutput ? +entityOutput.total_revenue_GOF : 0;
    this.total_revenue_BEF = entityOutput ? +entityOutput.total_revenue_BEF : 0;
  }

  
}
