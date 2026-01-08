import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChannelOrderFoodModule } from '../channel-order-food/channel-order-food.module';
import { ChannelOrderFoodTokenEntity } from './entity/channel-order-food-token.entity';
import { ChannelOrderFoodTokenService } from './channel-order-food-token.service';
import { ChannelOrderFoodTokenController } from './channel-order-food-token.controller';
import { ChannelOrderFoodApiModule } from '../channel-order-food-api/channel-order-food-api.module';
import { BranchChannelFoodBranchMapsModule } from '../branch-channel-food-branch-map/branch-channel-food-branch-maps.module';
import { RedisModule } from 'src/redis/redis.module';

@Module({
  imports: [TypeOrmModule.forFeature([ChannelOrderFoodTokenEntity]), 
  forwardRef(() => ChannelOrderFoodModule) ,
  forwardRef(() => ChannelOrderFoodApiModule) ,
  forwardRef(() => BranchChannelFoodBranchMapsModule),
  forwardRef(() => RedisModule),

  ],
  providers: [ChannelOrderFoodTokenService],
  controllers: [ChannelOrderFoodTokenController],
  exports : [ChannelOrderFoodTokenService]
})
export class ChannelOrderFoodTokenModule {}
