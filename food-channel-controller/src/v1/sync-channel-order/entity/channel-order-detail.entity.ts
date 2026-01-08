import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('channel_order_details')
export class ChannelOrderDetailEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  channel_order_id: number;

  @Column()
  order_id: string;

  @Column()
  channel_order_food_id: number;

  @Column()
  food_id: string;

  @Column()
  food_name: string;

  @Column()
  quantity: number;

  @Column()
  food_price: number;

  @Column()
  food_note : string;

  @Column()
  food_options : string;

  @Column()
  food_price_addition: number;
}
