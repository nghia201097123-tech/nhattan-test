import { forwardRef, Module } from "@nestjs/common";
import { ChannelOrderFoodController } from "./channel-order-food.controller";
import { ChannelOrderFoodService } from "./channel-order-food.service";
import { ChannelOrderFoodEntity } from "./entity/channel-order-food.entity";
import { ChannelOrderFoodDataModel } from "./model/channel-order-food.data.model";
import { RedisModule } from "src/redis/redis.module";
@Module({
  imports: [
      ChannelOrderFoodEntity,
      ChannelOrderFoodDataModel,
      forwardRef(() => RedisModule),  

  ],
  controllers: [ChannelOrderFoodController],
  providers: [ChannelOrderFoodService],
  exports: [ChannelOrderFoodService],
})
export class ChannelOrderFoodModule {}
