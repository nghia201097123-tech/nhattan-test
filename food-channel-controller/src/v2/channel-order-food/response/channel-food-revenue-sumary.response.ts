import { ChannelFoodRevenueSumaryDataModel } from "../model/channel-food-revenue-sumary.data.model";

export class ChannelFoodRevenueSumaryResponse {

    report_date: string;

    total_order_SHF: number;
    
    total_order_GRF: number;

    total_order_GOF: number;

    total_order_BEF: number;

    commission_amount_SHF: number;

    commission_amount_GRF: number;

    commission_amount_GOF: number;

    commission_amount_BEF: number;

    order_amount_SHF: number;

    order_amount_GRF: number;

    order_amount_GOF: number;

    order_amount_BEF: number;

    total_amount_SHF: number;

    total_amount_GRF: number;

    total_amount_GOF: number;

    total_amount_BEF : number;

  constructor(entity?: ChannelFoodRevenueSumaryDataModel) {
    this.report_date = entity?.report_date ?? '';
    
    this.total_order_SHF = +(entity?.total_order_SHF ?? 0);
    this.total_order_GRF = +(entity?.total_order_GRF ?? 0);
    this.total_order_GOF = +(entity?.total_order_GOF ?? 0);
    this.total_order_BEF = +(entity?.total_order_BEF ?? 0);

    this.commission_amount_SHF = +(entity?.commission_amount_SHF ?? 0);
    this.commission_amount_GRF = +(entity?.commission_amount_GRF ?? 0);
    this.commission_amount_GOF = +(entity?.commission_amount_GOF ?? 0);
    this.commission_amount_BEF = +(entity?.commission_amount_BEF ?? 0);

    this.order_amount_SHF = +(entity?.order_amount_SHF ?? 0);
    this.order_amount_GRF = +(entity?.order_amount_GRF ?? 0);
    this.order_amount_GOF = +(entity?.order_amount_GOF ?? 0);
    this.order_amount_BEF = +(entity?.order_amount_BEF ?? 0);
    
    this.total_amount_SHF = +(entity?.total_amount_SHF ?? 0);
    this.total_amount_GRF = +(entity?.total_amount_GRF ?? 0);
    this.total_amount_GOF = +(entity?.total_amount_GOF ?? 0);
    this.total_amount_BEF = +(entity?.total_amount_BEF ?? 0);
  }

  public mapToList(data: ChannelFoodRevenueSumaryDataModel[]) {
    let response: ChannelFoodRevenueSumaryResponse[] = [];
    data.forEach((e) => {
      response.push(new ChannelFoodRevenueSumaryResponse(e));
    });
    return response;
  }
}
