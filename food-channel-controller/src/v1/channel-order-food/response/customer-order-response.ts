import { ApiProperty } from '@nestjs/swagger';
import { CustomerOrderDetailResponse } from './customer-order-detail-response';

export class CustomerOrderResponse {

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
    details: CustomerOrderDetailResponse[] = [];

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

    deliver_time :  string = '';

    is_scheduled_order : number = 0;

    is_printed : number = 0;
    

    constructor(entity?: any) {
        const defaults = {
            id: 0,
            restaurant_id: 0,
            restaurant_brand_id: 0,
            branch_id: 0,
            order_id: 0,
            customer_id: 0,
            table_id: 0,
            area_id: 0,
            table_name: '',
            customer_name: '',
            phone: '',
            address: '',
            total_amount: 0,
            note: '',
            payment_method: 0,
            payment_status: 0,
            customer_order_status: 0,
            customer_order_type: 0,
            details: [],
            created_at: '',
            updated_at: '',
            shipping_fee: 0,
            is_app_food: 0,
            shipping_lat: '',
            shipping_lng: '',
            third_party_delivery_order_id: '',
            third_party_delivery_name: '',
            channel_order_food_id: 0,
            channel_branch_id: '',
            channel_branch_name: '',
            channel_branch_address: '',
            channel_branch_phone: '',
            driver_name: '',
            driver_avatar: '',
            driver_phone: '',
            channel_order_food_name: '',
            channel_order_food_code: '',
            channel_order_id: '',
            channel_order_code: '',
            display_id: '',
            order_amount: 0,
            discount_amount: 0,
            customer_order_amount: 0,
            customer_discount_amount: 0,
            item_discount_amount: 0,
            deliver_time: '',
            is_scheduled_order: 0,
            is_printed:0,
        };

        if (entity) {          
          
            Object.assign(this, defaults, {               

                id: entity.id,
                restaurant_id: entity.restaurant_id,
                restaurant_brand_id: entity.restaurant_brand_id,
                branch_id: entity.branch_id,
                order_id: +entity.restaurant_order_id || 0,
                customer_id: entity.customer_id,
                table_id: entity.table_id,
                area_id: entity.area_id,
                table_name: entity.table_name,
                customer_name: entity.customer_name,
                phone: entity.phone,
                address: entity.address,
                total_amount: +entity.total_amount || 0,
                note: entity.note,
                payment_method: entity.payment_method,
                payment_status: entity.payment_status,
                customer_order_status: entity.customer_order_status,
                customer_order_type: entity.customer_order_type,
                details: Array.isArray(entity.details) 
                    ? entity.details.map(detail => new CustomerOrderDetailResponse(detail))
                    : new CustomerOrderDetailResponse().mapToList(
                        typeof entity.details === 'string' 
                            ? JSON.parse(entity.details) 
                            : []
                    ),
                created_at: entity.created_at,
                updated_at: entity.updated_at,
                shipping_fee: +entity.shipping_fee || 0,
                shipping_lat: entity.shipping_lat,
                shipping_lng: entity.shipping_lng,
                third_party_delivery_order_id: entity.third_party_delivery_order_id,
                third_party_delivery_name: entity.third_party_delivery_name,
                channel_order_food_id: +entity.channel_order_food_id || 0,
                channel_branch_id: entity.channel_branch_id || '',
                channel_branch_name: entity.channel_branch_name || '',
                channel_branch_address: entity.channel_branch_address || '',
                channel_branch_phone: entity.channel_branch_phone || '',
                driver_name: entity.driver_name,
                driver_avatar: entity.driver_avatar,
                driver_phone: entity.driver_phone,
                channel_order_food_name: entity.channel_order_food_name,
                channel_order_food_code: entity.channel_order_food_code || '',
                channel_order_id: entity.channel_order_id || '',
                channel_order_code: entity.channel_order_code || '',
                display_id: entity.display_id || '',
                order_amount: +entity.order_amount || 0,
                discount_amount: +entity.discount_amount || 0,
                customer_order_amount: +entity.customer_order_amount || 0,
                customer_discount_amount: +entity.customer_discount_amount || 0,
                item_discount_amount: +entity.item_discount_amount || 0,
                deliver_time: entity.deliver_time || '',
                is_scheduled_order: +entity.is_scheduled_order || 0,
                is_printed:+entity.is_printed || 0,
                is_app_food : +entity.is_app_food || 0,
            });
        } else {
            Object.assign(this, defaults);
        }
    }

    public mapToList(data: any[]): CustomerOrderResponse[] {
        return data.map(e => new CustomerOrderResponse(e));
    }

}
