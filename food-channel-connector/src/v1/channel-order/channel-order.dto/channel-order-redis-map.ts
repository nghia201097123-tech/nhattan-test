export class OrderRedisMapValue {
    order_id: string;
    display_id: string;
    order_status: number;
    driver_name: string;
    status_string: string;
    is_new: number;
  
    constructor(partial?: Partial<OrderRedisMapValue>) {
      Object.assign(this, partial);
    }
  }
  