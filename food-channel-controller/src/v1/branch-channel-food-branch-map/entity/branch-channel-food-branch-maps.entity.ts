
import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('branch_channel_food_branch_maps')
export class BranchChannelFoodBranchMapEntity {

  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  restaurant_id: number;

  @Column()
  restaurant_brand_id: number;

  @Column()
  channel_order_food_id: number;

  @Column()
  branch_id: number;

  @Column()
  channel_branch_id: string;

  @Column()
  merchant_id: string;

}
