// channel-order-food-api.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ChannelBranchSchema, ChannelBranchSchemFactory } from './schema/channel-branch.schema';
import { ChannelBranchSchemaService } from './channel-branch-schema.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: ChannelBranchSchema.name, schema: ChannelBranchSchemFactory }])],
  controllers: [],
  providers: [ChannelBranchSchemaService],
  exports : [ChannelBranchSchemaService]
})
export class ChannelBranchSchemaModule {}
