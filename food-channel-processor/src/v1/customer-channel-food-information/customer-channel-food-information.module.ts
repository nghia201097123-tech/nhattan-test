import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerChannelFoodInformationService } from './customer-channel-food-information.service';
import { CustomerChannelFoodInformationController } from './customer-channel-food-information.controller';
import { CustomerChannelFoodInformationEntity } from './entity/customer-channel-food-information.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CustomerChannelFoodInformationEntity])],
  controllers: [CustomerChannelFoodInformationController],
  providers: [CustomerChannelFoodInformationService],
})
export class CustomerChannelFoodInformationModule {}
