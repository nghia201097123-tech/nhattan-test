export class ChannelOrderMongoDetailResponse {
  id: number;
  customer_order_id: number;
  food_id: string;
  food_name: string;
  order_detail_parent_id: number;
  order_detail_combo_parent_id: number;
  customer_order_detail_addition_ids: string;
  customer_order_detail_combo_ids: string;
  customer_order_detail_combo: string;
  customer_order_detail_addition: string;
  quantity: number;
  price: number;
  total_price: number;
  is_addition: number;
  is_combo: number;
  note: string;
  total_price_addition: number;
  created_at: string;
  updated_at: string;
  food_options: string;

  constructor(detail?: any) {
    this.id = detail?.id ?? 0;
    this.customer_order_id = 0;
    this.food_id = detail?.food_id ?? "";
    this.food_name = detail?.food_name ?? "";
    this.order_detail_parent_id = 0;
    this.order_detail_combo_parent_id = 0;
    this.customer_order_detail_addition_ids = "[]";
    this.customer_order_detail_combo_ids = "[]";
    this.customer_order_detail_combo = "[]";
    this.customer_order_detail_addition = "[]";
    this.quantity = +detail?.quantity ?? 0;
    this.price = +detail?.price ?? 0;
    this.total_price = 0;
    this.is_addition = 0;
    this.is_combo = 0;
    this.note = detail?.note ?? "";
    this.total_price_addition = +detail?.food_price_addition ?? 0;
    this.created_at = "";
    this.updated_at = "";
    this.food_options = JSON.stringify(detail?.options ?? "[]");
  }

  public mapToList(data: any[]) {    
    let response: ChannelOrderMongoDetailResponse[] = [];
    data.forEach((e) => {
      response.push(new ChannelOrderMongoDetailResponse(e));
    });
    return response;
  }

}
