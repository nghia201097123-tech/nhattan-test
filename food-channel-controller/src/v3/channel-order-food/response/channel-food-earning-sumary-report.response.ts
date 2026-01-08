
import { ApiProperty } from "@nestjs/swagger";
import {EarningSumaryReportResponse } from "src/v1/grpc/interfaces/channel-order-food-report";

export class ChannelFoodEarningSumaryReportResponse {

    @ApiProperty({ description: 'Doanh thu ròng' })
    net_sales: number;

    @ApiProperty({ description: 'Tổng số tiền thu về' })
    net_total: number;

    @ApiProperty({ description: 'Tổng số đơn hàng' })
    total_orders: number;

    @ApiProperty({ description: 'Danh sách chi phí' })
    breakdown_by_category: any[];

  constructor(entity?: EarningSumaryReportResponse) {
    this.net_sales = entity?.net_sales ?? 0 ;
    this.net_total = entity?.net_total ?? 0 ;
    this.total_orders = entity?.total_orders ?? 0 ;
    this.breakdown_by_category = JSON.parse(entity?.breakdown_by_category ?? '[]')
  }

}
