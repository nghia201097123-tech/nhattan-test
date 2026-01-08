import { Module } from '@nestjs/common';
import { ChannelOrderFoodTokenService } from './channel-order-food-token.service';
import { ChannelOrderFoodTokenController } from './channel-order-food-token.controller';

@Module({
  imports: [],
  providers: [ChannelOrderFoodTokenService],
  controllers: [ChannelOrderFoodTokenController],
  exports : [ChannelOrderFoodTokenService]
})
export class ChannelOrderFoodTokenModule {}
