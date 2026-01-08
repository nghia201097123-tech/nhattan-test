import { ChannelFoodOrderReportModel } from "../model/channel-food-order-report.data.model";

export class ChannelFoodOrderReportResponse {

  id: number;
  order_id: string;
  display_id: string;
  customer_name: string;
  customer_phone: string;
  order_amount: number;
  commission_amount: number;
  customer_discount_amount: number;
  total_amount: number;

  constructor(entity?: ChannelFoodOrderReportModel) {
    this.id = entity ? entity.id : 0;
    this.order_id = entity ? entity.order_id : '';
    this.display_id = entity ? entity.display_id : '';
    this.customer_name = entity ? entity.customer_name : '';
    this.customer_phone = entity ? entity.customer_phone : '';
    this.order_amount = entity ? entity.order_amount : 0;
    this.commission_amount = entity ? entity.commission_amount : 0;
    this.customer_discount_amount = entity ? entity.customer_discount_amount : 0;
    this.total_amount = entity ? entity.total_amount : 0;
  }

  public mapToList(data: ChannelFoodOrderReportModel[]) {
    let response: ChannelFoodOrderReportResponse[] = [];
    data.forEach((e) => {
      response.push(new ChannelFoodOrderReportResponse(e));
    });
    return response;
  }
}
