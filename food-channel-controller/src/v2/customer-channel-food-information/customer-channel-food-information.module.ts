import { Module } from '@nestjs/common';
import { CustomerChannelFoodInformationService } from './customer-channel-food-information.service';
import { CustomerChannelFoodInformationController } from './customer-channel-food-information.controller';

@Module({
  imports: [],
  controllers: [CustomerChannelFoodInformationController],
  providers: [CustomerChannelFoodInformationService],
})
export class CustomerChannelFoodInformationModule {}
