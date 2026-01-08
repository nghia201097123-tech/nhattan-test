import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity('channel_order_food_tokens')
export class ChannelOrderFoodTokenEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  restaurant_id: number;

  @Column()
  restaurant_brand_id: number;

  @Column()
  channel_order_food_id: number;

  @Column()
  access_token: string;

  @Column({ length: 255 })
  username: string;

  @Column({ length: 255 })
  password: string;

  @Column()
  x_foody_entity_id: number;

  @Column()
  x_merchant_token : string 

  @Column()
  device_id : string 

  @Column()
  device_brand : string 

  @Column()
  uuid : string 

  @Column()
  menu_group_id : string 

}
