export class ChannelFoodOrderReportModel {
    id: number;
    order_id: string;
    display_id: string;
    customer_name: string;
    customer_phone: string;
    order_amount: number;
    commission_amount: number;
    customer_discount_amount: number;
    total_amount: number;

    constructor() {
        this.id = 0;
        this.order_id = '';
        this.display_id = '';
        this.customer_name = '';
        this.customer_phone = '';
        this.order_amount = 0;
        this.commission_amount = 0;
        this.customer_discount_amount = 0;
        this.total_amount = 0;
    }
}

