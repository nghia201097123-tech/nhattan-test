export class ChannelFoodTokenGrabfoodDataModel {
    channel_branch_id: number;
    channel_branch_name: string;
    channel_branch_address: string;
    channel_branch_phone: string;
    channel_order_food_token_id: number;
    access_token: string;
    username: string;
    password: string;
    device_id: string;
    device_brand: string;
    url_login: string;
    url_update_device: string;
    url_earning_summary_report: string;
    url_earning_summary_report_v2: string;

    constructor(data: Partial<ChannelFoodTokenGrabfoodDataModel> = {}) {
        this.channel_branch_id = data.channel_branch_id || 0;
        this.channel_branch_name = data.channel_branch_name || '';
        this.channel_branch_address = data.channel_branch_address || '';
        this.channel_branch_phone = data.channel_branch_phone || '';
        this.channel_order_food_token_id = data.channel_order_food_token_id || 0;
        this.access_token = data.access_token || '';
        this.username = data.username || '';
        this.password = data.password || '';
        this.device_id = data.device_id || '';
        this.device_brand = data.device_brand || '';
        this.url_login = data.url_login || '';
        this.url_update_device = data.url_update_device || '';
        this.url_earning_summary_report = data.url_earning_summary_report || '';
        this.url_earning_summary_report_v2 = data.url_earning_summary_report_v2 || '';
    }
}
