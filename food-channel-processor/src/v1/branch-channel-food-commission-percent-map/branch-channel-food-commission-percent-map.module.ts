import { forwardRef, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchChannelFoodCommissionPercentMapService } from './branch-channel-food-commission-percent-map.service';
import { BranchChannelFoodCommissionPercentMapController } from './branch-channel-food-commission-percent-map.controller';
import { BranchChannelFoodCommissionPercentMapEntity } from './entity/branch-channel-food-commission-percent-map.entity';
import { ChannelOrderFoodModule } from '../channel-order-food/channel-order-food.module';
import { ChannelOrderFoodTokenModule } from '../channel-order-food-token/channel-order-food-token.module';


@Module({
    imports: [TypeOrmModule.forFeature([BranchChannelFoodCommissionPercentMapEntity]),
    forwardRef(() => ChannelOrderFoodModule), 
    forwardRef(() => ChannelOrderFoodTokenModule) ,
    ],
    controllers: [BranchChannelFoodCommissionPercentMapController],
    providers: [BranchChannelFoodCommissionPercentMapService],
    exports:[]

})
export class BranchChannelFoodCommissionPercentMapModule {}