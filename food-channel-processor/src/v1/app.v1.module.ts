import { Module } from "@nestjs/common";
import { ChannelOrderFoodModule } from "./channel-order-food/channel-order-food.module";
import { ChannelOrderFoodTokenModule } from "./channel-order-food-token/channel-order-food-token.module";
import { ChannelOrderFoodApiModule } from "./channel-order-food-api/channel-order-food-api.module";
import { HttpModule } from "@nestjs/axios";
import { SyncChannelOrdersModule } from "./sync-channel-order/sync-channel-orders.module";
import { BranchChannelFoodCommissionPercentMapModule } from "./branch-channel-food-commission-percent-map/branch-channel-food-commission-percent-map.module";
import { CustomerChannelFoodInformationModule } from "./customer-channel-food-information/customer-channel-food-information.module";
import { ChannelOrderSchemaModule } from "./channel-order-schema/channel-order-schema.module";

@Module({
  imports: [
    ChannelOrderFoodModule,
    ChannelOrderFoodTokenModule,
    ChannelOrderFoodApiModule,
    HttpModule,
    SyncChannelOrdersModule,
    BranchChannelFoodCommissionPercentMapModule,
    CustomerChannelFoodInformationModule,
    ChannelOrderSchemaModule
  ]
})

export class AppV1Module {
}