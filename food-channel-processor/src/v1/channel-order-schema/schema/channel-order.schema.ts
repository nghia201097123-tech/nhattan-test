import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {HydratedDocument } from 'mongoose';


export type ChannelOrderSchemaDocument = HydratedDocument<ChannelOrderSchema>;

@Schema({ collection: 'channel_order', timestamps: true })
export class ChannelOrderSchema {
  @Prop({ required: false, default: 0 })
  restaurant_id: number;

  @Prop({ required: false, default: 0 })
  restaurant_brand_id: number;

  @Prop({ required: false, default: 0 })
  branch_id: number;

  @Prop({ required: false, default: 0 })
  restaurant_order_id: number;
  
  @Prop({ required: false, default: '' })
  order_id: string;

  @Prop({ required: false, default: '' })
  order_code: string;

  @Prop({ required: false, default: 0 })
  channel_order_food_id: number;

  @Prop({ required: false, default: '0' })
  channel_branch_id: string;

  @Prop({ required: false, default: 0 })
  channel_order_food_token_id: number;

  @Prop({ required: false, default: 0 })
  delivery_amount: number;

  @Prop({ default: 0 })
  discount_amount: number;

  @Prop({ required: false, default: 0 })
  customer_discount_amount: number;

  @Prop({ required: false, default: 0 })
  customer_order_amount: number;

  @Prop({ required: false, default: 0 })
  order_amount: number;

  @Prop({ required: false, default: 0 })
  total_amount: number;

  @Prop({ required: false, default: '' })
  driver_name: string;

  @Prop({ required: false, default: '' })
  driver_avatar: string;

  @Prop({ required: false, default: '' })
  driver_phone: string;

  @Prop({ required: false, default: '' })
  display_id: string;

  @Prop({ required: false, default: '' })
  status_string: string;

  @Prop({ required: false, default: 0 })
  payment_type: number;

  @Prop({ required: false, default: 0 })
  order_status: number;

  @Prop({ required: false, default: false })
  is_grpc_complete: number;

  @Prop({ required: false, default: '' })
  customer_name: string;

  @Prop({ required: false, default: '' })
  customer_phone: string;

  @Prop({ required: false, default: '' })
  delivery_address: string;

  @Prop({ required: false, default: 0 })
  item_discount_amount: number;

  @Prop({ required: false, default: 0 })
  small_order_amount: number;

  @Prop({ required: false, default: 0 })
  bad_weather_amount: number;

  @Prop({ required: false, default: '' })
  note: string;

  @Prop({ required: false, default: 0 })
  is_need_update: number;

  @Prop({ required: false, default: null })
  day: string;

  @Prop({ required: false, default: '[]' })
  details: string;

  @Prop({ required: false, default: 1 })
  is_new: number;

  @Prop({ required: false, default: '' })
  deliver_time: string;

  @Prop({ required: false, default: 0 })
  is_scheduled_order: number;

  @Prop({ required: false, default: 0 })
  channel_order_id: number;

  @Prop({ type: Date, required: false, default: null })
  completed_at: Date | null;
}

// export const ChannelOrderSchemFactory = SchemaFactory.createForClass(ChannelOrderSchema);

export const ChannelOrderSchemFactory =
  SchemaFactory.createForClass(ChannelOrderSchema);

ChannelOrderSchemFactory.index({ channel_order_id: 1 }, { name: "channel_order_id_1" });
// Single field indexes
ChannelOrderSchemFactory.index(
  { restaurant_id: 1 },
  { name: "restaurant_id_1" }
);
ChannelOrderSchemFactory.index(
  { restaurant_brand_id: 1 },
  { name: "restaurant_brand_id_1" }
);
ChannelOrderSchemFactory.index({ branch_id: 1 }, { name: "branch_id_1" });
ChannelOrderSchemFactory.index({ order_id: 1 }, { name: "order_id_1" });
ChannelOrderSchemFactory.index(
  { is_grpc_complete: 1 },
  { name: "is_grpc_complete_1" }
);
ChannelOrderSchemFactory.index(
  { is_need_update: 1 },
  { name: "is_need_update_1" }
);
ChannelOrderSchemFactory.index({ is_new: 1 }, { name: "is_new_1" });
ChannelOrderSchemFactory.index({ day: 1 }, { name: "day_1" });
ChannelOrderSchemFactory.index(
  { channel_order_food_id: 1 },
  { name: "channel_order_food_id_1" }
);
ChannelOrderSchemFactory.index(
  { createdAt: 1 },
  { expireAfterSeconds: 172800, name: "createdAt_ttl" }
);

ChannelOrderSchemFactory.index(
  { completed_at: 1 },
  { expireAfterSeconds: 7200, name: "completedAt_ttl" }
);

// Compound indexes
ChannelOrderSchemFactory.index(
  {
    restaurant_id: 1,
    restaurant_brand_id: 1,
    branch_id: 1,
    channel_order_food_id: 1,
    day: 1,
  },
  {
    name: "restaurant_id_1_restaurant_brand_id_1_branch_id_1_channel_order_food_id_1_day_1",
  }
);

ChannelOrderSchemFactory.index(
  {
    restaurant_id: 1,
    restaurant_order_id: 1,
    branch_id: 1,
  },
  {
    name: "restaurant_id_1_restaurant_order_id_1_branch_id_1",
  }
);

ChannelOrderSchemFactory.index(
  {
    restaurant_id: 1,
    restaurant_brand_id: 1,
    branch_id: 1,
    channel_order_food_id: 1,
  },
  {
    name: "restaurant_id_1_restaurant_brand_id_1_branch_id_1_channel_order_food_id_1",
  }
);
