import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {HydratedDocument } from 'mongoose';


export type ChannelOrderSchemaDocument = HydratedDocument<ChannelBranchSchema>;

@Schema({ collection: 'channel_branches', timestamps: true })
export class ChannelBranchSchema {

  @Prop({ required: false, default: 0 })
  restaurant_id: number;

  @Prop({ required: false, default: 0 })
  restaurant_brand_id: number;

  @Prop({ required: false, default: 0 })
  channel_order_food_id: number;

  @Prop({ required: false, default: 0 })
  channel_order_food_token_id: number;

  @Prop({ required: false, default: '' })
  channel_order_food_token_name: string;

  @Prop({ required: false, default: '0' })
  channel_branch_id: string;

  @Prop({ required: false, default: '' })
  channel_branch_name: string;

  @Prop({ required: false, default: '' })
  channel_branch_address: string;

  @Prop({ required: false, default: '' })
  channel_branch_phone: string;
  
}

export const ChannelBranchSchemFactory = SchemaFactory.createForClass(ChannelBranchSchema);
