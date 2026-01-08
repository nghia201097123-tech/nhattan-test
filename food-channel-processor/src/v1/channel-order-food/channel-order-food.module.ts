import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelOrderFoodController } from './channel-order-food.controller';
import { ChannelOrderFoodService } from './channel-order-food.service';
import { ChannelOrderFoodEntity } from './entity/channel-order-food.entity';
import { ChannelOrderFoodDataModel } from './model/channel-order-food.data.model';
import { ChannelOrderFoodTokenModule } from '../channel-order-food-token/channel-order-food-token.module';
import { ChannelOrderFoodApiModule } from '../channel-order-food-api/channel-order-food-api.module';
import { SyncChannelOrdersModule } from '../sync-channel-order/sync-channel-orders.module';
import { BranchChannelFoodBranchMapsModule } from '../branch-channel-food-branch-map/branch-channel-food-branch-maps.module';
import { RedisModule } from 'src/redis/redis.module';
import { BranchOrderSyncTimeEntity } from './entity/branch-order-sync-time.entity';
import { ChannelOrderSchemaModule } from '../channel-order-schema/channel-order-schema.module';
import { ChannelBranchSchemaModule } from '../channel-branch-schema/channel-branch-schema.module';
import { CustomElasticsearchModule } from '../elasticsearch/elasticsearch.module';
import { BullModule } from '@nestjs/bull';
import { QueueSyncChannelOrderMongoToMysql } from '../bull-processor/bull-queue-sync-channel-order-mongo-to-mysql';
import { QueueSyncTokenExpired } from '../bull-processor/bull-queue-queue-sync-token-expired';

@Module({
    imports: [TypeOrmModule.forFeature([ChannelOrderFoodEntity , ChannelOrderFoodDataModel, BranchOrderSyncTimeEntity]),
    forwardRef(() => ChannelOrderFoodTokenModule) ,
    forwardRef(() => ChannelOrderFoodApiModule) ,
    forwardRef(() => SyncChannelOrdersModule) ,
    forwardRef(() => BranchChannelFoodBranchMapsModule) ,
    forwardRef(() => RedisModule),
    forwardRef(() => ChannelOrderSchemaModule),
    forwardRef(() => ChannelBranchSchemaModule),
    forwardRef(() => CustomElasticsearchModule),
    BullModule.registerQueue({
      name: process.env.CONFIG_QUEUE_GROUP_REDIS_FOOD_CHANNEL_TOKEN
      },
      {
        name: process.env.CONFIG_QUEUE_GROUP_REDIS_REFRESH_STATUS_CHANNEL_ORDER
      },
      {
        name: process.env.CONFIG_QUEUE_GROUP_REDIS_FOOD_CHANNEL_TOKEN_SHOPEE_FOOD,
      },
      {
        name: process.env.CONFIG_QUEUE_GROUP_REDIS_FOOD_CHANNEL_TOKEN_GRAB_FOOD,
      },
      {
        name: process.env.CONFIG_QUEUE_GROUP_REDIS_FOOD_CHANNEL_TOKEN_BE_FOOD,
      },
      { name: 'queue-sync-channel-order-mongo-to-mysql' },
      { name: 'queue-sync-token-expired' },
    ),
    
    ],
    
    controllers: [ChannelOrderFoodController],
    providers: [ChannelOrderFoodService ,QueueSyncChannelOrderMongoToMysql,QueueSyncTokenExpired],
    exports:[ChannelOrderFoodService , QueueSyncChannelOrderMongoToMysql,QueueSyncTokenExpired]

})
export class ChannelOrderFoodModule {}
