import { Entity, Column, PrimaryGeneratedColumn} from 'typeorm';

@Entity('channel_orders')
export class ChannelOrderEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  restaurant_id: number;

  @Column()
  restaurant_brand_id: number;

  @Column()
  branch_id: number;

  @Column()
  restaurant_order_id: number;

  @Column()
  order_id: string;

  @Column()
  channel_order_food_id: number;

  @Column()
  channel_order_food_token_id: number;

  @Column()
  channel_branch_id: string;

  @Column()
  total_amount: number;

  @Column()
  driver_name: string;

  @Column()
  driver_avatar: string;

  @Column()
  driver_phone: string;

  @Column()
  status_string: string;
 
  @Column()
  is_grpc_complete: number;

  @Column()
  order_status: number;

  @Column()
  is_printed: number;

  @Column()
  is_cancel_printed: number;
  
}
