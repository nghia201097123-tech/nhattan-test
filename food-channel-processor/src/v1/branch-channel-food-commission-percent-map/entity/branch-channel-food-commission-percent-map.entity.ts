import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('branch_channel_food_commission_percent_maps')
export class BranchChannelFoodCommissionPercentMapEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  restaurant_id: number;

  @Column()
  restaurant_brand_id: number;

  @Column()
  branch_id: number;

  @Column()
  channel_order_food_id: number;

  @Column()
  channel_order_food_token_id: number;

  @Column()
  channel_branch_id: string;

  @Column()
  percent: number;
}
