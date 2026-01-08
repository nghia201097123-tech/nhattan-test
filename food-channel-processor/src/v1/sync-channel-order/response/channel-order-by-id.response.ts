import { ChannelOrderByIdDataModel } from "../model/channel-order-by-id.data.model";
import { ChannelOrderByIdsDataModel } from "../model/channel-order-by-ids.data.model";

export class ChannelOrderByIdResponse {

  id: number;
  branch_id:number;
  order_id: string;
  channel_order_food_id: number;
  channel_branch_id: string;
  total_amount: string;
  driver_name: string;
  driver_avatar: string;
  channel_order_food_name: string;
  channel_order_food_code: string;
  details: any[];
  display_id: string;
  discount_amount: string;
  restaurant_order_id: number;
  customer_order_amount: string;
  customer_discount_amount: string;
  order_amount: string;
  driver_phone: string;
  customer_name: string;
  phone: string;
  address: string;
  shipping_fee: string;
  create_at: string;
  channel_branch_name : string = '';
  channel_branch_address : string = '';
  channel_branch_phone : string = '';
  note : string = '';
  item_discount_amount : number = 0 ;
  is_scheduled_order : number = 0;
  deliver_time : string;
  status_string : string = '';

  constructor(entity?: ChannelOrderByIdDataModel) {
    this.id = +(entity?.id ?? 0);
    this.branch_id = entity?.branch_id?? 0;
    this.order_id = entity?.order_id ?? '';
    this.channel_order_food_id = +(entity?.channel_order_food_id ?? 0);
    this.channel_branch_id = entity?.channel_branch_id ?? '';
    this.total_amount = entity?.total_amount ?? '0';
    this.driver_name = entity?.driver_name ?? '';
    this.driver_avatar = entity?.driver_avatar ?? '';
    this.channel_order_food_name = entity?.channel_order_food_name ?? '';
    this.channel_order_food_code = entity?.channel_order_food_code ?? '';
    this.details = JSON.parse(entity?.details ?? "[]");
    this.display_id = entity?.display_id ?? '';
    this.discount_amount = entity?.discount_amount ?? '0';
    this.restaurant_order_id = +(entity?.restaurant_order_id ?? 0);
    this.customer_order_amount = entity?.customer_order_amount ?? '0';
    this.customer_discount_amount = entity?.customer_discount_amount ?? '0';
    this.order_amount = entity?.order_amount ?? '0';
    this.driver_phone = entity?.driver_phone ?? '';
    this.customer_name = entity?.customer_name ?? '';
    this.phone = entity?.customer_phone ?? '';
    this.address = entity?.delivery_address ?? '';
    this.shipping_fee = entity?.delivery_amount ?? '0';
    this.create_at = entity?.order_created_at ?? '';
    this.channel_branch_name = entity?.channel_branch_name ?? '';
    this.channel_branch_address = entity?.channel_branch_address ?? '';
    this.channel_branch_phone = entity?.channel_branch_phone ?? '';
    this.note = entity?.note ?? '';
    this.item_discount_amount = +(entity?.item_discount_amount ?? 0);
    this.is_scheduled_order = entity?.is_scheduled_order ?? 0;
    this.deliver_time = entity?.deliver_time ?? '';
    this.status_string = entity?.status_string ?? '';
}

  public mapToList(data: ChannelOrderByIdDataModel[]) {
    let response: ChannelOrderByIdResponse[] = [];
    data.forEach((e) => {
      response.push(new ChannelOrderByIdResponse(e));
    });
    return response;
  }

}