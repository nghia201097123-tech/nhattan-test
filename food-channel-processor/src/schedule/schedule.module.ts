import { forwardRef, Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleModule } from '@nestjs/schedule';
import { SyncChannelOrdersModule } from 'src/v1/sync-channel-order/sync-channel-orders.module';
import { ChannelOrderSchemaModule } from 'src/v1/channel-order-schema/channel-order-schema.module';

@Module({
  imports: [ScheduleModule.forRoot() ,
    forwardRef(() => SyncChannelOrdersModule),
    forwardRef(() => ChannelOrderSchemaModule)

   ],
  providers: [ScheduleService],
})
export class ScheduleAppModule  {}
