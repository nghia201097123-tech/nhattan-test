import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('customer_channel_food_informations')
export class CustomerChannelFoodInformationEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  restaurant_id: number;

  @Column()
  restaurant_brand_id: number;

  @Column()
  branch_id: number;

  @Column()
  order_id: string;

  @Column()
  order_code: string;

  @Column()
  channel_order_food_id: number;

  @Column()
  channel_branch_id: string;

  @Column()
  customer_name: string;

  @Column()
  customer_phone: string;

  @Column()
  customer_address: string;

  @Column()
  is_grpc_complete: boolean;

  @Column()
  channel_order_food_token_id: number;
}
