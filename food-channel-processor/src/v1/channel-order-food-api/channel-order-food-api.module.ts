// channel-order-food-api.module.ts
import { HttpModule } from '@nestjs/axios';
import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelOrderFoodTokenModule } from '../channel-order-food-token/channel-order-food-token.module';
import { ChannelOrderFoodApiEntity } from './entity/channel-order-food-api.entity';
import { ChannelOrderFoodApiService } from './channel-order-food-api.service';

@Module({
  imports: [TypeOrmModule.forFeature([ChannelOrderFoodApiEntity]) , HttpModule , 
  forwardRef(() => ChannelOrderFoodTokenModule) ,
  ],
  controllers: [],
  providers: [ChannelOrderFoodApiService],
  exports : [ChannelOrderFoodApiService]
})
export class ChannelOrderFoodApiModule {}
