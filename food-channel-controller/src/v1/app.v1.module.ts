import { Module } from "@nestjs/common";
import { HttpModule } from "@nestjs/axios";
import { ChannelOrderFoodModule } from "./channel-order-food/channel-order-food.module";
import { BranchChannelFoodCommissionPercentMapModule } from "./branch-channel-food-commission-percent-map/branch-channel-food-commission-percent-map.module";
import { ChannelOrderFoodTokenModule } from "./channel-order-food-token/channel-order-food-token.module";
import { CustomerChannelFoodInformationModule } from "./customer-channel-food-information/customer-channel-food-information.module";
import { SyncChannelOrdersModule } from "./sync-channel-order/sync-channel-orders.module";

@Module({
  imports: [
    HttpModule,
    ChannelOrderFoodModule,
    BranchChannelFoodCommissionPercentMapModule,
    ChannelOrderFoodTokenModule,
    CustomerChannelFoodInformationModule,
    SyncChannelOrdersModule
  ]
})

export class AppV1Module {
}