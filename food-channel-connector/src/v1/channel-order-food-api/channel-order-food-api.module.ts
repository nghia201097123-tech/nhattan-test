// channel-order-food-api.module.ts
import { HttpModule } from '@nestjs/axios';
import { ChannelOrderFoodApiGRFService } from './channel-order-food-api-grf.service';
import { ChannelOrderFoodApiBEFService } from './channel-order-food-api-bef.service';
import { ChannelOrderFoodApiSHFService } from './channel-order-food-api-shf.service';
import { Module } from '@nestjs/common';
import { ChannelOrderFoodApiController } from './channel-order-food-api.controller';

@Module({
  imports: [HttpModule 
  ],
  controllers: [ChannelOrderFoodApiController],
  providers: [ChannelOrderFoodApiSHFService ,ChannelOrderFoodApiGRFService ,ChannelOrderFoodApiBEFService],
  exports : [ChannelOrderFoodApiSHFService ,ChannelOrderFoodApiGRFService ,ChannelOrderFoodApiBEFService]
})
export class ChannelOrderFoodApiModule {}
