import { Module } from '@nestjs/common';
import { BranchChannelFoodCommissionPercentMapService } from './branch-channel-food-commission-percent-map.service';
import { BranchChannelFoodCommissionPercentMapEntity } from './entity/branch-channel-food-commission-percent-map.entity';
import { BranchChannelFoodCommissionPercentMapController } from './branch-channel-food-commission-percent-map.controller';


@Module({
    imports: [BranchChannelFoodCommissionPercentMapEntity
    ],
    controllers: [BranchChannelFoodCommissionPercentMapController],
    providers: [BranchChannelFoodCommissionPercentMapService],
    exports:[]

})
export class BranchChannelFoodCommissionPercentMapModule {}