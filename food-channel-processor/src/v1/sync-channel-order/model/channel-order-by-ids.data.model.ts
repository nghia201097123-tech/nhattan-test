export class ChannelOrderByIdsDataModel {

    id: number;
    order_id: string;
    channel_order_food_id: number;
    channel_branch_id: string;
    total_amount: string;
    driver_name: string;
    driver_avatar: string;
    driver_phone: string;
    channel_order_food_name: string;
    channel_order_food_code: string;
    details: string;
    display_id: string;
    discount_amount: string;
    restaurant_order_id: number;
    customer_order_amount: string;
    customer_discount_amount: string;
    order_amount: string;
    customer_name: string;
    customer_phone: string;
    delivery_address: string;
    delivery_amount: string;
    order_created_at: string;
    channel_branch_name : string = '';
    channel_branch_address : string = '';
    channel_branch_phone : string = '';
    note : string = '';
    item_discount_amount : number = 0 ;
    is_scheduled_order : number = 0;
    deliver_time : string;
    status_string : string = '';

}