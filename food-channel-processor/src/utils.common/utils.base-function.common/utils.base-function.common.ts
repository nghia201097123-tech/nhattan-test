export class UtilsBaseFunction {

    static mapChannelOrderFoodName(channelOrderFoodId: number): string {
        switch (channelOrderFoodId) {
            case 1:
                return 'Shopee Food';
            case 2:
                return 'Grab Food';
            default:
                return 'Be Food';
        }
    }

    static mapChannelOrderFoodCode(channelOrderFoodId: number): string {
        switch (channelOrderFoodId) {
            case 1:
                return 'SHF';
            case 2:
                return 'GRF';
            default:
                return 'BEF';
        }
    }

    static filterDataByStatus(
        data: any[],
        conditions: { [key: number]: { order_status?: number[]; status_string?: string[] } }
      ): string[] {        
        return data
          .filter((item) => {
            const condition = conditions[item.channel_order_food_id];
            if (!condition) return false;
      
            const { order_status, status_string } = condition;
            return (
              (order_status && order_status.includes(item.order_status)) ||
              (status_string && status_string.includes(item.status_string))
            );
          })
          .map((item) => item.restaurant_order_id) // Assuming `id` is equivalent to `restaurant_order_id`
          .filter((restaurant_order_id) => restaurant_order_id !== undefined);
    }

    // static findCompleteStatusChannelOrder(channelOrderFoodId: number): string {
    //     switch (channelOrderFoodId) {
    //         case 1:
    //             return 'Shopee Food';
    //         case 2:
    //             return 'Grab Food';
    //         default:
    //             return 'Be Food';
    //     }
    // }
      
}