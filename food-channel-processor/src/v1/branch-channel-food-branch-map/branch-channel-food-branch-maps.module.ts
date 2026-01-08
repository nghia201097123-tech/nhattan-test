// src/branch-channel-food-branch-maps/branch-channel-food-branch-maps.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchChannelFoodBranchMapsService } from './branch-channel-food-branch-maps.service';
import { BranchChannelFoodBranchMapEntity } from './entity/branch-channel-food-branch-maps.entity';

@Module({
  imports: [TypeOrmModule.forFeature([BranchChannelFoodBranchMapEntity])],
  providers: [BranchChannelFoodBranchMapsService],
  exports: [BranchChannelFoodBranchMapsService],
})
export class BranchChannelFoodBranchMapsModule {}
