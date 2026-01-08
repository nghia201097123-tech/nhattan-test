// channel-order-food-api.module.ts
import { Module } from '@nestjs/common';
import { ChannelOrderSchemaService } from './channel-order-schema.service';
import { ChannelOrderSchema, ChannelOrderSchemFactory } from './schema/channel-order.schema';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forFeature([{ name: ChannelOrderSchema.name, schema: ChannelOrderSchemFactory }])],
  controllers: [],
  providers: [ChannelOrderSchemaService],
  exports : [ChannelOrderSchemaService]
})
export class ChannelOrderSchemaModule {}
