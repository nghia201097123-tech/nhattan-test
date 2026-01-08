
export class FoodChannelValidatorObjectEntity {

    channel_branch_id: string;
    
    merchant_id: number;

    channel_order_food_token_id: number;

    access_token: string;
    
    username: string;
    
    password: string;

    x_merchant_token: string;

    device_id: string;

    device_brand: string;

    
    url_get_foods: string;

    
    url_get_food_detail: string;

    
    url_update_food: string;

    
    url_get_branches: string;

    
    url_get_new_orders: string;

    
    url_get_history_orders: string;

    
    url_get_order_detail: string;

    
    url_login: string;

    
    url_update_device: string;

    
    url_get_account_information_detail: string;

    constructor(entity?: any) {
        this.channel_branch_id = entity?.channel_branch_id ?? '';
        this.merchant_id = entity?.merchant_id ? +entity.merchant_id : 0;
        this.channel_order_food_token_id = entity?.channel_order_food_token_id ?? 0;
        this.access_token = entity?.access_token ?? '';
        this.username = entity?.username ?? '';
        this.password = entity?.password ?? '';
        this.x_merchant_token = entity?.x_merchant_token ?? '';
        this.device_id = entity?.device_id ?? '';
        this.device_brand = entity?.device_brand ?? '';
        this.url_get_foods = entity?.url_get_foods ?? '';
        this.url_get_food_detail = entity?.url_get_food_detail ?? '';
        this.url_update_food = entity?.url_update_food ?? '';
        this.url_get_branches = entity?.url_get_branches ?? '';
        this.url_get_new_orders = entity?.url_get_new_orders ?? '';
        this.url_get_history_orders = entity?.url_get_history_orders ?? '';
        this.url_get_order_detail = entity?.url_get_order_detail ?? '';
        this.url_login = entity?.url_login ?? '';
        this.url_update_device = entity?.url_update_device ?? '';
        this.url_get_account_information_detail = entity?.url_get_account_information_detail ?? '';
    }   
}
