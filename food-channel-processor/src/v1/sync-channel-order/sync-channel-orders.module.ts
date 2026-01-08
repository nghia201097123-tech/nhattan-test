import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelOrderDetailEntity } from './entity/channel-order-detail.entity';
import { ChannelOrderEntity } from './entity/channel-order.entity';
import { SyncChannelOrderEntity } from './entity/sync-channel-orders.entity';
import { SyncChannelOrderController } from './sync-channel-orders.controller';
import { SyncChannelOrdersService } from './sync-channel-orders.service';
import { RedisModule } from 'src/redis/redis.module';
import { ChannelOrderDataEntity } from './entity/channel-order-data.entity';
import { ChannelOrderDetailDataEntity } from './entity/channel-order-detail-data.entity';
import { ChannelOrderPrintEntity } from './entity/channel-order-print.entity';
import { ChannelOrderDriverEntity } from './entity/channel-order-driver.entity';

@Module({
  imports: [TypeOrmModule.forFeature([SyncChannelOrderEntity , ChannelOrderDetailEntity , ChannelOrderEntity , 
    ChannelOrderDataEntity , ChannelOrderDetailDataEntity , ChannelOrderPrintEntity , ChannelOrderDriverEntity]),
  forwardRef(() => RedisModule)
  ],
  providers: [SyncChannelOrdersService],
  exports: [SyncChannelOrdersService],
  controllers: [SyncChannelOrderController]
})
export class SyncChannelOrdersModule {}
