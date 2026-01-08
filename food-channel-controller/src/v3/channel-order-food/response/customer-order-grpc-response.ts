import { ApiProperty } from '@nestjs/swagger';
import { CustomerOrderDetailResponse } from './customer-order-detail-response';

export class CustomerOrderGrpcResponse {

  @ApiProperty({ description: 'id bill tạm' })
  id: number;

  @ApiProperty({ description: 'id nhà hàng' })
  restaurant_id: number;

  @ApiProperty({ description: 'id thương hiệu' })
  restaurant_brand_id: number;

  @ApiProperty({ description: 'id chi nhánh' })
  branch_id: number;

  @ApiProperty({ description: 'id đơn hàng hệ thống' })
  order_id: number;

  @ApiProperty({ description: 'id khach hang' })
  customer_id: number;

  @ApiProperty({ description: 'id khu vực' })
  area_id: number;

  @ApiProperty({ description: 'id bàn' })
  table_id: number;

  @ApiProperty({ description: 'Tên bàn' })
  table_name: string = '';

  @ApiProperty({ description: 'Tên khách hàng' })
  customer_name: string = '';

  @ApiProperty({ description: 'Số điện thoại khách hàng' })
  phone: string = '';

  @ApiProperty({ description: 'Địa chỉ khách hàng' })
  address: string = '';

  @ApiProperty({ description: 'Tổng tiền thanh toán' })
  total_amount: number;

  @ApiProperty({ description: 'Trạng thái thanh toán' })
  payment_status: number;

  @ApiProperty({ description: 'Phương thức thanh toán' })
  payment_method: number;

  @ApiProperty({ description: 'ghi chú' })
  note: string = '';

  @ApiProperty({ description: 'Trạng thái bill' })
  customer_order_status: number;

  @ApiProperty({ description: 'Hình thức order' })
  customer_order_type: number;

  @ApiProperty({ description: 'Danh sách món ăn' })
  customer_order_details: CustomerOrderDetailResponse[] = [];

  @ApiProperty({ description: 'Thời gian tạo' })
  created_at: string;

  @ApiProperty({ description: 'Thời gian cập nhật' })
  updated_at: string;

  @ApiProperty({ description: 'Phí vận chuyển' })
  shipping_fee: number;

  @ApiProperty({ description: 'ID giao hàng bên thứ ba của nhà hàng' })
  restaurant_third_party_delivery_id: number;

  @ApiProperty({ description: 'Vĩ độ giao hàng' })
  shipping_lat: string;

  @ApiProperty({ description: 'Kinh độ giao hàng' })
  shipping_lng: string;

  @ApiProperty({ description: 'ID đơn giao hàng bên thứ ba' })
  third_party_delivery_order_id: string;

  @ApiProperty({ description: 'URL theo dõi' })
  tracking_url: string;

  @ApiProperty({ description: 'Tên người giao hàng' })
  shippe_name: string;

  @ApiProperty({ description: 'Số điện thoại người giao hàng' })
  shipper_phone: string;

  @ApiProperty({ description: 'Thời gian đặt hàng' })
  order_time: number;

  @ApiProperty({ description: 'Bình luận hủy đơn hàng' })
  cancel_comment: string = '';

  @ApiProperty({ description: 'Tên bên giao hàng bên thứ ba' })
  third_party_delivery_name: string;

  @ApiProperty({ description: 'ID kênh bán hàng' })
  channel_order_food_id: number;

  @ApiProperty({ description: 'ID chi nhánh' })
  channel_branch_id: string = '';

  driver_name: string = '';

  driver_avatar: string = '';

  channel_order_food_name: string = '';

  channel_order_food_code: string = '';

  channel_order_id: string = '';

  is_app_food: number = 0;

  display_id : string = '';

  order_amount : number = 0;

  discount_amount : number = 0;

  customer_order_amount : number = 0;

  customer_discount_amount : number = 0;

  constructor(entity?: any) {
    this.id = entity ? entity.id : 0;
    this.restaurant_id = entity ? entity.restaurant_id : 0;
    this.restaurant_brand_id = entity ? entity.restaurant_brand_id : 0;
    this.branch_id = entity ? entity.branch_id : 0;
    this.order_id = entity && entity.order_id ? entity.order_id : 0;
    this.customer_id = entity && entity.customer_id ? entity.customer_id : 0;
    this.table_id = entity && entity.table_id ? entity.table_id : 0;
    this.area_id = entity && entity.area_id ? entity.area_id : 0;
    this.table_name = entity && entity.table_name ? entity.table_name : '';
    this.customer_name = entity && entity.customer_name ? entity.customer_name : '';
    this.phone = entity && entity.phone ? entity.phone : '';
    this.address = entity && entity.address ? entity.address : '';
    this.total_amount = entity && entity.total_amount ? +entity.total_amount : 0;
    this.note = entity && entity.note ? entity.note : '';
    this.payment_method = entity && entity.payment_method ? entity.payment_method : 0;
    this.payment_status = entity && entity.payment_status ? entity.payment_status : 0;
    this.customer_order_status = entity && entity.customer_order_status ? entity.customer_order_status : 0;
    this.customer_order_type = entity && entity.customer_order_type ? entity.customer_order_type : 0;
    this.customer_order_details = entity ? new CustomerOrderDetailResponse().mapToList(entity.customer_order_details || []) : [];
    this.created_at = entity ? entity.created_at : '';
    this.updated_at = entity ? entity.updated_at : '';
    this.shipping_fee = entity && entity.shipping_fee ? +entity.shipping_fee : 0;
    this.tracking_url = entity && entity.tracking_url ? entity.tracking_url : '';
    this.shippe_name = ''; 
    this.shipper_phone = entity && entity.shipper_phone ? entity.shipper_phone : '';
    this.order_time = entity && entity.order_time ? +entity.order_time : 0;
    this.cancel_comment = entity && entity.cancel_comment ? entity.cancel_comment : '';
    this.restaurant_third_party_delivery_id = entity && entity.restaurant_third_party_delivery_id ? entity.restaurant_third_party_delivery_id : 0;
    this.shipping_lat = entity && entity.shipping_lat ? entity.shipping_lat : '';
    this.shipping_lng = entity && entity.shipping_lng ? entity.shipping_lng : '';
    this.third_party_delivery_order_id = entity && entity.third_party_delivery_order_id ? entity.third_party_delivery_order_id : '';
    this.third_party_delivery_name = entity && entity.third_party_delivery_name ? entity.third_party_delivery_name : '';

    this.channel_order_food_id = 0;
    this.channel_branch_id = '';
    this.driver_name = '';
    this.driver_avatar = '';
    this.channel_order_food_name = '';
    this.channel_order_food_code = '';
    this.channel_order_id = '';
    this.is_app_food = 0;

  }

  public mapToList(data: any[]) {
    let response: CustomerOrderGrpcResponse[] = [];
    data.forEach((e) => {
      response.push(new CustomerOrderGrpcResponse(e));
    });
    return response;
  }
}
