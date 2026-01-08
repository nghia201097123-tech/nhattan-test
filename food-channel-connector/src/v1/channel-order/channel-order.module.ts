import { BullModule } from "@nestjs/bull";
import { forwardRef, Module } from "@nestjs/common";
import { ChannelOrderSchemaModule } from "../channel-order-schema/channel-order-schema.module";
import { PiscinaModule } from "../piscina/piscina.module";
import { ChannelOrderQueue } from "./bull-processor/food-channel-queue";
import { FoodChannelRefreshStatusOrderQueue } from "./bull-processor/food-channel-refresh-status-order-queue";
import { ChannelOrderController } from "./channel-order.controller";
import { ChannelOrderService } from "./channel-order.service";
import { SyncChannelOrderBefService } from "./sync-channel-order/sync-channel-order-bef";
import { SyncChannelOrderGrfService } from "./sync-channel-order/sync-channel-order-grf";
import { SyncChannelOrderShfService } from "./sync-channel-order/sync-channel-order-shf";
import { RedisModule } from "../redis/redis.module";
import { QueueModule } from "../queue/queue.module";
import { SyncOrderByBranchQueue } from "./bull-processor/sync-order-by-branch-queue";

@Module({
  imports: [
    forwardRef(() => PiscinaModule),
    forwardRef(() => ChannelOrderSchemaModule),
    forwardRef(() => RedisModule),
    // BullModule.registerQueue(
    //     { name: "queue-sync-channel-order-mongo-to-mysql"},
    //     { name: "queue-sync-token-expired"},
    //     { name: process.env.CONFIG_QUEUE_GROUP_NODEJS_FOOD_CHANNEL_CONNECTOR_REDIS_SYNC_CHANNEL_ORDER},
    //     { name: process.env.CONFIG_QUEUE_GROUP_NODEJS_FOOD_CHANNEL_CONNECTOR_REDIS_REFRESH_STATUS}
    // ),
    forwardRef(() => QueueModule),
  ],

  controllers: [ChannelOrderController],
  providers: [
    ChannelOrderService,
    SyncChannelOrderShfService,
    SyncChannelOrderGrfService,
    SyncChannelOrderBefService,
    ChannelOrderQueue,
    FoodChannelRefreshStatusOrderQueue,
    SyncOrderByBranchQueue
  ],
  exports: [
    ChannelOrderService,
    SyncChannelOrderShfService,
    SyncChannelOrderGrfService,
    SyncChannelOrderBefService,
    ChannelOrderQueue,
    FoodChannelRefreshStatusOrderQueue,
    SyncOrderByBranchQueue
  ],
})
export class ChannelOrderModule { }
