import { MiddlewareConsumer, Module, NestModule, RequestMethod } from "@nestjs/common";
import { ChannelOrderService } from './channel-order/channel-order.service';
import { ChannelOrderModule } from './channel-order/channel-order.module';
import { ChannelOrderFoodApiModule } from "./channel-order-food-api/channel-order-food-api.module";
import { HttpModule } from "@nestjs/axios";
import { PiscinaModule } from "./piscina/piscina.module";
import { ChannelOrderSchemaModule } from "./channel-order-schema/channel-order-schema.module";
import { RedisModule } from "./redis/redis.module";
import { QueueModule } from "./queue/queue.module";

@Module({
  imports: [
    ChannelOrderModule , 
    ChannelOrderFoodApiModule,
    HttpModule,
    PiscinaModule,
    ChannelOrderSchemaModule,
    RedisModule,
    QueueModule
],
  providers: [ChannelOrderService],
})
export class AppV1Module implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
    .apply()
    .exclude({ path: '/public/health-check', method: RequestMethod.ALL })
    .forRoutes({ path: "*", method: RequestMethod.ALL });
  }
}
