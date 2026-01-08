import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('sync_channel_orders')
export class SyncChannelOrderEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  restaurant_id: number;

  @Column()
  restaurant_brand_id: number;

  @Column()
  order_id: string;

  @Column()
  channel_order_food_id: number;

  @Column()
  is_sync: number;

}
