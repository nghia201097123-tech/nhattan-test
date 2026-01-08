import { ApiProperty } from "@nestjs/swagger";


export class ChannelFoodSumaryDataResponse {

    @ApiProperty({ description: 'Tiền chiết khấu của shopeefood' })
    commission_amount_SHF: number;
  
    @ApiProperty({ description: 'Tiền chiết khấu của grabfood' })
    commission_amount_GRF: number;

    @ApiProperty({ description: 'Tiền chiết khấu của befood' })
    commission_amount_BEF: number;

    @ApiProperty({ description: 'Tổng tiền chiết khấu' })
    total_commission_amount: number;

    @ApiProperty({ description: 'Tiền đơn hàng từ shopeefood' })
    order_amount_SHF: number;

    @ApiProperty({ description: 'Tiền đơn hàng từ grabfood' })
    order_amount_GRF: number;

    @ApiProperty({ description: 'Tiền đơn hàng từ befood' })
    order_amount_BEF: number;

    @ApiProperty({ description: 'Tổng tiền đơn hàng' })
    total_order_amount: number;

    @ApiProperty({ description: 'Tiền doanh thu từ shopeefood' })
    total_amount_SHF: number;

    @ApiProperty({ description: 'Tiền doanh thu từ grabfood' })
    total_amount_GRF: number;

    @ApiProperty({ description: 'Tiền doanh thu từ befood' })
    total_amount_BEF: number;

    @ApiProperty({ description: 'Tổng doanh thu' })
    total_revenue_amount: number;

    @ApiProperty({ description: 'Số tiền giảm giá từ shopeefood' })
    discount_amount_SHF: number;

    @ApiProperty({ description: 'Số tiền giảm giá từ grabfood' })
    discount_amount_GRF: number;

    @ApiProperty({ description: 'Số tiền giảm giá từ befood' })
    discount_amount_BEF: number;

    @ApiProperty({ description: 'Tổng số tiền giảm giá' })
    total_discount_amount: number;

  constructor(entity?: any) {
    const toNumber = (value: any) => +(value ?? 0);
    
    // Commission amounts
    this.commission_amount_SHF = toNumber(entity?.commission_amount_SHF);
    this.commission_amount_GRF = toNumber(entity?.commission_amount_GRF);
    this.commission_amount_BEF = toNumber(entity?.commission_amount_BEF);
    this.total_commission_amount = toNumber(entity?.total_commission_amount);

    // Order amounts
    this.order_amount_SHF = toNumber(entity?.order_amount_SHF);
    this.order_amount_GRF = toNumber(entity?.order_amount_GRF);
    this.order_amount_BEF = toNumber(entity?.order_amount_BEF);
    this.total_order_amount = toNumber(entity?.total_order_amount);

    // Discount amounts
    this.discount_amount_SHF = toNumber(entity?.discount_amount_SHF);
    this.discount_amount_GRF = toNumber(entity?.discount_amount_GRF);
    this.discount_amount_BEF = toNumber(entity?.discount_amount_BEF);
    this.total_discount_amount = toNumber(entity?.total_discount_amount);
    
    // Total amounts
    this.total_amount_SHF = toNumber(entity?.total_amount_SHF);
    this.total_amount_GRF = toNumber(entity?.total_amount_GRF);
    this.total_amount_BEF = toNumber(entity?.total_amount_BEF);
    this.total_revenue_amount = toNumber(entity?.total_revenue_amount);
  }
  
}
