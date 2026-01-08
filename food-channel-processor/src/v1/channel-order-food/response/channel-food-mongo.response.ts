import { ApiProperty } from '@nestjs/swagger';
import { ChannelOrderMongoDetailResponse } from './channel-food-mongo-detail.response';
import { UtilsDate } from 'src/utils.common/utils.format-time.common/utils.format-time.common';

export class ChannelOrderMongoResponse {

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
    details: ChannelOrderMongoDetailResponse[] = [];

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

    driver_name : string = '';

    driver_avatar: string  = '';

    driver_phone: string = '';

    channel_order_food_name: string  = '';

    channel_order_food_code: string = '';

    channel_order_id : string = '';

    channel_order_code : string = '';

    is_app_food : number = 0; 

    display_id : string = '';

    order_amount : number = 0;

    discount_amount : number = 0;

    customer_order_amount : number = 0;

    customer_discount_amount : number = 0;

    channel_branch_name : string = '';

    channel_branch_address : string = '';

    channel_branch_phone : string = '';

    item_discount_amount : number = 0 ;

    constructor(entity? : any ) {
      this.id = entity?.id ?? 0;
      this.restaurant_id = entity?.restaurant_id ?? 0;
      this.restaurant_brand_id = entity?.restaurant_brand_id ?? 0;
      this.branch_id = entity?.branch_id ?? 0;
      this.order_id = +entity?.restaurant_order_id ?? 0;
      this.table_name = entity?.table_name ?? '';
      this.customer_name = entity?.customer_name ?? '';
      this.phone = entity?.customer_phone ?? '';
      this.address = entity?.delivery_address ?? '';
      this.total_amount = +entity?.total_amount ?? 0;
      this.note = entity?.note ?? '';
      this.details = new ChannelOrderMongoDetailResponse().mapToList(JSON.parse(entity?.details ?? '[]'));
      this.created_at = UtilsDate.formatDateTimeVNToStringV2(entity?.createdAt ?? '');
      this.updated_at = UtilsDate.formatDateTimeVNToStringV2(entity?.updatedAt ?? '');
      this.shipping_fee = +entity?.delivery_amount ?? 0;

      this.channel_order_food_id = +entity?.channel_order_food_id ?? 0;
      this.channel_branch_id = entity?.channel_branch_id ?? '';
      this.channel_branch_name = entity?.channel_branch_name ?? '';
      this.channel_branch_address = entity?.channel_branch_address ?? '';
      this.channel_branch_phone = entity?.channel_branch_phone ?? '';

      this.driver_name = entity?.driver_name ?? '';
      this.driver_avatar = entity?.driver_avatar ?? '';
      this.driver_phone = entity?.driver_phone ?? '';

      this.channel_order_food_name = this.mapChannelOrderFoodName(this.channel_order_food_id);
      this.channel_order_food_code = this.mapChannelOrderFoodCode(this.channel_order_food_id);

      this.channel_order_id = entity?.order_id ?? '';
      this.channel_order_code = entity?.order_code ?? '';
      this.is_app_food = 1;
      this.display_id = entity?.display_id ?? '';
      this.order_amount = +entity?.order_amount ?? 0;
      this.discount_amount = +entity?.discount_amount ?? 0;
      this.customer_order_amount = +entity?.customer_order_amount ?? 0;
      this.customer_discount_amount = +entity?.customer_discount_amount ?? 0;
      this.item_discount_amount = +entity?.item_discount_amount ?? 0;

  }

  public mapToList(data: any[]) {
    let response: ChannelOrderMongoResponse[] = [];
    data.forEach((e) => {        
      response.push(new ChannelOrderMongoResponse(e));
    });
    return response;
  }

  private mapChannelOrderFoodName(channelOrderFoodId: number): string {
    switch (channelOrderFoodId) {
      case 1:
        return 'Shopee Food';
      case 2:
        return 'Grab Food';
      default:
        return 'Be Food';
    }
  }

  private mapChannelOrderFoodCode(channelOrderFoodId: number): string {
    switch (channelOrderFoodId) {
      case 1:
        return 'SHF';
      case 2:
        return 'GRF';
      default:
        return 'BEF';
    }
  }
}
